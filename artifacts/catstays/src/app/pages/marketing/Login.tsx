import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Heart, ArrowRight, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoText = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';

export function Login() {
  const navigate = useNavigate();
  const { signIn, cattery } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Invalid email or password');
      setIsLoading(false);
      return;
    }

    // Give auth state a moment to propagate, then navigate
    await new Promise(r => setTimeout(r, 400));
    navigate('/staff-dashboard');
    setIsLoading(false);
  };

  const handleClose = () => navigate('/');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md border-[#0A1128]/10 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex flex-col items-center gap-3 mb-6">
            <img src={logoIcon} alt="CatStays" className="h-16 w-16" />
            <img src={logoText} alt="CatStays" className="h-12" />
          </div>
          <CardTitle className="text-3xl font-serif text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Sign in
          </CardTitle>
          <CardDescription className="text-base text-[#0A1128]/70">
            Welcome back to your cattery dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C46A3A] hover:bg-[#B55A2A] text-white py-3 rounded-full text-base font-medium"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-[#0A1128]/60">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#C46A3A] hover:underline font-medium">
                  Start free trial
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[#0A1128]/40">
              <Heart className="w-3 h-3" />
              <span>Made for boutique catteries</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
