import { Link, useLocation } from 'react-router';
import { Home, Calendar, Users, CreditCard, Settings, Plus, MessageSquare, Camera } from 'lucide-react';
import { Button } from './ui/button';

export function BottomNav() {
  const location = useLocation();
  
  const quickActions = [
    { path: '/admin/bookings?new=true', icon: Plus, label: 'New Booking', isAction: true },
    { path: '/admin/messages', icon: MessageSquare, label: 'Message' },
    { path: '/admin/cat-update-generator', icon: Camera, label: 'Update' },
    { path: '/admin', icon: Home, label: 'Today' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sage/10 shadow-lg z-50">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {quickActions.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.isAction) {
              // Special styling for "New Booking" button
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1"
                >
                  <Button 
                    size="icon"
                    className="w-12 h-12 rounded-full text-white shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: '#7DAF7B' }}
                  >
                    <Icon className="w-6 h-6" />
                  </Button>
                  <span className="text-xs font-medium" style={{ color: '#7DAF7B' }}>{item.label}</span>
                </Link>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive 
                    ? 'text-[#7DAF7B]' 
                    : 'text-[#6b7a6d] hover:text-[#7DAF7B]'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-[#7DAF7B]/10' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}