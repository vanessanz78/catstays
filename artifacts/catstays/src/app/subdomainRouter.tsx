import { useEffect } from 'react';
import { createBrowserRouter } from 'react-router';
import { TenantHome } from './pages/tenant/Home';
import { BookingFlow } from './pages/tenant/BookingFlow';
import { StaffDashboard } from './pages/staff/StaffDashboard';
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
  { path: '/client-portal', Component: ClientPortalEntry },
  { path: '/client-portal/bookings', Component: ClientPortalEntry },
  { path: '/client-portal/profile', Component: ClientPortalEntry },
  { path: '*', Component: TenantHome },
]);
