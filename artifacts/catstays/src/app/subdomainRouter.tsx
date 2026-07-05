import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';

type RouteComponent = ComponentType<Record<string, never>>;
type LazyRouteLoader = () => Promise<unknown>;

function withAuthProvider(Component: ComponentType) {
  function AuthenticatedRoute() {
    return (
      <AuthProvider>
        <Component />
      </AuthProvider>
    );
  }

  AuthenticatedRoute.displayName = `AuthenticatedRoute(${Component.displayName || Component.name || 'Component'})`;
  return AuthenticatedRoute;
}

function lazyRoute(loader: LazyRouteLoader, exportName: string, requiresAuth = false) {
  return async () => {
    const module = (await loader()) as Record<string, RouteComponent>;
    const Component = module[exportName];

    if (!Component) {
      throw new Error(`Route component export "${exportName}" was not found.`);
    }

    return {
      Component: requiresAuth ? withAuthProvider(Component) : Component,
    };
  };
}

export const subdomainRouter = createBrowserRouter([
  { path: '/', lazy: lazyRoute(() => import('./pages/tenant/Home'), 'TenantHome') },
  { path: '/rooms', lazy: lazyRoute(() => import('./pages/tenant/Rooms'), 'TenantRooms') },
  { path: '/about', lazy: lazyRoute(() => import('./pages/tenant/About'), 'TenantAbout') },
  { path: '/contact', lazy: lazyRoute(() => import('./pages/tenant/Contact'), 'TenantContact') },
  { path: '/booking-flow', lazy: lazyRoute(() => import('./pages/tenant/BookingFlow'), 'BookingFlow') },
  { path: '/staff-dashboard', lazy: lazyRoute(() => import('./pages/staff/StaffDashboard'), 'StaffDashboard', true) },
  { path: '/client-portal', lazy: lazyRoute(() => import('./pages/customer/ClientPortalEntry'), 'ClientPortalEntry') },
  { path: '/client-portal/bookings', lazy: lazyRoute(() => import('./pages/customer/ClientPortalEntry'), 'ClientPortalEntry') },
  { path: '/client-portal/profile', lazy: lazyRoute(() => import('./pages/customer/ClientPortalEntry'), 'ClientPortalEntry') },
  { path: '*', lazy: lazyRoute(() => import('./pages/tenant/Home'), 'TenantHome') },
]);
