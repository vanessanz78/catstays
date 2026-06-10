import { useState } from 'react';
import { Button } from './ui/button';
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
  Upload
} from 'lucide-react';

interface RightMenuMockProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export function RightMenuMock({ currentPage = 'home', onPageChange }: RightMenuMockProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', icon: Home, label: 'Today', description: 'Check-ins & departures' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', description: 'Month view' },
    { id: 'room-planner', icon: LayoutGrid, label: 'Room Planner', description: 'Visual room grid' },
    { id: 'bookings', icon: BookOpen, label: 'Bookings', description: 'All reservations' },
    { id: 'customers', icon: Users, label: 'Customers', description: 'Contact details' },
    { id: 'smart-import', icon: Upload, label: 'Smart Import', description: 'Import your data', badge: 'AI' },
    { id: 'accounting', icon: CreditCard, label: 'Accounting', description: 'Payments & invoices' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', description: 'Automated messaging' },
    { id: 'promotions', icon: Megaphone, label: 'Promotions', description: 'Special offers' },
    { id: 'social', icon: Share2, label: 'Social Media', description: 'Post generator' },
    { id: 'cat-updates', icon: Camera, label: 'Cat Updates', description: 'Photo updates' },
    { id: 'insights', icon: BarChart3, label: 'Insights', description: 'Analytics & reports' },
    { id: 'settings', icon: Settings, label: 'Settings', description: 'Configure platform' },
  ];

  const handleItemClick = (itemId: string) => {
    setIsOpen(false);
    if (onPageChange) {
      onPageChange(itemId);
    }
  };

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
        className={`fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ maxWidth: '75vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#F6F4EF' }}>
          <div>
            <h2 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
              Dashboard
            </h2>
            <p className="text-sm" style={{ color: '#6b7a6d' }}>Purrfect Haven</p>
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
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl mb-1 transition-all group ${
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
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${isActive ? 'text-white' : 'text-[#2d3e2f]'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-[#6b7a6d]'}`}>
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-[#6b7a6d] opacity-0 group-hover:opacity-100'
                  } transition-opacity`} />
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
