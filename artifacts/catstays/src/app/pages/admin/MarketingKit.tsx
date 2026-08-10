import { MarketingStudio } from '../../components/MarketingStudio';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export function MarketingKit() {
  // Load business data from localStorage or use defaults
  const getBusinessData = () => {
    const saved = localStorage.getItem('catteryData');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      businessName: 'Purrfect Haven Cattery',
      location: 'Auckland, New Zealand',
      subdomain: 'purrfecthaven',
      primaryColor: '#0A1128',
      accentColor: '#C46A3A',
      backgroundColor: '#F8F7F5',
      heroHeading: 'Premium Cat Boarding in Auckland',
      heroSubheading: 'Luxurious suites, daily updates, and personalized care for your feline family',
      aboutText: 'Welcome to our boutique cattery, where your cats enjoy spacious suites, daily photo updates, and loving attention.',
      phone: '021 123 4567',
      email: 'hello@purrfecthaven.catstays.nz',
      address: '123 Cat Street, Auckland',
      pricePerNight: '45',
      heroImage: '',
      headingFont: 'Playfair Display',
      subheadingFont: 'Inter'
    };
  };

  const businessData = getBusinessData();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard" className="p-2 hover:bg-[#F6F4EF] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: '#2d3e2f' }} />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Marketing Studio
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Create posts, campaigns, and client-ready graphics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <RightMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1680px] p-4 pb-24 md:p-6">
        <MarketingStudio businessData={businessData} />
      </div>
    </div>
  );
}
