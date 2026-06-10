import { useState } from 'react';
import { Smartphone, Monitor, Globe, LayoutDashboard, Home, Calendar, MapPin, Phone, Mail, Star, Tablet, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { DashboardPreviewMock } from './DashboardPreviewMock';
import { CustomerDashboard } from '../customer/Dashboard';
import { BookingBar } from '../../components/BookingBar';
import { BookingFlowModal } from '../../components/BookingFlowModal';
import { ChatWidget } from '../../components/ChatWidget';
import { WebsiteHeader } from '../../components/WebsiteHeader';
import {
  WhyChooseUsSection,
  FacilitiesSection,
  SuitesSection,
  AboutSection,
  ServicesSection,
  GallerySection,
  TestimonialsSection,
  FAQSection,
  CommitmentSection,
  ContactSection,
  FooterSection,
  catImages,
  getHeadingFontClass,
  getSubheadingFontClass,
  getBodyFontClass
} from '../../components/WebsiteSections';

interface FullWebsitePreviewProps {
  data: {
    businessName: string;
    location: string;
    subdomain: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    heroHeading: string;
    heroSubheading: string;
    aboutText: string;
    aboutHeading: string;
    phone: string;
    email: string;
    address: string;
    pricePerNight?: string;
    pricePerCat?: string;
    // Website builder data
    selectedTemplate?: string | null;
    heroImage?: string;
    ctaText?: string;
    headingFont?: string;
    subheadingFont?: string;
    typography?: string;
    // All website sections
    whyChooseUsData?: any;
    facilitiesData?: any;
    suitesData?: any;
    aboutData?: any;
    servicesData?: any;
    galleryData?: any;
    testimonialsData?: any;
    faqData?: any;
    commitmentData?: any;
    contactData?: any;
    customSectionsData?: any[];
    // Section visibility
    sectionsOrder?: string[];
    // Booking setup data from Step 5
    checkInTime?: string;
    checkOutTime?: string;
    minimumStay?: string;
    maximumStay?: string;
    depositRequired?: string;
    depositType?: string;
    cancellationPolicy?: string;
    roomTypes?: Array<{
      name: string;
      numberOfRooms: string;
      maxCatsPerRoom: string;
      sameFamilyOnly: boolean;
    }>;
    pricingRates?: Array<{
      numberOfCats: string;
      price: string;
      discountType: string;
      discountValue: string;
    }>;
    discounts?: Array<{
      name: string;
      type: string;
      value: string;
    }>;
    blockOutDates?: Array<{
      name: string;
      startDate: string;
      endDate: string;
    }>;
  };
  initialMode?: 'website' | 'dashboard' | 'client';
  initialDevice?: 'mobile' | 'tablet' | 'desktop';
}

export function FullWebsitePreview({ data, initialMode = 'dashboard', initialDevice = 'mobile' }: FullWebsitePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'website' | 'dashboard' | 'client'>(initialMode);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(initialDevice);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState<'staff' | 'client' | null>(null);

  const handleBookingSearch = (searchData: any) => {
    setShowBookingModal(true);
  };

  // Render the customer website using the same template logic as WebsiteBuilder
  const renderWebsitePreview = () => {
    const template = data.selectedTemplate || 'boutique-luxury';

    // Render the template with all the data
    return (
      <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-white">
        {/* Header */}
        <WebsiteHeader
          businessName={data.businessName || 'Our Cattery'}
          primaryColor={data.primaryColor || '#0A1128'}
          accentColor={data.accentColor || '#C46A3A'}
          backgroundColor="#ffffff"
          onStaffLogin={() => setShowDashboard('staff')}
          onClientLogin={() => setShowDashboard('client')}
        />

        {/* Hero Section */}
        <div id="hero" className="relative h-[400px] sm:h-[500px] md:h-[600px]">
          <img 
            src={data.heroImage || catImages.hero1} 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight" 
              style={{ fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}
            >
              {data.heroHeading || 'Luxury Cat Boarding'}
            </h1>
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto text-white/90" 
              style={{ fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}
            >
              {data.heroSubheading || 'Premium care for your feline friends'}
            </p>
            {data.ctaText && (
              <Button 
                className="rounded-full font-semibold px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 text-base sm:text-lg shadow-2xl"
                style={{ backgroundColor: data.accentColor || '#C46A3A', color: 'white' }}
              >
                {data.ctaText}
              </Button>
            )}
          </div>
        </div>

        {/* Booking Bar */}
        <div className="px-4 sm:px-6 md:px-12 -mt-8 sm:-mt-12 relative z-10">
          <BookingBar
            primaryColor={data.primaryColor || '#0A1128'}
            accentColor={data.accentColor || '#C46A3A'}
            isPreview={true}
            onBookingSearch={handleBookingSearch}
            style="overlay"
          />
        </div>

        {/* Why Choose Us */}
        <WhyChooseUsSection
          data={{
            ...data,
            ...data.whyChooseUsData
          }}
          template={template}
        />

        {/* About Section */}
        <AboutSection
          data={{
            ...data,
            ...data.aboutData,
            aboutHeading: data.aboutHeading,
            aboutText: data.aboutText
          }}
          template={template}
        />

        {/* Suites Section */}
        <SuitesSection
          data={{
            ...data,
            ...data.suitesData
          }}
          template={template}
        />

        {/* Services Section */}
        <ServicesSection
          data={{
            ...data,
            ...data.servicesData
          }}
          template={template}
        />

        {/* Facilities Section */}
        <FacilitiesSection
          data={{
            ...data,
            ...data.facilitiesData
          }}
          template={template}
        />

        {/* Gallery Section */}
        <GallerySection
          data={{
            ...data,
            ...data.galleryData
          }}
          template={template}
        />

        {/* Testimonials Section */}
        <TestimonialsSection
          data={{
            ...data,
            ...data.testimonialsData
          }}
          template={template}
        />

        {/* FAQ Section */}
        <FAQSection
          data={{
            ...data,
            ...data.faqData
          }}
          template={template}
        />

        {/* Contact Section */}
        <ContactSection
          data={{
            ...data,
            ...data.contactData,
            phone: data.phone,
            email: data.email,
            address: data.address
          }}
          template={template}
        />

        {/* Footer */}
        <FooterSection
          data={{
            businessName: data.businessName,
            primaryColor: data.primaryColor,
            accentColor: data.accentColor,
            phone: data.phone,
            email: data.email,
            address: data.address
          }}
          template={template}
        />

        {/* Chat Widget */}
        <ChatWidget
          primaryColor={data.primaryColor}
          accentColor={data.accentColor}
          businessName={data.businessName}
        />

        {/* Booking Modal */}
        {showBookingModal && (
          <BookingFlowModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            primaryColor={data.primaryColor}
            accentColor={data.accentColor}
            businessName={data.businessName}
            pricePerNight={data.pricePerNight}
          />
        )}
      </div>
    );
  };

  // Device frame dimensions
  const deviceDimensions = deviceType === 'mobile'
    ? { width: 375, height: 667, scale: 1.0 }
    : deviceType === 'tablet'
    ? { width: 768, height: 1024, scale: 0.75 }
    : { width: 1440, height: 900, scale: 0.7 };

  return (
    <div className="space-y-6">
      {/* Preview Mode Toggle */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => setPreviewMode('website')}
          variant={previewMode === 'website' ? 'default' : 'outline'}
          className={`rounded-xl gap-2 ${
            previewMode === 'website'
              ? 'bg-[#0A1128] hover:bg-[#0A1128]/90 text-white'
              : 'border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          Customer Website
        </Button>
        <Button
          onClick={() => setPreviewMode('dashboard')}
          variant={previewMode === 'dashboard' ? 'default' : 'outline'}
          className={`rounded-xl gap-2 ${
            previewMode === 'dashboard'
              ? 'bg-[#0A1128] hover:bg-[#0A1128]/90 text-white'
              : 'border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Staff Dashboard
        </Button>
        <Button
          onClick={() => setPreviewMode('client')}
          variant={previewMode === 'client' ? 'default' : 'outline'}
          className={`rounded-xl gap-2 ${
            previewMode === 'client'
              ? 'bg-[#0A1128] hover:bg-[#0A1128]/90 text-white'
              : 'border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5'
          }`}
        >
          <User className="w-4 h-4" />
          Client Dashboard
        </Button>
      </div>

      {/* Device Type Toggle */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => setDeviceType('mobile')}
          variant={deviceType === 'mobile' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-lg gap-2 ${
            deviceType === 'mobile'
              ? 'bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white'
              : 'border-[#C46A3A]/20 text-[#C46A3A] hover:bg-[#C46A3A]/5'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </Button>
        <Button
          onClick={() => setDeviceType('tablet')}
          variant={deviceType === 'tablet' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-lg gap-2 ${
            deviceType === 'tablet'
              ? 'bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white'
              : 'border-[#C46A3A]/20 text-[#C46A3A] hover:bg-[#C46A3A]/5'
          }`}
        >
          <Tablet className="w-4 h-4" />
          Tablet
        </Button>
        <Button
          onClick={() => setDeviceType('desktop')}
          variant={deviceType === 'desktop' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-lg gap-2 ${
            deviceType === 'desktop'
              ? 'bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white'
              : 'border-[#C46A3A]/20 text-[#C46A3A] hover:bg-[#C46A3A]/5'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Desktop
        </Button>
      </div>

      {/* Informational Text */}
      <div className="text-center max-w-2xl mx-auto">
        {previewMode === 'website' ? (
          <p className="text-sm text-[#0A1128]/70">
            This is a fully functional preview of your customer-facing website. Navigate between sections to see how it works!
          </p>
        ) : previewMode === 'dashboard' ? (
          <p className="text-sm text-[#0A1128]/70">
            This is your staff dashboard where you'll manage bookings, customers, and daily operations.
          </p>
        ) : (
          <p className="text-sm text-[#0A1128]/70">
            This is the customer portal where your clients can view their bookings, manage their pet profiles, and receive photo updates.
          </p>
        )}
      </div>

      {/* Device Preview Frame - ISOLATED VIEWPORT */}
      <div className="flex justify-center items-center py-8 bg-gradient-to-b from-[#0A1128]/5 to-transparent rounded-3xl">
        <div
          className="relative shadow-2xl"
          style={{
            width: `${deviceDimensions.width * deviceDimensions.scale}px`,
            height: `${deviceDimensions.height * deviceDimensions.scale}px`,
            borderRadius: deviceType === 'mobile' ? '36px' : deviceType === 'tablet' ? '24px' : '12px',
            backgroundColor: deviceType === 'mobile' ? '#1a1a1a' : deviceType === 'tablet' ? '#2a2a2a' : '#fff',
            border: deviceType === 'mobile' ? '8px solid #1a1a1a' : deviceType === 'tablet' ? '12px solid #2a2a2a' : '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {/* Mobile Notch */}
          {deviceType === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-50" />
          )}

          {/* Tablet Camera */}
          {deviceType === 'tablet' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rounded-full z-50" />
          )}

          {/* HARD ISOLATED APP CONTAINER - Architecture from mobile-preview-fix */}
          <div
            className="absolute inset-0"
            style={{
              position: 'relative',
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              contain: 'layout paint size', // STRICT containment
              borderRadius: deviceType === 'mobile' ? '28px' : deviceType === 'tablet' ? '16px' : '8px',
            }}
          >
            {/* INTERNAL SCROLL LAYER - Only scrollable area */}
            <div
              className="h-full w-full"
              data-preview-mode="true"
              style={{
                overflow: 'auto',
                overflowX: 'hidden',
                position: 'relative',
              }}
            >
              {previewMode === 'website' ? (
                renderWebsitePreview()
              ) : previewMode === 'dashboard' ? (
                <div className="h-full bg-cream">
                  <DashboardPreviewMock businessName={data.businessName} />
                </div>
              ) : (
                <div className="h-full bg-cream">
                  <CustomerDashboard 
                    primaryColor={data.primaryColor}
                    accentColor={data.accentColor}
                    businessName={data.businessName}
                    businessAddress={data.address}
                    businessPhone={data.phone}
                    businessEmail={data.email}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="max-w-2xl mx-auto">
        <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#F8F7F5] p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-[#C46A3A]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0A1128] mb-1">
                {previewMode === 'website' ? 'Your Website is Live!' : previewMode === 'dashboard' ? 'Staff Dashboard Ready' : 'Client Portal Active'}
              </h4>
              <p className="text-sm text-[#0A1128]/70 leading-relaxed">
                {previewMode === 'website' 
                  ? `Your customers will access this at ${data.subdomain}.catstays.app. They can browse rooms, learn about your cattery, and book online.`
                  : previewMode === 'dashboard'
                  ? `You and your staff will access this dashboard to manage bookings, view arrivals/departures, track payments, and communicate with customers.`
                  : `Your customers can log in to view their bookings, manage pet profiles, receive photo updates, and communicate with you.`
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
