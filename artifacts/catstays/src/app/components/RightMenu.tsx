import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  Calendar,
  LayoutGrid,
  BookOpen,
  Users,
  CreditCard,
  MessageSquare,
  Megaphone,
  Share2,
  Camera,
  BarChart3,
  Settings,
  ChevronRight,
  Upload,
  Globe,
  Crown,
  WandSparkles,
} from 'lucide-react';

export function RightMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { cattery } = useAuth();
  const businessName = cattery?.name || 'Your cattery';

  const menuItems = [
    { path: '/staff-dashboard', icon: Home, label: 'Today', description: 'Check-ins & departures' },
    { path: '/staff-dashboard/calendar', icon: Calendar, label: 'Calendar', description: 'Month view' },
    { path: '/staff-dashboard/room-planner', icon: LayoutGrid, label: 'Room Planner', description: 'Visual room grid' },
    { path: '/staff-dashboard/bookings', icon: BookOpen, label: 'Bookings', description: 'All reservations' },
    { path: '/staff-dashboard/customers', icon: Users, label: 'Customers', description: 'Contact details' },
    { path: '/staff-dashboard/smart-import', icon: Upload, label: 'Smart Import', description: 'Import your data', badge: 'AI' },
    { path: '/staff-dashboard/accounting', icon: CreditCard, label: 'Accounting', description: 'Payments & invoices' },
    { path: '/staff-dashboard/payment', icon: CreditCard, label: 'Payment Setup', description: 'Stripe integration' },
    { path: '/staff-dashboard/messages', icon: MessageSquare, label: 'Messages', description: 'Automated messaging' },
    { path: '/staff-dashboard/promotions', icon: Megaphone, label: 'Promotions', description: 'Special offers' },
    { path: '/staff-dashboard/social', icon: Share2, label: 'Social Media', description: 'Post generator' },
    { path: '/staff-dashboard/cat-update-generator', icon: Camera, label: 'Cat Updates', description: 'Photo updates' },
    { path: '/staff-dashboard/website-editor', icon: Globe, label: 'Website', description: 'Edit your website' },
    { path: '/staff-dashboard/booking-setup', icon: Settings, label: 'Booking Setup', description: 'Rules & pricing' },
    { path: '/staff-dashboard/marketing', icon: WandSparkles, label: 'Marketing Studio', description: 'Editable marketing materials' },
    { path: '/staff-dashboard/insights', icon: BarChart3, label: 'Insights', description: 'Analytics & reports' },
    { path: '/staff-dashboard/subscription', icon: Crown, label: 'Subscription', description: 'Manage your plan' },
    { path: '/staff-dashboard/settings', icon: Settings, label: 'Settings', description: 'Configure platform' },
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        aria-label="Open dashboard menu"
        className="rounded-full hover:bg-[#7DAF7B]/10"
      >
        <Menu className="h-6 w-6" style={{ color: '#7DAF7B' }} />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-80 transform flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ maxWidth: '85vw' }}
      >
        <div className="flex shrink-0 items-center justify-between border-b p-4" style={{ backgroundColor: '#F6F4EF' }}>
          <div>
            <h2 className="font-serif text-xl font-semibold" style={{ color: '#2d3e2f' }}>
              Dashboard
            </h2>
            <p className="text-sm" style={{ color: '#6b7a6d' }}>{businessName}</p>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            aria-label="Close dashboard menu"
            className="rounded-full"
          >
            <X className="h-6 w-6" style={{ color: '#6b7a6d' }} />
          </Button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/staff-dashboard'
                  ? location.pathname === item.path
                  : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`group mb-1 flex items-center gap-3 rounded-xl p-4 transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-[#2d3e2f] hover:bg-[#7DAF7B]/5'
                  }`}
                  style={isActive ? { backgroundColor: '#7DAF7B' } : {}}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isActive ? 'bg-white/20' : 'bg-[#7DAF7B]/10'
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#7DAF7B]'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isActive ? 'text-white' : 'text-[#2d3e2f]'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-[#6b7a6d]'}`}>
                      {item.description}
                    </div>
                  </div>
                  {item.badge && <Badge className="ml-2">{item.badge}</Badge>}
                  <ChevronRight className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-[#6b7a6d] opacity-0 group-hover:opacity-100'
                  } transition-opacity`} />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
