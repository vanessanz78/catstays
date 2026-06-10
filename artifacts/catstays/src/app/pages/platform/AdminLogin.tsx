import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield, ArrowRight, Lock } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production: verify admin credentials via API
    // For demo: navigate to platform admin dashboard
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#0A1128] to-[#1A2138] flex items-center justify-center p-4">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <Card className="w-full max-w-md border-white/10 shadow-2xl bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-6">
          {/* Admin Shield Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#0A1128]/10 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0A1128] to-[#0A1128]/80 flex items-center justify-center border-2 border-[#0A1128]/20 shadow-lg">
                <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-serif text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            CatStays Admin
          </CardTitle>
          <CardDescription className="text-base text-[#0A1128]/70">
            Manage your platform, customers, and growth
          </CardDescription>

          {/* Security Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A1128]/5 border border-[#0A1128]/10">
            <Lock className="w-3 h-3 text-[#0A1128]/60" />
            <span className="text-xs text-[#0A1128]/60 font-medium">Secure Admin Access</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-[#0A1128]">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@catstays.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#0A1128]/20 focus:border-[#0A1128] h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-[#0A1128]">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#0A1128]/20 focus:border-[#0A1128] h-11"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#0A1128] hover:bg-[#0A1128]/90 text-white h-11 text-base shadow-lg" 
              size="lg"
            >
              Login to Admin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#0A1128]/10">
            <p className="text-xs text-center text-[#0A1128]/50">
              Admin access only • Unauthorized access is prohibited
            </p>
            <p className="text-xs text-center text-[#0A1128]/50 mt-2">
              Need help? <a href="mailto:support@catstays.app" className="text-[#C46A3A] hover:underline">Contact support</a>
            </p>
          </div>

          {/* Back to Main Site */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-[#0A1128]/60 hover:text-[#0A1128] hover:underline">
              ← Back to CatStays
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
