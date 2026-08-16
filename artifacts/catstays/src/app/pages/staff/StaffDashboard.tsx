import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Cat,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
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

type StaffSection =
  | 'today'
  | 'bookings'
  | 'customers'
  | 'calendar'
  | 'room-planner'
  | 'smart-import'
  | 'smart-data-import'
  | 'accounting'
  | 'messages'
  | 'promotions'
  | 'payment'
  | 'social'
  | 'cat-update-generator'
  | 'insights'
  | 'settings'
  | 'booking-setup'
  | 'marketing'
  | 'subscription';

type Booking = ReturnType<typeof useBookings>['bookings'][number];
type Room = ReturnType<typeof useRooms>['rooms'][number];
type Customer = ReturnType<typeof useCustomers>['customers'][number];

const sectionMeta: Record<StaffSection, { title: string; subtitle: string }> = {
  today: { title: 'Today', subtitle: 'Check-ins, departures, and live room status' },
  bookings: { title: 'Bookings', subtitle: 'All reservations for this cattery' },
  customers: { title: 'Customers', subtitle: 'Contact details and cat profiles' },
  calendar: { title: 'Calendar', subtitle: 'Booking timeline and upcoming stays' },
  'room-planner': { title: 'Room Planner & Pricing', subtitle: 'Rooms, availability, and rate setup' },
  'smart-import': { title: 'Smart Import', subtitle: 'Bring in existing cattery data' },
  'smart-data-import': { title: 'Smart Data Import', subtitle: 'Import tools for tenant-owned records' },
  accounting: { title: 'Accounting', subtitle: 'Payments, invoices, and revenue tools' },
  messages: { title: 'Messages', subtitle: 'Customer updates and automated messages' },
  promotions: { title: 'Promotions', subtitle: 'Offers and marketing campaigns' },
  payment: { title: 'Payment Setup', subtitle: 'Stripe and payout configuration' },
  social: { title: 'Social', subtitle: 'Social content and channel planning' },
  'cat-update-generator': { title: 'Cat Update Generator', subtitle: 'Photo updates and stay notes' },
  insights: { title: 'Insights', subtitle: 'Tenant metrics and reports' },
  settings: { title: 'Settings', subtitle: 'Cattery preferences and account setup' },
  'booking-setup': { title: 'Booking Setup', subtitle: 'Public booking rules and intake settings' },
  marketing: { title: 'Marketing', subtitle: 'Campaigns and promotional content' },
  subscription: { title: 'Subscription', subtitle: 'Plan and account status' },
};

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

