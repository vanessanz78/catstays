import { Button } from './ui/button';
import {
  Star,
  Shield,
  Heart,
  Award,
  Clock,
  Camera,
  Home,
  Users,
  CheckCircle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube
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

// Font class helpers - returns font family names for inline styles
const getHeadingFontClass = (font: string) => {
  const fontMap: Record<string, string> = {
    'playfair': 'Playfair Display',
    'merriweather': 'Merriweather',
    'poppins': 'Poppins',
    'montserrat': 'Montserrat',
    'inter': 'Inter'
  };
  return fontMap[font] || fontMap['playfair'];
};

const getSubheadingFontClass = (font: string) => {
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

const getBodyFontClass = (font: string) => {
  const fontMap: Record<string, string> = {
    'inter': 'Inter',
    'nunito': 'Nunito',
    'lato': 'Lato',
    'opensans': 'Open Sans',
    'roboto': 'Roboto'
  };
  return fontMap[font] || fontMap['inter'];
};

// Stock cat images
const catImages = {
  hero1: 'https://images.unsplash.com/photo-1770255860384-3359fd44b467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  hero2: 'https://images.unsplash.com/photo-1636340629239-008219592d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  room1: 'https://images.unsplash.com/photo-1672764788664-9f5844477a0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  room2: 'https://images.unsplash.com/photo-1662118821764-68db771a95ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  happy: 'https://images.unsplash.com/photo-1662118821764-68db771a95ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  playing: 'https://images.unsplash.com/photo-1574114908319-2efa632834d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  care: 'https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  gallery5: 'https://images.unsplash.com/photo-1727500569846-5ece5be57dc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXQlMjBib2FyZGluZyUyMGNvbWZvcnRhYmxlfGVufDF8fHx8MTc3MzgwODcxOHww&ixlib=rb-4.1.0&q=80&w=1080',
};

// Export catImages and helper functions for use in templates
export { catImages, getHeadingFontClass, getSubheadingFontClass, getBodyFontClass };

interface SectionProps {
  data: any;
  template?: string;
}

// 2. WHY CHOOSE US / TRUST SECTION
export function WhyChooseUsSection({ data, template }: SectionProps) {
  return (
    <div id="why-choose-us" className="px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
      <div className="max-w-5xl mx-auto">
        <div className="w-16 sm:w-24 h-0.5 mx-auto mb-6 sm:mb-8" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 px-4" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
          {data.whyChooseUsHeading || 'Why Choose Us'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 text-center">
          {(data.whyChooseUsFeatures || [
            { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
            { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
            { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
          ]).map((feature: any, i: number) => {
            const IconComponent = getIconComponent(feature.icon);
            return (
              <div key={i} className="space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: data.accentColor || '#C46A3A' }} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold break-words px-2" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>{feature.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words px-2" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 3. FACILITIES SECTION
export function FacilitiesSection({ data, template }: SectionProps) {
  return (
    <div id="facilities" className="px-6 md:px-12 py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
              {data.facilitiesHeading || 'Premium Facilities'}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-gray-600 mb-6" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
              {data.facilitiesText || 'Our state-of-the-art cattery features climate-controlled suites, natural lighting, and soothing music to keep your cat comfortable.'}
            </p>
            <ul className="space-y-3">
              {(data.facilityFeatures && data.facilityFeatures.length > 0 ? data.facilityFeatures : [
                { title: 'Temperature controlled rooms', description: '' },
                { title: 'Individual play areas', description: '' },
                { title: 'Premium bedding', description: '' },
                { title: 'Calm environment', description: '' }
              ]).map((feature: any, i: number) => (
                <li key={i} className="flex items-start text-gray-700" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
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
  );
}

// 4. SUITES/ROOMS SECTION
export function SuitesSection({ data, template }: SectionProps) {
  return (
    <div id="suites" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.suitesHeading || 'Our Suites'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>Choose the perfect accommodation for your cat</p>
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
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-4 break-words leading-tight" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>{room.name}</h3>
              {room.price && <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4" style={{ color: data.accentColor || '#C46A3A', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>{room.price}</div>}
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 break-words leading-relaxed" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{room.description}</p>
              <Button className="w-full rounded-xl px-6 md:px-8" style={{ backgroundColor: room.popular ? data.accentColor || '#C46A3A' : data.primaryColor || '#0A1128', color: 'white' }}>
                Book Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. ABOUT SECTION
export function AboutSection({ data, template }: SectionProps) {
  return (
    <div id="about" className="px-6 md:px-12 py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-24 h-0.5 mx-auto mb-8" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
        <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
          {data.aboutHeading || 'About Us'}
        </h2>
        <p className="text-base md:text-lg leading-relaxed text-gray-700" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
          {data.aboutText || 'We are a family-run cattery dedicated to providing the highest standard of care for your beloved pets.'}
        </p>
      </div>
    </div>
  );
}

// 6. OUR SERVICES SECTION
export function ServicesSection({ data, template }: SectionProps) {
  return (
    <div id="services" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.servicesHeading || 'Our Services'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {(data.services || [
            { icon: 'Home', title: 'Luxury Boarding', description: 'Premium accommodations with individual suites', image: catImages.room1 },
            { icon: 'Camera', title: 'Daily Photo Updates', description: 'Professional photos sent to you daily', image: catImages.happy },
            { icon: 'Heart', title: 'Special Care', description: 'Medication administration and dietary needs', image: catImages.care },
            { icon: 'Star', title: 'Comfort Checks', description: 'Regular wellbeing checks during every stay', image: catImages.playing }
          ]).map((service: any, i: number) => {
            const IconComponent = getIconComponent(service.icon);
            return (
              <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-shadow">
                {/* Stack vertically on mobile, horizontal on desktop */}
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                    <IconComponent className="w-8 h-8" style={{ color: data.accentColor || '#C46A3A' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold mb-3 break-words" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>{service.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 break-words" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{service.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 7. GALLERY SECTION
export function GallerySection({ data, template }: SectionProps) {
  return (
    <div id="gallery" className="px-6 md:px-12 py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.galleryHeading || 'Gallery'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(data.galleryImages || [
            { url: catImages.happy, caption: 'Happy guests' },
            { url: catImages.room1, caption: 'Luxury suites' },
            { url: catImages.playing, caption: 'Playtime' },
            { url: catImages.care, caption: 'Individual care' },
            { url: catImages.hero1, caption: 'Cozy spaces' },
            { url: catImages.hero2, caption: 'Safe environment' },
            { url: catImages.gallery5, caption: 'Comfortable accommodations' }
          ]).map((image: any, i: number) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
              <img src={image.url || image} alt={image.caption || `Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 8. TESTIMONIALS SECTION
export function TestimonialsSection({ data, template }: SectionProps) {
  return (
    <div id="testimonials" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.testimonialsHeading || 'What Our Clients Say'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {(data.testimonials || [
            { name: 'Sarah M.', text: 'The best cattery! My cat actually seems happy to go back.', rating: 5 },
            { name: 'James T.', text: 'Professional, caring, and the daily updates are wonderful.', rating: 5 },
            { name: 'Emma R.', text: 'I trust them completely with my precious cats. Highly recommend!', rating: 5 }
          ]).map((testimonial: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(testimonial.rating || 5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-current" style={{ color: data.accentColor || '#C46A3A' }} />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-6 italic break-words" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: data.primaryColor || '#0A1128' }}>
                  {testimonial.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>{testimonial.name}</p>
                  <p className="text-xs md:text-sm text-gray-500" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{testimonial.location || 'Verified Client'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 8.5 FAQ SECTION
export function FAQSection({ data, template }: SectionProps) {
  return (
    <div id="faq" className="px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="w-16 sm:w-24 h-0.5 mx-auto mb-6 sm:mb-8" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 break-words px-4" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
          {data.faqHeading || 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {(data.faqs || [
            { question: 'What are your boarding hours?', answer: 'Check-in is from 8AM-12PM and 3PM-6PM. Check-out is from 8AM-12PM.' },
            { question: 'What should I bring?', answer: 'Please bring your cat\'s food, any medications, and comfort items like toys or blankets.' },
            { question: 'Do you provide daily updates?', answer: 'Yes! We send daily photo updates and are happy to provide video calls upon request.' },
            { question: 'What vaccinations are required?', answer: 'All cats must be current on FVRCP and rabies vaccinations. Proof is required at check-in.' }
          ]).map((faq: any, i: number) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 break-words" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words leading-relaxed" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 9. CONTACT SECTION
export function ContactSection({ data, template }: SectionProps) {
  return (
    <div id="contact" className="px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="w-16 sm:w-24 h-0.5 mx-auto mb-6 sm:mb-8" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 break-words px-4" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
          {data.contactHeading || 'Get In Touch'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {/* Phone */}
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
              <Phone className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: data.accentColor || '#C46A3A' }} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 break-words" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>Phone</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-all" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{data.phone || '(555) 123-4567'}</p>
          </div>

          {/* Email */}
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
              <Mail className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: data.accentColor || '#C46A3A' }} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 break-words" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>Email</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-all" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{data.email || 'hello@cattery.com'}</p>
          </div>

          {/* Address */}
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: data.accentColor || '#C46A3A' }} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 break-words" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>Address</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words px-2" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>{data.address || '123 Cat Lane, Catville'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. COMMITMENT SECTION
export function CommitmentSection({ data, template }: SectionProps) {
  return (
    <div id="commitment" className="px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: data.backgroundColor || '#F8F7F5' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
            {data.commitmentHeading || 'Our Commitment'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {(data.commitmentValues || [
            { icon: 'Heart', title: 'Love & Care' },
            { icon: 'Shield', title: 'Safety First' },
            { icon: 'Star', title: 'Excellence' },
            { icon: 'Award', title: 'Quality' }
          ]).map((value: any, i: number) => {
            const IconComponent = getIconComponent(value.icon);
            return (
              <div key={i} className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                  <IconComponent className="w-8 h-8 md:w-10 md:h-10" style={{ color: data.accentColor || '#C46A3A' }} />
                </div>
                <h3 className="text-base md:text-lg font-semibold break-words" style={{ color: data.primaryColor || '#0A1128', fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>{value.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 11. CUSTOM SECTIONS
export function CustomSections({ data, template }: SectionProps) {
  if (!data.customSections || data.customSections.length === 0) return null;

  return (
    <>
      {data.customSections.map((section: any, index: number) => (
        <div
          key={index}
          id={`custom-${index}`}
          className="px-6 md:px-12 py-16 md:py-24"
          style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : data.backgroundColor || '#F8F7F5' }}
        >
          <div className="max-w-4xl mx-auto">
            {section.heading && (
              <>
                <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 md:mb-12" style={{ color: data.primaryColor || '#0A1128', fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>
                  {section.heading}
                </h2>
              </>
            )}
            {section.content && (
              <div className="text-base md:text-lg leading-relaxed text-gray-700 whitespace-pre-line break-words" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
                {section.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

// FOOTER COMPONENT
export function FooterSection({ data, template }: SectionProps) {
  // Social media icons (for platforms not in Lucide)
  const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  const hasSocialMedia = data.facebookUrl || data.instagramUrl || data.tiktokUrl || data.youtubeUrl || data.xUrl;

  return (
    <div style={{ backgroundColor: data.primaryColor || '#0A1128' }} className="text-white px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ fontFamily: getHeadingFontClass(data.headingFont || data.typography || 'playfair') }}>{data.businessName || 'CatStays'}</h3>
            <p className="text-white/70 text-sm md:text-base mb-6" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>Premium cat boarding with love and care.</p>

            {/* Social Media Icons */}
            {hasSocialMedia && (
              <div className="flex gap-3 mt-4">
                {data.facebookUrl && (
                  <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {data.instagramUrl && (
                  <a href={data.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {data.tiktokUrl && (
                  <a href={data.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                    <TikTokIcon />
                  </a>
                )}
                {data.youtubeUrl && (
                  <a href={data.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {data.xUrl && (
                  <a href={data.xUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                    <XIcon />
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>Quick Links</h4>
            <ul className="space-y-2 text-white/70 text-sm md:text-base" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
              {(data.footerQuickLinks || 'About Us, Our Rooms, Services, Contact').split(',').map((link: string, i: number) => (
                <li key={i}>{link.trim()}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>Services</h4>
            <ul className="space-y-2 text-white/70 text-sm md:text-base" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
              {(data.footerServices || 'Cat Boarding, Cat Suites, Special Care, Photo Updates').split(',').map((service: string, i: number) => (
                <li key={i}>{service.trim()}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: getSubheadingFontClass(data.subheadingFont || 'inter') }}>Contact</h4>
            <ul className="space-y-2 text-white/70 text-sm md:text-base break-words" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
              <li>{data.phone || '(555) 123-4567'}</li>
              <li>{data.email || 'hello@cattery.com'}</li>
              <li>{data.address || '123 Cat Lane'}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm" style={{ fontFamily: getBodyFontClass(data.bodyFont || 'inter') }}>
          <p>© 2024 {data.businessName || 'Your Cattery'}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
