import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  BellRing, CalendarDays, Camera, Cat, CheckCircle2, ChevronRight, Loader2, Lock,
  LogOut, MessageSquare, Pencil, Plus, Save, Send, UserRound,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useSubdomainCattery } from '@/contexts/SubdomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { sendCustomerReply } from '@/utils/email';
import { enablePhoneNotifications } from '@/lib/pushService';

type PortalSection = 'overview' | 'cats' | 'details' | 'messages' | 'updates';
type ClientBooking = { id: string; check_in: string; check_out: string; check_in_time: string | null; check_out_time: string | null; status: string; cat_names: string | null; number_of_cats: number | null; total_amount: number | null };
type ClientCat = { id: string; name: string; breed: string | null; age: string | null; medical_notes: string | null; dietary_requirements: string | null };
type ClientCatUpdate = { id: string; caption: string; storage_path: string; created_at: string; cat: { name: string } | null; photoUrl?: string };
type ClientMessage = { id: string; booking_id: string | null; direction: 'inbound' | 'outbound'; subject: string | null; body: string; status: string; created_at: string };
type ClientDetails = { id: string; name: string; email: string; phone: string | null; address: string | null; notes: string | null };
type CatDraft = { id: string | null; name: string; breed: string; age: string; medicalNotes: string; dietaryRequirements: string };

const emptyCat: CatDraft = { id: null, name: '', breed: '', age: '', medicalNotes: '', dietaryRequirements: '' };
const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9D1C8] bg-white px-3 py-2 text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15';

function displayDate(value: string, time?: string | null) {
  const date = new Date(`${value}T${time || '12:00:00'}`);
  if (Number.isNaN(date.getTime())) return value;
  const dateText = date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  return time ? `${dateText}, ${date.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit' })}` : dateText;
}

function displayDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function ClientPortalEntry() {
  const [searchParams] = useSearchParams();
  const { cattery: tenantCattery } = useSubdomainCattery();
  const { accountRole, cattery: accountCattery, customer, loading, refreshCattery, signIn, signOut, signUpCustomer, user } = useAuth();
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
  const [section, setSection] = useState<PortalSection>(searchParams.get('update') ? 'updates' : 'overview');
  const [portalLoading, setPortalLoading] = useState(false);
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [cats, setCats] = useState<ClientCat[]>([]);
  const [catUpdates, setCatUpdates] = useState<ClientCatUpdate[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [profileDraft, setProfileDraft] = useState({ name: '', phone: '', address: '', notes: '' });
  const [catDraft, setCatDraft] = useState<CatDraft>(emptyCat);
  const [editingCat, setEditingCat] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyBookingId, setReplyBookingId] = useState('');

  const loadPortal = useCallback(async () => {
    if (accountRole !== 'customer' || !customer?.id) {
      setDetails(null); setBookings([]); setCats([]); setCatUpdates([]); setMessages([]); return;
    }
    setPortalLoading(true);
    const [profileResult, bookingResult, catsResult, updateResult, messageResult] = await Promise.all([
      supabase.from('customers').select('id,name,email,phone,address,notes').eq('id', customer.id).single(),
      supabase.from('bookings').select('id,check_in,check_out,check_in_time,check_out_time,status,cat_names,number_of_cats,total_amount').eq('customer_id', customer.id).order('check_in', { ascending: false }),
      supabase.from('cats').select('id,name,breed,age,medical_notes,dietary_requirements').eq('customer_id', customer.id).order('created_at', { ascending: true }),
      supabase.from('cat_updates').select('id,caption,storage_path,created_at,cat:cats(name)').eq('customer_id', customer.id).neq('status', 'archived').order('created_at', { ascending: false }),
      supabase.from('customer_messages').select('id,booking_id,direction,subject,body,status,created_at').eq('customer_id', customer.id).neq('status', 'archived').order('created_at', { ascending: true }),
    ]);
    const firstError = [profileResult.error, bookingResult.error, catsResult.error, updateResult.error, messageResult.error].find(Boolean);
    if (firstError) setMessage(`Your portal could not be fully refreshed. ${firstError.message}`);
    const profile = (profileResult.data || null) as ClientDetails | null;
    setDetails(profile);
    if (profile) setProfileDraft({ name: profile.name, phone: profile.phone || '', address: profile.address || '', notes: profile.notes || '' });
    setBookings((bookingResult.data || []) as ClientBooking[]);
    setCats((catsResult.data || []) as ClientCat[]);
    setMessages((messageResult.data || []) as ClientMessage[]);
    const updates = (updateResult.data || []) as unknown as ClientCatUpdate[];
    setCatUpdates(await Promise.all(updates.map(async (update) => {
      const { data: signed } = await supabase.storage.from('cat-update-photos').createSignedUrl(update.storage_path, 60 * 60);
      return { ...update, photoUrl: signed?.signedUrl || '' };
    })));
    setPortalLoading(false);
  }, [accountRole, customer?.id]);

  useEffect(() => { void loadPortal(); }, [loadPortal]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage(null);
    const result = mode === 'signin' ? await signIn(email.trim(), password) : cattery?.id
      ? await signUpCustomer(email.trim(), password, name.trim(), cattery.id)
      : { error: new Error('This cattery is still loading. Please try again.') };
    if (result.error) setMessage(result.error.message);
    else if (mode === 'create') setMessage('Check your email to confirm your client access, then return here to sign in.');
    setBusy(false);
  };

  const enableAlerts = async () => {
    if (!cattery?.id) return;
    setBusy(true); setMessage(null);
    try { await enablePhoneNotifications(cattery.id); setMessage('Phone notifications are connected for this client account.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Phone notifications could not be enabled.'); }
    finally { setBusy(false); }
  };

  const saveProfile = async () => {
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc('catstays_update_my_customer_profile', {
      profile_name: profileDraft.name.trim(), profile_phone: profileDraft.phone.trim() || null,
      profile_address: profileDraft.address.trim() || null, profile_notes: profileDraft.notes.trim() || null,
    });
    if (error) setMessage(error.message);
    else { setMessage('Your details have been saved and are now visible to the cattery.'); await refreshCattery(); await loadPortal(); }
    setBusy(false);
  };

  const openCatEditor = (cat?: ClientCat) => {
    setCatDraft(cat ? { id: cat.id, name: cat.name, breed: cat.breed || '', age: cat.age || '', medicalNotes: cat.medical_notes || '', dietaryRequirements: cat.dietary_requirements || '' } : emptyCat);
    setEditingCat(true); setMessage(null);
  };

  const saveCat = async () => {
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc('catstays_upsert_my_cat', {
      target_cat_id: catDraft.id, cat_name: catDraft.name.trim(), cat_breed: catDraft.breed.trim() || null,
      cat_age: catDraft.age.trim() || null, cat_medical_notes: catDraft.medicalNotes.trim() || null,
      cat_dietary_requirements: catDraft.dietaryRequirements.trim() || null,
    });
    if (error) setMessage(error.message);
    else { setMessage(`${catDraft.name.trim()}'s details have been saved for the cattery.`); setEditingCat(false); setCatDraft(emptyCat); await loadPortal(); }
    setBusy(false);
  };

  const sendReply = async () => {
    setBusy(true); setMessage(null);
    const result = await sendCustomerReply({ subject: replySubject.trim(), body: replyBody.trim(), bookingId: replyBookingId || undefined });
    if (!result.success) setMessage(result.error || 'The message could not be sent.');
    else { setMessage(result.warning || 'Your message is now in the cattery conversation and staff have been alerted.'); setReplySubject(''); setReplyBody(''); setReplyBookingId(''); await loadPortal(); }
    setBusy(false);
  };

  const nextBooking = useMemo(() => [...bookings].filter((booking) => booking.status !== 'cancelled').sort((a, b) => a.check_in.localeCompare(b.check_in))[0] || null, [bookings]);
  const navItems: { id: PortalSection; label: string; icon: typeof Cat; count?: number }[] = [
    { id: 'overview', label: 'Bookings', icon: CalendarDays, count: bookings.length },
    { id: 'cats', label: 'My cats', icon: Cat, count: cats.length },
    { id: 'updates', label: 'Updates', icon: Camera, count: catUpdates.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: messages.length },
    { id: 'details', label: 'My details', icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A1128]">
      <header className="border-b border-[#0A1128]/10 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase text-[#C46A3A]">Client portal</p><h1 className="truncate text-xl font-semibold">{businessName}</h1></div><Link to={websitePath}><Button variant="outline" className="rounded-lg border-[#0A1128]/15">Website</Button></Link></div></header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {loading ? <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C46A3A]" /></div> : !user ? (
          <Card className="mx-auto max-w-xl rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-7 sm:p-9"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#C46A3A]/10"><Lock className="h-7 w-7 text-[#C46A3A]" /></div><h2 className="text-center text-2xl font-semibold">{mode === 'signin' ? 'Client sign in' : 'Create client access'}</h2><p className="mt-2 text-center text-sm leading-6 text-[#4E5871]">{mode === 'signin' ? 'Sign in to manage your details and cats, see bookings and receive private updates.' : 'Use the same email address you used for your booking so CatStays can securely connect your account.'}</p><form onSubmit={submit} className="mt-7 space-y-4">{mode === 'create' && <label className="block text-sm font-medium">Your name<input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" /></label>}<label className="block text-sm font-medium">Email<input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label className="block text-sm font-medium">Password<input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></label>{message && <p className="rounded-xl bg-[#F8F1EC] p-3 text-sm text-[#7A3D22]">{message}</p>}<Button disabled={busy} className="h-11 w-full rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === 'signin' ? 'Sign in' : 'Create client access'}</Button></form><button className="mt-5 w-full text-sm font-semibold text-[#C46A3A]" onClick={() => { setMode(mode === 'signin' ? 'create' : 'signin'); setMessage(null); }}>{mode === 'signin' ? 'Create client access from an existing booking' : 'Already have client access? Sign in'}</button></CardContent></Card>
        ) : accountRole === 'owner' || accountRole === 'staff' ? (
          <Card className="mx-auto max-w-2xl rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-[#C46A3A]" /><h2 className="mt-4 text-2xl font-semibold">Staff account recognised</h2><p className="mt-2 text-sm text-[#4E5871]">Use a separate customer email to test the client portal without mixing staff permissions.</p><Link to="/staff-dashboard"><Button className="mt-6 bg-[#C46A3A] text-white hover:bg-[#A85A30]">Open dashboard</Button></Link></CardContent></Card>
        ) : accountRole === 'customer' && customer ? (
          <div className="space-y-5">
            <section className="rounded-2xl bg-[#0A1128] p-5 text-white shadow-sm sm:flex sm:items-center sm:justify-between sm:p-6"><div className="min-w-0"><p className="text-sm text-white/65">Welcome back</p><h2 className="mt-1 truncate text-2xl font-semibold">{details?.name || customer.name}</h2><p className="mt-1 break-all text-sm text-white/70">{details?.email || customer.email}</p></div><div className="mt-5 flex flex-wrap gap-2 sm:mt-0"><Button onClick={enableAlerts} disabled={busy} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"><BellRing className="mr-2 h-4 w-4" />Phone alerts</Button><Button onClick={() => void signOut()} variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10"><LogOut className="mr-2 h-4 w-4" />Sign out</Button></div></section>
            <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E8DED4] bg-white p-2 shadow-sm sm:grid-cols-5">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setSection(item.id); setMessage(null); }} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${section === item.id ? 'bg-[#C46A3A] text-white' : 'text-[#4E5871] hover:bg-[#F8F1EC]'}`}><Icon className="h-4 w-4" />{item.label}{item.count ? <span className={`rounded-full px-2 py-0.5 text-xs ${section === item.id ? 'bg-white/20' : 'bg-[#F1E6DC] text-[#7A3D22]'}`}>{item.count}</span> : null}</button>; })}</nav>
            {message && <p className="rounded-xl border border-[#C46A3A]/20 bg-[#F8F1EC] p-4 text-sm text-[#7A3D22]">{message}</p>}
            {portalLoading && <p className="flex items-center justify-center gap-2 rounded-xl bg-white p-4 text-sm text-[#4E5871]"><Loader2 className="h-4 w-4 animate-spin" />Refreshing your portal…</p>}

            {section === 'overview' && <div className="space-y-4">{nextBooking && <Card className="rounded-2xl border-[#C46A3A]/25 bg-[#FFF9F5] shadow-sm"><CardContent className="p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Next stay</p><div className="mt-3 flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold">{nextBooking.cat_names || `${nextBooking.number_of_cats || 1} cat`}</h3><p className="mt-2 text-sm text-[#4E5871]">Arrive {displayDate(nextBooking.check_in, nextBooking.check_in_time)}</p><p className="text-sm text-[#4E5871]">Collect {displayDate(nextBooking.check_out, nextBooking.check_out_time)}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize shadow-sm">{nextBooking.status}</span></div></CardContent></Card>}<Card className="rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Your bookings</h2><p className="text-sm text-[#4E5871]">All stays linked to this login.</p></div><CalendarDays className="h-6 w-6 text-[#C46A3A]" /></div>{bookings.length ? <div className="space-y-3">{bookings.map((booking) => <article key={booking.id} className="rounded-xl border border-[#E8DED4] bg-[#F8F7F5] p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{booking.cat_names || `${booking.number_of_cats || 1} cat`}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize">{booking.status}</span></div><p className="mt-2 text-sm text-[#4E5871]">{displayDate(booking.check_in, booking.check_in_time)} to {displayDate(booking.check_out, booking.check_out_time)}</p>{booking.total_amount != null && <p className="mt-1 text-sm font-semibold">${Number(booking.total_amount).toFixed(2)}</p>}<button onClick={() => { setReplyBookingId(booking.id); setReplySubject('Booking amendment request'); setSection('messages'); }} className="mt-3 inline-flex items-center text-sm font-semibold text-[#C46A3A]">Request an amendment<ChevronRight className="ml-1 h-4 w-4" /></button></article>)}</div> : <p className="rounded-xl bg-[#F8F7F5] p-6 text-center text-sm text-[#4E5871]">No bookings are connected to this account yet.</p>}</CardContent></Card><Link to={bookingPath}><Button className="h-12 w-full rounded-xl bg-[#0A1128] text-white hover:bg-[#19233D]"><Plus className="mr-2 h-4 w-4" />Request another stay</Button></Link></div>}

            {section === 'cats' && <div className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold">My cats</h2><p className="text-sm text-[#4E5871]">Keep care information current for the cattery.</p></div><Button onClick={() => openCatEditor()} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"><Plus className="mr-2 h-4 w-4" />Add cat</Button></div>{editingCat && <Card className="rounded-2xl border-[#C46A3A]/25 shadow-sm"><CardContent className="space-y-4 p-5 sm:p-6"><h3 className="text-xl font-semibold">{catDraft.id ? `Edit ${catDraft.name}` : 'Add a cat'}</h3><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Name<input className={fieldClass} value={catDraft.name} onChange={(event) => setCatDraft({ ...catDraft, name: event.target.value })} /></label><label className="text-sm font-medium">Breed<input className={fieldClass} value={catDraft.breed} onChange={(event) => setCatDraft({ ...catDraft, breed: event.target.value })} /></label><label className="text-sm font-medium">Age<input className={fieldClass} value={catDraft.age} onChange={(event) => setCatDraft({ ...catDraft, age: event.target.value })} placeholder="e.g. 4 years" /></label></div><label className="block text-sm font-medium">Medical or medication notes<textarea className={fieldClass} rows={3} value={catDraft.medicalNotes} onChange={(event) => setCatDraft({ ...catDraft, medicalNotes: event.target.value })} /></label><label className="block text-sm font-medium">Food, allergies or dietary requirements<textarea className={fieldClass} rows={3} value={catDraft.dietaryRequirements} onChange={(event) => setCatDraft({ ...catDraft, dietaryRequirements: event.target.value })} /></label><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => { setEditingCat(false); setCatDraft(emptyCat); }}>Cancel</Button><Button onClick={saveCat} disabled={busy || !catDraft.name.trim()} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"><Save className="mr-2 h-4 w-4" />Save cat</Button></div></CardContent></Card>}{cats.length ? <div className="grid gap-4 sm:grid-cols-2">{cats.map((cat) => <Card key={cat.id} className="rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F1E6DC]"><Cat className="h-5 w-5 text-[#C46A3A]" /></div><div className="min-w-0"><h3 className="truncate text-lg font-semibold">{cat.name}</h3><p className="text-sm text-[#4E5871]">{[cat.breed, cat.age].filter(Boolean).join(' · ') || 'Details can be added'}</p></div></div><button onClick={() => openCatEditor(cat)} aria-label={`Edit ${cat.name}`} className="rounded-lg border border-[#E8DED4] p-2 text-[#C46A3A]"><Pencil className="h-4 w-4" /></button></div>{(cat.medical_notes || cat.dietary_requirements) && <dl className="mt-4 space-y-3 rounded-xl bg-[#F8F7F5] p-4 text-sm">{cat.medical_notes && <div><dt className="font-semibold">Medical</dt><dd className="mt-1 whitespace-pre-wrap text-[#4E5871]">{cat.medical_notes}</dd></div>}{cat.dietary_requirements && <div><dt className="font-semibold">Food and diet</dt><dd className="mt-1 whitespace-pre-wrap text-[#4E5871]">{cat.dietary_requirements}</dd></div>}</dl>}</CardContent></Card>)}</div> : !editingCat && <p className="rounded-2xl border border-dashed border-[#D9D1C8] bg-white p-8 text-center text-sm text-[#4E5871]">No cats are linked yet. Add the first cat above.</p>}</div>}

            {section === 'updates' && <Card className="rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Cat updates</h2><p className="text-sm text-[#4E5871]">Private photos and messages from {businessName}.</p></div><Camera className="h-6 w-6 shrink-0 text-[#C46A3A]" /></div>{catUpdates.length ? <div className="grid gap-4 sm:grid-cols-2">{catUpdates.map((update) => <article key={update.id} className="min-w-0 overflow-hidden rounded-xl border border-[#E8DED4] bg-[#F8F7F5]">{update.photoUrl && <img src={update.photoUrl} alt={`Update for ${update.cat?.name || 'your cat'}`} className="aspect-[4/3] w-full object-cover" />}<div className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{update.cat?.name || 'Cat update'}</h3><span className="text-xs text-[#768098]">{displayDateTime(update.created_at)}</span></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#273149]">{update.caption}</p></div></article>)}</div> : <p className="rounded-xl bg-[#F8F7F5] p-6 text-center text-sm text-[#4E5871]">No updates have been shared yet. New updates will also arrive by email.</p>}</CardContent></Card>}

            {section === 'messages' && <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"><Card className="rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Conversation</h2><p className="text-sm text-[#4E5871]">Amendments and questions stay visible to both sides.</p></div><MessageSquare className="h-6 w-6 text-[#C46A3A]" /></div>{messages.length ? <div className="space-y-3">{messages.map((item) => <article key={item.id} className={`max-w-[92%] rounded-2xl p-4 ${item.direction === 'inbound' ? 'ml-auto bg-[#0A1128] text-white' : 'bg-[#F1E6DC] text-[#0A1128]'}`}><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{item.subject || (item.direction === 'inbound' ? 'You' : businessName)}</p><span className={`text-xs ${item.direction === 'inbound' ? 'text-white/60' : 'text-[#768098]'}`}>{displayDateTime(item.created_at)}</span></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.body}</p></article>)}</div> : <p className="rounded-xl bg-[#F8F7F5] p-6 text-center text-sm text-[#4E5871]">No messages yet. Start a conversation about a booking or your cat.</p>}</CardContent></Card><Card className="h-fit rounded-2xl border-[#C46A3A]/25 shadow-sm"><CardContent className="space-y-4 p-5 sm:p-6"><div><h2 className="text-xl font-semibold">Message the cattery</h2><p className="text-sm text-[#4E5871]">Staff receive this in CatStays and by email.</p></div><label className="block text-sm font-medium">Booking<select className={fieldClass} value={replyBookingId} onChange={(event) => setReplyBookingId(event.target.value)}><option value="">General question</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.cat_names || 'Booking'} — {displayDate(booking.check_in)}</option>)}</select></label><label className="block text-sm font-medium">Subject<input className={fieldClass} value={replySubject} onChange={(event) => setReplySubject(event.target.value)} maxLength={180} placeholder="What would you like changed?" /></label><label className="block text-sm font-medium">Message<textarea className={fieldClass} rows={6} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} maxLength={4000} placeholder="Write the dates, times or details you would like amended." /></label><Button onClick={sendReply} disabled={busy || !replySubject.trim() || !replyBody.trim()} className="h-11 w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]"><Send className="mr-2 h-4 w-4" />Send to cattery</Button></CardContent></Card></div>}

            {section === 'details' && <Card className="rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="space-y-4 p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">My details</h2><p className="text-sm text-[#4E5871]">Changes are immediately visible to cattery staff.</p></div><UserRound className="h-6 w-6 text-[#C46A3A]" /></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Name<input className={fieldClass} value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} /></label><label className="text-sm font-medium">Phone<input className={fieldClass} type="tel" value={profileDraft.phone} onChange={(event) => setProfileDraft({ ...profileDraft, phone: event.target.value })} /></label></div><label className="block text-sm font-medium">Email<input className={`${fieldClass} bg-[#F8F7F5] text-[#4E5871]`} type="email" value={details?.email || customer.email} readOnly /><span className="mt-1 block text-xs font-normal text-[#768098]">Ask the cattery to change the login email securely.</span></label><label className="block text-sm font-medium">Address<textarea className={fieldClass} rows={3} value={profileDraft.address} onChange={(event) => setProfileDraft({ ...profileDraft, address: event.target.value })} /></label><label className="block text-sm font-medium">Notes for the cattery<textarea className={fieldClass} rows={4} value={profileDraft.notes} onChange={(event) => setProfileDraft({ ...profileDraft, notes: event.target.value })} placeholder="Access notes or anything staff should know." /></label><Button onClick={saveProfile} disabled={busy || profileDraft.name.trim().length < 2} className="h-11 w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]"><Save className="mr-2 h-4 w-4" />Save my details</Button></CardContent></Card>}
          </div>
        ) : <Card className="mx-auto max-w-2xl rounded-2xl border-[#E8DED4] shadow-sm"><CardContent className="p-8 text-center"><Lock className="mx-auto h-9 w-9 text-[#C46A3A]" /><h2 className="mt-4 text-2xl font-semibold">No client booking is linked yet</h2><p className="mt-2 text-sm leading-6 text-[#4E5871]">Sign out and create client access with the exact email used for your booking, or ask {businessName} to update the email on your customer record.</p><Button onClick={() => void signOut()} className="mt-6 bg-[#0A1128] text-white hover:bg-[#19233D]">Sign out</Button></CardContent></Card>}
      </main>
    </div>
  );
}