function getTenantStaffDashboardUrl(slug: string, path = '/staff-dashboard') {
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `https://${safeSlug}.${ROOT_DOMAIN}${path}`;
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

function staffSectionFromPath(pathname: string): StaffSection {
  const match = pathname.match(/\/staff-dashboard\/?([^/?#]*)/);
  const section = match?.[1] || '';

  if (section === 'bookings') return 'bookings';
  if (section === 'customers') return 'customers';
  if (section === 'calendar') return 'calendar';
  if (section === 'room-planner') return 'room-planner';
  if (section === 'smart-import') return 'smart-import';
  if (section === 'smart-data-import') return 'smart-data-import';
  if (section === 'accounting') return 'accounting';
  if (section === 'messages') return 'messages';
  if (section === 'promotions') return 'promotions';
  if (section === 'payment') return 'payment';
  if (section === 'social') return 'social';
  if (section === 'cat-update-generator') return 'cat-update-generator';
  if (section === 'insights') return 'insights';
  if (section === 'settings') return 'settings';
  if (section === 'booking-setup') return 'booking-setup';
  if (section === 'marketing') return 'marketing';
  if (section === 'subscription') return 'subscription';
  return 'today';
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
  booking: Booking;
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
        <Button size="sm" className="rounded-full bg-[#0A1128] text-white hover:bg-[#19233D]">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-lg bg-white p-8 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#C46A3A]/10">
          <Icon className="h-7 w-7 text-[#C46A3A]" />
        </div>
        <h3 className="text-lg font-semibold text-[#0A1128]">{title}</h3>
        <p className="mt-2 text-sm text-[#4E5871]">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function WorkspaceCard({
  href,
  icon: Icon,
  title,
  description,
  value,
}: {
  href: string;
  icon: typeof CalendarDays;
  title: string;
  description: string;
  value?: string | number;
}) {
  return (
    <Link to={href} className="flex items-center justify-between rounded-lg border border-[#E8DED4] bg-white p-4 shadow-sm transition hover:bg-[#F8F7F5]">
      <span className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#C46A3A]/10">
          <Icon className="h-5 w-5 text-[#C46A3A]" />
        </span>
        <span>
          <span className="block font-semibold text-[#0A1128]">{title}</span>
          <span className="block text-sm text-[#4E5871]">{description}</span>
        </span>
      </span>
      {value !== undefined && <span className="text-sm font-semibold text-[#C46A3A]">{value}</span>}
    </Link>
  );
}

function PagePanel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#E8DED4] bg-white p-5 shadow-sm">
      {children}
    </section>
  );
}

function NewBookingDraft() {
  return (
    <PagePanel>
      <div className="mx-auto max-w-2xl py-4">
        <div className="mb-5 flex items-center justify-between border-b border-[#E8DED4] pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#0A1128]">New booking</h2>
            <p className="text-sm text-[#4E5871]">Step 1 of 4</p>
          </div>
          <Link to="/staff-dashboard/bookings" className="text-sm font-semibold text-[#C46A3A]">
            Close
          </Link>
        </div>
        <div className="rounded-lg bg-[#F8F7F5] p-6">
          <h3 className="text-xl font-semibold text-[#0A1128]">Select customer</h3>
          <p className="mt-1 text-sm text-[#4E5871]">Search existing customers or create a new one for this cattery.</p>
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#E8DED4] bg-white px-4 py-3 text-[#768098]">
            <Search className="h-5 w-5 text-[#C46A3A]" />
            Search customers...
          </div>
          <Button className="mt-4 w-full rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
            <Plus className="mr-2 h-4 w-4" />
            Add new customer
          </Button>
        </div>
      </div>
    </PagePanel>
  );
}

function TodaySection({
  businessName,
  bookings,
  customers,
  isLoading,
  rooms,
  tenantHost,
  data,
  catterySlug,
}: {
  businessName: string;
  bookings: Booking[];
  customers: Customer[];
  isLoading: boolean;
  rooms: Room[];
  tenantHost: string;
  data: ReturnType<typeof buildDashboardData>;
  catterySlug?: string;
}) {
  return (
    <>
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
            <p className="text-3xl font-semibold">{isLoading ? '-' : data.arrivalsToday.length}</p>
            <p className="text-sm text-white/80">Arrivals</p>
          </div>
          <div className="rounded-lg bg-[#C46A3A] p-6 text-center text-white shadow-sm">
            <p className="text-3xl font-semibold">{isLoading ? '-' : data.departuresToday.length}</p>
            <p className="text-sm text-white/85">Departures</p>
          </div>
          <Link to="/staff-dashboard/room-planner" className="rounded-lg bg-white p-6 text-center shadow-sm ring-1 ring-[#E8DED4] hover:bg-[#F8F7F5]">
            <p className="text-3xl font-semibold">{isLoading ? '-' : data.occupancyLabel}</p>
            <p className="text-sm text-[#4E5871]">Occupied</p>
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <BookingListPanel
          title="Arrivals Today"
          count={data.arrivalsToday.length}
          loadingLabel="Loading arrivals..."
          bookings={data.arrivalsToday}
          emptyIcon={Clock}
          emptyTitle="No arrivals scheduled for today"
          emptyDescription="New arrivals will appear here as soon as they are booked for this cattery."
          actionLabel="Check in"
          isLoading={isLoading}
        />
        <BookingListPanel
          title="Departures Today"
          count={data.departuresToday.length}
          loadingLabel="Loading departures..."
          bookings={data.departuresToday}
          emptyIcon={CheckCircle2}
          emptyTitle="No departures scheduled for today"
          emptyDescription="Check-outs for this cattery will show here when bookings reach their departure date."
          actionLabel="Check out"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <PagePanel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Currently Occupied</h2>
              <p className="text-sm text-[#4E5871]">Live room status for {businessName}</p>
            </div>
            <Badge className="rounded-full bg-[#7DAF7B]/20 text-[#2D5830] hover:bg-[#7DAF7B]/20">
              {data.occupiedNow.length}
            </Badge>
          </div>
          {isLoading ? (
            <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading room status...</p>
          ) : data.occupiedNow.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {data.occupiedNow.map((booking) => (
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
        </PagePanel>

        <aside className="space-y-5">
          <PagePanel>
            <h2 className="text-xl font-semibold">Workspace</h2>
            <div className="mt-4 space-y-3">
              <WorkspaceCard href="/staff-dashboard/bookings" icon={BookOpen} title="Bookings" description="All reservations" value={bookings.length} />
              <WorkspaceCard href="/staff-dashboard/customers" icon={Users} title="Customers" description="Contact details" value={customers.length} />
              <WorkspaceCard href="/staff-dashboard/room-planner" icon={Cat} title="Rooms" description="Room planner" value={`${data.availableRooms} available`} />
            </div>
          </PagePanel>

          <section className="rounded-lg border border-[#0A1128] bg-[#0A1128] p-5 text-white shadow-sm">
            <p className="text-sm uppercase tracking-wide text-[#E9D7C8]">Website</p>
            <h2 className="mt-2 text-xl font-semibold">{tenantHost}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Public bookings connect back to this tenant dashboard only.
            </p>
            <Link to={catterySlug ? `/tenant/${catterySlug}` : '/site'}>
              <Button className="mt-4 rounded-full bg-white text-[#0A1128] hover:bg-[#F6F2EA]">
                View website
              </Button>
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

function BookingListPanel({
  title,
  count,
  loadingLabel,
  bookings,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  actionLabel,
  isLoading,
}: {
  title: string;
  count: number;
  loadingLabel: string;
  bookings: Booking[];
  emptyIcon: typeof CalendarDays;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  isLoading: boolean;
}) {
  return (
    <PagePanel>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge className="rounded-full bg-[#F1E8DE] text-[#0A1128] hover:bg-[#F1E8DE]">{count}</Badge>
      </div>
      {isLoading ? (
        <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">{loadingLabel}</p>
      ) : bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} actionLabel={actionLabel} />
          ))}
        </div>
      ) : (
        <EmptyPanel icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      )}
    </PagePanel>
  );
}

function BookingsSection({ bookings, isLoading, showNewBooking }: { bookings: Booking[]; isLoading: boolean; showNewBooking: boolean }) {
  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');
  const pending = bookings.filter((booking) => booking.status === 'pending');

  return (
    <div className="space-y-5">
      {showNewBooking && <NewBookingDraft />}
      <PagePanel>
        <Link to="/staff-dashboard/bookings?new=true">
          <Button className="mb-4 h-14 w-full rounded-lg bg-[#C46A3A] text-base font-semibold text-white hover:bg-[#A85A30]">
            <Plus className="mr-2 h-5 w-5" />
            New booking
          </Button>
        </Link>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile label="Total bookings" value={isLoading ? '-' : activeBookings.length} />
          <MetricTile label="Pending requests" value={isLoading ? '-' : pending.length} tone="orange" />
          <MetricTile label="Cancelled" value={isLoading ? '-' : bookings.length - activeBookings.length} />
        </div>
      </PagePanel>
      <PagePanel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Latest bookings</h2>
            <p className="text-sm text-[#4E5871]">Only live tenant bookings appear here.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="rounded-full border-[#E8DED4]">Arrival</Badge>
            <Badge variant="outline" className="rounded-full border-[#E8DED4]">Departure</Badge>
            <Badge variant="outline" className="rounded-full border-[#E8DED4]">Received</Badge>
          </div>
        </div>
        {isLoading ? (
          <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading bookings...</p>
        ) : activeBookings.length > 0 ? (
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} actionLabel="Open" />
            ))}
          </div>
        ) : (
          <EmptyPanel
            icon={BookOpen}
            title="No recent bookings"
            description="Bookings from the published website will appear here for this cattery only."
            action={
              <Link to="/staff-dashboard/bookings?new=true">
                <Button className="rounded-full bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                  <Plus className="mr-2 h-4 w-4" />
                  New booking
                </Button>
              </Link>
            }
          />
        )}
      </PagePanel>
    </div>
  );
}

