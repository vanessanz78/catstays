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
  ExternalLink,
  MessageSquare,
  Megaphone,
  Share2,
  Camera,
  BarChart3,
  FileBarChart,
  Settings,
  ChevronRight,
  ChevronLeft,
  Upload,
  Globe,
  Crown,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react';

type RightMenuMode = 'button' | 'sidebar';

type MenuItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  description: string;
  badge?: string;
};

export const menuItems: MenuItem[] = [
  { path: '/staff-dashboard', icon: Home, label: 'Today', description: 'Check-ins & departures' },
  { path: '/staff-dashboard/bookings', icon: BookOpen, label: 'Bookings', description: 'All reservations' },
  { path: '/staff-dashboard/calendar', icon: Calendar, label: 'Calendar', description: 'Room timeline' },
  { path: '/staff-dashboard/customers', icon: Users, label: 'Customers', description: 'Contact details' },
  { path: '/staff-dashboard/messages', icon: MessageSquare, label: 'Messages', description: 'Email & customer history' },
  { path: '/staff-dashboard/cat-update-generator', icon: Camera, label: 'Cat Updates', description: 'Private photo updates' },
  { path: '/staff-dashboard/smart-import', icon: Upload, label: 'Smart Import', description: 'Import & export CSV data' },
  { path: '/staff-dashboard/accounting', icon: CreditCard, label: 'Accounting', description: 'Payments, expenses & GST' },
  { path: '/staff-dashboard/reports', icon: FileBarChart, label: 'Reports', description: 'Sort, filter, print & export' },
  { path: '/staff-dashboard/payment', icon: CreditCard, label: 'Payment Setup', description: 'Stripe integration' },
  { path: '/staff-dashboard/promotions', icon: Megaphone, label: 'Promotions', description: 'Offers & promo codes' },
  { path: '/staff-dashboard/social', icon: Share2, label: 'Social Media', description: 'Drafts, schedule & sharing' },
  { path: '/staff-dashboard/booking-setup', icon: Settings, label: 'Booking Setup', description: 'Rules, times & deposits' },
  { path: '/staff-dashboard/marketing', icon: WandSparkles, label: 'Marketing Studio', description: 'Editable marketing materials' },
  { path: '/staff-dashboard/insights', icon: BarChart3, label: 'Insights', description: 'Trends and performance' },
  { path: '/staff-dashboard/subscription', icon: Crown, label: 'Subscription', description: 'Manage your plan' },
  { path: '/staff-dashboard/settings', icon: Settings, label: 'Settings', description: 'Configure platform' },
  { path: '/staff-dashboard/room-planner', icon: LayoutGrid, label: 'Room Planner', description: 'Visual room grid' },
  { path: '/staff-dashboard/website-editor', icon: Globe, label: 'Edit Website', description: 'Edit public website' },
];

const primaryMenuItems = menuItems.slice(0, 6);
const secondaryMenuItems = menuItems.slice(6, -2);
const bottomMenuItems = menuItems.slice(-2);

export function RightMenu({ mode = 'button' }: { mode?: RightMenuMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { cattery } = useAuth();
  const businessName = cattery?.name || 'Your cattery';

  const isActivePath = (path: string) =>
    path === '/staff-dashboard'
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderMenuItem = (item: MenuItem, compact = false, onSelect?: () => void) => {
    const Icon = item.icon;
    const isActive = isActivePath(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        title={compact ? item.label : undefined}
        onClick={onSelect}
        className={`group mb-1 flex items-center gap-3 rounded-lg p-3 transition-all ${
          compact ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-[#0A1128] text-white shadow-sm'
            : 'text-[#2d3e2f] hover:bg-[#F6F2EA]'
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isActive ? 'bg-white/15' : 'bg-[#C46A3A]/10'
          }`}
        >
          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#C46A3A]'}`} />
        </div>
        {!compact && (
          <>
            <div className="min-w-0 flex-1">
              <div className={`truncate font-semibold ${isActive ? 'text-white' : 'text-[#2d3e2f]'}`}>
                {item.label}
              </div>
              <div className={`truncate text-xs ${isActive ? 'text-white/80' : 'text-[#6b7a6d]'}`}>
                {item.description}
              </div>
            </div>
            {item.badge && <Badge className="ml-2 bg-[#C46A3A] text-white">{item.badge}</Badge>}
            <ChevronRight
              className={`h-5 w-5 ${
                isActive ? 'text-white' : 'text-[#6b7a6d] opacity-0 group-hover:opacity-100'
              } transition-opacity`}
            />
          </>
        )}
      </Link>
    );
  };

  const renderMenuGroups = (compact = false, onSelect?: () => void) => (
    <>
      <div>{primaryMenuItems.map((item) => renderMenuItem(item, compact, onSelect))}</div>
      <div className="mt-3 border-t border-[#E8DED4] pt-3">
        {secondaryMenuItems.map((item) => renderMenuItem(item, compact, onSelect))}
      </div>
      <div className="mt-3 border-t border-[#E8DED4] pt-3">
        {bottomMenuItems.map((item) => renderMenuItem(item, compact, onSelect))}
      </div>
    </>
  );

  const renderWebsiteLink = (onSelect?: () => void) => (
    <Link
      to="/"
      onClick={onSelect}
      aria-label="View public website"
      title="View public website"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#C46A3A] transition hover:bg-[#C46A3A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46A3A] focus-visible:ring-offset-2"
    >
      <ExternalLink className="h-5 w-5" />
    </Link>
  );

  if (mode === 'sidebar') {
    return (
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#E8DED4] bg-white/95 shadow-sm transition-[width] duration-200 lg:flex ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8DED4] bg-[#F6F4EF] p-4">
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-serif text-xl font-semibold text-[#2d3e2f]">Dashboard</h2>
                <p className="truncate text-sm text-[#6b7a6d]">{businessName}</p>
              </div>
              {renderWebsiteLink()}
            </>
          )}
          <Button
            onClick={() => setIsCollapsed((value) => !value)}
            variant="ghost"
            size="icon"
            aria-label={isCollapsed ? 'Expand dashboard menu' : 'Collapse dashboard menu'}
            className="ml-auto rounded-full hover:bg-[#C46A3A]/10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-[#C46A3A]" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-[#C46A3A]" />
            )}
          </Button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-8">
          {renderMenuGroups(isCollapsed)}
        </nav>
      </aside>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        aria-label="Open dashboard menu"
        className="rounded-full hover:bg-[#C46A3A]/10 lg:hidden"
      >
        <Menu className="h-6 w-6 text-[#C46A3A]" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && <div
        className="fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-80 flex-col bg-white shadow-2xl lg:hidden"
        style={{ maxWidth: '85vw', height: '100vh' }}
      >
        <div className="flex shrink-0 items-center justify-between border-b p-4" style={{ backgroundColor: '#F6F4EF' }}>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold" style={{ color: '#2d3e2f' }}>
              Dashboard
            </h2>
            <p className="truncate text-sm" style={{ color: '#6b7a6d' }}>{businessName}</p>
          </div>
          {renderWebsiteLink(() => setIsOpen(false))}
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

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
          <div className="p-2">
            {renderMenuGroups(false, () => setIsOpen(false))}
          </div>
        </nav>
      </div>}
    </>
  );
}
