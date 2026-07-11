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
import { CatstaysTemplateSite } from './CatstaysTemplateSite';
import { isOriginalTemplate, normalizePreviewTemplateId } from '../../lib/previewTemplates';
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
    sourceUrl?: string;
    sourceHost?: string;
    importSourceUrl?: string;
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
  controlledMode?: 'website' | 'dashboard' | 'client';
  controlledDevice?: 'mobile' | 'tablet' | 'desktop';
  showControls?: boolean;
  showInfoCard?: boolean;
}

export function FullWebsitePreview({
  data,
  initialMode = 'website',
  initialDevice = 'desktop',
  controlledMode,
  controlledDevice,
  showControls = true,
  showInfoCard = true,
}: FullWebsitePreviewProps) {
  const [internalPreviewMode, setInternalPreviewMode] = useState<'website' | 'dashboard' | 'client'>(initialMode);
  const [internalDeviceType, setInternalDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(initialDevice);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState<'staff' | 'client' | null>(null);
  const previewMode = controlledMode ?? internalPreviewMode;
  const deviceType = controlledDevice ?? internalDeviceType;

  const setPreviewMode = (mode: 'website' | 'dashboard' | 'client') => {
    if (!controlledMode) setInternalPreviewMode(mode);
  };

  const setDeviceType = (device: 'mobile' | 'tablet' | 'desktop') => {
    if (!controlledDevice) setInternalDeviceType(device);
  };

  const isEmbeddedDemoSurface = !showControls && !showInfoCard;

  const handleBookingSearch = (searchData: any) => {
    setShowBookingModal(true);
  };

  // Render the imported customer website exactly when a source URL exists.
  const renderWebsitePreview = (fillHeight = true) => {
    const sourcePreviewUrl = importedPreviewUrl(data);
    if (sourcePreviewUrl && isOriginalTemplate(data.selectedTemplate)) {
      return (
        <SourceWebsitePreview
          sourceUrl={sourcePreviewUrl}
          title={`${data.businessName || 'Imported cattery'} website preview`}
          fillHeight={fillHeight}
        />
      );
    }

    const template = normalizePreviewTemplateId(data.selectedTemplate || 'conversion-focus');

    if (
      template === 'conversion-focus' ||
      template === 'editorial-guide' ||
      template === 'modern-showcase' ||
      template === 'original'
    ) {
      return <CatstaysTemplateSite data={data} templateId={template} embedded previewDevice={deviceType} />;
    }

    // Render the template with all the data
    return (
      <div className="min-h-full w-full bg-white">
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

  const renderActivePreview = (fillHeight = true) => {
    if (previewMode === 'website') return renderWebsitePreview(fillHeight);
    if (previewMode === 'dashboard') {
      return (
        <div className={`${fillHeight ? 'h-full' : 'min-h-screen'} bg-cream`}>
          <DashboardPreviewMock businessName={data.businessName} />
        </div>
      );
    }
    return (
      <div className={`${fillHeight ? 'h-full' : 'min-h-screen'} bg-cream`}>
        <CustomerDashboard
          primaryColor={data.primaryColor}
          accentColor={data.accentColor}
          businessName={data.businessName}
          businessAddress={data.address}
          businessPhone={data.phone}
          businessEmail={data.email}
          previewDevice={deviceType}
        />
      </div>
    );
  };

  if (isEmbeddedDemoSurface && deviceType === 'desktop' && previewMode === 'website') {
    return (
      <div
        className="w-full overflow-visible bg-white"
        data-preview-mode="true"
      >
        {renderActivePreview(false)}
      </div>
    );
  }

  // Device frame dimensions
  const deviceDimensions = deviceType === 'mobile'
    ? { width: 375, height: 667, scale: 1.0 }
    : deviceType === 'tablet'
    ? { width: 768, height: 1024, scale: showControls ? 0.72 : 0.76 }
    : { width: 1440, height: 900, scale: showControls ? 0.62 : 0.82 };
  const deviceBorderSize = deviceType === 'mobile' ? 8 : deviceType === 'tablet' ? 12 : 1;
  const frameWidth = deviceDimensions.width * deviceDimensions.scale + deviceBorderSize * 2;
  const frameHeight = deviceDimensions.height * deviceDimensions.scale + deviceBorderSize * 2;
  const frameRadius = deviceType === 'mobile' ? '36px' : deviceType === 'tablet' ? '24px' : '12px';
  const contentRadius = deviceType === 'mobile' ? '28px' : deviceType === 'tablet' ? '16px' : '8px';

  return (
    <div className={showControls || showInfoCard ? 'space-y-6' : ''}>
      {/* Preview Mode Toggle */}
      {showControls && <div className="flex justify-center gap-3">
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
      </div>}

      {/* Device Type Toggle */}
      {showControls && <div className="flex justify-center gap-3">
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
      </div>}

      {/* Informational Text */}
      {showControls && <div className="text-center max-w-2xl mx-auto">
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
      </div>}

      {/* Device Preview Frame - ISOLATED VIEWPORT */}
      <div className={`flex justify-center items-center overflow-hidden ${showControls || showInfoCard ? 'px-3 py-8 bg-gradient-to-b from-[#0A1128]/5 to-transparent rounded-3xl' : 'px-0 py-0'}`}>
        <div
          className="relative shadow-2xl"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            maxWidth: '100%',
            borderRadius: frameRadius,
            backgroundColor: deviceType === 'mobile' ? '#1a1a1a' : deviceType === 'tablet' ? '#2a2a2a' : '#fff',
            border: deviceType === 'mobile' ? '8px solid #1a1a1a' : deviceType === 'tablet' ? '12px solid #2a2a2a' : '1px solid #e5e7eb',
            boxSizing: 'border-box',
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
              position: 'absolute',
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              contain: 'layout paint size', // STRICT containment
              borderRadius: contentRadius,
            }}
          >
            {/* INTERNAL SCROLL LAYER - Only scrollable area */}
            <div
              style={{
                width: `${deviceDimensions.width}px`,
                height: `${deviceDimensions.height}px`,
                transform: `scale(${deviceDimensions.scale})`,
                transformOrigin: 'top left',
              }}
            >
              <div
                className="h-full w-full"
                data-preview-mode="true"
                style={{
                  overflow: 'auto',
                  overflowX: 'hidden',
                  position: 'relative',
                }}
              >
                {renderActivePreview()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      {showInfoCard && <div className="max-w-2xl mx-auto">
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
      </div>}
    </div>
  );
}

function importedPreviewUrl(data: FullWebsitePreviewProps['data']) {
  const rawUrl = data.importSourceUrl || data.sourceUrl;
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  try {
    const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

function SourceWebsitePreview({
  sourceUrl,
  title,
  fillHeight,
}: {
  sourceUrl: string;
  title: string;
  fillHeight: boolean;
}) {
  const heightStyle = fillHeight
    ? { height: '100%' }
    : { height: '900px', minHeight: 'calc(100vh - 170px)' };

  return (
    <div className="w-full bg-white" style={heightStyle}>
      <iframe
        key={sourceUrl}
        title={title}
        src={sourceUrl}
        className="block h-full min-h-[inherit] w-full border-0 bg-white"
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        scrolling="auto"
      />
    </div>
  );
}
