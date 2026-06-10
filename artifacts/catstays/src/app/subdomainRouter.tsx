import { createBrowserRouter } from 'react-router';
import { TenantHome } from './pages/tenant/Home';
import { TenantRooms } from './pages/tenant/Rooms';
import { TenantAbout } from './pages/tenant/About';
import { TenantContact } from './pages/tenant/Contact';
import { BookingFlow } from './pages/tenant/BookingFlow';

export const subdomainRouter = createBrowserRouter([
  { path: '/', Component: TenantHome },
  { path: '/rooms', Component: TenantRooms },
  { path: '/about', Component: TenantAbout },
  { path: '/contact', Component: TenantContact },
  { path: '/booking-flow', Component: BookingFlow },
  { path: '*', Component: TenantHome },
]);
