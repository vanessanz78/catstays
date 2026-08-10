import { useEffect } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/marketing/Login';
import { ResetPassword } from './pages/marketing/ResetPassword';
import { ConfirmEmail } from './pages/onboarding/ConfirmEmail';
import { TenantHome } from './pages/tenant/Home';
import { BookingFlow } from './pages/tenant/BookingFlow';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { DashboardWebsiteEditor } from './pages/admin/WebsiteEditor';
import { MarketingKit } from './pages/admin/MarketingKit';
import { ClientPortalEntry } from './pages/customer/ClientPortalEntry';

function TenantHomeSection({ section }: { section: string }) {
  useEffect(() => {
    window.history.replaceState(null, '', `/#${section}`);

    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scrollWhenReady = () => {
      const target = document.getElementById(section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      attempts += 1;
      if (attempts < 12) {
        timeoutId = setTimeout(scrollWhenReady, 150);
      }
    };

    requestAnimationFrame(scrollWhenReady);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [section]);

  return <TenantHome />;
}

const staffDashboardRoutes = [
  '/staff-dashboard',
  '/staff-dashboard/bookings',
  '/staff-dashboard/customers',
  '/staff-dashboard/calendar',
  '/staff-dashboard/room-planner',
  '/staff-dashboard/smart-import',
  '/staff-dashboard/smart-data-import',
  '/staff-dashboard/accounting',
  '/staff-dashboard/messages',
  '/staff-dashboard/promotions',
  '/staff-dashboard/social',
  '/staff-dashboard/cat-update-generator',
  '/staff-dashboard/insights',
  '/staff-dashboard/settings',
  '/staff-dashboard/booking-setup',
  '/staff-dashboard/payment',
  '/staff-dashboard/subscription',
].map((path) => ({ path, Component: StaffDashboard }));

export const subdomainRouter = createBrowserRouter([
  { path: '/', Component: TenantHome },
  { path: '/login', Component: Login },
  { path: '/reset-password', Component: ResetPassword },
  { path: '/confirm-email', Component: ConfirmEmail },
  { path: '/host-login', element: <Navigate to="/login" replace /> },
  { path: '/dashboard', element: <Navigate to="/staff-dashboard" replace /> },
  { path: '/admin', element: <Navigate to="/staff-dashboard" replace /> },
  { path: '/about', element: <TenantHomeSection section="about" /> },
  { path: '/care', element: <TenantHomeSection section="care" /> },
  { path: '/facilities', element: <TenantHomeSection section="facilities" /> },
  { path: '/rooms', element: <TenantHomeSection section="suites" /> },
  { path: '/suites', element: <TenantHomeSection section="suites" /> },
  { path: '/gallery', element: <TenantHomeSection section="gallery" /> },
  { path: '/reviews', element: <TenantHomeSection section="reviews" /> },
  { path: '/location', element: <TenantHomeSection section="location" /> },
  { path: '/contact', element: <TenantHomeSection section="contact" /> },
  { path: '/booking-flow', Component: BookingFlow },
  { path: '/booking', element: <TenantHomeSection section="booking" /> },
  ...staffDashboardRoutes,
  { path: '/staff-dashboard/website-editor', Component: DashboardWebsiteEditor },
  { path: '/staff-dashboard/marketing', Component: MarketingKit },
  { path: '/client-portal', Component: ClientPortalEntry },
  { path: '/client-portal/bookings', Component: ClientPortalEntry },
  { path: '/client-portal/profile', Component: ClientPortalEntry },
  { path: '*', Component: TenantHome },
]);
