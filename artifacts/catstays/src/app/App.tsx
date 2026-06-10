import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubdomainProvider, isSubdomainOrCustomDomain } from '@/contexts/SubdomainContext';
import { subdomainRouter } from './subdomainRouter';

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
