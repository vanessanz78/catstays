import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubdomainProvider, isSubdomainOrCustomDomain } from '@/contexts/SubdomainContext';
import { subdomainRouter } from './subdomainRouter';

const previewImportStorageKey = 'catstays_preview_import_table';
const oversizedStorageThreshold = 500_000;

function clearPreviewCache(storage: Storage) {
  try {
    storage.removeItem(previewImportStorageKey);
  } catch {
    // Ignore unavailable browser storage; preview generation can recover without this cache.
  }
}

function installPreviewCacheQuotaGuard() {
  if (typeof window === 'undefined' || typeof Storage === 'undefined') return;

  const globalWindow = window as Window & { __catstaysPreviewCacheQuotaGuardInstalled?: boolean };
  if (globalWindow.__catstaysPreviewCacheQuotaGuardInstalled) return;

  const originalSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function guardedSetItem(key: string, value: string) {
    if (key !== previewImportStorageKey) {
      return originalSetItem.call(this, key, value);
    }

    try {
      return originalSetItem.call(this, key, value);
    } catch {
      clearPreviewCache(this);
      if (value.length <= oversizedStorageThreshold) {
        try {
          return originalSetItem.call(this, key, value);
        } catch {
          clearPreviewCache(this);
        }
      }
    }
  };

  globalWindow.__catstaysPreviewCacheQuotaGuardInstalled = true;
}

function clearOversizedPreviewCache() {
  if (typeof window === 'undefined') return;

  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const cachedPreview = storage.getItem(previewImportStorageKey);
      if (cachedPreview && cachedPreview.length > oversizedStorageThreshold) {
        clearPreviewCache(storage);
      }
    } catch {
      clearPreviewCache(storage);
    }
  }
}

installPreviewCacheQuotaGuard();
clearOversizedPreviewCache();

const onSubdomain = isSubdomainOrCustomDomain();

function App() {
  if (onSubdomain) {
    return (
      <AuthProvider>
        <SubdomainProvider>
          <RouterProvider router={subdomainRouter} />
        </SubdomainProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
