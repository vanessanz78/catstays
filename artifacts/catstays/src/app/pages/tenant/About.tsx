import { Link, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Heart, Shield, Camera, Star, Loader2, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useTenantCattery } from '@/hooks/useTenantCattery';

const CAT_IMGS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1573865526739-10c1dd7aa736?w=600&q=80',
  'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600&q=80',
];

export function TenantAbout() {
  const { tenantId } = useParams();
  const { cattery, rooms, loading } = useTenantCattery(tenantId);
  const base = tenantId ? `/tenant/${tenantId}` : '/site';
  const ws = (cattery?.website_settings as Record<string, any>) ?? {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  const facilitiesText = ws.facilitiesText || `We provide exceptional, personalised care for cats in ${cattery?.city || 'New Zealand'}. Our purpose-built cattery offers a safe, comfortable, and stress-free environment where your cat can relax and feel at home while you're away.`;
  const facilitiesHeading = ws.facilitiesHeading || `About ${cattery?.name || 'Our Cattery'}`;
  const features = ws.features as Array<{ icon?: string; title: string; description: string }> | undefined;

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-sage/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={base} className="flex items-center gap-2 text-forest/70 hover:text-forest transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-serif font-semibold">{cattery?.name || 'Cattery'}</span>
          </Link>
          <Link to={`${base}/booking-flow`}>
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero banner */}
      <div className="bg-forest text-cream py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-semibold mb-4">{facilitiesHeading}</h1>
          <p className="text-xl text-cream/80">{cattery?.city ? `Proudly serving cat families in ${cattery.city}` : 'Caring for cats with love and expertise'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-serif font-semibold text-forest mb-6">Our Story</h2>
            <div className="space-y-4 text-forest/70 text-lg leading-relaxed">
              <p>{facilitiesText}</p>
              <p>We understand that every cat is unique. That's why we take the time to get to know each guest personally, ensuring they receive the individual care and attention they deserve — from daily photo updates to specialised dietary requirements.</p>
              <p>Our team of experienced cat lovers is dedicated to making every stay a positive experience, giving you complete peace of mind while you're away.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CAT_IMGS.slice(0, 2).map((src, i) => (
              <div key={i} className={`rounded-3xl overflow-hidden shadow-lg ${i === 0 ? 'col-span-2 h-56' : 'h-40'}`}>
                <ImageWithFallback src={src} alt="Cats at cattery" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="h-40 rounded-3xl overflow-hidden shadow-lg">
              <ImageWithFallback src={CAT_IMGS[2]} alt="Happy cat" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { value: rooms.length > 0 ? `${rooms.length}` : '25+', label: 'Rooms', sub: 'across all types' },
            { value: '5.0', label: 'Rating', sub: 'from verified guests' },
            { value: '7', label: 'Days/week', sub: 'open year-round' },
            { value: '24h', label: 'Response', sub: 'to enquiries' },
          ].map(s => (
            <Card key={s.label} className="border-sage/10 shadow-md rounded-3xl p-6 text-center">
              <div className="text-4xl font-bold text-sage mb-1">{s.value}</div>
              <div className="font-semibold text-forest">{s.label}</div>
              <div className="text-xs text-forest/50 mt-1">{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Features from website_settings or defaults */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-semibold text-forest mb-10 text-center">Why Families Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(features && features.length > 0 ? features : [
              { title: 'Daily Photo Updates', description: 'We send photos every day so you can see your cat happy and relaxed.' },
              { title: 'Personalised Care', description: 'Every cat gets individual attention tailored to their personality.' },
              { title: 'Safe & Secure', description: 'Our cattery is purpose-built with your cat\'s safety as the top priority.' },
              { title: 'Experienced Team', description: 'Our staff are passionate cat lovers with years of professional experience.' },
              { title: 'Clean Environment', description: 'Rooms are cleaned daily with pet-safe products.' },
              { title: 'Peace of Mind', description: 'Regular updates and a dedicated team mean you never have to worry.' },
            ]).map((f, i) => {
              const icons = [<Heart className="w-6 h-6 text-sage" />, <Camera className="w-6 h-6 text-sage" />, <Shield className="w-6 h-6 text-sage" />, <Star className="w-6 h-6 text-sage" />, <Clock className="w-6 h-6 text-sage" />, <Heart className="w-6 h-6 text-sage" />];
              return (
                <Card key={i} className="border-sage/10 shadow-md rounded-3xl p-6">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-4">
                      {icons[i % icons.length]}
                    </div>
                    <h3 className="font-semibold text-forest mb-2">{f.title}</h3>
                    <p className="text-sm text-forest/70 leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-3xl p-10 shadow-md border border-sage/10">
          <h2 className="text-3xl font-serif font-semibold text-forest mb-8 text-center">Find Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cattery?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sage mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-forest text-sm mb-1">Address</div>
                  <div className="text-forest/70 text-sm">{cattery.address}{cattery.city ? `, ${cattery.city}` : ''}</div>
                </div>
              </div>
            )}
            {cattery?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-sage mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-forest text-sm mb-1">Phone</div>
                  <div className="text-forest/70 text-sm">{cattery.phone}</div>
                </div>
              </div>
            )}
            {cattery?.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sage mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-forest text-sm mb-1">Email</div>
                  <div className="text-forest/70 text-sm">{cattery.email}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-sage mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-forest text-sm mb-1">Hours</div>
                <div className="text-forest/70 text-sm">
                  <div>Drop-off: 8am – 10am</div>
                  <div>Pick-up: 4pm – 6pm</div>
                  <div className="text-forest/50">7 days a week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`${base}/booking-flow`}>
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl px-10 py-4 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Request a Booking
            </Button>
          </Link>
          <Link to={`${base}/contact`}>
            <Button variant="outline" className="border-sage text-sage hover:bg-sage/5 rounded-xl px-10 py-4 text-lg">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
