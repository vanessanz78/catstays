import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Heart, Menu, X } from 'lucide-react';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { AdminLoginModal } from './AdminLoginModal';

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Admin access: logo click (5x) or Cmd/Ctrl+Shift+A
  const { handleLogoClick } = useAdminAccess({
    onAdminAccess: () => setShowAdminModal(true)
  });

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#0A1128]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Hidden admin access */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
              onClick={(e) => {
                // Don't interfere with navigation
                handleLogoClick();
              }}
            >
              <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                <Heart className="w-10 h-10 text-[#C46A3A] fill-[#C46A3A]/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">🐱</span>
                </div>
              </div>
              <span 
                className="text-2xl font-serif font-bold text-[#0A1128]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                CatStays
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/features" 
                className="text-sm font-medium text-[#0A1128]/70 hover:text-[#0A1128] transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm font-medium text-[#0A1128]/70 hover:text-[#0A1128] transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/demo/deloraine"
                className="text-sm font-medium text-[#0A1128]/70 hover:text-[#0A1128] transition-colors"
              >
                Live Example
              </Link>
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                asChild
                variant="ghost" 
                className="text-[#0A1128]"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button 
                asChild
                className="bg-[#A85A30] hover:bg-[#8A3F20] text-white"
              >
                <Link to="/signup">Start Free Trial</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#0A1128]"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#0A1128]/10">
              <nav className="flex flex-col gap-4">
                <Link 
                  to="/features" 
                  className="text-sm font-medium text-[#0A1128]/70 hover:text-[#0A1128]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-sm font-medium text-[#0A1128]/70 hover:text-[#0A1128]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/demo/deloraine"
                  className="text-sm font-medium text-[#0A1128]/70 hover:text-[#0A1128]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Live Example
                </Link>
                <div className="pt-4 border-t border-[#0A1128]/10 flex flex-col gap-2">
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full"
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    className="w-full bg-[#A85A30] hover:bg-[#8A3F20] text-white"
                  >
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Start Free Trial
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Admin Login Modal - Hidden until triggered */}
      <AdminLoginModal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />
    </>
  );
}
