import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
  Download,
  Crown
} from 'lucide-react';

export function RightMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Today', description: 'Check-ins & departures' },
    { path: '/admin/calendar', icon: Calendar, label: 'Calendar', description: 'Month view' },
    { path: '/admin/room-planner', icon: LayoutGrid, label: 'Room Planner', description: 'Visual room grid' },
    { path: '/admin/bookings', icon: BookOpen, label: 'Bookings', description: 'All reservations' },
    { path: '/admin/customers', icon: Users, label: 'Customers', description: 'Contact details' },
    { path: '/admin/smart-import', icon: Upload, label: 'Smart Import', description: 'Import your data', badge: 'AI' },
    { path: '/admin/accounting', icon: CreditCard, label: 'Accounting', description: 'Payments & invoices' },
    { path: '/dashboard/payment', icon: CreditCard, label: 'Payment Setup', description: 'Stripe integration' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages', description: 'Automated messaging' },
    { path: '/admin/promotions', icon: Megaphone, label: 'Promotions', description: 'Special offers' },
    { path: '/admin/social', icon: Share2, label: 'Social Media', description: 'Post generator' },
    { path: '/admin/cat-update-generator', icon: Camera, label: 'Cat Updates', description: 'Photo updates' },
    { path: '/dashboard/website-editor', icon: Globe, label: 'Website', description: 'Edit your website' },
    { path: '/dashboard/booking-setup', icon: Settings, label: 'Booking Setup', description: 'Rules & pricing' },
    { path: '/dashboard/marketing', icon: Download, label: 'Marketing Kit', description: 'Download materials' },
    { path: '/admin/insights', icon: BarChart3, label: 'Insights', description: 'Analytics & reports' },
    { path: '/dashboard/subscription', icon: Crown, label: 'Subscription', description: 'Manage your plan' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', description: 'Configure platform' },
  ];

  return (
    <>
      {/* Menu Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-[#7DAF7B]/10"
      >
        <Menu className="w-6 h-6" style={{ color: '#7DAF7B' }} />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ maxWidth: '85vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#F6F4EF' }}>
          <div>
            <h2 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
              Dashboard
            </h2>
            <p className="text-sm" style={{ color: '#6b7a6d' }}>Deloraine Cattery</p>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <X className="w-6 h-6" style={{ color: '#6b7a6d' }} />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="overflow-y-auto h-full pb-24">
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-xl mb-1 transition-all group ${
                    isActive
                      ? 'text-white'
                      : 'text-[#2d3e2f] hover:bg-[#7DAF7B]/5'
                  }`}
                  style={isActive ? { backgroundColor: '#7DAF7B' } : {}}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : 'bg-[#7DAF7B]/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#7DAF7B]'}`} />
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
                  <ChevronRight className={`w-5 h-5 ${
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
