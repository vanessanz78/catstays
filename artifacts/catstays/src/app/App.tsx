import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubdomainProvider, isSubdomainOrCustomDomain } from '@/contexts/SubdomainContext';
import { subdomainRouter } from './subdomainRouter';
import { RevelationSyncToast } from './components/RevelationSyncButton';
import { applySeoMetadata, routeSeo } from './lib/seo';

const onSubdomain = isSubdomainOrCustomDomain();

function SeoController({ activeRouter }: { activeRouter: typeof router }) {
  const [pathname, setPathname] = useState(activeRouter.state.location.pathname);

  useEffect(() => activeRouter.subscribe((state) => setPathname(state.location.pathname)), [activeRouter]);
  useEffect(() => applySeoMetadata(routeSeo(pathname)), [pathname]);

  return null;
}

function App() {
  if (onSubdomain) {
    return (
      <AuthProvider>
        <SubdomainProvider>
          <SeoController activeRouter={subdomainRouter as typeof router} />
          <RouterProvider router={subdomainRouter} />
          <RevelationSyncToast />
        </SubdomainProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SeoController activeRouter={router} />
      <RouterProvider router={router} />
      <RevelationSyncToast />
    </AuthProvider>
  );
}

export default App;
