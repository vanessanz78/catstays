import { useState } from 'react';
import { Button } from './ui/button';
import { User, Shield, Menu, X } from 'lucide-react';
import { ClientLoginModal } from './ClientLoginModal';
import { StaffLoginModal } from './StaffLoginModal';

interface WebsiteHeaderProps {
  businessName?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  onStaffLogin?: () => void;
  onClientLogin?: () => void;
}

export function WebsiteHeader({ 
  businessName = 'Our Cattery', 
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  backgroundColor = '#ffffff',
  onStaffLogin,
  onClientLogin
}: WebsiteHeaderProps) {
  const [showClientLogin, setShowClientLogin] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('WebsiteHeader rendered with:', { hasOnStaffLogin: !!onStaffLogin, hasOnClientLogin: !!onClientLogin });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Prevent event bubbling to parent
    
    // ONLY scroll if NOT inside a preview iframe/container
    // Check if we're in a preview context by looking for specific parent classes
    const isInsidePreview = (e.target as Element).closest('[data-preview-mode]') !== null;
    
    if (!isInsidePreview) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{ backgroundColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
          {/* Logo/Business Name - Always Visible */}
          <h1 
            className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap"
            style={{ color: primaryColor }}
          >
            {businessName}
          </h1>
          
          {/* Hamburger Menu Button - Always Visible */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
            style={{ color: primaryColor }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Right-Side Slide-Out Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Slide-out Menu Panel */}
          <div 
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            style={{ backgroundColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 
                className="text-xl font-bold"
                style={{ color: primaryColor }}
              >
                Menu
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2"
                style={{ color: primaryColor }}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-1">
                <a 
                  href="#hero" 
                  onClick={(e) => handleNavClick(e, 'hero')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Home
                </a>
                <a 
                  href="#why-choose-us" 
                  onClick={(e) => handleNavClick(e, 'why-choose-us')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Why Choose Us
                </a>
                <a 
                  href="#facilities" 
                  onClick={(e) => handleNavClick(e, 'facilities')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Facilities
                </a>
                <a 
                  href="#suites" 
                  onClick={(e) => handleNavClick(e, 'suites')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Our Suites
                </a>
                <a 
                  href="#services" 
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Services
                </a>
                <a 
                  href="#gallery" 
                  onClick={(e) => handleNavClick(e, 'gallery')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Gallery
                </a>
                <a 
                  href="#testimonials" 
                  onClick={(e) => handleNavClick(e, 'testimonials')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Testimonials
                </a>
                <a 
                  href="#faq" 
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  FAQ
                </a>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="text-base py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                  style={{ color: primaryColor }}
                >
                  Contact
                </a>
              </div>
            </nav>

            {/* Login Buttons at Bottom */}
            <div className="p-6 border-t space-y-3">
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setShowClientLogin(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <User className="w-5 h-5" />
                Client Login
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setShowStaffLogin(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full"
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                <Shield className="w-5 h-5" />
                Staff Login
              </Button>
            </div>
          </div>
        </div>
      )}

      <ClientLoginModal
        isOpen={showClientLogin}
        onClose={() => setShowClientLogin(false)}
        primaryColor={primaryColor}
        accentColor={accentColor}
        onClientLogin={onClientLogin}
      />

      <StaffLoginModal
        isOpen={showStaffLogin}
        onClose={() => setShowStaffLogin(false)}
        primaryColor={primaryColor}
        accentColor={accentColor}
        onStaffLogin={onStaffLogin}
      />
    </>
  );
}