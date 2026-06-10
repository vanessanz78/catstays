import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production: verify admin credentials via API
    // For demo: navigate to platform admin
    navigate('/admin');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-[#0A1128]/10">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A1128] to-[#0A1128]/80 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-serif text-center text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            CatStays Admin
          </DialogTitle>
          <DialogDescription className="text-center text-[#0A1128]/70">
            Manage your platform, customers, and growth
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
            className="w-full bg-[#0A1128] hover:bg-[#0A1128]/90 text-white h-11" 
            size="lg"
          >
            Login to Admin
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="text-xs text-center text-[#0A1128]/50 mt-4">
          Admin access only • Unauthorized access is prohibited
        </p>
      </DialogContent>
    </Dialog>
  );
}
