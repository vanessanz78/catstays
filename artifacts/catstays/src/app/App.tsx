import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubdomainProvider, isSubdomainOrCustomDomain } from '@/contexts/SubdomainContext';
import { subdomainRouter } from './subdomainRouter';
import { RevelationSyncToast } from './components/RevelationSyncButton';

const onSubdomain = isSubdomainOrCustomDomain();

function App() {
  if (onSubdomain) {
    return (
      <AuthProvider>
        <SubdomainProvider>
          <RouterProvider router={subdomainRouter} />
          <RevelationSyncToast />
        </SubdomainProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <RevelationSyncToast />
    </AuthProvider>
  );
}

export default App;
