import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BellRing, CalendarDays, Camera, Cat, CheckCircle2, Loader2, Lock, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useSubdomainCattery } from '@/contexts/SubdomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { enablePhoneNotifications } from '@/lib/pushService';

type ClientBooking = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  cat_names: string | null;
  number_of_cats: number | null;
  total_amount: number | null;
};

type ClientCatUpdate = {
  id: string;
  caption: string;
  storage_path: string;
  created_at: string;
  cat: { name: string } | null;
  photoUrl?: string;
};

const fieldClass = 'mt-1 h-11 w-full rounded-lg border border-[#D9D1C8] bg-white px-3 text-[#0A1128] outline-none focus:border-[#C46A3A]';

export function ClientPortalEntry() {
  const { cattery: tenantCattery } = useSubdomainCattery();
  const { accountRole, cattery: accountCattery, customer, loading, signIn, signOut, signUpCustomer, user } = useAuth();
  const cattery = tenantCattery || accountCattery;
  const businessName = cattery?.name || 'your cattery';
  const bookingPath = tenantCattery ? '/booking-flow' : '/site/booking-flow';
  const websitePath = tenantCattery ? '/' : '/site';
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [catUpdates, setCatUpdates] = useState<ClientCatUpdate[]>([]);

  useEffect(() => {
    if (accountRole !== 'customer' || !customer?.id) {
      setBookings([]);
      setCatUpdates([]);
      return;
    }
    void Promise.all([
      supabase
        .from('bookings')
        .select('id,check_in,check_out,status,cat_names,number_of_cats,total_amount')
        .eq('customer_id', customer.id)
        .order('check_in', { ascending: false }),
      supabase
        .from('cat_updates')
        .select('id,caption,storage_path,created_at,cat:cats(name)')
        .eq('customer_id', customer.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false }),
    ]).then(async ([bookingResult, updateResult]) => {
      setBookings((bookingResult.data || []) as ClientBooking[]);
      const updates = (updateResult.data || []) as unknown as ClientCatUpdate[];
      const withPhotos = await Promise.all(updates.map(async (update) => {
        const { data: signed } = await supabase.storage.from('cat-update-photos').createSignedUrl(update.storage_path, 60 * 60);
        return { ...update, photoUrl: signed?.signedUrl || '' };
      }));
      setCatUpdates(withPhotos);
    });
  }, [accountRole, customer?.id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = mode === 'signin'
      ? await signIn(email.trim(), password)
      : cattery?.id
        ? await signUpCustomer(email.trim(), password, name.trim(), cattery.id)
        : { error: new Error('This cattery is still loading. Please try again.') };
    if (result.error) setMessage(result.error.message);
    else if (mode === 'create') setMessage('Check your email to confirm your client access, then return here to sign in.');
    setBusy(false);
  };

  const enableAlerts = async () => {
    if (!cattery?.id) return;
    setBusy(true);
    setMessage(null);
    try {
      await enablePhoneNotifications(cattery.id);
      setMessage('Phone notifications are connected for this client account.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Phone notifications could not be enabled.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A1128]">
      <header className="border-b border-[#0A1128]/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#C46A3A]">Client portal</p>
            <h1 className="text-xl font-semibold">{businessName}</h1>
          </div>
          <Link to={websitePath}>
            <Button variant="outline" className="rounded-lg border-[#0A1128]/15">View website</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {loading ? (
          <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C46A3A]" /></div>
        ) : !user ? (
          <Card className="mx-auto max-w-xl rounded-2xl border-[#E8DED4] shadow-sm">
            <CardContent className="p-7 sm:p-9">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#C46A3A]/10">
                <Lock className="h-7 w-7 text-[#C46A3A]" />
              </div>
              <h2 className="text-center text-2xl font-semibold">{mode === 'signin' ? 'Client sign in' : 'Create client access'}</h2>
              <p className="mt-2 text-center text-sm leading-6 text-[#4E5871]">
                {mode === 'signin'
                  ? 'Sign in to see your bookings and receive updates from the cattery.'
                  : 'Use the same email address you used for your booking so CatStays can securely connect your account.'}
              </p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                {mode === 'create' && (
                  <label className="block text-sm font-medium">Your name
                    <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
                  </label>
                )}
                <label className="block text-sm font-medium">Email
                  <input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
                </label>
                <label className="block text-sm font-medium">Password
                  <input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
                </label>
                {message && <p className="rounded-lg bg-[#F8F1EC] p-3 text-sm text-[#7A3D22]">{message}</p>}
                <Button disabled={busy} className="h-11 w-full rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'signin' ? 'Sign in' : 'Create client access'}
                </Button>
              </form>

              <button className="mt-5 w-full text-sm font-semibold text-[#C46A3A]" onClick={() => { setMode(mode === 'signin' ? 'create' : 'signin'); setMessage(null); }}>
                {mode === 'signin' ? 'Create client access from an existing booking' : 'Already have client access? Sign in'}
              </button>
            </CardContent>
          </Card>
        ) : accountRole === 'owner' || accountRole === 'staff' ? (
          <Card className="mx-auto max-w-2xl rounded-2xl border-[#E8DED4] shadow-sm">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#C46A3A]" />
              <h2 className="mt-4 text-2xl font-semibold">Staff account recognised</h2>
              <p className="mt-2 text-sm text-[#4E5871]">This installed CatStays app will open your staff dashboard by default.</p>
              <Link to="/staff-dashboard"><Button className="mt-6 bg-[#C46A3A] text-white hover:bg-[#A85A30]">Open dashboard</Button></Link>
            </CardContent>
          </Card>
        ) : accountRole === 'customer' && customer ? (
          <div className="space-y-5">
            <section className="rounded-2xl bg-[#0A1128] p-6 text-white shadow-sm sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/65">Signed in as</p>
                <h2 className="mt-1 text-2xl font-semibold">{customer.name}</h2>
                <p className="mt-1 text-sm text-white/70">{customer.email}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-0">
                <Button onClick={enableAlerts} disabled={busy} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"><BellRing className="mr-2 h-4 w-4" />Enable phone alerts</Button>
                <Button onClick={() => void signOut()} variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10"><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
              </div>
            </section>
            {message && <p className="rounded-xl border border-[#C46A3A]/20 bg-[#F8F1EC] p-4 text-sm text-[#7A3D22]">{message}</p>}

            <Card className="rounded-2xl border-[#E8DED4] shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div><h2 className="text-xl font-semibold">Photo updates</h2><p className="text-sm text-[#4E5871]">Private updates shared with you by {businessName}.</p></div>
                  <Camera className="h-6 w-6 shrink-0 text-[#C46A3A]" />
                </div>
                {catUpdates.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {catUpdates.map((update) => (
                      <article key={update.id} className="min-w-0 overflow-hidden rounded-xl border border-[#E8DED4] bg-[#F8F7F5]">
                        {update.photoUrl && <img src={update.photoUrl} alt={`Update for ${update.cat?.name || 'your cat'}`} className="aspect-[4/3] w-full object-cover" />}
                        <div className="p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{update.cat?.name || 'Cat update'}</h3><span className="text-xs text-[#768098]">{new Date(update.created_at).toLocaleString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div>
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#273149]">{update.caption}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <p className="rounded-xl bg-[#F8F7F5] p-6 text-center text-sm text-[#4E5871]">No photo updates have been shared yet. The cattery will send them when there is something to share.</p>}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-[1fr_260px]">
              <Card className="rounded-2xl border-[#E8DED4] shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div><h2 className="text-xl font-semibold">Your bookings</h2><p className="text-sm text-[#4E5871]">Only bookings connected to your account are shown.</p></div>
                    <CalendarDays className="h-6 w-6 text-[#C46A3A]" />
                  </div>
                  {bookings.length ? (
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="rounded-xl border border-[#E8DED4] bg-[#F8F7F5] p-4">
                          <div className="flex items-start justify-between gap-3"><p className="font-semibold">{booking.cat_names || `${booking.number_of_cats || 1} cat`}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize">{booking.status}</span></div>
                          <p className="mt-2 text-sm text-[#4E5871]">{booking.check_in} to {booking.check_out}</p>
                          {booking.total_amount != null && <p className="mt-1 text-sm font-semibold">${Number(booking.total_amount).toFixed(2)}</p>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="rounded-xl bg-[#F8F7F5] p-6 text-center text-sm text-[#4E5871]">No bookings are connected to this account yet.</p>}
                </CardContent>
              </Card>
              <Card className="h-fit rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-6 text-center"><Cat className="mx-auto h-8 w-8 text-[#C46A3A]" /><h3 className="mt-3 font-semibold">Need another stay?</h3><Link to={bookingPath}><Button className="mt-4 w-full bg-[#0A1128] text-white hover:bg-[#19233D]">Book now</Button></Link></CardContent></Card>
            </div>
          </div>
        ) : (
          <Card className="mx-auto max-w-2xl rounded-2xl border-[#E8DED4] shadow-sm">
            <CardContent className="p-8 text-center">
              <Lock className="mx-auto h-9 w-9 text-[#C46A3A]" />
              <h2 className="mt-4 text-2xl font-semibold">No client booking is linked yet</h2>
              <p className="mt-2 text-sm leading-6 text-[#4E5871]">Sign out and create client access with the exact email used for your booking, or ask {businessName} to update the email on your customer record.</p>
              <Button onClick={() => void signOut()} className="mt-6 bg-[#0A1128] text-white hover:bg-[#19233D]">Sign out</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
