import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  accentColor?: string;
  onStaffLogin?: () => void;
}

export function StaffLoginModal({ isOpen, onClose, primaryColor = '#0A1128', accentColor = '#C46A3A', onStaffLogin }: StaffLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check demo credentials
    if (email === 'staff@catstays.app' && password === 'C@t$tays') {
      console.log('StaffLoginModal: Login successful', { hasCallback: !!onStaffLogin });
      onClose();
      // If onStaffLogin callback is provided (from preview), use it
      // Otherwise, navigate to /admin (from regular site)
      if (onStaffLogin) {
        console.log('StaffLoginModal: Calling onStaffLogin callback');
        onStaffLogin();
      } else {
        console.log('StaffLoginModal: No callback, navigating to /admin');
        navigate('/admin');
      }
    } else {
      setError('Invalid email or password. Try: staff@catstays.app / C@t$tays');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: primaryColor }} />
            <DialogTitle style={{ color: primaryColor }}>Staff Login</DialogTitle>
          </div>
          <DialogDescription>
            Access the admin dashboard
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Demo credentials hint */}
          <div className="border rounded-lg p-3 text-sm" style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}30`, color: primaryColor }}>
            <strong>Demo:</strong> staff@catstays.app / C@t$tays
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-email">Staff Email</Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@catstays.app"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-password">Password</Label>
            <div className="relative">
              <Input
                id="staff-password"
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
              style={{ backgroundColor: primaryColor, color: 'white' }}
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

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Add forgot password logic
              }}
              className="hover:underline bg-transparent border-none cursor-pointer p-0"
              style={{ color: accentColor }}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}