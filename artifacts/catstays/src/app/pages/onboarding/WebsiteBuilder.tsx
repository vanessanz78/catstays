/**
 * CATSTAYS MULTI-TENANT ARCHITECTURE
 * 
 * Each new user (cattery owner) who completes the onboarding flow gets:
 * - A unique subdomain: {businessName}.catstays.app
 * - A complete copy of the website template (fully customizable)
 * - Their own client portal (customized with their brand colors)
 * - Their own staff dashboard (for managing bookings)
 * - All data is isolated and separate per tenant
 * 
 * Data stored per tenant:
 * - Website configuration (colors, content, images, social links)
 * - Room types and pricing
 * - Customer bookings
 * - Customer profiles and pets
 * - Staff accounts
 * - Photo updates and messaging
 * 
 * The website becomes accessible at {businessName}.catstays.app upon:
 * - Completing onboarding
 * - Subscription payment confirmation
 * - All subsequent payments remain current
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Upload, 
  Wand2, 
  ArrowLeft,
  ArrowRight,
  Eye,
  Sparkles,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Shield,
  Heart,
  Award,
  ChevronLeft,
  ChevronRight,
  Camera,
  Home,
  Users,
  CheckCircle
} from 'lucide-react';

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Shield,
    Heart,
    Award,
    Star,
    Clock,
    Camera,
    Home,
    Users,
    CheckCircle,
    Sparkles
  };
  return icons[iconName] || Shield;
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { CleanModernTemplate } from './WebsiteTemplates';
import { BookingBar } from '../../components/BookingBar';
import { AvailableRooms } from '../../components/AvailableRooms';
import { BookingFlowModal } from '../../components/BookingFlowModal';
import { ChatWidget } from '../../components/ChatWidget';
import { WebsiteEditorPanelEnhanced } from '../../components/WebsiteEditorPanelEnhanced';
import { DesignColorsPanel } from '../../components/DesignColorsPanel';
import { WebsiteHeader } from '../../components/WebsiteHeader';
import { AdminDashboard } from '../admin/Dashboard';
import { CustomerDashboard } from '../customer/Dashboard';
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
  CustomSections,
  FooterSection,
  catImages,
  getHeadingFontClass as getHeadingFont,
  getSubheadingFontClass as getSubheadingFont,
  getBodyFontClass as getBodyFont
} from '../../components/WebsiteSections';

interface WebsiteBuilderProps {
  data: any;
  setData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onAIRegenerate: (field: string) => void;
  onChangeTemplate?: () => void;
  showImportBanner?: boolean;
}

export function WebsiteBuilder({ data, setData, onNext, onBack, onAIRegenerate, onChangeTemplate, showImportBanner }: WebsiteBuilderProps) {
  const [activeTab, setActiveTab] = useState('hero');
  const [editorTab, setEditorTab] = useState('content'); // 'content' or 'design'
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Dashboard view state
  const [showDashboard, setShowDashboard] = useState<'staff' | 'client' | null>(null);
  
  // Booking system state
  const [bookingView, setBookingView] = useState<'search' | 'rooms' | 'booking'>('search');
  const [searchData, setSearchData] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isBookingFromClientPortal, setIsBookingFromClientPortal] = useState(false);

  // AI regeneration handler - calls onAIRegenerate prop
  const handleAIClick = async (field: string) => {
    setIsRegenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAIRegenerate(field);
    setIsRegenerating(false);
  };

  const colorPalettes = [
    { name: 'Boutique Navy', primary: '#0A1128', accent: '#C46A3A', bg: '#F8F7F5' },
    { name: 'Forest Green', primary: '#1B4332', accent: '#D4A373', bg: '#F8F5F2' },
    { name: 'Royal Purple', primary: '#3D1E6D', accent: '#E07A5F', bg: '#FBF8F3' },
    { name: 'Ocean Blue', primary: '#003D5B', accent: '#F1A208', bg: '#F7F9FB' },
    { name: 'Charcoal', primary: '#2C3639', accent: '#A27B5C', bg: '#F5F5F5' },
    { name: 'Burgundy', primary: '#641220', accent: '#D4A276', bg: '#FAF7F5' },
  ];

  const applyPalette = (palette: typeof colorPalettes[0]) => {
    setData({
      ...data,
      primaryColor: palette.primary,
      accentColor: palette.accent,
      backgroundColor: palette.bg,
    });
  };

  // Booking system handlers
  const handleBookingSearch = (searchDataParam: any) => {
    setSearchData(searchDataParam);
    setBookingView('rooms');
  };

  const handleBackToSearch = () => {
    setBookingView('search');
    setSearchData(null);
  };

  const handleBookRoom = (room: any) => {
    setSelectedRoom(room);
    setBookingView('booking');
  };

  const handleCloseBooking = () => {
    setBookingView('search');
    setSelectedRoom(null);
    setSearchData(null);
    setIsBookingFromClientPortal(false);
  };

  const handleCompleteBooking = (bookingData: any) => {
    console.log('Preview booking completed:', bookingData);
    // In preview mode, just close the modal
    setIsBookingFromClientPortal(false);
    handleCloseBooking();
  };

  // DELETED OLD FONT FUNCTIONS - Using imported helpers instead
  const _deletedGetHeadingFontClass = (font: string) => {
    const fontMap: Record<string, string> = {
      'playfair': 'font-[\'Playfair_Display\']',
      'merriweather': 'font-[\'Merriweather\']',
      'poppins': 'font-[\'Poppins\']',
      'montserrat': 'font-[\'Montserrat\']',
      'inter': 'font-[\'Inter\']'
    };
    return fontMap[font] || fontMap['playfair'];
  };

  const _deletedGetSubheadingFontClass = (font: string) => {
    const fontMap: Record<string, string> = {
      'inter': 'font-[\'Inter\']',
      'poppins': 'font-[\'Poppins\']',
      'nunito': 'font-[\'Nunito\']',
      'lato': 'font-[\'Lato\']',
      'opensans': 'font-[\'Open_Sans\']'
    };
    return fontMap[font] || fontMap['inter'];
  };

  const _deletedGetBodyFontClass = (font: string) => {
    const fontMap: Record<string, string> = {
      'inter': 'font-[\'Inter\']',
      'nunito': 'font-[\'Nunito\']',
      'lato': 'font-[\'Lato\']',
      'opensans': 'font-[\'Open_Sans\']',
      'roboto': 'font-[\'Roboto\']'
    };
    return fontMap[font] || fontMap['inter'];
  };

  // Legacy function - now uses imported helpers
  const getHeadingFontClass = (font: string) => getHeadingFont(font);
  const getSubheadingFontClass = (font: string) => getSubheadingFont(font);
  const getBodyFontClass = (font: string) => getBodyFont(font);
  const getFontClass = (typography: string) => getHeadingFont(typography);

  // Render different preview layouts based on template
  const renderPreviewLayout = () => {
    const template = data.selectedTemplate || 'boutique-luxury';

    switch (template) {
      case 'boutique-luxury':
        return renderBoutiqueLuxuryPreview();
      case 'clean-modern':
        return renderCleanModernPreview();
      case 'playful-family':
        return renderPlayfulFamilyPreview();
      case 'image-focused':
        return renderImageFocusedPreview();
      case 'split-layout':
        return renderSplitLayoutPreview();
      case 'classic-service':
        return renderClassicServicePreview();
      default:
        return renderBoutiqueLuxuryPreview();
    }
  };

  // TEMPLATE 1: Boutique Luxury - Large hero, elegant serif headings, minimal layout, ALL 14 SECTIONS
  const renderBoutiqueLuxuryPreview = () => (
    <div className="bg-white">
      {/* HEADER with Client/Staff Login */}
      <WebsiteHeader
        businessName={data.businessName || 'Our Cattery'}
        primaryColor={data.primaryColor || '#0A1128'}
        accentColor={data.accentColor || '#C46A3A'}
        backgroundColor="#ffffff"
        onStaffLogin={() => setShowDashboard('staff')}
        onClientLogin={() => setShowDashboard('client')}
      />

      {/* 1. HERO - Large, elegant with overlay */}
      <div id="hero" className="relative h-[500px]">
        <img 
          src={data.heroImage || catImages.hero1} 
          alt="Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex flex-col items-center justify-center px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{ fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.heroHeading || 'Luxury Cat Boarding'}
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto text-white/90" style={{ fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>
            {data.heroSubheading || 'Premium care for your feline friends'}
          </p>
          {data.ctaText && (
            <Button 
              className="rounded-full font-semibold px-10 py-7 text-lg shadow-2xl"
              style={{ backgroundColor: data.accentColor || '#C46A3A', color: 'white' }}
            >
              {data.ctaText}
            </Button>
          )}
        </div>
      </div>

      {/* BOOKING BAR - Integrated below hero */}
      <div className="px-6 md:px-12 -mt-12 relative z-10">
        <BookingBar
          primaryColor={data.primaryColor || '#0A1128'}
          accentColor={data.accentColor || '#C46A3A'}
          isPreview={true}
          onBookingSearch={handleBookingSearch}
          style="overlay"
        />
      </div>

      {/* 2. TRUST / WHY CHOOSE US - Icon grid, minimal, centered */}
      <div id="why-choose-us" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
        <div className="max-w-5xl mx-auto">
          <div className="w-24 h-0.5 mx-auto mb-8" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 md:mb-16" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.whyChooseUsHeading || 'Why Choose Us'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            {(data.whyChooseUsFeatures || [
              { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
              { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
              { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
            ]).map((feature: any, i: number) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <div key={i} className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                    <IconComponent className="w-8 h-8" style={{ color: data.accentColor || '#C46A3A' }} />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold break-words px-2" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 break-words px-2" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. FACILITIES - Single elegant section */}
      <div id="facilities" className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
                {data.facilitiesHeading || 'Premium Facilities'}
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-gray-600 mb-6">
                {data.facilitiesText || 'Our state-of-the-art cattery features climate-controlled suites, natural lighting, and soothing music to keep your cat comfortable.'}
              </p>
              <ul className="space-y-3">
                {(data.facilityFeatures && data.facilityFeatures.length > 0 ? data.facilityFeatures : [
                  { title: 'Temperature controlled rooms', description: '' },
                  { title: 'Individual play areas', description: '' },
                  { title: 'Premium bedding', description: '' },
                  { title: 'Calm environment', description: '' }
                ]).map((feature: any, i: number) => (
                  <li key={i} className="flex items-start text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full mr-3 mt-2 flex-shrink-0" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
                    <div>
                      <span className="font-medium">{feature.title}</span>
                      {feature.description && <span className="text-gray-600"> - {feature.description}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img src={data.facilitiesImage || catImages.room1} alt="Facilities" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROOMS - Clean cards with pricing */}
      <div id="suites" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              {data.suitesHeading || 'Our Suites'}
            </h2>
            <p className="text-lg md:text-xl text-gray-600">Choose the perfect accommodation for your cat</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {(data.suites && data.suites.length > 0 ? data.suites : [
              { name: 'Standard Suite', price: '$35/night', description: 'Cozy space with daily play and photo updates', image: catImages.room1 },
              { name: 'Premium Suite', price: '$55/night', description: 'Spacious room with extra playtime and video calls', image: catImages.room2, popular: true },
              { name: 'Luxury Villa', price: '$85/night', description: 'Private villa with garden access and premium treats', image: catImages.hero1 }
            ]).map((room: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg relative hover:shadow-2xl transition-shadow">
                {room.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold text-white whitespace-nowrap" style={{ backgroundColor: data.accentColor || '#C46A3A' }}>
                    Most Popular
                  </div>
                )}
                {room.image && (
                  <div className="mb-4 -mx-6 md:-mx-8 -mt-6 md:-mt-8">
                    <img src={room.image} alt={room.name} className="w-full h-48 object-cover rounded-t-2xl" />
                  </div>
                )}
                <h3 className="text-xl md:text-2xl font-bold mb-4 break-words" style={{ color: data.primaryColor || '#0A1128' }}>{room.name}</h3>
                {room.price && <div className="text-3xl md:text-4xl font-bold mb-4" style={{ color: data.accentColor || '#C46A3A' }}>{room.price}</div>}
                <p className="text-gray-600 mb-6 break-words">{room.description}</p>
                <Button className="w-full rounded-xl" style={{ backgroundColor: room.popular ? data.accentColor || '#C46A3A' : data.primaryColor || '#0A1128', color: 'white' }}>
                  Book Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. CTA BANNER - Elegant, minimal */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={catImages.happy} alt="CTA" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white" style={{ fontFamily: getFontClass(data.typography) }}>
            Book Your Cat's Stay Today
          </h2>
          <Button className="rounded-full font-semibold px-8 md:px-10 py-6 md:py-7 text-base md:text-lg" style={{ backgroundColor: data.accentColor || '#C46A3A', color: 'white' }}>
            Check Availability
          </Button>
        </div>
      </div>

      {/* 6. OUR SERVICES - Grid */}
      <div className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              {data.additionalServicesHeading || 'Our Services'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {(data.additionalServices && data.additionalServices.length > 0 ? data.additionalServices : [
              { title: 'Grooming', price: '$35', description: 'Professional bathing and brushing' },
              { title: 'Medication Administration', price: '$10/day', description: 'Careful medication management' },
              { title: 'Special Diet', price: '$15/day', description: 'Custom meal preparation' },
              { title: 'Extended Playtime', price: '$20/day', description: 'Extra one-on-one attention' }
            ]).map((service: any, i: number) => (
              <div key={i} className="flex items-start gap-4 md:gap-6 p-4 md:p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                  <Star className="w-6 h-6" style={{ color: data.accentColor || '#C46A3A' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 break-words" style={{ color: data.primaryColor || '#0A1128' }}>{service.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2 break-words">{service.description}</p>
                  {service.price && <div className="font-semibold" style={{ color: data.accentColor || '#C46A3A' }}>{service.price}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. GALLERY - Minimal grid */}
      <div id="gallery" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              {data.galleryHeading || 'Gallery'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {(data.galleryImages && data.galleryImages.length > 0 ? data.galleryImages : [catImages.happy, catImages.playing, catImages.care, catImages.room1, catImages.hero2, catImages.hero1]).map((img: string, i: number) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. TESTIMONIALS - Centered cards */}
      <div className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              {data.testimonialsHeading || 'What Pet Parents Say'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {(data.testimonials && data.testimonials.length > 0 ? data.testimonials : [
              { name: 'Sarah M.', text: 'Absolutely wonderful! My cat Whiskers loves it here.', rating: 5 },
              { name: 'James T.', text: 'Professional, caring, and spotlessly clean. Highly recommend!', rating: 5 },
              { name: 'Emma L.', text: 'I travel worry-free knowing my cats are in great hands.', rating: 5 }
            ]).map((review: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 md:p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(review.rating || 5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-current" style={{ color: data.accentColor || '#C46A3A' }} />
                  ))}
                </div>
                <p className="text-sm md:text-base text-gray-700 mb-6 italic break-words">"{review.text}"</p>
                <div className="font-semibold" style={{ color: data.primaryColor || '#0A1128' }}>— {review.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. FAQ - Elegant accordion style */}
      <div className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              {data.faqHeading || 'Frequently Asked Questions'}
            </h2>
          </div>
          <div className="space-y-6">
            {(data.faqs && data.faqs.length > 0 ? data.faqs : [
              { question: 'What are your check-in times?', answer: 'Check-in is between 9 AM - 12 PM, and check-out is 3 PM - 6 PM.' },
              { question: 'Do you require vaccinations?', answer: 'Yes, all cats must be up-to-date on vaccinations for everyone\'s safety.' },
              { question: 'Can I visit my cat during their stay?', answer: 'We recommend letting cats settle in, but video updates are sent daily.' }
            ]).map((faq: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold mb-3" style={{ color: data.primaryColor || '#0A1128' }}>{faq.question}</h3>
                <p className="text-sm md:text-base text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10. OUR STORY - Story section */}
      <div id="about" className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img src={data.aboutImage || catImages.care} alt="About" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
                {data.aboutHeading || 'Our Story'}
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-gray-600">
                {data.aboutText || 'Founded in 2009, we\'ve dedicated ourselves to providing the highest standard of cat care. Our passion for felines and commitment to excellence has made us the trusted choice for thousands of pet parents.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 11. COMMITMENT / VALUES - Icon grid */}
      <div id="commitment" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              {data.commitmentHeading || 'Our Commitment'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {(data.commitmentValues || [
              { icon: 'Heart', title: 'Love & Care' },
              { icon: 'Shield', title: 'Safety First' },
              { icon: 'Star', title: 'Excellence' },
              { icon: 'Award', title: 'Quality' }
            ]).map((value: any, i: number) => {
              const IconComponent = getIconComponent(value.icon);
              return (
                <div key={i}>
                  <div className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                    <IconComponent className="w-8 md:w-10 h-8 md:h-10" style={{ color: data.accentColor || '#C46A3A' }} />
                  </div>
                  <h3 className="text-base md:text-xl font-semibold break-words px-2" style={{ color: data.primaryColor || '#0A1128' }}>{value.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 12. CUSTOM SECTIONS */}
      {(data.customSections || []).map((section: any, i: number) => (
        <div key={i} className={`px-6 md:px-12 py-16 md:py-24 ${i % 2 === 0 ? 'bg-white' : ''}`} style={{ backgroundColor: i % 2 === 0 ? 'white' : data.backgroundColor || '#F8F7F5' }}>
          <div className="max-w-6xl mx-auto">
            <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${section.media ? '' : 'md:grid-cols-1'}`}>
              <div className={section.media ? '' : 'text-center mx-auto max-w-3xl'}>
                <div className={`w-16 h-0.5 mb-6 ${section.media ? '' : 'mx-auto'}`} style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
                  {section.heading}
                </h2>
                <p className="text-base md:text-lg leading-relaxed text-gray-600 whitespace-pre-line" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
                  {section.description}
                </p>
              </div>
              {section.media && (
                <div className="h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <img src={section.media} alt={section.heading} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 13. LOCATION - Map placeholder */}
      <div className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
                Visit Us
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1" style={{ color: data.primaryColor || '#0A1128' }}>Address</div>
                    <div className="text-gray-600 break-words">{data.address || '123 Cat Lane, Feline City, FC 12345'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }} />
                  <div>
                    <div className="font-semibold mb-1" style={{ color: data.primaryColor || '#0A1128' }}>Phone</div>
                    <div className="text-gray-600">{data.phone || '(555) 123-4567'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }} />
                  <div>
                    <div className="font-semibold mb-1" style={{ color: data.primaryColor || '#0A1128' }}>Hours</div>
                    <div className="text-gray-600">Mon-Fri: 9AM-6PM<br/>Sat-Sun: 10AM-4PM</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-64 md:h-96 rounded-2xl bg-gray-200 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 13. CONTACT - Form */}
      <div id="contact" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: data.primaryColor || '#0A1128', fontFamily: getFontClass(data.typography) }}>
              Get In Touch
            </h2>
            <p className="text-lg md:text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Input placeholder="Your Name" className="rounded-xl h-12" />
              <Input placeholder="Email Address" className="rounded-xl h-12" />
            </div>
            <Input placeholder="Phone Number" className="rounded-xl h-12 mb-6" />
            <Textarea placeholder="Your Message" className="rounded-xl mb-6" rows={6} />
            <Button className="w-full rounded-xl h-14 text-lg font-semibold" style={{ backgroundColor: data.accentColor || '#C46A3A', color: 'white' }}>
              Send Message
            </Button>
          </div>
        </div>
      </div>

      {/* 14. FOOTER */}
      <FooterSection data={data} template="boutique-luxury" />
    </div>
  );

  // TEMPLATE 2: Clean Modern - ALL 14 SECTIONS
  const renderCleanModernPreview = () => <CleanModernTemplate data={data} onStaffLogin={() => setShowDashboard('staff')} onClientLogin={() => setShowDashboard('client')} />;

  const renderPlayfulFamilyPreview = () => (
    <div className="bg-white">
      {/* HEADER with Client/Staff Login */}
      <WebsiteHeader
        businessName={data.businessName || 'Our Cattery'}
        primaryColor={data.primaryColor || '#0A1128'}
        accentColor={data.accentColor || '#C46A3A'}
        backgroundColor="#ffffff"
        onStaffLogin={() => setShowDashboard('staff')}
        onClientLogin={() => setShowDashboard('client')}
      />

      {/* HERO - Playful style with emoji */}
      <div className="px-8 py-20 text-center" style={{ backgroundColor: `${data.primaryColor}20` }}>
        <div className="inline-block px-6 py-2 rounded-full mb-6" style={{ backgroundColor: data.accentColor }}>
          <span className="text-2xl">😺</span>
        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ color: data.primaryColor, fontFamily: getFontClass(data.typography) }}>
          {data.heroHeading || 'Your Heading Here'}
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#2d3e2f' }}>
          {data.heroSubheading || 'Your subheading will appear here'}
        </p>
        {data.ctaText && (
          <Button className="rounded-full font-bold px-8 py-6 text-lg shadow-lg" style={{ backgroundColor: data.accentColor, color: 'white' }}>
            {data.ctaText} 🎉
          </Button>
        )}
      </div>

      <WhyChooseUsSection data={data} template="playful-family" />
      <FacilitiesSection data={data} template="playful-family" />
      <SuitesSection data={data} template="playful-family" />
      <AboutSection data={data} template="playful-family" />
      <ServicesSection data={data} template="playful-family" />
      <GallerySection data={data} template="playful-family" />
      <TestimonialsSection data={data} template="playful-family" />
      <FAQSection data={data} template="playful-family" />
      <CommitmentSection data={data} template="playful-family" />
      <ContactSection data={data} template="playful-family" />
      <CustomSections data={data} template="playful-family" />
      <FooterSection data={data} template="playful-family" />
    </div>
  );

  const renderImageFocusedPreview = () => (
    <div className="bg-white">
      {/* HEADER with Client/Staff Login */}
      <WebsiteHeader
        businessName={data.businessName || 'Our Cattery'}
        primaryColor={data.primaryColor || '#0A1128'}
        accentColor={data.accentColor || '#C46A3A'}
        backgroundColor="#ffffff"
        onStaffLogin={() => setShowDashboard('staff')}
        onClientLogin={() => setShowDashboard('client')}
      />

      {/* HERO - Image-focused with overlay */}
      <div className="relative h-[500px]">
        <img src={data.heroImage || catImages.hero1} alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: getFontClass(data.typography) }}>
              {data.heroHeading || 'Your Heading Here'}
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {data.heroSubheading || 'Your subheading will appear here'}
            </p>
          </div>
        </div>
      </div>

      <WhyChooseUsSection data={data} template="image-focused" />
      <FacilitiesSection data={data} template="image-focused" />
      <SuitesSection data={data} template="image-focused" />
      <AboutSection data={data} template="image-focused" />
      <ServicesSection data={data} template="image-focused" />
      <GallerySection data={data} template="image-focused" />
      <TestimonialsSection data={data} template="image-focused" />
      <FAQSection data={data} template="image-focused" />
      <CommitmentSection data={data} template="image-focused" />
      <ContactSection data={data} template="image-focused" />
      <CustomSections data={data} template="image-focused" />
      <FooterSection data={data} template="image-focused" />
    </div>
  );

  const renderSplitLayoutPreview = () => (
    <div className="bg-white">
      {/* HEADER with Client/Staff Login */}
      <WebsiteHeader
        businessName={data.businessName || 'Our Cattery'}
        primaryColor={data.primaryColor || '#0A1128'}
        accentColor={data.accentColor || '#C46A3A'}
        backgroundColor="#ffffff"
        onStaffLogin={() => setShowDashboard('staff')}
        onClientLogin={() => setShowDashboard('client')}
      />

      {/* HERO - Split layout style */}
      <div className="grid md:grid-cols-2 min-h-96">
        <div className="bg-white px-12 py-16 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6" style={{ color: data.primaryColor || '#2d3e2f', fontFamily: getFontClass(data.typography) }}>
            {data.heroHeading || 'Your Heading Here'}
          </h1>
          <p className="text-lg mb-8" style={{ color: '#6b7a6d' }}>
            {data.heroSubheading || 'Your subheading will appear here'}
          </p>
          {data.ctaText && (
            <div>
              <Button className="rounded-lg font-semibold" style={{ backgroundColor: data.primaryColor, color: 'white' }}>
                {data.ctaText}
              </Button>
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <img src={data.heroImage || catImages.hero2} alt="Hero" className="w-full h-full object-cover" />
        </div>
      </div>

      <WhyChooseUsSection data={data} template="split-layout" />
      <FacilitiesSection data={data} template="split-layout" />
      <SuitesSection data={data} template="split-layout" />
      <AboutSection data={data} template="split-layout" />
      <ServicesSection data={data} template="split-layout" />
      <GallerySection data={data} template="split-layout" />
      <TestimonialsSection data={data} template="split-layout" />
      <FAQSection data={data} template="split-layout" />
      <CommitmentSection data={data} template="split-layout" />
      <ContactSection data={data} template="split-layout" />
      <CustomSections data={data} template="split-layout" />
      <FooterSection data={data} template="split-layout" />
    </div>
  );

  const renderClassicServicePreview = () => (
    <div className="bg-white">
      {/* HEADER with Client/Staff Login */}
      <WebsiteHeader
        businessName={data.businessName || 'Our Cattery'}
        primaryColor={data.primaryColor || '#0A1128'}
        accentColor={data.accentColor || '#C46A3A'}
        backgroundColor="#ffffff"
        onStaffLogin={() => setShowDashboard('staff')}
        onClientLogin={() => setShowDashboard('client')}
      />

      {/* HERO - Classic service style with business name banner */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold" style={{ color: data.primaryColor || '#2d3e2f', fontFamily: getFontClass(data.typography) }}>
            {data.businessName || 'Your Cattery Name'}
          </h1>
        </div>
      </div>
      <div className="px-8 py-16 text-center" style={{ backgroundColor: data.primaryColor, color: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: getFontClass(data.typography) }}>
            {data.heroHeading || 'Your Heading Here'}
          </h2>
          <p className="text-lg mb-8">
            {data.heroSubheading || 'Your subheading will appear here'}
          </p>
          {data.ctaText && (
            <Button className="rounded font-semibold" style={{ backgroundColor: 'white', color: data.primaryColor }}>
              {data.ctaText}
            </Button>
          )}
        </div>
      </div>

      <WhyChooseUsSection data={data} template="classic-service" />
      <FacilitiesSection data={data} template="classic-service" />
      <SuitesSection data={data} template="classic-service" />
      <AboutSection data={data} template="classic-service" />
      <ServicesSection data={data} template="classic-service" />
      <GallerySection data={data} template="classic-service" />
      <TestimonialsSection data={data} template="classic-service" />
      <FAQSection data={data} template="classic-service" />
      <CommitmentSection data={data} template="classic-service" />
      <ContactSection data={data} template="classic-service" />
      <CustomSections data={data} template="classic-service" />
      <FooterSection data={data} template="classic-service" />
    </div>
  );

  return (
    <div className={`grid gap-6 transition-all duration-300 items-start ${isPanelCollapsed ? 'grid-cols-[60px_1fr]' : 'lg:grid-cols-[500px_1fr]'}`}>
      {/* LEFT PANEL: Editing Tools */}
      <div className="space-y-4 relative">
        {/* Collapse Button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full p-0 shadow-md bg-white"
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
        >
          {isPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {!isPanelCollapsed && (
          <>
            {/* Import Banner */}
            {showImportBanner && (
              <div className="bg-[#F8F7F5] border border-[#C46A3A]/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#C46A3A] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#0A1128] mb-1">We've imported your content</p>
                    <p className="text-sm text-[#0A1128]/80">Feel free to change your design or customize anything below</p>
                  </div>
                </div>
              </div>
            )}

            <div 
              className="rounded-2xl shadow-xl border-2 max-h-[90vh] flex flex-col" 
              style={{ backgroundColor: 'white', borderColor: `${data.primaryColor}30` }}
            >
              {/* Fixed Header */}
              <div className="flex-shrink-0 p-6 pb-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                      Website Builder
                    </h2>
                    <p className="text-sm" style={{ color: '#6b7a6d' }}>
                      Customize your website visually
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {onChangeTemplate && (
                      <Button
                        onClick={onChangeTemplate}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Template
                      </Button>
                    )}
                    <Badge className="bg-[#E9C46A] hover:bg-[#E9C46A] text-[#2d3e2f]">
                      <Eye className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6">
              {/* Horizontal Tabs for Content and Design & Colors */}
              <div className="mb-6">
                <div className="flex gap-2 border-b border-gray-200">
                  <button
                    onClick={() => setEditorTab('content')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      editorTab === 'content'
                        ? 'border-b-2 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={editorTab === 'content' ? { borderColor: data.primaryColor || '#0A1128', color: data.primaryColor || '#0A1128' } : {}}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setEditorTab('design')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      editorTab === 'design'
                        ? 'border-b-2 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={editorTab === 'design' ? { borderColor: data.primaryColor || '#0A1128', color: data.primaryColor || '#0A1128' } : {}}
                  >
                    Design & Colors
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {editorTab === 'content' ? (
                  <WebsiteEditorPanelEnhanced
                    data={data}
                    setData={setData}
                    onAIRegenerate={handleAIClick}
                    isRegenerating={isRegenerating}
                  />
                ) : (
                  <DesignColorsPanel
                    data={data}
                    setData={setData}
                  />
                )}
              </div>

              {/* OLD TABS SECTION - Keeping for backward compatibility */}
              <div className="hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 mb-6 rounded-xl w-full" style={{ backgroundColor: '#F6F4EF' }}>
                  <TabsTrigger value="hero" className="rounded-lg text-xs">Hero</TabsTrigger>
                  <TabsTrigger value="about" className="rounded-lg text-xs">About</TabsTrigger>
                  <TabsTrigger value="images" className="rounded-lg text-xs">Images</TabsTrigger>
                  <TabsTrigger value="design" className="rounded-lg text-xs">Design</TabsTrigger>
                  <TabsTrigger value="contact" className="rounded-lg text-xs">Contact</TabsTrigger>
                </TabsList>

                {/* Hero Tab */}
                <TabsContent value="hero" className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Hero Heading</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('heroHeading')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Input
                      value={data.heroHeading}
                      onChange={(e) => setData({ ...data, heroHeading: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="Your main heading"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Hero Subheading</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('heroSubheading')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Textarea
                      value={data.heroSubheading}
                      onChange={(e) => setData({ ...data, heroSubheading: e.target.value })}
                      className="rounded-xl"
                      rows={2}
                      placeholder="Supporting text"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">CTA Button Text</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('ctaText')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Input
                      value={data.ctaText || 'Book Now'}
                      onChange={(e) => setData({ ...data, ctaText: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="Book Now"
                    />
                  </div>
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about" className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">About Heading</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('aboutHeading')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Input
                      value={data.aboutHeading}
                      onChange={(e) => setData({ ...data, aboutHeading: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="About your cattery"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">About Text</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('aboutText')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Textarea
                      value={data.aboutText}
                      onChange={(e) => setData({ ...data, aboutText: e.target.value })}
                      className="rounded-xl"
                      rows={6}
                      placeholder="Tell visitors about your cattery"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Facilities Description</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('facilitiesText')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Textarea
                      value={data.facilitiesText || 'Our state-of-the-art cattery features climate-controlled suites, natural lighting, and soothing music.'}
                      onChange={(e) => setData({ ...data, facilitiesText: e.target.value })}
                      className="rounded-xl"
                      rows={4}
                      placeholder="Describe your facilities"
                    />
                  </div>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images" className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Hero Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 transition-colors">
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100">
                        {data.heroImage ? (
                          <img
                            src={data.heroImage}
                            alt="Hero Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-200">
                            <ImageIcon className="w-10 h-10 text-gray-400" />
                            <p className="text-sm text-gray-400 font-medium">No image set</p>
                            <p className="text-xs text-gray-400">Paste a URL below</p>
                          </div>
                        )}
                      </div>
                      <Input
                        type="text"
                        value={data.heroImage || ''}
                        onChange={(e) => setData({ ...data, heroImage: e.target.value })}
                        className="rounded-xl h-9 text-sm"
                        placeholder="https://example.com/your-image.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-2">Paste an image URL to set your hero photo</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Facilities Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 transition-colors">
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <img 
                          src={data.facilitiesImage || catImages.room1} 
                          alt="Facilities Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Input
                        type="text"
                        value={data.facilitiesImage || ''}
                        onChange={(e) => setData({ ...data, facilitiesImage: e.target.value })}
                        className="rounded-xl h-9 text-sm"
                        placeholder="Image URL"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">About Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 transition-colors">
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <img 
                          src={data.aboutImage || catImages.care} 
                          alt="About Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Input
                        type="text"
                        value={data.aboutImage || ''}
                        onChange={(e) => setData({ ...data, aboutImage: e.target.value })}
                        className="rounded-xl h-9 text-sm"
                        placeholder="Image URL"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Color Palettes</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {colorPalettes.map((palette, i) => (
                        <button
                          key={i}
                          onClick={() => applyPalette(palette)}
                          className="flex flex-col items-start p-3 rounded-xl border-2 hover:border-gray-400 transition-all"
                          style={{ 
                            borderColor: data.primaryColor === palette.primary ? palette.primary : '#e5e7eb',
                            backgroundColor: data.primaryColor === palette.primary ? `${palette.primary}10` : 'white'
                          }}
                        >
                          <div className="flex gap-2 mb-2">
                            <div
                              className="w-8 h-8 rounded-md"
                              style={{ backgroundColor: palette.primary }}
                            ></div>
                            <div
                              className="w-8 h-8 rounded-md"
                              style={{ backgroundColor: palette.accent }}
                            ></div>
                          </div>
                          <p className="text-xs font-medium text-gray-700">{palette.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Primary Color</Label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={data.primaryColor || '#0A1128'}
                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                        className="w-16 h-12 rounded-lg border cursor-pointer"
                      />
                      <Input
                        value={data.primaryColor || '#0A1128'}
                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                        className="flex-1 rounded-xl h-12"
                        placeholder="#0A1128"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Accent Color</Label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={data.accentColor || '#C46A3A'}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        className="w-16 h-12 rounded-lg border cursor-pointer"
                      />
                      <Input
                        value={data.accentColor || '#C46A3A'}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        className="flex-1 rounded-xl h-12"
                        placeholder="#C46A3A"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Business Name</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAIClick('businessName')}
                        disabled={isRegenerating}
                        className="text-xs"
                        style={{ color: '#E9C46A' }}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                    </div>
                    <Input
                      value={data.businessName || ''}
                      onChange={(e) => setData({ ...data, businessName: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="Your Cattery Name"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Phone Number</Label>
                    <Input
                      value={data.phone}
                      onChange={(e) => setData({ ...data, phone: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Email</Label>
                    <Input
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="hello@cattery.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Address</Label>
                    <Textarea
                      value={data.address || data.location || ''}
                      onChange={(e) => setData({ ...data, address: e.target.value })}
                      className="rounded-xl"
                      rows={3}
                      placeholder="123 Cat Lane, Feline City, FC 12345"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              </div>
              </div>

              {/* Navigation Buttons - Sticky at bottom */}
              <div className="flex gap-3 p-6 pt-4 border-t flex-shrink-0 bg-white">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={onNext}
                  className="flex-1 rounded-xl h-12"
                  style={{ backgroundColor: data.primaryColor || '#0A1128', color: 'white' }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL: Live Preview */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 max-h-[90vh] flex flex-col" style={{ borderColor: `${data.primaryColor}30` }}>
        <div className="bg-white border-b px-4 py-3 flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-500 text-center">
            {data.businessName || 'your-cattery'}.catstays.app
            {showDashboard === 'staff' && '/staff'}
            {showDashboard === 'client' && '/portal'}
            {(bookingView === 'rooms' || bookingView === 'booking') && !showDashboard && '/booking'}
          </div>
        </div>
        <div className="overflow-y-auto bg-white relative flex-1">
          {/* Show dashboard, booking flow views, or default preview */}
          {showDashboard === 'staff' ? (
            <AdminDashboard onBackToWebsite={() => setShowDashboard(null)} isPreview={true} />
          ) : showDashboard === 'client' ? (
            <CustomerDashboard 
              onBackToWebsite={() => setShowDashboard(null)} 
              primaryColor={data.primaryColor || '#0A1128'}
              accentColor={data.accentColor || '#C46A3A'}
              businessName={data.businessName || 'CatStays'}
              businessAddress={data.address || data.location || '123 Main St, City, State 12345'}
              businessPhone={data.phone || '(555) 123-4567'}
              businessEmail={data.email || 'hello@catstays.app'}
              businessLogo={data.businessLogo}
              onCreateBooking={() => {
                // Switch to booking flow - show search view first
                // Mark that this booking is from the client portal (user is logged in)
                setIsBookingFromClientPortal(true);
                setShowDashboard(null);
                setBookingView('search');
              }}
            />
          ) : bookingView === 'rooms' && searchData ? (
            <AvailableRooms
              checkIn={searchData.checkIn}
              checkOut={searchData.checkOut}
              numberOfCats={searchData.numberOfCats}
              primaryColor={data.primaryColor || '#0A1128'}
              accentColor={data.accentColor || '#C46A3A'}
              onBack={handleBackToSearch}
              onBookRoom={handleBookRoom}
            />
          ) : (
            <>
              {renderPreviewLayout()}
              <ChatWidget 
                accentColor={data.accentColor || '#C46A3A'} 
                businessName={data.businessName || 'CatStays'} 
              />
            </>
          )}

          {/* Booking Flow Modal */}
          {bookingView === 'booking' && selectedRoom && searchData && (
            <BookingFlowModal
              room={selectedRoom}
              checkIn={searchData.checkIn}
              checkOut={searchData.checkOut}
              numberOfCats={searchData.numberOfCats}
              primaryColor={data.primaryColor || '#0A1128'}
              accentColor={data.accentColor || '#C46A3A'}
              onClose={handleCloseBooking}
              onComplete={handleCompleteBooking}
              isLoggedIn={isBookingFromClientPortal}
              userProfile={isBookingFromClientPortal ? {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '(555) 987-6543',
                address: '456 Oak Street, Springfield, IL 62701',
                cats: [
                  {
                    id: '1',
                    name: 'Whiskers',
                    breed: 'Maine Coon',
                    vaccinationDate: '2025-12-15',
                    specialNotes: 'Loves treats and belly rubs'
                  },
                  {
                    id: '2',
                    name: 'Mittens',
                    breed: 'Siamese',
                    vaccinationDate: '2025-11-20',
                    specialNotes: 'Prefers quiet spaces'
                  },
                  {
                    id: '3',
                    name: 'Shadow',
                    breed: 'British Shorthair',
                    vaccinationDate: '2026-01-10',
                    specialNotes: 'Very social and playful'
                  }
                ]
              } : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
