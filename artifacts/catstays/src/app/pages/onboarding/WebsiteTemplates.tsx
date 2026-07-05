import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Star, Shield, Heart, Award, Camera, Home, Users, CheckCircle, Sparkles } from 'lucide-react';
import { WebsiteHeader } from '../../components/WebsiteHeader';
import { FooterSection } from '../../components/WebsiteSections';

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

const getFontClass = (typography: string) => {
  switch (typography) {
    case 'playfair':
      return 'font-serif';
    case 'inter':
    case 'nunito':
    case 'poppins':
    default:
      return 'font-sans';
  }
};

interface TemplateProps {
  data: any;
  onStaffLogin?: () => void;
  onClientLogin?: () => void;
}

const templateImage = (...values: unknown[]) => {
  for (const value of values.flat()) {
    if (typeof value !== 'string') continue;
    const image = value.trim();
    if (/^https?:\/\//i.test(image) || /^data:image\//i.test(image)) return image;
  }
  return '';
};

const templateGalleryImages = (data: any) => {
  const images = [
    ...(Array.isArray(data.galleryImages) ? data.galleryImages : []),
    data.heroImage,
    data.facilitiesImage,
    data.aboutImage,
  ];
  const seen = new Set<string>();
  return images
    .map((image) => templateImage(image))
    .filter((image) => {
      if (!image || seen.has(image)) return false;
      seen.add(image);
      return true;
    });
};

const TemplateImage = ({ src, alt, className }: { src?: string; alt: string; className: string }) => {
  if (!src) return <div aria-hidden="true" className={`${className} bg-gray-100`} />;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
    />
  );
};

