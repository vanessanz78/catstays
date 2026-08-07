import { useEffect } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/marketing/Login';
import { TenantHome } from './pages/tenant/Home';
import { BookingFlow } from './pages/tenant/BookingFlow';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminCustomers } from './pages/admin/Customers';
import { AdminCalendar } from './pages/admin/Calendar';
import { RoomPlannerDashboard } from './pages/rooms/RoomPlannerDashboard';
import { SmartImport } from './pages/admin/SmartImport';
import { SmartDataImport } from './pages/admin/SmartDataImport';
import { AdminAccounting } from './pages/admin/Accounting';
import { AdminMessages } from './pages/admin/Messages';
import { AdminPromotions } from './pages/admin/Promotions';
import { AdminSocial } from './pages/admin/Social';
import { CatUpdateGenerator } from './pages/admin/CatUpdateGenerator';
import { AdminInsights } from './pages/admin/Insights';
import { AdminSettings } from './pages/admin/Settings';
import { BookingSetup } from './pages/admin/BookingSetup';
import { PaymentIntegration } from './pages/admin/PaymentIntegration';
import { DashboardWebsiteEditor } from './pages/admin/WebsiteEditor';
import { MarketingKit } from './pages/admin/MarketingKit';
import { Subscription } from './pages/admin/Subscription';
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

export const subdomainRouter = createBrowserRouter([
  { path: '/', Component: TenantHome },
  { path: '/login', Component: Login },
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
  { path: '/staff-dashboard', Component: StaffDashboard },
  { path: '/staff-dashboard/bookings', Component: AdminBookings },
  { path: '/staff-dashboard/customers', Component: AdminCustomers },
  { path: '/staff-dashboard/calendar', Component: AdminCalendar },
  { path: '/staff-dashboard/room-planner', Component: RoomPlannerDashboard },
  { path: '/staff-dashboard/smart-import', Component: SmartImport },
  { path: '/staff-dashboard/smart-data-import', Component: SmartDataImport },
  { path: '/staff-dashboard/accounting', Component: AdminAccounting },
  { path: '/staff-dashboard/messages', Component: AdminMessages },
  { path: '/staff-dashboard/promotions', Component: AdminPromotions },
  { path: '/staff-dashboard/social', Component: AdminSocial },
  { path: '/staff-dashboard/cat-update-generator', Component: CatUpdateGenerator },
  { path: '/staff-dashboard/insights', Component: AdminInsights },
  { path: '/staff-dashboard/settings', Component: AdminSettings },
  { path: '/staff-dashboard/booking-setup', Component: BookingSetup },
  { path: '/staff-dashboard/payment', Component: PaymentIntegration },
  { path: '/staff-dashboard/website-editor', Component: DashboardWebsiteEditor },
  { path: '/staff-dashboard/marketing', Component: MarketingKit },
  { path: '/staff-dashboard/subscription', Component: Subscription },
  { path: '/client-portal', Component: ClientPortalEntry },
  { path: '/client-portal/bookings', Component: ClientPortalEntry },
  { path: '/client-portal/profile', Component: ClientPortalEntry },
  { path: '*', Component: TenantHome },
]);
