import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  CalendarDays,
  Cat,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Mail,
  Menu,
  Plus,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useCustomers } from '@/hooks/useCustomers';
import { useRooms } from '@/hooks/useRooms';
import { RightMenu } from '../../components/RightMenu';

function getDraftAccount() {
  try {
    const raw = localStorage.getItem('catstays_account');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function StaffDashboard() {
  const { cattery, loading: authLoading } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { customers, loading: customersLoading } = useCustomers();
  const { rooms, loading: roomsLoading } = useRooms();

  const draftAccount = getDraftAccount();
  const isLoading = authLoading || bookingsLoading || customersLoading || roomsLoading;
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === 'pending').length;
    const arrivalsToday = bookings.filter((booking) => booking.check_in === today).length;
    const occupiedToday = bookings.filter((booking) => {
      return booking.status !== 'cancelled' && booking.check_in <= today && booking.check_out >= today;
    }).length;

    return {
      pending,
      arrivalsToday,
      occupiedToday,
      roomCount: rooms.filter((room) => room.is_active).length,
      customerCount: customers.length,
    };
  }, [bookings, customers.length, rooms, today]);

  const upcomingBookings = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .slice(0, 5);

  const businessName = cattery?.name || draftAccount?.businessName || 'Your cattery';

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
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A1128]">
      <header className="sticky top-0 z-20 border-b border-[#0A1128]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A1128] text-white">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#C46A3A]">Staff dashboard</p>
              <h1 className="text-xl font-semibold">{businessName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/staff-dashboard/bookings?new=true" className="hidden sm:block">
              <Button className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                <Plus className="mr-2 h-4 w-4" />
                New booking
              </Button>
            </Link>
            <RightMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: 'Arrivals today', value: stats.arrivalsToday, icon: CalendarDays },
            { label: 'Pending requests', value: stats.pending, icon: Clock },
            { label: 'Occupied now', value: stats.occupiedToday, icon: CheckCircle2 },
            { label: 'Active rooms', value: stats.roomCount, icon: Cat },
            { label: 'Customers', value: stats.customerCount, icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="rounded-lg border-[#E8DED4] shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-[#4E5871]">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold">{isLoading ? '-' : item.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A1128]/5">
                    <Icon className="h-5 w-5 text-[#C46A3A]" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-lg border-[#E8DED4] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E8DED4] p-5">
              <CardTitle className="text-lg">Bookings</CardTitle>
              <Link to="/staff-dashboard/bookings">
                <Button variant="outline" size="sm" className="rounded-lg border-[#0A1128]/15">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-sm text-[#4E5871]">Loading your bookings...</div>
              ) : upcomingBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C46A3A]/10">
                    <CalendarDays className="h-6 w-6 text-[#C46A3A]" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">No bookings yet</h2>
                  <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-[#4E5871]">
                    New booking requests from your website will appear here. Imported bookings will also show here once data import is complete.
                  </p>
                  <Link to="/staff-dashboard/bookings?new=true">
                    <Button className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                      Add first booking
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E8DED4]">
                  {upcomingBookings.map((booking) => {
                    const customerName = booking.customer?.name || (booking as any).guest_name || 'Guest booking';
                    const roomName = booking.room?.name || 'Unassigned room';
                    return (
                      <div key={booking.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{customerName}</h3>
                            <Badge className="rounded-md bg-[#C46A3A]/10 text-[#8A4E2B] hover:bg-[#C46A3A]/10">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-[#4E5871]">
                            {formatDate(booking.check_in)} to {formatDate(booking.check_out)} - {roomName}
                          </p>
                        </div>
                        <Link to="/staff-dashboard/bookings">
                          <Button variant="outline" size="sm" className="rounded-lg border-[#0A1128]/15">
                            Open
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-lg border-[#E8DED4] shadow-sm">
              <CardHeader className="border-b border-[#E8DED4] p-5">
                <CardTitle className="text-lg">Setup next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                <Link to="/staff-dashboard/payment" className="flex items-center justify-between rounded-lg border border-[#E8DED4] p-4 hover:bg-white">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <CreditCard className="h-4 w-4 text-[#C46A3A]" />
                    Connect Stripe
                  </span>
                  <Menu className="h-4 w-4 text-[#4E5871]" />
                </Link>
                <Link to="/staff-dashboard/website-editor" className="flex items-center justify-between rounded-lg border border-[#E8DED4] p-4 hover:bg-white">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Home className="h-4 w-4 text-[#C46A3A]" />
                    Edit website
                  </span>
                  <Menu className="h-4 w-4 text-[#4E5871]" />
                </Link>
                <Link to="/staff-dashboard/customers" className="flex items-center justify-between rounded-lg border border-[#E8DED4] p-4 hover:bg-white">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Users className="h-4 w-4 text-[#C46A3A]" />
                    Add customers
                  </span>
                  <Menu className="h-4 w-4 text-[#4E5871]" />
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-[#E8DED4] bg-[#0A1128] text-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm uppercase text-[#E9D7C8]">Website</p>
                <h2 className="mt-2 text-xl font-semibold">{cattery?.slug || 'your-handle'}.catstays.app</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Public bookings connect back to this dashboard as soon as your website is live.
                </p>
                <Link to={cattery?.slug ? `/tenant/${cattery.slug}` : '/site'}>
                  <Button className="mt-4 rounded-lg bg-white text-[#0A1128] hover:bg-[#F6F2EA]">
                    View website
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
