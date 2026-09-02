import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getConfirmEmailUrl } from '@/utils/appUrl';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function StaffLogin() {
  const { signIn, refreshCattery } = useAuth();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (register) {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password,
          options: { emailRedirectTo: getConfirmEmailUrl(), data: { account_type: 'customer' } },
        });
        if (error) throw error;
        setMessage('Check your email to verify your login, then return here and sign in. Access is granted only if the owner has added this exact email to Staff profiles.');
        setRegister(false);
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        const { error: claimError } = await supabase.rpc('catstays_accept_staff_access');
        if (claimError) throw new Error('Staff access could not be checked. Please try again.');
        await refreshCattery(); navigate('/staff-dashboard/settings/staff');
      }
    } catch (error: any) { setError(error.message || 'Please check your details and try again.'); }
    finally { setBusy(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#F8F7F5] p-4"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-serif font-bold text-[#304331]">Staff sign-in</h1>
    <p className="text-sm text-slate-600">Use the email your cattery owner saved in Staff profiles. This does not start a cattery trial or subscription.</p>
    {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="space-y-2"><Label htmlFor="staff-login-email">Email</Label><Input id="staff-login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
    <div className="space-y-2"><Label htmlFor="staff-login-password">Password</Label><Input id="staff-login-password" type="password" minLength={8} required autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></div>
    <Button type="submit" disabled={busy} className="w-full bg-[#C46A3A] text-white">{busy ? 'Please wait…' : register ? 'Create staff login' : 'Sign in'}</Button>
    <button type="button" disabled={busy} onClick={() => { setRegister(!register); setError(''); }} className="min-h-11 w-full text-sm underline">{register ? 'Already have a login? Sign in' : 'First time? Create your staff login'}</button>
    <Link to="/reset-password" className="block text-center text-sm underline">Reset password</Link><Link to="/" className="block text-center text-sm">Back to website</Link>
  </form></main>;
}
