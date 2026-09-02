import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  BookOpen,
  BellRing,
  CalendarDays,
  Cat,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Home,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useCustomers } from '@/hooks/useCustomers';
import { useRooms } from '@/hooks/useRooms';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { StaffInsights } from './StaffInsights';
import { StaffRoomCalendar } from './StaffRoomCalendar';
import { StaffCustomerDirectory } from './StaffCustomerDirectory';
import { StaffSubscription } from './StaffSubscription';
import {
  bookingRoomUnitKeys,
  physicalRoomName,
} from '../../lib/roomInventory';
import { bookingFinancials } from '../../lib/bookingOperations';
import { normalizeBookingSetup } from '../../lib/bookingSetup';
import { customerMatchesDirectorySearch } from '../../lib/customerDirectory';
import { formatBookingTime } from '../../lib/bookingSchedule';
import { buildDashboardData, dailyBookingAction } from '../../lib/staffDashboard';

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
  customers: { title: 'Customers', subtitle: 'Customer details, cats, stays, balances, and credits' },
  calendar: { title: 'Calendar', subtitle: 'Room availability and draggable stays' },
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

function formatDayLabel(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function shiftDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
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

function getCatNames(booking: { booking_cats?: { cat?: { name?: string | null } | null }[]; cat_names?: string | null }) {
  const names = booking.booking_cats
    ?.map((entry) => entry.cat?.name)
    .filter((name): name is string => Boolean(name));

  return names && names.length > 0 ? names.join(', ') : booking.cat_names || 'Cat guest';
}

function BookingRow({
  booking,
  actionLabel,
  onAction,
  actionDisabled = false,
}: {
  booking: Booking;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}) {
  const { cattery } = useAuth();
  const bookingSetup = normalizeBookingSetup(cattery?.website_settings);
  const catNames = getCatNames(booking);
  const customerName = booking.customer?.name || booking.guest_name || 'New customer';
  const roomName = booking.room ? getBookingPhysicalRoomNames(booking, booking.room as Room) : 'Unassigned room';
  const financials = bookingFinancials(Number(booking.total_amount || 0), booking.booking_adjustments || [], booking.payments || [], {
    chargeTax: bookingSetup.chargeTax,
    taxRate: bookingSetup.taxRate,
  });
  const paid = financials.owing <= 0 || booking.payment_status === 'paid';

  const bookingHref = `/staff-dashboard/bookings?booking=${booking.id}`;

  return (
    <article className="grid gap-3 rounded-lg bg-[#F8F7F5] p-4 transition hover:bg-[#F1E8DE] sm:grid-cols-[1fr_auto] sm:items-center">
      <Link to={bookingHref} aria-label={`Open ${customerName} booking`} className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46A3A] focus-visible:ring-offset-2">
        <p className="font-semibold text-[#0A1128]">{customerName}</p>
        <div className="mt-1 flex flex-wrap gap-1">{catNames.split(',').map((name) => <Badge key={name.trim()} variant="outline" className="bg-white text-xs">🐱 {name.trim()}</Badge>)}</div>
        <p className="mt-2 text-xs text-[#768098]">{roomName}</p>
        <p className="mt-0.5 text-xs font-medium text-[#4E5871]">
          {formatDate(booking.check_in)} {booking.check_in_time ? formatBookingTime(booking.check_in_time) : ''}
          {' → '}
          {formatDate(booking.check_out)} {booking.check_out_time ? formatBookingTime(booking.check_out_time) : ''}
        </p>
      </Link>
      <div className="flex items-center gap-2 sm:justify-end">
        <Badge className="rounded-full bg-[#E9D7C8] text-[#8A4E2B] hover:bg-[#E9D7C8]">
          {paid ? 'Paid' : `Owing $${financials.owing.toFixed(2)}`}
        </Badge>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className="inline-flex h-9 items-center rounded-full bg-[#0A1128] px-4 text-sm font-medium text-white transition hover:bg-[#19233D] disabled:cursor-wait disabled:opacity-55"
          >
            {actionDisabled ? 'Saving…' : actionLabel}
          </button>
        ) : (
          <Link to={bookingHref} className="inline-flex h-9 items-center rounded-full bg-[#0A1128] px-4 text-sm font-medium text-white transition hover:bg-[#19233D]">
            {actionLabel}
          </Link>
        )}
      </div>
    </article>
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
  selectedDate,
  onSelectedDateChange,
  updateBookingStatus,
}: {
  businessName: string;
  bookings: Booking[];
  customers: Customer[];
  isLoading: boolean;
  rooms: Room[];
  tenantHost: string;
  data: ReturnType<typeof buildDashboardData>;
  catterySlug?: string;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  updateBookingStatus: ReturnType<typeof useBookings>['updateBookingStatus'];
}) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [statusActionId, setStatusActionId] = useState('');
  const [statusActionError, setStatusActionError] = useState('');
  const customerMatches = customerSearch.trim()
    ? customers.filter((customer) => customerMatchesDirectorySearch(customer, customerSearch)).slice(0, 6)
    : [];

  const applyDailyStatus = async (booking: Booking, nextStatus: string) => {
    setStatusActionId(booking.id);
    setStatusActionError('');
    const { error } = await updateBookingStatus(booking.id, nextStatus);
    if (error) {
      setStatusActionError(typeof error === 'string' ? error : error.message || 'The booking could not be updated.');
    }
    setStatusActionId('');
  };

  return (
    <>
      <section className="mb-5 rounded-lg border border-[#E8DED4] bg-white p-4 shadow-sm sm:p-5">
        <Link to="/staff-dashboard/bookings?new=true">
          <Button className="mb-3 h-12 w-full rounded-lg bg-[#C46A3A] text-base font-semibold text-white hover:bg-[#A85A30] sm:h-14">
            <Plus className="mr-2 h-5 w-5" />
            New booking
          </Button>
        </Link>

        <div className="relative mb-3">
          <label className="flex min-w-0 items-center gap-3 rounded-lg border border-[#E8DED4] bg-white px-4 py-3 shadow-sm focus-within:border-[#C46A3A]">
            <Search className="h-5 w-5 shrink-0 text-[#C46A3A]" />
            <span className="sr-only">Find a customer or cat</span>
            <input
              value={customerSearch}
              onChange={(event) => setCustomerSearch(event.currentTarget.value)}
              placeholder="Find a customer or cat…"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0A1128] outline-none placeholder:text-[#768098]"
            />
            {customerSearch && <button type="button" onClick={() => setCustomerSearch('')} aria-label="Clear customer search" className="text-[#768098] hover:text-[#0A1128]"><X className="h-4 w-4" /></button>}
          </label>
          {customerSearch.trim() && (
            <div className="absolute inset-x-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#E8DED4] bg-white p-1 shadow-xl">
              {customerMatches.length > 0 ? customerMatches.map((customer) => (
                <div key={customer.id} className="flex items-stretch gap-1 rounded-lg hover:bg-[#FFF8F2]">
                  <Link
                    to={`/staff-dashboard/customers?search=${encodeURIComponent(customer.id)}`}
                    className="min-w-0 flex-1 px-3 py-3"
                  >
                    <p className="truncate font-semibold text-[#0A1128]">{customer.name}</p>
                    <p className="truncate text-sm text-[#4E5871]">{customer.email} · {customer.phone || 'No phone'}</p>
                    <p className="mt-0.5 truncate text-xs text-[#768098]">{(customer.cats || []).map((cat) => cat.name).join(', ') || 'No cats saved'}</p>
                  </Link>
                  <Link
                    to={`/staff-dashboard/bookings?new=true&customer=${customer.id}`}
                    aria-label={`Start a booking for ${customer.name}`}
                    className="m-1 grid w-11 shrink-0 place-items-center rounded-lg text-[#C46A3A] hover:bg-[#C46A3A]/10"
                  >
                    <Plus className="h-5 w-5" />
                  </Link>
                </div>
              )) : <p className="px-3 py-4 text-sm text-[#4E5871]">No matching customer or cat.</p>}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[#E8DED4] bg-[#F8F7F5] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => onSelectedDateChange(shiftDateKey(selectedDate, -1))} aria-label="Previous day" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E8DED4] bg-white"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-3 text-center">
              <CalendarDays className="h-5 w-5 shrink-0 text-[#0A1128]" />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-tight sm:text-xl">{selectedDate === getLocalDateKey() ? 'Today' : 'Daily overview'}</h2>
                <p className="truncate text-xs text-[#4E5871] sm:text-sm">{formatDayLabel(selectedDate)}</p>
              </div>
            </div>
            <button type="button" onClick={() => onSelectedDateChange(shiftDateKey(selectedDate, 1))} aria-label="Next day" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E8DED4] bg-white"><ChevronRight className="h-5 w-5" /></button>
          </div>
          {selectedDate !== getLocalDateKey() && <button type="button" onClick={() => onSelectedDateChange(getLocalDateKey())} className="mx-auto mt-2 block text-xs font-semibold text-[#C46A3A]">Return to today</button>}

          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="min-w-0 rounded-lg bg-[#0A1128] p-3 text-center text-white shadow-sm sm:p-5">
              <p className="text-2xl font-semibold sm:text-3xl">{isLoading ? '-' : data.arrivalsToday.length}</p>
              <p className="truncate text-xs text-white/80 sm:text-sm">Arrivals</p>
            </div>
            <div className="min-w-0 rounded-lg bg-[#C46A3A] p-3 text-center text-white shadow-sm sm:p-5">
              <p className="text-2xl font-semibold sm:text-3xl">{isLoading ? '-' : data.departuresToday.length}</p>
              <p className="truncate text-xs text-white/85 sm:text-sm">Departures</p>
            </div>
            <Link to="/staff-dashboard/room-planner" className="min-w-0 rounded-lg bg-white p-3 text-center shadow-sm ring-1 ring-[#E8DED4] hover:bg-white sm:p-5">
              <p className="truncate text-2xl font-semibold sm:text-3xl">{isLoading ? '-' : data.occupancyLabel}</p>
              <p className="truncate text-xs text-[#4E5871] sm:text-sm">Occupied</p>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <BookingListPanel
          title={selectedDate === getLocalDateKey() ? 'Arrivals Today' : 'Arrivals'}
          count={data.arrivalsToday.length}
          loadingLabel="Loading arrivals..."
          bookings={data.arrivalsToday}
          emptyIcon={Clock}
          emptyTitle="No arrivals scheduled for today"
          emptyDescription="New arrivals will appear here as soon as they are booked for this cattery."
          actionLabel="Check in"
          isLoading={isLoading}
          actionKind="arrival"
          actionBookingId={statusActionId}
          onBookingAction={applyDailyStatus}
        />
        <BookingListPanel
          title={selectedDate === getLocalDateKey() ? 'Departures Today' : 'Departures'}
          count={data.departuresToday.length}
          loadingLabel="Loading departures..."
          bookings={data.departuresToday}
          emptyIcon={CheckCircle2}
          emptyTitle="No departures scheduled for today"
          emptyDescription="Check-outs for this cattery will show here when bookings reach their departure date."
          actionLabel="Check out"
          isLoading={isLoading}
          actionKind="departure"
          actionBookingId={statusActionId}
          onBookingAction={applyDailyStatus}
        />
      </div>

      {statusActionError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{statusActionError}</p>}

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
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Pending bookings</h2><Badge className="bg-[#F1E8DE] text-[#8A4E2B] hover:bg-[#F1E8DE]">{data.pending.length}</Badge></div>
            <div className="mt-4 space-y-2">
              {data.pending.slice(0, 4).map((booking) => <BookingRow key={booking.id} booking={booking} actionLabel="Review" />)}
              {data.pending.length === 0 && <p className="rounded-lg bg-[#F8F7F5] p-4 text-sm text-[#4E5871]">No booking requests are waiting.</p>}
            </div>
          </PagePanel>

          <PagePanel>
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-xl font-semibold">Latest bookings</h2><p className="text-xs text-[#4E5871]">Most recently received</p></div>
              <Link to="/staff-dashboard/bookings" className="text-sm font-semibold text-[#C46A3A]">View all</Link>
            </div>
            <div className="mt-4 space-y-2">
              {data.latestBookings.map((booking) => <BookingRow key={booking.id} booking={booking} actionLabel="Open" />)}
              {data.latestBookings.length === 0 && <p className="rounded-lg bg-[#F8F7F5] p-4 text-sm text-[#4E5871]">No recent bookings yet.</p>}
            </div>
          </PagePanel>

          {data.waitingList.length > 0 && <PagePanel>
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Waiting list</h2><Badge variant="outline">{data.waitingList.length}</Badge></div>
            <div className="mt-4 space-y-2">{data.waitingList.map((booking) => <BookingRow key={booking.id} booking={booking} actionLabel="Open" />)}</div>
          </PagePanel>}

          <PagePanel>
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">7-day occupancy</h2><p className="text-xs text-[#4E5871]">Physical rooms in use</p></div><Link to={`/staff-dashboard/calendar?date=${selectedDate}`} className="text-sm font-semibold text-[#C46A3A]">Calendar</Link></div>
            <div className="mt-4 grid grid-cols-7 gap-1">{data.occupancyWeek.map((day) => <div key={day.date} className="text-center"><div className="flex h-20 items-end overflow-hidden rounded-md bg-[#F1E8DE]"><div className="w-full bg-[#C46A3A]" style={{ height: `${Math.max(day.percentage, day.count ? 8 : 0)}%` }} /></div><span className="mt-1 block text-[10px] text-[#4E5871]">{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}</span><span className="block text-[10px] font-semibold">{day.count}</span></div>)}</div>
            <div className="mt-4 overflow-hidden rounded-lg border border-[#E8DED4]">
              <table className="w-full table-fixed text-center text-xs">
                <thead className="bg-[#F8F7F5] text-[#4E5871]"><tr><th className="px-2 py-2 text-left font-semibold">Day</th><th className="px-1 py-2 font-semibold">In</th><th className="px-1 py-2 font-semibold">Out</th><th className="px-1 py-2 font-semibold">Day end</th></tr></thead>
                <tbody>{data.occupancyWeek.map((day) => <tr key={`${day.date}-summary`} className="border-t border-[#EEE7DF]"><td className="px-2 py-2 text-left font-medium">{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</td><td className="px-1 py-2">{day.arrivals}</td><td className="px-1 py-2">{day.departures}</td><td className="px-1 py-2 font-semibold">{day.dayEnd}</td></tr>)}</tbody>
              </table>
            </div>
          </PagePanel>

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
            <Link to={catterySlug ? '/' : '/site'}>
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
  actionKind,
  actionBookingId,
  onBookingAction,
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
  actionKind?: 'arrival' | 'departure';
  actionBookingId?: string;
  onBookingAction?: (booking: Booking, nextStatus: string) => Promise<void>;
}) {
  const EmptyIcon = emptyIcon;

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
            (() => {
              const action = actionKind ? dailyBookingAction(booking.status, actionKind) : { label: actionLabel, nextStatus: null };
              return <BookingRow
                key={booking.id}
                booking={booking}
                actionLabel={action.label}
                actionDisabled={actionBookingId === booking.id}
                onAction={action.nextStatus && onBookingAction ? () => void onBookingAction(booking, action.nextStatus as string) : undefined}
              />;
            })()
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-[#E8DED4] bg-[#F8F7F5] px-3 py-3">
          <EmptyIcon className="h-5 w-5 shrink-0 text-[#C46A3A]" />
          <p className="text-sm font-semibold text-[#0A1128]">{emptyTitle}</p>
          <span className="sr-only">{emptyDescription}</span>
        </div>
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

function CustomersSection({
  customers,
  isLoading,
  createCustomer,
  addCat,
}: {
  customers: Customer[];
  isLoading: boolean;
  createCustomer: ReturnType<typeof useCustomers>['createCustomer'];
  addCat: ReturnType<typeof useCustomers>['addCat'];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', catName: '' });
  const query = searchQuery.trim().toLowerCase();
  const filteredCustomers = query
    ? customers.filter((customer) => [
      customer.name,
      customer.email,
      customer.phone,
      ...(customer.cats || []).map((cat) => cat.name),
    ].some((value) => value?.toLowerCase().includes(query)))
    : customers;

  const closeAddCustomer = () => {
    if (saving) return;
    setShowAddCustomer(false);
    setSaveError('');
  };

  const handleAddCustomer = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newCustomer.name.trim();
    const email = newCustomer.email.trim();
    const phone = newCustomer.phone.trim();
    const catName = newCustomer.catName.trim();

    setSaving(true);
    setSaveError('');

    const { data: customer, error } = await createCustomer({
      name,
      email,
      phone: phone || undefined,
    });

    if (error || !customer) {
      setSaveError(typeof error === 'string' ? error : error?.message || 'The customer could not be added.');
      setSaving(false);
      return;
    }

    if (catName) {
      const { error: catError } = await addCat(customer.id, { name: catName });
      if (catError) {
        setSaveError(
          typeof catError === 'string'
            ? catError
            : catError.message || 'The customer was added, but the cat could not be added.',
        );
        setSaving(false);
        return;
      }
    }

    setNewCustomer({ name: '', email: '', phone: '', catName: '' });
    setSaving(false);
    setShowAddCustomer(false);
  };

  return (
    <div className="space-y-5">
      <PagePanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#E8DED4] bg-[#F8F7F5] px-4 py-3 text-[#768098] focus-within:border-[#C46A3A]">
            <Search className="h-5 w-5 shrink-0 text-[#C46A3A]" />
            <span className="sr-only">Search customers</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, cat, email, or phone…"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0A1128] outline-none placeholder:text-[#768098]"
            />
          </label>
          <Button
            type="button"
            onClick={() => setShowAddCustomer(true)}
            className="rounded-lg bg-[#C46A3A] px-5 text-white hover:bg-[#A85A30]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add customer
          </Button>
        </div>
      </PagePanel>
      <PagePanel>
        {isLoading ? (
          <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading customers...</p>
        ) : filteredCustomers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="rounded-lg bg-[#F8F7F5] p-4">
                <h3 className="font-semibold text-[#0A1128]">{customer.name}</h3>
                {customer.email ? <a href={`mailto:${customer.email}`} className="mt-1 block break-all text-sm text-[#4E5871] hover:text-[#C46A3A]">{customer.email}</a> : <p className="text-sm text-[#4E5871]">No email saved</p>}
                {customer.phone ? <a href={`tel:${customer.phone}`} className="block text-sm text-[#4E5871] hover:text-[#C46A3A]">{customer.phone}</a> : <p className="text-sm text-[#4E5871]">No phone saved</p>}
                {(customer.cats || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {customer.cats.map((cat) => <Badge key={cat.id} variant="outline" className="bg-white">🐱 {cat.name}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            icon={Users}
            title={query ? 'No matching customers' : 'No customers yet'}
            description={query ? 'Try a customer name, cat name, email address, or phone number.' : 'Customer records will be created from bookings or added manually for this cattery.'}
            action={!query ? (
              <Button
                type="button"
                onClick={() => setShowAddCustomer(true)}
                className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add customer
              </Button>
            ) : undefined}
          />
        )}
      </PagePanel>

      {showAddCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0A1128]/45 p-0 sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddCustomer();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-customer-title"
            className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 id="add-customer-title" className="text-2xl font-semibold text-[#0A1128]">Add customer</h3>
                <p className="mt-1 text-sm text-[#4E5871]">Add their first cat now, or leave it blank and add the cat when you make a booking.</p>
              </div>
              <button
                type="button"
                onClick={closeAddCustomer}
                aria-label="Close add customer"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E8DED4] text-[#4E5871] hover:bg-[#F8F7F5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              {saveError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </p>
              )}
              <label className="block text-sm font-semibold text-[#0A1128]">
                Name
                <input
                  required
                  autoFocus
                  autoComplete="name"
                  value={newCustomer.name}
                  onChange={(event) => setNewCustomer((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0A1128]">
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={newCustomer.email}
                  onChange={(event) => setNewCustomer((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0A1128]">
                Mobile number <span className="font-normal text-[#768098]">(optional)</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={newCustomer.phone}
                  onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0A1128]">
                First cat's name <span className="font-normal text-[#768098]">(optional)</span>
                <input
                  value={newCustomer.catName}
                  onChange={(event) => setNewCustomer((current) => ({ ...current, catName: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeAddCustomer} disabled={saving} className="rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                  {saving ? 'Adding customer…' : 'Add customer'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

type RoomPlannerProps = {
  rooms: Room[];
  data: ReturnType<typeof buildDashboardData>;
  isLoading: boolean;
  roomError: string | null;
  createRoom: ReturnType<typeof useRooms>['createRoom'];
  updateRoom: ReturnType<typeof useRooms>['updateRoom'];
  toggleActive: ReturnType<typeof useRooms>['toggleActive'];
};

type RoomDraft = {
  name: string;
  type: string;
  description: string;
  roomCount: string;
  capacity: string;
  dailyRate: string;
  isActive: boolean;
};

const emptyRoomDraft: RoomDraft = {
  name: '',
  type: '',
  description: '',
  roomCount: '1',
  capacity: '1',
  dailyRate: '',
  isActive: true,
};

function roomActionError(error: unknown) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'The room could not be saved.';
}

function RoomPlannerSection({
  rooms,
  data,
  isLoading,
  roomError,
  createRoom,
  updateRoom,
  toggleActive,
}: RoomPlannerProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [draft, setDraft] = useState<RoomDraft>(emptyRoomDraft);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const openAddRoom = () => {
    setEditingRoom(null);
    setDraft(emptyRoomDraft);
    setActionError('');
    setEditorOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setDraft({
      name: room.name || '',
      type: room.type || '',
      description: room.description || '',
      roomCount: String(room.room_count || 1),
      capacity: String(room.capacity || 1),
      dailyRate: String(room.price_per_night ?? ''),
      isActive: room.is_active,
    });
    setActionError('');
    setEditorOpen(true);
  };

  const saveRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError('');
    setActionMessage('');

    const name = draft.name.trim();
    const type = draft.type.trim();
    const roomCount = Number(draft.roomCount);
    const capacity = Number(draft.capacity);
    const pricePerDay = Number(draft.dailyRate);
    if (!name || !type || !Number.isInteger(roomCount) || roomCount < 1 || !Number.isInteger(capacity) || capacity < 1 || !Number.isFinite(pricePerDay) || pricePerDay < 0) {
      setActionError('Enter a room name, room type, number of physical rooms, whole-number capacity, and valid daily rate.');
      return;
    }

    setSaving(true);
    const values = {
      name,
      type,
      description: draft.description.trim(),
      room_count: roomCount,
      capacity,
      price_per_night: pricePerDay,
      is_active: draft.isActive,
    };
    const result = editingRoom
      ? await updateRoom(editingRoom.id, values)
      : await createRoom(values);
    setSaving(false);

    if (result.error) {
      setActionError(roomActionError(result.error));
      return;
    }

    setEditorOpen(false);
    setActionMessage(editingRoom ? `${name} was updated.` : `${name} was added.`);
  };

  const changeActiveState = async (room: Room) => {
    setActionError('');
    setActionMessage('');
    const result = await toggleActive(room.id, !room.is_active);
    if (result.error) {
      setActionError(roomActionError(result.error));
      return;
    }
    setActionMessage(`${room.name} is now ${room.is_active ? 'inactive' : 'active'}.`);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Arriving" value={isLoading ? '-' : data.arrivalsToday.length} />
        <MetricTile label="Departing" value={isLoading ? '-' : data.departuresToday.length} />
        <MetricTile label="Occupied" value={isLoading ? '-' : data.occupiedRoomKeys.length} tone="navy" />
        <MetricTile label="Available" value={isLoading ? '-' : data.availableRooms} tone="green" />
      </div>
      <PagePanel>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Room status board</h2>
            <p className="text-sm text-[#4E5871]">Live occupancy, assigned cats, capacity, and daily rates for this cattery.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/staff-dashboard/calendar">
              <Button variant="outline" className="w-full sm:w-auto">View calendar</Button>
            </Link>
            <Button onClick={openAddRoom} className="w-full bg-[#C46A3A] text-white hover:bg-[#A85A30] sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add room
            </Button>
          </div>
        </div>
        {(roomError || actionError) && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError || roomError}
          </p>
        )}
        {actionMessage && (
          <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {actionMessage}
          </p>
        )}
        {isLoading ? (
          <p className="rounded-lg bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading rooms...</p>
        ) : rooms.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => {
              const roomBookings = data.occupiedNow.filter((booking) => bookingRoomIds(booking).includes(room.id));
              const occupiedUnits = data.occupiedRoomKeys.filter((key) => key.startsWith(`${room.id}:`)).length;
              const occupied = room.is_active && occupiedUnits > 0;
              return (
                <div key={room.id} className={`rounded-xl border p-4 ${room.is_active ? 'border-[#E8DED4] bg-[#F8F7F5]' : 'border-dashed border-[#D3CBC3] bg-[#F3F1EE] opacity-75'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-[#0A1128]">{room.name}</h3>
                    <Badge className={`rounded-full ${!room.is_active ? 'bg-[#E4E0DB] text-[#4E5871] hover:bg-[#E4E0DB]' : occupied ? 'bg-[#C46A3A] text-white hover:bg-[#C46A3A]' : 'bg-[#7DAF7B]/20 text-[#2D5830] hover:bg-[#7DAF7B]/20'}`}>
                      {!room.is_active ? 'Inactive' : occupied ? `${occupiedUnits}/${room.room_count || 1} occupied` : 'All available'}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">{room.type || 'Room'}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-[#4E5871]">
                    <p>Rooms<br /><span className="font-semibold text-[#0A1128]">{room.room_count || 1}</span></p>
                    <p>Per room<br /><span className="font-semibold text-[#0A1128]">{room.capacity || 1} cats</span></p>
                    <p>Daily rate<br /><span className="font-semibold text-[#0A1128]">${room.price_per_night || 0} per cat</span></p>
                  </div>
                  {roomBookings.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-[#E8DED4] pt-3">
                      {roomBookings.map((booking) => (
                        <Link key={booking.id} to={`/staff-dashboard/bookings?booking=${booking.id}`} className="block rounded-lg bg-white p-3 ring-1 ring-[#E8DED4] transition hover:ring-[#C46A3A]/45">
                          <span className="block truncate text-sm font-semibold text-[#0A1128]">{getRoomCatNames(booking, room.id)}</span>
                          <span className="block truncate text-xs text-[#4E5871]">
                            {getBookingPhysicalRoomNames(booking, room)} · {booking.customer?.name || booking.guest_name || 'Customer'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-col gap-2 border-t border-[#E8DED4] pt-3 sm:flex-row">
                    <Button type="button" variant="outline" onClick={() => openEditRoom(room)} className="flex-1 rounded-lg">
                      Edit room
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void changeActiveState(room)}
                      disabled={occupied}
                      title={occupied ? 'An occupied room cannot be deactivated.' : undefined}
                      className="flex-1 rounded-lg"
                    >
                      {room.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
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

      <Dialog open={editorOpen} onOpenChange={(open) => !saving && setEditorOpen(open)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit room' : 'Add room'}</DialogTitle>
            <DialogDescription>
              The room count creates the individually bookable rows. Capacity is how many cats can share each physical room.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveRoom} className="space-y-4">
            <label className="block text-sm font-semibold text-[#0A1128]">
              Room name
              <input
                required
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0A1128]">
              Room type
              <input
                required
                value={draft.type}
                onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-semibold text-[#0A1128]">
                Number of physical rooms
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={draft.roomCount}
                  onChange={(event) => setDraft((current) => ({ ...current, roomCount: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0A1128]">
                Cats per room
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={draft.capacity}
                  onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0A1128]">
                Daily rate per cat ($)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={draft.dailyRate}
                  onChange={(event) => setDraft((current) => ({ ...current, dailyRate: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-[#0A1128]">
              Description <span className="font-normal text-[#4E5871]">(optional)</span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                className="mt-1.5 w-full resize-y rounded-lg border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]"
              />
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-[#E8DED4] bg-[#F8F7F5] p-3 text-sm text-[#0A1128]">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                className="mt-0.5 h-4 w-4 accent-[#C46A3A]"
              />
              <span><span className="block font-semibold">Available for bookings</span><span className="block text-xs text-[#4E5871]">Inactive rooms stay in the planner but cannot be assigned to new stays.</span></span>
            </label>
            {actionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                {saving ? 'Saving…' : editingRoom ? 'Save changes' : 'Add room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolsSection({ section }: { section: StaffSection }) {
  const meta = sectionMeta[section];
  if (section === 'settings') {
    const settingsTools = [
      {
        path: '/staff-dashboard/settings/notifications',
        icon: BellRing,
        title: 'Phone notifications',
        description: 'Connect this installed app to native booking and customer alerts.',
      },
      {
        path: '/staff-dashboard/booking-setup',
        icon: CalendarDays,
        title: 'Booking rules & hours',
        description: 'Set open days, appointment times, deposits, pricing, and public booking rules.',
      },
      {
        path: '/staff-dashboard/payment',
        icon: CreditCard,
        title: 'Customer payments',
        description: 'Connect this cattery to Stripe and control customer payment requests.',
      },
      {
        path: '/staff-dashboard/subscription',
        icon: CheckCircle2,
        title: 'CatStays subscription',
        description: 'See the cattery plan and manage CatStays platform billing separately.',
      },
      {
        path: '/staff-dashboard/smart-import',
        icon: Sparkles,
        title: 'Import & export data',
        description: 'Bring in customers, cats, rooms, and bookings, or export a backup.',
      },
      {
        path: '/staff-dashboard/website-editor',
        icon: Home,
        title: 'Business & website details',
        description: 'Update the cattery contact details and the content shown on its public website.',
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsTools.map(({ path, icon: Icon, title, description }) => (
          <Link
            key={path}
            to={path}
            className="group flex min-w-0 items-start gap-4 rounded-2xl border border-[#E8DED4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C46A3A]/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46A3A]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C46A3A]/10">
              <Icon className="h-6 w-6 text-[#C46A3A]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-[#0A1128]">{title}</span>
              <span className="mt-1 block text-sm leading-6 text-[#4E5871]">{description}</span>
            </span>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#0A1128]/35 transition group-hover:translate-x-0.5 group-hover:text-[#C46A3A]" />
          </Link>
        ))}
      </div>
    );
  }
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
        title={`${meta.title} is coming soon`}
        description="This workspace is not live yet. CatStays will keep it out of operational workflows until it is connected to real cattery data."
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

function bookingRoomIds(booking: Booking) {
  const assignedRoomIds = (booking.booking_cat_rooms || [])
    .map((assignment) => assignment.room?.id)
    .filter((roomId): roomId is string => Boolean(roomId));
  if (booking.room?.id) assignedRoomIds.push(booking.room.id);
  return [...new Set(assignedRoomIds)];
}

function getRoomCatNames(booking: Booking, roomId: string) {
  const assignedNames = (booking.booking_cat_rooms || [])
    .filter((assignment) => assignment.room?.id === roomId)
    .map((assignment) => assignment.cat?.name)
    .filter((name): name is string => Boolean(name));
  return assignedNames.length > 0 ? assignedNames.join(', ') : getCatNames(booking);
}

function getBookingPhysicalRoomNames(booking: Booking, room: Room) {
  const units = bookingRoomUnitKeys(booking)
    .filter((key) => key.startsWith(`${room.id}:`))
    .map((key) => Number(key.slice(key.lastIndexOf(':') + 1)))
    .filter((unitNumber) => Number.isInteger(unitNumber) && unitNumber > 0);
  return units.length > 0
    ? units.map((unitNumber) => physicalRoomName(room, unitNumber)).join(', ')
    : room.name;
}

// Production staff workspace. Demo data stays isolated in DashboardPreviewMock and /demo routes.
// The earlier sparse/admin dashboard path is retired for signed-up tenant dashboards.
export function StaffDashboard() {
  const location = useLocation();
  const { cattery, loading: authLoading } = useAuth();
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    moveBooking,
    splitBooking,
    updateBookingStatus,
    refetch: refetchBookings,
  } = useBookings();
  const {
    customers,
    loading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
    createCustomer,
    addCat,
    mergeCustomers,
    deleteEmptyCustomer,
  } = useCustomers();
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
    createRoom,
    updateRoom,
    toggleActive,
  } = useRooms();

  const draftAccount = getDraftAccount();
  const isLoading = authLoading || bookingsLoading || customersLoading || roomsLoading;
  const today = getLocalDateKey();
  const [selectedDate, setSelectedDate] = useState(() => new URLSearchParams(location.search).get('date') || today);
  const section = staffSectionFromPath(location.pathname);
  const showNewBooking = section === 'bookings' && new URLSearchParams(location.search).get('new') === 'true';

  const dashboardData = useMemo(() => buildDashboardData(bookings, rooms, selectedDate), [bookings, rooms, selectedDate]);

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
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p>
              <div className="flex min-w-0 items-center gap-1">
                <h1 className="truncate text-xl font-semibold">{businessName}</h1>
                <Link
                  to="/"
                  aria-label="View public website"
                  title="View public website"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#C46A3A] transition hover:bg-[#C46A3A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46A3A] focus-visible:ring-offset-2 lg:hidden"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard/bookings?new=true" className="hidden sm:block">
              <Button className="rounded-full bg-[#C46A3A] px-6 text-white shadow-sm hover:bg-[#A85A30]">
                <Plus className="mr-2 h-4 w-4" />
                New booking
              </Button>
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {(bookingsError || customersError || roomsError) && <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Some dashboard information could not be loaded. Your records have not been deleted. Please retry before relying on availability or totals.<Button variant="outline" className="mt-3 block" onClick={() => { void refetchBookings(); void refetchCustomers(); void refetchRooms(); }}>Try again</Button></div>}
        {section !== 'today' && (
          <div className={`mb-5 ${section === 'calendar' ? 'max-sm:hidden' : ''}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide text-[#C46A3A] ${section === 'customers' ? 'max-sm:hidden' : ''}`}>{section === 'room-planner' ? 'Room planner' : 'Workspace'}</p>
            <h2 className="text-3xl font-semibold text-[#0A1128]">{meta.title}</h2>
            <p className={`mt-1 text-sm text-[#4E5871] ${section === 'customers' ? 'max-sm:hidden' : ''}`}>{meta.subtitle}</p>
          </div>
        )}

        {section === 'today' && !bookingsError && !customersError && !roomsError && (
          <TodaySection
            businessName={businessName}
            bookings={bookings}
            customers={customers}
            isLoading={isLoading}
            rooms={rooms}
            tenantHost={tenantHost}
            data={dashboardData}
            catterySlug={cattery?.slug}
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            updateBookingStatus={updateBookingStatus}
          />
        )}
        {section === 'bookings' && <BookingsSection bookings={bookings} isLoading={isLoading} showNewBooking={showNewBooking} />}
        {section === 'customers' && (
          <StaffCustomerDirectory
            customers={customers}
            bookings={bookings}
            isLoading={isLoading}
            createCustomer={createCustomer}
            addCat={addCat}
            mergeCustomers={mergeCustomers}
            deleteEmptyCustomer={deleteEmptyCustomer}
            refetchBookings={refetchBookings}
          />
        )}
        {section === 'calendar' && (
          <StaffRoomCalendar
            bookings={bookings}
            rooms={rooms}
            isLoading={isLoading}
            moveBooking={moveBooking}
            splitBooking={splitBooking}
          />
        )}
        {section === 'room-planner' && (
          <RoomPlannerSection
            rooms={rooms}
            data={dashboardData}
            isLoading={isLoading}
            roomError={roomsError}
            createRoom={createRoom}
            updateRoom={updateRoom}
            toggleActive={toggleActive}
          />
        )}
        {section === 'insights' && <StaffInsights />}
        {section === 'subscription' && <StaffSubscription />}
        {[
          'smart-import',
          'smart-data-import',
          'accounting',
          'messages',
          'promotions',
          'payment',
          'social',
          'cat-update-generator',
          'settings',
          'booking-setup',
          'marketing',
        ].includes(section) && <ToolsSection section={section} />}
      </main>
      </div>
    </div>
  );
}
