import { useEffect } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/marketing/Login';
import { ResetPassword } from './pages/marketing/ResetPassword';
import { ConfirmEmail } from './pages/onboarding/ConfirmEmail';
import { TenantHome } from './pages/tenant/Home';
import { BookingFlow } from './pages/tenant/BookingFlow';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AdminBookings } from './pages/admin/Bookings';
import { DashboardWebsiteEditor } from './pages/admin/WebsiteEditor';
import { MarketingKit } from './pages/admin/MarketingKit';
import { ClientPortalEntry } from './pages/customer/ClientPortalEntry';
import { NotificationSettings } from './pages/admin/NotificationSettings';
import { PaymentIntegration } from './pages/admin/PaymentIntegration';
import { AdminAccounting } from './pages/admin/Accounting';
import { SmartImport } from './pages/admin/SmartImport';
import { AdminMessages } from './pages/admin/Messages';
import { AdminPromotions } from './pages/admin/Promotions';
import { AdminSocial } from './pages/admin/Social';
import { CatUpdateGenerator } from './pages/admin/CatUpdateGenerator';
import { PwaLaunch } from './pages/PwaLaunch';

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
  '/staff-dashboard/customers',
  '/staff-dashboard/calendar',
  '/staff-dashboard/room-planner',
  '/staff-dashboard/insights',
  '/staff-dashboard/settings',
  '/staff-dashboard/booking-setup',
  '/staff-dashboard/subscription',
].map((path) => ({ path, Component: StaffDashboard }));

export const subdomainRouter = createBrowserRouter([
  { path: '/', Component: TenantHome },
  { path: '/app', Component: PwaLaunch },
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
  { path: '/staff-dashboard/smart-import', Component: SmartImport },
  { path: '/staff-dashboard/smart-data-import', Component: SmartImport },
  { path: '/staff-dashboard/messages', Component: AdminMessages },
  { path: '/staff-dashboard/promotions', Component: AdminPromotions },
  { path: '/staff-dashboard/social', Component: AdminSocial },
  { path: '/staff-dashboard/cat-update-generator', Component: CatUpdateGenerator },
  { path: '/staff-dashboard/payment', Component: PaymentIntegration },
  { path: '/staff-dashboard/accounting', Component: AdminAccounting },
  { path: '/staff-dashboard/bookings', Component: AdminBookings },
  { path: '/staff-dashboard/website-editor', Component: DashboardWebsiteEditor },
  { path: '/staff-dashboard/marketing', Component: MarketingKit },
  { path: '/staff-dashboard/settings/notifications', Component: NotificationSettings },
  { path: '/client-portal', Component: ClientPortalEntry },
  { path: '/client-portal/bookings', Component: ClientPortalEntry },
  { path: '/client-portal/profile', Component: ClientPortalEntry },
  { path: '*', Component: TenantHome },
]);
