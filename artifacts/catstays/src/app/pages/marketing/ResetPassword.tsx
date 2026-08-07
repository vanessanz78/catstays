import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, CheckCircle, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { supabase } from '@/utils/supabase/client';
import { getResetPasswordUrl } from '@/utils/appUrl';

const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoText = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';

type ResetMode = 'checking' | 'request' | 'set-password' | 'success';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<ResetMode>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const openRecoverySession = async () => {
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash') || searchParams.get('token');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery' as any,
          });
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else {
          if (mounted) setMode('request');
          return;
        }

        if (mounted) setMode('set-password');
      } catch (recoveryError) {
        console.error('Password recovery link failed', recoveryError);
        if (mounted) {
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setMode('request');
        }
      }
    };

    openRecoverySession();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleRequestReset = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: getResetPasswordUrl(),
    });

    setIsLoading(false);
    if (error) {
      setError(error.message || 'We could not send a reset email. Please try again.');
      return;
    }

    setMessage('If that email is connected to a CatStays account, a reset link is on its way.');
  };

  const handleSetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Please use at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setError(error.message || 'We could not update your password. Please request a new reset link.');
      return;
    }

    setMode('success');
  };

  const handleClose = () => navigate('/');

  const renderContent = () => {
    if (mode === 'checking') {
      return (
        <div className="flex flex-col items-center gap-3 py-8 text-[#0A1128]/70">
          <Loader2 className="h-6 w-6 animate-spin text-[#C46A3A]" />
          <p>Checking your reset link…</p>
        </div>
      );
    }

    if (mode === 'success') {
      return (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-700" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Password updated
            </h2>
            <p className="mt-2 text-sm text-[#0A1128]/65">
              You can now open your cattery dashboard.
            </p>
          </div>
          <Button
            onClick={() => navigate('/staff-dashboard')}
            className="w-full rounded-full bg-[#C46A3A] py-3 text-base font-medium text-white hover:bg-[#B55A2A]"
          >
            Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (mode === 'set-password') {
      return (
        <form onSubmit={handleSetPassword} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your new password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#C46A3A] py-3 text-base font-medium text-white hover:bg-[#B55A2A]"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <>Save new password <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>
      );
    }

    return (
      <form onSubmit={handleRequestReset} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-[#C46A3A] py-3 text-base font-medium text-white hover:bg-[#B55A2A]"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            <>Send reset email <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>

        <p className="text-center text-sm text-[#0A1128]/60">
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-[#C46A3A] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="relative w-full max-w-md border-[#0A1128]/10 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="pb-6 pt-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-3">
            <img src={logoIcon} alt="CatStays" className="h-16 w-16" />
            <img src={logoText} alt="CatStays" className="h-12" />
          </div>
          <CardTitle className="mb-2 font-serif text-3xl text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Reset password
          </CardTitle>
          <CardDescription className="text-base text-[#0A1128]/70">
            Get back into your cattery dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
