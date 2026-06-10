import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { X, Eye, EyeOff } from 'lucide-react';

interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  accentColor?: string;
  onClientLogin?: () => void;
}

export function ClientLoginModal({ isOpen, onClose, primaryColor = '#0A1128', accentColor = '#C46A3A', onClientLogin }: ClientLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check demo credentials
    if (email === 'client@catstays.app' && password === 'C@t$tays') {
      onClose();
      // If onClientLogin callback is provided (from preview), use it
      // Otherwise, navigate to /customer (from regular site)
      if (onClientLogin) {
        onClientLogin();
      } else {
        navigate('/customer');
      }
    } else {
      setError('Invalid email or password. Try: client@catstays.app / C@t$tays');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: primaryColor }}>Client Login</DialogTitle>
          <DialogDescription>
            Access your booking history and upcoming stays
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Demo credentials hint */}
          <div className="border rounded-lg p-3 text-sm" style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40`, color: primaryColor }}>
            <strong>Demo:</strong> client@catstays.app / C@t$tays
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@catstays.app"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="border rounded-lg p-3 text-sm" style={{ backgroundColor: '#FEF2F2', borderColor: `${accentColor}60`, color: accentColor }}>
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Log In
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>

          <div className="text-sm text-center space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Add forgot password logic
              }}
              className="hover:underline block bg-transparent border-none cursor-pointer p-0"
              style={{ color: accentColor }}
            >
              Forgot password?
            </button>
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Navigate to booking flow
                }}
                className="hover:underline bg-transparent border-none cursor-pointer p-0"
                style={{ color: accentColor }}
              >
                Create one during booking
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}