function CustomersSection({ customers, isLoading }: { customers: Customer[]; isLoading: boolean }) {
  return (
    <div className="space-y-5">
      <PagePanel>
        <div className="flex items-center gap-3 rounded-lg border border-[#E8DED4] bg-[#F8F7F5] px-4 py-3 text-[#768098]">
          <Search className="h-5 w-5 text-[#C46A3A]" />
          Search customers...
        </div>
      </PagePanel>
      <PagePanel>
        {isLoading ? (
          <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading customers...</p>
        ) : customers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-lg bg-[#F8F7F5] p-4">
                <h3 className="font-semibold text-[#0A1128]">{customer.name}</h3>
                <p className="text-sm text-[#4E5871]">{customer.email || 'No email saved'}</p>
                <p className="text-sm text-[#4E5871]">{customer.phone || 'No phone saved'}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            icon={Users}
            title="No customers yet"
            description="Customer records will be created from bookings or added manually for this cattery."
          />
        )}
      </PagePanel>
    </div>
  );
}

function RoomPlannerSection({ rooms, data, isLoading }: { rooms: Room[]; data: ReturnType<typeof buildDashboardData>; isLoading: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Arriving" value={isLoading ? '-' : data.arrivalsToday.length} />
        <MetricTile label="Departing" value={isLoading ? '-' : data.departuresToday.length} />
        <MetricTile label="Occupied" value={isLoading ? '-' : data.occupiedNow.length} tone="navy" />
        <MetricTile label="Available" value={isLoading ? '-' : data.availableRooms} tone="green" />
      </div>
      <PagePanel>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Room status board</h2>
          <p className="text-sm text-[#4E5871]">Blank until this tenant adds real rooms and bookings.</p>
        </div>
        {isLoading ? (
          <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading rooms...</p>
        ) : rooms.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => {
              const occupied = data.occupiedNow.some((booking) => booking.room?.id === room.id);
              return (
                <div key={room.id} className="rounded-lg border border-[#E8DED4] bg-[#F8F7F5] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-[#0A1128]">{room.name}</h3>
                    <Badge className={`rounded-full ${occupied ? 'bg-[#C46A3A] text-white hover:bg-[#C46A3A]' : 'bg-[#7DAF7B]/20 text-[#2D5830] hover:bg-[#7DAF7B]/20'}`}>
                      {occupied ? 'Occupied' : 'Available'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#4E5871]">Capacity: {room.capacity || 1} cats</p>
                  <p className="text-sm text-[#4E5871]">${room.price_per_night || 0} per night</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyPanel
            icon={Cat}
            title="No rooms set up yet"
            description="Rooms added during setup or in the room planner will appear here."
          />
        )}
      </PagePanel>
    </div>
  );
}

function CalendarSection({ data, isLoading }: { data: ReturnType<typeof buildDashboardData>; isLoading: boolean }) {
  const upcoming = [...data.arrivalsToday, ...data.departuresToday];
  return (
    <PagePanel>
      {isLoading ? (
        <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading calendar...</p>
      ) : upcoming.length > 0 ? (
        <div className="space-y-3">
          {upcoming.map((booking) => (
            <BookingRow key={booking.id} booking={booking} actionLabel="Open" />
          ))}
        </div>
      ) : (
        <EmptyPanel
          icon={CalendarDays}
          title="No bookings on today’s calendar"
          description="Upcoming bookings will appear here once customers book through this cattery website."
        />
      )}
    </PagePanel>
  );
}

function ToolsSection({ section }: { section: StaffSection }) {
  const meta = sectionMeta[section];
  const icon =
    section === 'smart-import' || section === 'smart-data-import'
      ? Sparkles
      : section === 'messages'
        ? MessageSquare
        : section === 'payment'
          ? CreditCard
          : LayoutGrid;
  return (
    <PagePanel>
      <EmptyPanel
        icon={icon}
        title={`${meta.title} is ready for live tenant data`}
        description="This area is reserved for the signed-up cattery only. Demo examples stay in the public demo and will not appear here."
      />
    </PagePanel>
  );
}

function MetricTile({ label, value, tone = 'light' }: { label: string; value: string | number; tone?: 'light' | 'orange' | 'navy' | 'green' }) {
  const toneClass =
    tone === 'orange'
      ? 'bg-[#C46A3A] text-white'
      : tone === 'navy'
        ? 'bg-[#0A1128] text-white'
        : tone === 'green'
          ? 'bg-[#7DAF7B]/15 text-[#2D5830]'
          : 'bg-white text-[#0A1128] ring-1 ring-[#E8DED4]';

  return (
    <div className={`rounded-lg p-5 shadow-sm ${toneClass}`}>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function buildDashboardData(bookings: Booking[], rooms: Room[], today: string) {
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
}

// Production staff workspace. Demo data stays isolated in DashboardPreviewMock and /demo routes.
// The earlier sparse/admin dashboard path is retired for signed-up tenant dashboards.
export function StaffDashboard() {
  const location = useLocation();
  const { cattery, loading: authLoading } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { customers, loading: customersLoading } = useCustomers();
  const { rooms, loading: roomsLoading } = useRooms();

  const draftAccount = getDraftAccount();
  const isLoading = authLoading || bookingsLoading || customersLoading || roomsLoading;
  const today = getLocalDateKey();
  const section = staffSectionFromPath(location.pathname);
  const showNewBooking = section === 'bookings' && new URLSearchParams(location.search).get('new') === 'true';

  const dashboardData = useMemo(() => buildDashboardData(bookings, rooms, today), [bookings, rooms, today]);

  const businessName = cattery?.name || draftAccount?.businessName || 'Your cattery';
  const tenantHost = cattery?.slug ? `${cattery.slug}.${ROOT_DOMAIN}` : 'your-handle.catstays.app';
  const shouldRedirectToTenantDashboard = !!cattery?.slug && isRootCatStaysHost();
  const meta = sectionMeta[section];

  useEffect(() => {
    if (shouldRedirectToTenantDashboard && cattery?.slug) {
      window.location.assign(getTenantStaffDashboardUrl(cattery.slug, location.pathname + location.search));
    }
  }, [cattery?.slug, location.pathname, location.search, shouldRedirectToTenantDashboard]);

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
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <RightMenu />
            </div>
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
        {section !== 'today' && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">{section === 'room-planner' ? 'Room planner' : 'Workspace'}</p>
            <h2 className="text-3xl font-semibold text-[#0A1128]">{meta.title}</h2>
            <p className="mt-1 text-sm text-[#4E5871]">{meta.subtitle}</p>
          </div>
        )}

        {section === 'today' && (
          <TodaySection
            businessName={businessName}
            bookings={bookings}
            customers={customers}
            isLoading={isLoading}
            rooms={rooms}
            tenantHost={tenantHost}
            data={dashboardData}
            catterySlug={cattery?.slug}
          />
        )}
        {section === 'bookings' && <BookingsSection bookings={bookings} isLoading={isLoading} showNewBooking={showNewBooking} />}
        {section === 'customers' && <CustomersSection customers={customers} isLoading={isLoading} />}
        {section === 'calendar' && <CalendarSection data={dashboardData} isLoading={isLoading} />}
        {section === 'room-planner' && <RoomPlannerSection rooms={rooms} data={dashboardData} isLoading={isLoading} />}
        {[
          'smart-import',
          'smart-data-import',
          'accounting',
          'messages',
          'promotions',
          'payment',
          'social',
          'cat-update-generator',
          'insights',
          'settings',
          'booking-setup',
          'marketing',
          'subscription',
        ].includes(section) && <ToolsSection section={section} />}
      </main>
      </div>
    </div>
  );
}
