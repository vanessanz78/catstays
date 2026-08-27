import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

type PlatformCattery = {
  id: string;
  name: string;
  slug: string | null;
  email: string | null;
  city: string | null;
  custom_domain: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  bookingsCount: number;
  customersCount: number;
  activeRoomsCount: number;
  pendingBookingsCount: number;
  upcomingBookingsCount: number;
  published: boolean;
  payment: {
    connected: boolean;
    mode: string | null;
    lastValidatedAt: string | null;
  };
};

type PlatformOverview = {
  administrator: { email: string | null; role: string };
  summary: {
    catteries: number;
    publishedWebsites: number;
    bookings: number;
    customers: number;
    pendingBookings: number;
    connectedPayments: number;
  };
  catteries: PlatformCattery[];
  generatedAt: string;
};

function catteryWebsiteUrl(cattery: PlatformCattery) {
  if (cattery.custom_domain) return `https://${cattery.custom_domain}`;
  if (cattery.slug) return `https://${cattery.slug}.catstays.app`;
  return null;
}

function readableStatus(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function PlatformDashboard() {
  const navigate = useNavigate();
  const { session, loading: authLoading, signOut } = useAuth();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadOverview = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/platform/overview', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The platform overview could not be loaded.');
      setOverview(data as PlatformOverview);
    } catch (loadError) {
      setOverview(null);
      setError(loadError instanceof Error ? loadError.message : 'The platform overview could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (authLoading) return;
    if (session?.access_token) void loadOverview();
    else setLoading(false);
  }, [authLoading, loadOverview, session?.access_token]);

  const filteredCatteries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return overview?.catteries || [];
    return (overview?.catteries || []).filter((cattery) => [
      cattery.name,
      cattery.slug,
      cattery.custom_domain,
      cattery.email,
      cattery.city,
      cattery.subscription_status,
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [overview?.catteries, search]);

  if (!authLoading && !session) return <Navigate to="/platform/admin-login" replace />;

  const logout = async () => {
    await signOut();
    navigate('/platform/admin-login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128]">
      <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0A1128] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">CatStays platform</p>
              <h1 className="truncate font-serif text-xl font-semibold sm:text-2xl">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={loading} onClick={() => void loadOverview()} aria-label="Refresh platform data">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void logout()} aria-label="Sign out of platform admin">
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl bg-[#0A1128] p-5 text-white shadow-sm sm:flex sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-sm text-white/65">Cross-tenant operations</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold">All catteries at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Monitor every CatStays subdomain, publishing state, bookings, customers, rooms, and Stripe connection without opening tenant payment secrets.</p>
          </div>
          {overview && (
            <div className="mt-5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm sm:mt-0 sm:text-right">
              <p className="font-semibold">{overview.administrator.email || 'Platform administrator'}</p>
              <p className="mt-1 capitalize text-white/65">{overview.administrator.role}</p>
            </div>
          )}
        </section>

        {(authLoading || loading) && !overview ? (
          <div className="grid min-h-[45vh] place-items-center rounded-2xl border border-[#E8DED4] bg-white">
            <div className="text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#C46A3A]" /><p className="mt-3 text-sm text-[#4E5871]">Loading platform data…</p></div>
          </div>
        ) : error ? (
          <Card className="border-[#C46A3A]/25"><CardContent className="p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-[#C46A3A]" /><h2 className="mt-4 text-xl font-semibold">Admin access unavailable</h2><p role="alert" className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#4E5871]">{error}</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button onClick={() => void loadOverview()} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]">Try again</Button><Button variant="outline" onClick={() => navigate('/platform/admin-login')}>Admin sign in</Button></div></CardContent></Card>
        ) : overview ? (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
              {[
                { label: 'Catteries', value: overview.summary.catteries, icon: Building2 },
                { label: 'Published', value: overview.summary.publishedWebsites, icon: Globe2 },
                { label: 'Bookings', value: overview.summary.bookings, icon: CalendarDays },
                { label: 'Pending', value: overview.summary.pendingBookings, icon: CheckCircle2 },
                { label: 'Customers', value: overview.summary.customers, icon: Users },
                { label: 'Stripe ready', value: overview.summary.connectedPayments, icon: CreditCard },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="border-[#E8DED4] shadow-sm"><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-[#4E5871]">{label}</p><Icon className="h-4 w-4 text-[#C46A3A]" /></div><p className="mt-3 text-3xl font-semibold">{value}</p></CardContent></Card>
              ))}
            </section>

            <section className="rounded-2xl border border-[#E8DED4] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Tenants</p><h2 className="mt-1 font-serif text-2xl font-semibold">Catteries and subdomains</h2><p className="mt-1 text-sm text-[#4E5871]">{filteredCatteries.length} of {overview.catteries.length} shown</p></div>
                <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#768098]" /><Input aria-label="Search catteries" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, subdomain, city…" className="pl-9" /></div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {filteredCatteries.map((cattery) => {
                  const websiteUrl = catteryWebsiteUrl(cattery);
                  return (
                    <article key={cattery.id} className="rounded-2xl border border-[#E8DED4] bg-[#F8F7F5] p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0"><h3 className="truncate text-xl font-semibold">{cattery.name}</h3><p className="mt-1 break-all text-sm text-[#4E5871]">{cattery.custom_domain || (cattery.slug ? `${cattery.slug}.catstays.app` : 'Subdomain not assigned')}</p>{cattery.email && <p className="mt-1 truncate text-xs text-[#768098]">{cattery.email}</p>}</div>
                        <div className="flex flex-wrap gap-2"><Badge variant="outline" className={cattery.published ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-800'}>{cattery.published ? 'Published' : 'Not published'}</Badge><Badge variant="outline">{readableStatus(cattery.subscription_status)}</Badge></div>
                      </div>

                      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {[
                          ['Bookings', cattery.bookingsCount],
                          ['Pending', cattery.pendingBookingsCount],
                          ['Upcoming', cattery.upcomingBookingsCount],
                          ['Customers', cattery.customersCount],
                          ['Rooms', cattery.activeRoomsCount],
                        ].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white p-3"><dt className="text-xs text-[#768098]">{label}</dt><dd className="mt-1 text-xl font-semibold">{value}</dd></div>)}
                      </dl>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#E8DED4] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4 text-[#C46A3A]" /><span className={cattery.payment.connected ? 'text-green-700' : 'text-[#4E5871]'}>{cattery.payment.connected ? `Stripe connected (${cattery.payment.mode || 'mode unknown'})` : 'Stripe not connected'}</span></div>
                        {websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer"><Button size="sm" className="w-full bg-[#0A1128] text-white hover:bg-[#19233D] sm:w-auto">Open website <ExternalLink className="ml-2 h-4 w-4" /></Button></a>}
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredCatteries.length === 0 && <div className="mt-5 rounded-xl border border-dashed border-[#E8DED4] p-10 text-center text-sm text-[#4E5871]">No catteries match that search.</div>}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
