import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubdomainProvider, isSubdomainOrCustomDomain } from '@/contexts/SubdomainContext';
import { subdomainRouter } from './subdomainRouter';

const previewImportStorageKey = 'catstays_preview_import_table';
const oversizedStorageThreshold = 500_000;

function clearOversizedPreviewCache() {
  if (typeof window === 'undefined') return;

  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const cachedPreview = storage.getItem(previewImportStorageKey);
      if (cachedPreview && cachedPreview.length > oversizedStorageThreshold) {
        storage.removeItem(previewImportStorageKey);
      }
    } catch {
      try {
        storage.removeItem(previewImportStorageKey);
      } catch {
        // Ignore unavailable browser storage; preview generation can recover without this cache.
      }
    }
  }
}

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