// Clean Modern Template - ALL 14 SECTIONS
export const CleanModernTemplate = ({ data, onStaffLogin, onClientLogin }: TemplateProps) => {
  const renderSection = (sectionNumber: number, content: React.ReactNode) => content;
  const galleryImages = templateGalleryImages(data);
  const heroImage = templateImage(data.heroImage, data.facilitiesImage, data.aboutImage, galleryImages);
  const facilitiesImage = templateImage(data.facilitiesImage, data.heroImage, data.aboutImage, galleryImages);
  const aboutImage = templateImage(data.aboutImage, data.heroImage, data.facilitiesImage, galleryImages);

  return (
    <div className="bg-white">
      {/* HEADER with Client/Staff Login */}
      <WebsiteHeader
        businessName={data.businessName || 'Our Cattery'}
        primaryColor={data.primaryColor || '#2d3e2f'}
        accentColor={data.accentColor || '#C46A3A'}
        backgroundColor="#ffffff"
        onStaffLogin={onStaffLogin}
        onClientLogin={onClientLogin}
      />

      {/* 1. HERO */}
      {renderSection(1, (
        <div className="bg-white px-6 md:px-12 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
                  {data.heroHeading || 'Your Heading Here'}
                </h1>
                <p className="text-base md:text-lg mb-6" style={{ color: '#6b7a6d' }}>
                  {data.heroSubheading || 'Your subheading will appear here'}
                </p>
                <Button className="rounded-lg font-semibold px-8 py-3" style={{ backgroundColor: data.primaryColor, color: 'white' }}>
                  {data.ctaText || 'Book Now'}
                </Button>
              </div>
              <div className="h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                <TemplateImage src={heroImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 2. TRUST */}
      {renderSection(2, (
        <div id="why-choose-us" className="px-6 md:px-12 py-12 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              {data.whyChooseUsHeading || 'Why Choose Us'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {(data.whyChooseUsFeatures || [
                { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
              ]).map((feature: any, i: number) => {
                const IconComponent = getIconComponent(feature.icon);
                return (
                  <div key={i} className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                      <IconComponent className="w-6 h-6" style={{ color: data.accentColor || '#C46A3A' }} />
                    </div>
                    <h3 className="font-semibold mb-2 break-words" style={{ color: data.primaryColor || '#2d3e2f' }}>{feature.title}</h3>
                    <p className="text-sm text-gray-600 break-words">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 3. FACILITIES */}
      {renderSection(3, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                <TemplateImage src={facilitiesImage} alt="Facilities" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
                  Premium Facilities
                </h2>
                <p className="text-base leading-relaxed mb-4 text-gray-600">
                  {data.facilitiesText || 'Our state-of-the-art cattery features climate-controlled suites, natural lighting, and soothing music.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 4. ROOMS */}
      {renderSection(4, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              Our Rooms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Standard Suite', price: '$35/night', features: ['Cozy space', 'Daily play', 'Photo updates'] },
                { name: 'Premium Suite', price: '$55/night', features: ['Spacious room', 'Extra playtime', 'Video calls'] },
                { name: 'Luxury Villa', price: '$85/night', features: ['Private villa', 'Garden access', 'Premium treats'] },
                { name: 'VIP Suite', price: '$100/night', features: ['Ultimate comfort', '24/7 monitoring', 'Spa services'] }
              ].map((room, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg break-words" style={{ color: data.primaryColor || '#2d3e2f' }}>{room.name}</h3>
                    <div className="font-bold" style={{ color: data.accentColor || '#C46A3A' }}>{room.price}</div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {room.features.map((feature, j) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: data.accentColor || '#C46A3A' }}></div>
                        <span className="break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-lg" variant="outline">Book Now</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* 5. CTA BANNER */}
      {renderSection(5, (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <TemplateImage src={heroImage || facilitiesImage || aboutImage || galleryImages[0]} alt="CTA" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center px-6 text-center">
            <h2 className={`text-2xl md:text-4xl font-bold mb-4 text-white ${getFontClass(data.typography)}`}>
              Book Your Cat's Stay Today
            </h2>
            <Button className="rounded-lg font-semibold px-8 py-3" style={{ backgroundColor: data.accentColor || '#C46A3A', color: 'white' }}>
              Check Availability
            </Button>
          </div>
        </div>
      ))}

      {/* 6. ADDITIONAL SERVICES */}
      {renderSection(6, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              Additional Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Grooming', price: '$35', desc: 'Professional bathing and brushing' },
                { title: 'Medication Administration', price: '$10/day', desc: 'Careful medication management' },
                { title: 'Special Diet', price: '$15/day', desc: 'Custom meal preparation' },
                { title: 'Extended Playtime', price: '$20/day', desc: 'Extra one-on-one attention' }
              ].map((service, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold break-words flex-1" style={{ color: data.primaryColor || '#2d3e2f' }}>{service.title}</h3>
                    <div className="font-bold text-sm ml-2 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }}>{service.price}</div>
                  </div>
                  <p className="text-sm text-gray-600 break-words">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* 7. GALLERY */}
      {renderSection(7, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.slice(0, 6).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden shadow-sm">
                  <TemplateImage src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* 8. TESTIMONIALS */}
      {renderSection(8, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              What Pet Parents Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah M.', text: 'Absolutely wonderful! My cat Whiskers loves it here.' },
                { name: 'James T.', text: 'Professional, caring, and spotlessly clean. Highly recommend!' },
                { name: 'Emma L.', text: 'I travel worry-free knowing my cats are in great hands.' }
              ].map((review, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" style={{ color: data.accentColor || '#C46A3A' }} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mb-4 italic break-words">"{review.text}"</p>
                  <div className="font-semibold text-sm" style={{ color: data.primaryColor || '#2d3e2f' }}>— {review.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* 9. FAQ */}
      {renderSection(9, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: 'What are your check-in times?', a: 'Check-in is between 9 AM - 12 PM, and check-out is 3 PM - 6 PM.' },
                { q: 'Do you require vaccinations?', a: 'Yes, all cats must be up-to-date on vaccinations for everyone\'s safety.' },
                { q: 'Can I visit my cat during their stay?', a: 'We recommend letting cats settle in, but video updates are sent daily.' }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-2" style={{ color: data.primaryColor || '#2d3e2f' }}>{faq.q}</h3>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* 10. ABOUT */}
      {renderSection(10, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
                  {data.aboutHeading || 'About Us'}
                </h2>
                <p className="text-base leading-relaxed text-gray-600">
                  {data.aboutText || 'Your about text will appear here'}
                </p>
              </div>
              <div className="h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                <TemplateImage src={aboutImage} alt="About" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 11. COMMITMENT / VALUES */}
      {renderSection(11, (
        <div id="commitment" className="px-6 md:px-12 py-12 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              {data.commitmentHeading || 'Our Commitment'}
            </h2>
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
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${data.accentColor || '#C46A3A'}20` }}>
                      <IconComponent className="w-8 h-8" style={{ color: data.accentColor || '#C46A3A' }} />
                    </div>
                    <h3 className="font-semibold text-sm break-words px-2" style={{ color: data.primaryColor || '#2d3e2f' }}>{value.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 12. LOCATION */}
      {renderSection(12, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
                  Visit Us
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold mb-1 text-sm" style={{ color: data.primaryColor || '#2d3e2f' }}>Address</div>
                      <div className="text-sm text-gray-600 break-words">{data.address || '123 Cat Lane, Feline City, FC 12345'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }} />
                    <div>
                      <div className="font-semibold mb-1 text-sm" style={{ color: data.primaryColor || '#2d3e2f' }}>Phone</div>
                      <div className="text-sm text-gray-600">{data.phone || '(555) 123-4567'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: data.accentColor || '#C46A3A' }} />
                    <div>
                      <div className="font-semibold mb-1 text-sm" style={{ color: data.primaryColor || '#2d3e2f' }}>Hours</div>
                      <div className="text-sm text-gray-600">Mon-Fri: 9AM-6PM<br/>Sat-Sun: 10AM-4PM</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-64 md:h-80 rounded-lg bg-gray-200 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 13. CONTACT */}
      {renderSection(13, (
        <div className="px-6 md:px-12 py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 ${getFontClass(data.typography)}`} style={{ color: data.primaryColor || '#2d3e2f' }}>
              Get In Touch
            </h2>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input placeholder="Your Name" className="rounded-lg h-11" />
                <Input placeholder="Email Address" className="rounded-lg h-11" />
              </div>
              <Input placeholder="Phone Number" className="rounded-lg h-11 mb-4" />
              <Textarea placeholder="Your Message" className="rounded-lg mb-4" rows={5} />
              <Button className="w-full rounded-lg h-12 font-semibold" style={{ backgroundColor: data.accentColor || '#C46A3A', color: 'white' }}>
                Send Message
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* 14. FOOTER */}
      {renderSection(14, (
        <FooterSection data={data} template="clean-modern" />
      ))}
    </div>
  );
};
