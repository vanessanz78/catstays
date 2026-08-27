import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Loader2, Lock, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

async function verifyPlatformAccess(accessToken: string) {
  const response = await fetch('/api/platform/overview', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Platform access could not be verified.');
}

export function AdminLogin() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (loading || !session?.access_token) return;
    setBusy(true);
    verifyPlatformAccess(session.access_token)
      .then(() => navigate('/platform/dashboard', { replace: true }))
      .catch((error) => setMessage(error.message))
      .finally(() => setBusy(false));
  }, [loading, navigate, session?.access_token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session) {
      setMessage(error?.message || 'Sign-in could not be completed.');
      setBusy(false);
      return;
    }
    try {
      await verifyPlatformAccess(data.session.access_token);
      navigate('/platform/dashboard', { replace: true });
    } catch (accessError) {
      setMessage(accessError instanceof Error ? accessError.message : 'Platform access could not be verified.');
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0A1128] p-4">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <Card className="relative z-10 w-full max-w-md border-white/10 bg-white shadow-2xl">
        <CardHeader className="pb-5 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#0A1128] shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="font-serif text-3xl text-[#0A1128]">CatStays Admin</CardTitle>
          <CardDescription>Secure oversight for every CatStays cattery and subdomain.</CardDescription>
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[#0A1128]/10 bg-[#0A1128]/5 px-3 py-1.5 text-xs font-medium text-[#0A1128]/65">
            <Lock className="h-3.5 w-3.5" /> Platform administrators only
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </div>
            {message && <p role="alert" className="rounded-xl border border-[#C46A3A]/20 bg-[#FFF4ED] p-3 text-sm text-[#7A3D22]">{message}</p>}
            <Button disabled={busy} className="h-11 w-full bg-[#0A1128] text-white hover:bg-[#19233D]">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              {session ? 'Checking access…' : 'Sign in to Admin'}
            </Button>
          </form>
          <p className="mt-5 text-center text-xs leading-5 text-[#0A1128]/55">Cattery owners and clients cannot open this cross-tenant dashboard unless they are separately allow-listed as a platform administrator.</p>
          <div className="mt-5 border-t border-[#0A1128]/10 pt-5 text-center">
            <Link to="/" className="text-sm font-medium text-[#C46A3A] hover:underline">← Back to CatStays</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
