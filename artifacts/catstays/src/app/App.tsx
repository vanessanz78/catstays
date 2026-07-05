import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SubdomainProvider, isSubdomainOrCustomDomain } from '@/contexts/SubdomainContext';
import { subdomainRouter } from './subdomainRouter';

const onSubdomain = isSubdomainOrCustomDomain();

function App() {
  if (onSubdomain) {
    return (
      <SubdomainProvider>
        <RouterProvider router={subdomainRouter} />
      </SubdomainProvider>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
