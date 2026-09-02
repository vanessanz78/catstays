import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, BellRing, Mail, Phone, Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { RightMenu } from '../../components/RightMenu';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

type Profile = { id: string | null; user_id: string | null; full_name: string; email: string; role: string; status: string; metadata: { phone?: string } };
const blank: Profile = { id: null, user_id: null, full_name: '', email: '', role: 'staff', status: 'invited', metadata: {} };

export function StaffProfiles() {
  const { user, cattery, accountRole, loading: authLoading } = useAuth();
  const owner = accountRole === 'owner';
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = async () => {
    if (!cattery || !user) return;
    setLoading(true);
    const { data, error } = await supabase.from('staff_memberships')
      .select('id,user_id,full_name,email,role,status,metadata').eq('cattery_id', cattery.id).order('created_at');
    setLoading(false);
    if (error) { setError('Staff profiles could not be loaded. Please retry.'); return; }
    const rows = (data || []) as Profile[];
    if (owner && !rows.some(row => row.user_id === user.id)) rows.unshift({
      ...blank, user_id: user.id, full_name: user.user_metadata?.full_name || user.user_metadata?.owner_name || '',
      email: user.email || '', role: 'owner', status: 'active',
    });
    setProfiles(rows);
  };
  useEffect(() => { if (!authLoading) void load(); }, [cattery?.id, user?.id, accountRole, authLoading]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft || !cattery) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const { error } = await supabase.rpc('catstays_save_staff_profile', {
        target_cattery: cattery.id, target_profile: draft.id, profile_name: draft.full_name,
        profile_email: draft.email, profile_phone: draft.metadata.phone || '',
        profile_role: draft.role, profile_status: draft.status,
      });
      if (error) throw error;
      setDraft(null); setMessage('Staff profile saved.'); await load();
    } catch (error: any) { setError(error.message || 'The profile could not be saved.'); }
    finally { setBusy(false); }
  };
  if (!authLoading && (!user || !cattery || !['owner','staff'].includes(accountRole || ''))) return (
    <main className="p-6"><h1>Staff profiles</h1><p>Sign in with your cattery staff account.</p><Link to="/staff-login">Staff sign-in</Link></main>
  );
  return <div className="min-h-screen bg-[#F8F7F5] lg:flex">
    <RightMenu mode="sidebar" />
    <div className="min-w-0 flex-1">
      <header className="border-b bg-white px-4 py-4"><div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="lg:hidden"><RightMenu /></div>
        <Link to="/staff-dashboard/settings" aria-label="Back to settings"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-serif font-bold text-[#304331]">Staff profiles</h1>
      </div></header>
      <main className="mx-auto max-w-3xl space-y-4 p-4 pb-12">
        <section className="space-y-3 rounded-2xl bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Users className="h-5 w-5" />Your cattery team</h2>
          <p className="text-sm text-slate-600">Save contact details and assign roles. Only the owner can add staff or change access. Managers and staff can manage daily cattery operations; neither can manage this team.</p>
          {owner && <Button onClick={() => { setDraft({ ...blank, metadata: {} }); setMessage(''); setError(''); }} className="w-full bg-[#C46A3A] text-white"><Plus className="mr-2 h-4 w-4" />Add staff</Button>}
          <p className="text-sm text-slate-600">After adding someone, give them the <Link to="/staff-login" className="underline text-[#A9572E]">staff sign-in page</Link>. They must use the exact email saved here and verify it. No invitation is emailed just by saving a profile.</p>
        </section>
        {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {draft && <form onSubmit={save} className="space-y-4 rounded-2xl bg-white p-5">
          <h2 className="text-xl font-semibold">{draft.id || draft.role === 'owner' ? 'Edit profile' : 'New staff profile'}</h2>
          <div className="space-y-2"><Label htmlFor="staff-name">Name</Label><Input id="staff-name" required maxLength={120} value={draft.full_name} onChange={e => setDraft({ ...draft, full_name: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="staff-email">Email used to sign in</Label><Input id="staff-email" type="email" required maxLength={254} disabled={!owner || Boolean(draft.user_id)} value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="staff-phone">Phone number</Label><Input id="staff-phone" type="tel" autoComplete="tel" maxLength={40} value={draft.metadata.phone || ''} onChange={e => setDraft({ ...draft, metadata: { ...draft.metadata, phone: e.target.value } })} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="staff-role">Role</Label><select id="staff-role" className="min-h-11 w-full rounded-md border bg-white px-3" disabled={!owner || draft.role === 'owner'} value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })}>
              {draft.role === 'owner' && <option value="owner">Owner</option>}<option value="manager">Manager</option><option value="staff">Staff</option>
            </select></div>
            <div className="space-y-2"><Label htmlFor="staff-access">Access</Label><select id="staff-access" className="min-h-11 w-full rounded-md border bg-white px-3" disabled={!owner || draft.role === 'owner'} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
              <option value={draft.user_id ? 'active' : 'invited'}>{draft.user_id ? 'Active' : 'Awaiting verified sign-in'}</option><option value="disabled">Disabled</option>
            </select></div>
          </div>
          <div className="flex gap-3"><Button type="button" variant="outline" disabled={busy} onClick={() => setDraft(null)}>Cancel</Button><Button type="submit" disabled={busy} className="flex-1 bg-[#C46A3A] text-white">{busy ? 'Saving…' : 'Save profile'}</Button></div>
        </form>}
        {loading ? <p role="status">Loading staff…</p> : profiles.map((profile, index) => <section key={profile.id || index} className="space-y-3 rounded-2xl bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-lg font-semibold text-[#304331]">{profile.full_name || 'Your owner profile'}</h2><p className="text-sm capitalize">{profile.role} · {profile.status === 'invited' ? 'Awaiting verified sign-in' : profile.status}</p></div><Button variant="outline" onClick={() => { setDraft({ ...profile, metadata: { ...profile.metadata } }); setError(''); setMessage(''); }}>Edit</Button></div>
          <a className="flex min-h-10 items-center gap-2 break-all text-sm text-[#A9572E]" href={`mailto:${profile.email}`}><Mail className="h-4 w-4 shrink-0" />{profile.email}</a>
          {profile.metadata?.phone && <a className="flex min-h-10 items-center gap-2 text-sm text-[#A9572E]" href={`tel:${profile.metadata.phone.replace(/[^+\d]/g, '')}`}><Phone className="h-4 w-4 shrink-0" />{profile.metadata.phone}</a>}
        </section>)}
        <section className="space-y-3 rounded-2xl border border-[#C46A3A]/25 bg-white p-5"><h2 className="flex items-center gap-2 font-semibold"><BellRing className="h-5 w-5" />PWA phone notifications</h2>
          <p className="text-sm text-slate-600">Each staff member signs in on their own phone, opens the installed CatStays PWA and enables notifications. A phone number is for contact—it does not register a notification device or send SMS.</p>
          <Link to="/staff-dashboard/settings/notifications" className="block rounded-xl bg-[#304331] px-4 py-3 text-center font-semibold text-white">Set up notifications on this device</Link>
        </section>
      </main>
    </div>
  </div>;
}
