import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Cat,
  CheckCircle2,
  Clock,
  Home,
  Mail,
  Plus,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useCustomers } from '@/hooks/useCustomers';
import { useRooms } from '@/hooks/useRooms';
import { RightMenu } from '../../components/RightMenu';

const ROOT_DOMAIN = 'catstays.app';

function getDraftAccount() {
  try {
    const raw = localStorage.getItem('catstays_account');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isRootCatStaysHost() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;
}

function getTenantStaffDashboardUrl(slug: string) {
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `https://${safeSlug}.${ROOT_DOMAIN}/staff-dashboard`;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCatNames(booking: { booking_cats?: { cat?: { name?: string | null } | null }[] }) {
  const names = booking.booking_cats
    ?.map((entry) => entry.cat?.name)
    .filter((name): name is string => Boolean(name));

  return names && names.length > 0 ? names.join(', ') : 'Cat guest';
}

function BookingRow({
  booking,
  actionLabel,
}: {
  booking: ReturnType<typeof useBookings>['bookings'][number];
  actionLabel: string;
}) {
  const catNames = getCatNames(booking);
  const customerName = booking.customer?.name || 'New customer';
  const roomName = booking.room?.name || 'Unassigned room';

  return (
    <div className="grid gap-3 rounded-lg bg-[#F8F7F5] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <h3 className="font-semibold text-[#0A1128]">{catNames}</h3>
        <p className="text-sm text-[#4E5871]">{customerName}</p>
        <p className="mt-1 text-xs text-[#768098]">
          {roomName} · {formatDate(booking.check_in)} to {formatDate(booking.check_out)}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        <Badge className="rounded-full bg-[#E9D7C8] text-[#8A4E2B] hover:bg-[#E9D7C8]">
          {booking.payment_status || booking.status}
        </Badge>
        <Link to="/staff-dashboard/bookings">
          <Button size="sm" className="rounded-full bg-[#0A1128] text-white hover:bg-[#19233D]">
            {actionLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-lg bg-white p-8 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#C46A3A]/10">
          <Icon className="h-7 w-7 text-[#C46A3A]" />
        </div>
        <h3 className="text-lg font-semibold text-[#0A1128]">{title}</h3>
        <p className="mt-2 text-sm text-[#4E5871]">{description}</p>
      </div>
    </div>
  );
}

// Production staff dashboard shell. The earlier sparse dashboard is retired;
// demo data must stay isolated in DashboardPreviewMock and demo routes only.
export function StaffDashboard() {
  const { cattery, loading: authLoading } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { customers, loading: customersLoading } = useCustomers();
  const { rooms, loading: roomsLoading } = useRooms();

  const draftAccount = getDraftAccount();
  const isLoading = authLoading || bookingsLoading || customersLoading || roomsLoading;
  const today = getLocalDateKey();

  const dashboardData = useMemo(() => {
    const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');
    const arrivalsToday = activeBookings.filter((booking) => booking.check_in === today);
    const departuresToday = activeBookings.filter((booking) => booking.check_out === today);
    const occupiedNow = activeBookings.filter((booking) => {
      return booking.check_in <= today && booking.check_out >= today;
    });
    const pending = bookings.filter((booking) => booking.status === 'pending');
    const activeRooms = rooms.filter((room) => room.is_active);

    return {
      activeRooms,
      arrivalsToday,
      departuresToday,
      occupiedNow,
      pending,
      availableRooms: Math.max(activeRooms.length - occupiedNow.length, 0),
      occupancyLabel: activeRooms.length > 0 ? `${occupiedNow.length}/${activeRooms.length}` : '0/0',
    };
  }, [bookings, rooms, today]);

  const businessName = cattery?.name || draftAccount?.businessName || 'Your cattery';
  const tenantHost = cattery?.slug ? `${cattery.slug}.${ROOT_DOMAIN}` : 'your-handle.catstays.app';
  const shouldRedirectToTenantDashboard = !!cattery?.slug && isRootCatStaysHost();

  useEffect(() => {
    if (shouldRedirectToTenantDashboard && cattery?.slug) {
      window.location.assign(getTenantStaffDashboardUrl(cattery.slug));
    }
  }, [cattery?.slug, shouldRedirectToTenantDashboard]);

  if (shouldRedirectToTenantDashboard) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8F7F5] text-[#4E5871]">
        Opening your cattery dashboard...
      </div>
    );
  }

  if (!cattery && !authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] text-[#0A1128]">
        <header className="sticky top-0 z-20 border-b border-[#0A1128]/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase text-[#C46A3A]">Staff dashboard</p>
              <h1 className="text-xl font-semibold">{businessName}</h1>
            </div>
            <Link to="/login">
              <Button className="rounded-lg bg-[#0A1128] text-white hover:bg-[#19233D]">
                Sign in
              </Button>
            </Link>
          </div>
        </header>

        <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-4xl place-items-center px-4 py-10">
          <Card className="w-full max-w-2xl rounded-lg border-[#E8DED4] shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[#C46A3A]/10">
                <Mail className="h-7 w-7 text-[#C46A3A]" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold">Confirm your email to open the dashboard</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-[#4E5871]">
                Your cattery setup has been saved and the secure confirmation link has been sent to
                {draftAccount?.email ? ` ${draftAccount.email}` : ' your inbox'}. Once confirmed, this dashboard will open with your own live data.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/onboarding">
                  <Button variant="outline" className="rounded-lg border-[#C46A3A]/40 text-[#0A1128]">
                    Return to setup
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                    Sign in after confirming
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128]">
      <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <RightMenu />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p>
              <h1 className="text-xl font-semibold">{businessName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard/bookings?new=true" className="hidden sm:block">
              <Button className="rounded-full bg-[#C46A3A] px-6 text-white shadow-sm hover:bg-[#A85A30]">
                <Plus className="mr-2 h-4 w-4" />
                New booking
              </Button>
            </Link>
            <div className="relative hidden h-10 w-10 place-items-center rounded-full bg-white text-[#C46A3A] shadow-sm sm:grid">
              <Bell className="h-5 w-5" />
              {dashboardData.pending.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#0A1128] px-1 text-xs font-semibold text-white">
                  {dashboardData.pending.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-6 rounded-lg border border-[#E8DED4] bg-white p-5 shadow-sm">
          <Link to="/staff-dashboard/bookings?new=true">
            <Button className="mb-4 h-14 w-full rounded-lg bg-[#C46A3A] text-base font-semibold text-white hover:bg-[#A85A30]">
              <Plus className="mr-2 h-5 w-5" />
              New booking
            </Button>
          </Link>

          <div className="mb-4 grid gap-3 rounded-lg border border-[#E8DED4] bg-[#F8F7F5] p-4 text-center sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <Link to="/staff-dashboard/calendar" className="text-[#0A1128] hover:text-[#C46A3A]">
              <CalendarDays className="mx-auto h-5 w-5 sm:mx-0" />
            </Link>
            <div>
              <h2 className="text-2xl font-semibold">Today</h2>
              <p className="text-sm text-[#4E5871]">{formatTodayLabel()}</p>
            </div>
            <Link to="/staff-dashboard/calendar" className="text-sm font-semibold text-[#C46A3A]">
              Calendar
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-lg bg-[#0A1128] p-6 text-center text-white shadow-sm">
              <p className="text-3xl font-semibold">{isLoading ? '-' : dashboardData.arrivalsToday.length}</p>
              <p className="text-sm text-white/80">Arrivals</p>
            </div>
            <div className="rounded-lg bg-[#C46A3A] p-6 text-center text-white shadow-sm">
              <p className="text-3xl font-semibold">{isLoading ? '-' : dashboardData.departuresToday.length}</p>
              <p className="text-sm text-white/85">Departures</p>
            </div>
            <Link to="/staff-dashboard/room-planner" className="rounded-lg bg-white p-6 text-center shadow-sm ring-1 ring-[#E8DED4] hover:bg-[#F8F7F5]">
              <p className="text-3xl font-semibold">{isLoading ? '-' : dashboardData.occupancyLabel}</p>
              <p className="text-sm text-[#4E5871]">Occupied</p>
            </Link>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-[#E8DED4] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Arrivals Today</h2>
              <Badge className="rounded-full bg-[#F1E8DE] text-[#0A1128] hover:bg-[#F1E8DE]">
                {dashboardData.arrivalsToday.length}
              </Badge>
            </div>
            {isLoading ? (
              <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading arrivals...</p>
            ) : dashboardData.arrivalsToday.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.arrivalsToday.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} actionLabel="Check in" />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={Clock}
                title="No arrivals scheduled for today"
                description="New arrivals will appear here as soon as they are booked for this cattery."
              />
            )}
          </section>

          <section className="rounded-lg border border-[#E8DED4] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Departures Today</h2>
              <Badge className="rounded-full bg-[#F1E8DE] text-[#0A1128] hover:bg-[#F1E8DE]">
                {dashboardData.departuresToday.length}
              </Badge>
            </div>
            {isLoading ? (
              <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading departures...</p>
            ) : dashboardData.departuresToday.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.departuresToday.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} actionLabel="Check out" />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={CheckCircle2}
                title="No departures scheduled for today"
                description="Check-outs for this cattery will show here when bookings reach their departure date."
              />
            )}
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-lg border border-[#E8DED4] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Currently Occupied</h2>
                <p className="text-sm text-[#4E5871]">Live room status for {businessName}</p>
              </div>
              <Badge className="rounded-full bg-[#7DAF7B]/20 text-[#2D5830] hover:bg-[#7DAF7B]/20">
                {dashboardData.occupiedNow.length}
              </Badge>
            </div>
            {isLoading ? (
              <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading room status...</p>
            ) : dashboardData.occupiedNow.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {dashboardData.occupiedNow.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} actionLabel="Open" />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={Home}
                title="No occupied rooms yet"
                description="Once bookings are checked in, occupied rooms will appear here."
              />
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-[#E8DED4] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Workspace</h2>
              <div className="mt-4 space-y-3">
                <Link to="/staff-dashboard/bookings" className="flex items-center justify-between rounded-lg border border-[#E8DED4] p-4 hover:bg-[#F8F7F5]">
                  <span className="flex items-center gap-3 font-medium">
                    <BookOpen className="h-5 w-5 text-[#C46A3A]" />
                    Bookings
                  </span>
                  <span className="text-sm text-[#4E5871]">{bookings.length}</span>
                </Link>
                <Link to="/staff-dashboard/customers" className="flex items-center justify-between rounded-lg border border-[#E8DED4] p-4 hover:bg-[#F8F7F5]">
                  <span className="flex items-center gap-3 font-medium">
                    <Users className="h-5 w-5 text-[#C46A3A]" />
                    Customers
                  </span>
                  <span className="text-sm text-[#4E5871]">{customers.length}</span>
                </Link>
                <Link to="/staff-dashboard/room-planner" className="flex items-center justify-between rounded-lg border border-[#E8DED4] p-4 hover:bg-[#F8F7F5]">
                  <span className="flex items-center gap-3 font-medium">
                    <Cat className="h-5 w-5 text-[#C46A3A]" />
                    Rooms
                  </span>
                  <span className="text-sm text-[#4E5871]">{dashboardData.availableRooms} available</span>
                </Link>
              </div>
            </section>

            <section className="rounded-lg border border-[#0A1128] bg-[#0A1128] p-5 text-white shadow-sm">
              <p className="text-sm uppercase tracking-wide text-[#E9D7C8]">Website</p>
              <h2 className="mt-2 text-xl font-semibold">{tenantHost}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Public bookings connect back to this tenant dashboard only.
              </p>
              <Link to={cattery?.slug ? `/tenant/${cattery.slug}` : '/site'}>
                <Button className="mt-4 rounded-full bg-white text-[#0A1128] hover:bg-[#F6F2EA]">
                  View website
                </Button>
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
