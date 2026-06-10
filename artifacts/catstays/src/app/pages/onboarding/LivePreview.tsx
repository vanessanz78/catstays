import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ExternalLink } from 'lucide-react';

interface LivePreviewProps {
  brandData: {
    businessName: string;
    subdomain: string;
    primaryColor: string;
    accentColor: string;
    typography?: string;
    headingFont?: string;
    subheadingFont?: string;
    bodyFont?: string;
    logoUrl?: string;
    heroImageUrl?: string;
  };
  isPreviewMode?: boolean;
}

export function LivePreview({ brandData, isPreviewMode = false }: LivePreviewProps) {
  // Font helper functions matching WebsiteSections.tsx
  const getHeadingFont = (font: string) => {
    const fontMap: Record<string, string> = {
      'playfair': 'Playfair Display',
      'merriweather': 'Merriweather',
      'poppins': 'Poppins',
      'montserrat': 'Montserrat',
      'inter': 'Inter'
    };
    return fontMap[font] || fontMap['playfair'];
  };

  const getSubheadingFont = (font: string) => {
    const fontMap: Record<string, string> = {
      'inter': 'Inter',
      'nunito': 'Nunito',
      'lato': 'Lato',
      'opensans': 'Open Sans',
      'roboto': 'Roboto',
      'poppins': 'Poppins'
    };
    return fontMap[font] || fontMap['inter'];
  };

  const getBodyFont = (font: string) => {
    const fontMap: Record<string, string> = {
      'inter': 'Inter',
      'nunito': 'Nunito',
      'lato': 'Lato',
      'opensans': 'Open Sans',
      'roboto': 'Roboto'
    };
    return fontMap[font] || fontMap['inter'];
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ borderColor: brandData.primaryColor, borderWidth: '2px' }}>
      {/* Preview Banner */}
      {isPreviewMode && (
        <div className="bg-yellow-400 px-4 py-2 text-center">
          <p className="text-sm font-semibold text-yellow-900">
            🔍 Preview Mode - Not yet live
          </p>
        </div>
      )}

      {/* Browser Chrome */}
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs font-mono text-gray-600">
          {isPreviewMode ? `preview.petstays.nz/${brandData.subdomain}` : `${brandData.subdomain}.petstays.nz`}
        </div>
      </div>

      {/* Website Preview Content */}
      <div className="bg-white overflow-hidden" style={{ height: '600px', overflowY: 'auto' }}>
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b">
          <div className="text-xl font-bold" style={{ color: brandData.primaryColor, fontFamily: getHeadingFont(brandData.headingFont || brandData.typography || 'playfair') }}>
            {brandData.businessName}
          </div>
          <nav className="hidden md:flex gap-6 text-sm" style={{ fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
            <a href="#" style={{ color: '#2d3e2f' }}>Home</a>
            <a href="#" style={{ color: '#2d3e2f' }}>About</a>
            <a href="#" style={{ color: '#2d3e2f' }}>Facilities</a>
            <a href="#" style={{ color: '#2d3e2f' }}>Contact</a>
          </nav>
        </header>

        {/* Hero Section */}
        <div className="relative" style={{ backgroundColor: `${brandData.primaryColor}10` }}>
          <div className="px-6 py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: '#2d3e2f', fontFamily: getHeadingFont(brandData.headingFont || brandData.typography || 'playfair') }}
              >
                Luxury Cat Boarding
              </h1>
              <p className="text-lg mb-6" style={{ color: '#6b7a6d', fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
                A home away from home for your feline friends. Safe, comfortable, and caring boarding in a peaceful environment.
              </p>
              <Button 
                className="rounded-xl"
                style={{ backgroundColor: brandData.accentColor, color: '#2d3e2f' }}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-6 py-12 bg-white">
          <h2 
            className="text-3xl font-bold text-center mb-8"
            style={{ color: '#2d3e2f', fontFamily: getHeadingFont(brandData.headingFont || brandData.typography || 'playfair') }}
          >
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${brandData.primaryColor}10` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ backgroundColor: brandData.primaryColor }}
              >
                🏡
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#2d3e2f', fontFamily: getSubheadingFont(brandData.subheadingFont || 'inter') }}>Cozy Rooms</h3>
              <p className="text-sm" style={{ color: '#6b7a6d', fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
                Private and spacious accommodations for every cat
              </p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${brandData.primaryColor}10` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ backgroundColor: brandData.primaryColor }}
              >
                💚
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#2d3e2f', fontFamily: getSubheadingFont(brandData.subheadingFont || 'inter') }}>Expert Care</h3>
              <p className="text-sm" style={{ color: '#6b7a6d', fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
                Experienced staff dedicated to your cat's wellbeing
              </p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${brandData.primaryColor}10` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ backgroundColor: brandData.primaryColor }}
              >
                📸
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#2d3e2f', fontFamily: getSubheadingFont(brandData.subheadingFont || 'inter') }}>Daily Updates</h3>
              <p className="text-sm" style={{ color: '#6b7a6d', fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
                Regular photos and updates about your cat's stay
              </p>
            </div>
          </div>
        </div>

        {/* Booking CTA */}
        <div className="px-6 py-12" style={{ backgroundColor: brandData.primaryColor }}>
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: getHeadingFont(brandData.headingFont || brandData.typography || 'playfair') }}>
              Ready to Book?
            </h2>
            <p className="mb-6 text-white/90" style={{ fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
              Secure your cat's stay today. Easy online booking with instant confirmation.
            </p>
            <Button 
              className="rounded-xl"
              style={{ backgroundColor: 'white', color: brandData.primaryColor }}
            >
              Check Availability
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-8 bg-gray-50 border-t">
          <div className="text-center text-sm" style={{ color: '#6b7a6d', fontFamily: getBodyFont(brandData.bodyFont || 'inter') }}>
            <p className="mb-2">© 2026 {brandData.businessName}. All rights reserved.</p>
            <p className="text-xs">Powered by Petstays</p>
          </div>
        </footer>
      </div>

      {/* Live Update Indicator */}
      <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs" style={{ color: '#6b7a6d' }}>Live Preview</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Updates in real-time
        </Badge>
      </div>
    </div>
  );
}
