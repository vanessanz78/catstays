import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Star, MapPin, Phone, Mail, Calendar, Home, Camera, Heart, Shield, Settings, Clock, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ChatWidget } from '../../components/ChatWidget';
import { useTenantCattery } from '@/hooks/useTenantCattery';
import { sendContactEnquiry } from '@/utils/email';

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
const ABOUT_IMG = 'https://images.unsplash.com/photo-1573865526739-10c1dd7aa736?w=1200&q=80';

export function TenantHome() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { cattery, rooms, loading } = useTenantCattery(tenantId);
  const base = tenantId ? `/tenant/${tenantId}` : '/site';
  const ws = (cattery?.website_settings as Record<string, any>) ?? {};

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cattery?.email) return;
    setSendingContact(true);
    await sendContactEnquiry({
      customerName: contactName,
      customerEmail: contactEmail,
      message: contactMsg,
      catteryName: cattery.name,
      catteryEmail: cattery.email,
    });
    setSendingContact(false);
    setContactSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  if (!cattery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-forest/60">Cattery not found.</p>
      </div>
    );
  }

  const heroImage = ws.heroImage || DEFAULT_HERO;
  const heroHeading = ws.heroHeading || 'A Peaceful Retreat for Your Cat';
  const heroSubheading = ws.heroSubheading || `Luxury cat boarding in ${cattery.city || 'New Zealand'}. Your cat's comfort, safety, and happiness is our priority.`;
  const previewRooms = rooms.slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-sage/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => scrollToSection('hero')} className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center">
                <span className="text-2xl">🐱</span>
              </div>
              <div>
                <h1 className="text-xl font-serif font-semibold text-forest">{cattery.name}</h1>
                {cattery.city && <p className="text-xs text-forest/60">{cattery.city}</p>}
              </div>
            </button>
            <div className="hidden md:flex items-center gap-6">
              {['hero', 'about', 'rooms', 'contact'].map(s => (
                <button key={s} onClick={() => scrollToSection(s)} className="text-forest/70 hover:text-forest transition-colors capitalize">{s === 'hero' ? 'Home' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
              <div className="h-4 w-px bg-sage/20" />
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-sage hover:bg-sage/5 gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Staff Portal</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative">
        <div className="h-[500px] relative overflow-hidden">
          <ImageWithFallback src={heroImage} alt={cattery.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-forest/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">Premium Cat Boarding</Badge>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-rose text-rose" />)}
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-semibold mb-4">{heroHeading}</h1>
              <p className="text-xl md:text-2xl mb-6 max-w-3xl opacity-95">{heroSubheading}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {cattery.address && (
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{cattery.address}</span></div>
                )}
                {cattery.phone && (
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{cattery.phone}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Check */}
      <section className="relative -mt-16 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="shadow-2xl border-sage/10 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-serif font-semibold text-forest mb-6">Check Availability</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-forest/70 mb-2 block">Check-in</label>
                  <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="rounded-xl border-sage/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-forest/70 mb-2 block">Check-out</label>
                  <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="rounded-xl border-sage/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-forest/70 mb-2 block">Cats</label>
                  <select className="w-full rounded-xl border border-sage/20 p-2 bg-white">
                    <option>1 cat</option><option>2 cats</option><option>3 cats</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => navigate(`${base}/booking-flow${checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ''}`)}
                    className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl shadow-md"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rooms */}
      <section id="rooms" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-semibold text-forest mb-4">Comfortable Accommodations</h2>
            <p className="text-lg text-forest/70">Choose the perfect space for your cat's stay</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {previewRooms.length > 0 ? previewRooms.map((room, i) => (
              <Card key={room.id} className="border-sage/10 shadow-lg rounded-3xl hover:shadow-xl transition-shadow">
                <div className={`h-48 flex items-center justify-center ${i === 0 ? 'bg-gradient-to-br from-sage-light/30 to-sage/20' : i === 1 ? 'bg-gradient-to-br from-rose-light/30 to-rose/20' : 'bg-gradient-to-br from-cream-dark to-cream'}`}>
                  {i === 1 ? <Heart className="w-16 h-16 text-rose" /> : <Home className="w-16 h-16 text-sage" />}
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif text-forest">{room.name}</CardTitle>
                  <p className="text-forest/60 text-sm">{room.description || `Up to ${room.capacity} cat${room.capacity > 1 ? 's' : ''}`}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-3xl font-semibold text-sage">${room.price_per_night}</p>
                    <p className="text-sm text-forest/60">per night</p>
                  </div>
                  {room.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map(a => (
                        <span key={a} className="text-xs bg-sage/10 text-sage-dark rounded-full px-2 py-0.5">{a}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              [
                { title: 'Private Rooms', desc: 'Exclusive spaces with outdoor access', price: 20, icon: <Home className="w-16 h-16 text-sage" />, bg: 'from-sage-light/30 to-sage/20' },
                { title: 'Indoor Rooms', desc: 'Cozy climate-controlled spaces', price: 20, icon: <Home className="w-16 h-16 text-rose" />, bg: 'from-rose-light/30 to-rose/20' },
                { title: 'Communal Area', desc: 'Social area for friendly cats', price: 20, icon: <Heart className="w-16 h-16 text-sage-dark" />, bg: 'from-cream-dark to-cream' },
              ].map((r, i) => (
                <Card key={i} className="border-sage/10 shadow-lg rounded-3xl hover:shadow-xl transition-shadow">
                  <div className={`h-48 bg-gradient-to-br ${r.bg} flex items-center justify-center`}>{r.icon}</div>
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif text-forest">{r.title}</CardTitle>
                    <p className="text-forest/60 text-sm">{r.desc}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-semibold text-sage">${r.price}</p>
                      <p className="text-sm text-forest/60">per night</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link to={`${base}/rooms`}>
              <Button variant="outline" className="border-sage text-sage hover:bg-sage/5 rounded-xl px-8">
                View All Rooms & Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Included in every stay */}
      <section className="py-20 bg-gradient-to-b from-cream to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-semibold text-forest mb-4">Included in Every Stay</h2>
            <p className="text-lg text-forest/70">Premium care and peace of mind</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Camera className="w-8 h-8 text-sage" />, bg: 'bg-sage/10', title: 'Daily Photo Updates', desc: 'See your cat happy and relaxed' },
              { icon: <Heart className="w-8 h-8 text-rose" />, bg: 'bg-rose/10', title: 'Personalised Care', desc: 'Individual attention for every cat' },
              { icon: <Shield className="w-8 h-8 text-sage-dark" />, bg: 'bg-sage-light/20', title: 'Safe & Secure', desc: 'Your cat\'s safety is our priority' },
              { icon: <Mail className="w-8 h-8 text-rose" />, bg: 'bg-rose-light/30', title: 'Stay Connected', desc: 'Regular updates via email' },
            ].map(f => (
              <div key={f.title} className="text-center">
                <div className={`w-16 h-16 rounded-full ${f.bg} flex items-center justify-center mx-auto mb-4`}>{f.icon}</div>
                <h4 className="font-semibold text-forest mb-2">{f.title}</h4>
                <p className="text-sm text-forest/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-semibold text-forest mb-6">About {cattery.name}</h2>
              <div className="space-y-4 text-forest/70">
                {ws.facilitiesText ? (
                  <p className="text-lg">{ws.facilitiesText}</p>
                ) : (
                  <>
                    <p className="text-lg">We provide exceptional care for cats in beautiful {cattery.city || 'New Zealand'}. Our purpose-built cattery offers a safe, comfortable, and stress-free environment where your cat can relax while you're away.</p>
                    <p className="text-lg">We understand that every cat is unique. That's why we take the time to get to know each guest personally, ensuring they receive the individual care and attention they deserve.</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-6 mt-8">
                {rooms.length > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-sage">{rooms.length}</div>
                    <div className="text-sm text-forest/60">Rooms</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-sage">5.0</div>
                  <div className="text-sm text-forest/60">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sage">7</div>
                  <div className="text-sm text-forest/60">Days/week</div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback src={ABOUT_IMG} alt="Happy cat at cattery" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gradient-to-b from-cream to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-semibold text-forest mb-4">Get in Touch</h2>
            <p className="text-lg text-forest/70">We'd love to hear from you</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-6">
              {cattery.address && (
                <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-sage" /></div>
                    <div><h4 className="font-semibold text-forest mb-1">Visit Us</h4><p className="text-forest/70">{cattery.address}{cattery.city ? `, ${cattery.city}` : ''}</p></div>
                  </div>
                </Card>
              )}
              {cattery.phone && (
                <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-sage" /></div>
                    <div><h4 className="font-semibold text-forest mb-1">Call Us</h4><p className="text-forest/70">{cattery.phone}</p></div>
                  </div>
                </Card>
              )}
              {cattery.email && (
                <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-sage" /></div>
                    <div><h4 className="font-semibold text-forest mb-1">Email Us</h4><p className="text-forest/70">{cattery.email}</p></div>
                  </div>
                </Card>
              )}
              <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6 text-sage" /></div>
                  <div>
                    <h4 className="font-semibold text-forest mb-1">Drop-off & Pick-up</h4>
                    <div className="text-forest/70 space-y-1">
                      <p>{ws.checkInTime || 'Drop-off: 8:00am – 10:00am'}</p>
                      <p>{ws.checkOutTime || 'Pick-up: 4:00pm – 6:00pm'}</p>
                      <p className="text-sm text-forest/60">Open 7 days a week</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                {contactSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-sage" />
                    </div>
                    <h3 className="text-2xl font-serif font-semibold text-forest mb-2">Message Sent!</h3>
                    <p className="text-forest/70">Thank you for getting in touch. We'll respond within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-serif font-semibold text-forest mb-6">Send a Message</h3>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-forest/70 mb-2 block">Your Name *</label>
                        <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Jane Smith" required className="rounded-xl border-sage/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-forest/70 mb-2 block">Email *</label>
                        <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="jane@example.com" required className="rounded-xl border-sage/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-forest/70 mb-2 block">Phone</label>
                        <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="021 123 4567" className="rounded-xl border-sage/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-forest/70 mb-2 block">Message *</label>
                        <textarea value={contactMsg} onChange={e => setContactMsg(e.target.value)} placeholder="Tell us about your cat and when you'd like to visit..." className="w-full rounded-xl border border-sage/20 p-3 min-h-32 resize-none" required />
                      </div>
                      <Button type="submit" disabled={sendingContact || !cattery.email} className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl shadow-md py-6 text-lg">
                        {sendingContact ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : 'Send Message'}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest text-cream py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center"><span className="text-xl">🐱</span></div>
                <span className="text-xl font-serif font-semibold">{cattery.name}</span>
              </div>
              <p className="text-cream/70 text-sm">{cattery.city ? `Premium cat boarding in ${cattery.city}` : 'Premium cat boarding'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-cream/70">
                <li><Link to={`${base}`} className="hover:text-cream">Home</Link></li>
                <li><Link to={`${base}/rooms`} className="hover:text-cream">Rooms</Link></li>
                <li><Link to={`${base}/booking-flow`} className="hover:text-cream">Book Now</Link></li>
                <li><Link to={`${base}/contact`} className="hover:text-cream">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-cream/70">
                {cattery.address && <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{cattery.address}</span></li>}
                {cattery.phone && <li className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{cattery.phone}</span></li>}
                {cattery.email && <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{cattery.email}</span></li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-sm text-cream/70">
                <li>Drop-off: 8am – 10am</li>
                <li>Pick-up: 4pm – 6pm</li>
                <li>7 days a week</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cream/10 pt-8 text-center text-sm text-cream/60">
            <p>© {new Date().getFullYear()} {cattery.name}. Powered by <Link to="/" className="text-sage-light hover:underline">CatStays</Link></p>
          </div>
        </div>
      </footer>

      <ChatWidget businessName={cattery.name} />
    </div>
  );
}
