import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { isStaffRole, staffLoginDestination } from '../../lib/authBoundary';

export function StaffLogin() {
  const { accountRole, loading: authLoading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const destination = staffLoginDestination(accountRole);
    if (!authLoading && destination) {
      navigate(destination, { replace: true });
    }
  }, [accountRole, authLoading, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await signIn(email.trim(), password);
      if (result.error) throw result.error;
      const destination = staffLoginDestination(result.accountRole);
      if (!isStaffRole(result.accountRole) || !destination) {
        await signOut();
        throw new Error('This login is not authorised for staff access. Use the client portal or ask the cattery owner to enable your exact email in Staff profiles.');
      }
      navigate(destination, { replace: true });
    } catch (error: any) { setError(error.message || 'Please check your details and try again.'); }
    finally { setBusy(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#F8F7F5] p-4"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-serif font-bold text-[#304331]">Staff sign-in</h1>
    <p className="text-sm text-slate-600">Use the email your cattery owner saved in Staff profiles. This does not start a cattery trial or subscription.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="space-y-2"><Label htmlFor="staff-login-email">Email</Label><Input id="staff-login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
    <div className="space-y-2"><Label htmlFor="staff-login-password">Password</Label><Input id="staff-login-password" type="password" minLength={8} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
    <Button type="submit" disabled={busy} className="w-full bg-[#C46A3A] text-white">{busy ? 'Please wait…' : 'Sign in'}</Button>
    <Link to="/reset-password" className="block text-center text-sm underline">Reset password</Link><Link to="/" className="block text-center text-sm">Back to website</Link>
  </form></main>;
}
