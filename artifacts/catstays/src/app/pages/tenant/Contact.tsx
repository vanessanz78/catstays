import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Heart, Loader2, Calendar } from 'lucide-react';
import { useTenantCattery } from '@/hooks/useTenantCattery';
import { sendContactEnquiry } from '@/utils/email';

export function TenantContact() {
  const { tenantId } = useParams();
  const { cattery, loading } = useTenantCattery(tenantId);
  const base = tenantId ? `/tenant/${tenantId}` : '/site';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cattery?.email) { setError('Contact details not available yet.'); return; }
    setSending(true);
    setError('');
    try {
      const result = await sendContactEnquiry({
        customerName: name,
        customerEmail: email,
        message,
        catteryName: cattery.name,
        catteryEmail: cattery.email,
      });
      if (result.success) {
        setSent(true);
      } else {
        setError('Message failed to send. Please try calling us instead.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-semibold text-forest mb-4">Get in Touch</h1>
          <p className="text-xl text-forest/70">We'd love to hear from you and answer any questions</p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Contact details */}
          <div className="md:col-span-2 space-y-5">
            {cattery?.address && (
              <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest mb-1">Visit Us</h4>
                    <p className="text-forest/70">{cattery.address}</p>
                    {cattery.city && <p className="text-forest/70">{cattery.city}</p>}
                    <p className="text-sm text-forest/50 mt-1">New Zealand</p>
                  </div>
                </div>
              </Card>
            )}
            {cattery?.phone && (
              <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest mb-1">Call Us</h4>
                    <p className="text-forest/70">{cattery.phone}</p>
                    <p className="text-sm text-forest/50 mt-1">Mon–Sun, 8am–6pm</p>
                  </div>
                </div>
              </Card>
            )}
            {cattery?.email && (
              <Card className="border-sage/10 shadow-md rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest mb-1">Email Us</h4>
                    <p className="text-forest/70 break-all">{cattery.email}</p>
                    <p className="text-sm text-forest/50 mt-1">We respond within 24 hours</p>
                  </div>
                </div>
              </Card>
            )}
            <Card className="border-sage/10 shadow-md rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-sage" />
                </div>
                <div>
                  <h4 className="font-semibold text-forest mb-1">Drop-off & Pick-up</h4>
                  <div className="text-forest/70 space-y-1">
                    <p>Drop-off: 8:00am – 10:00am</p>
                    <p>Pick-up: 4:00pm – 6:00pm</p>
                    <p className="text-sm text-forest/50 mt-1">Open 7 days a week</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-sage/10 rounded-3xl p-6 text-center">
              <p className="text-forest/70 text-sm mb-3">Ready to book? Skip the form —</p>
              <Link to={`${base}/booking-flow`}>
                <Button className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl">
                  <Calendar className="w-4 h-4 mr-2" />
                  Request a Booking
                </Button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <Card className="md:col-span-3 border-sage/10 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-sage" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-forest mb-3">Message Sent!</h3>
                  <p className="text-forest/70 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <Button onClick={() => setSent(false)} variant="outline" className="border-sage text-sage rounded-xl">
                    Send Another
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-serif font-semibold text-forest mb-6">Send a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-forest/70 mb-2 block">Your Name *</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required className="rounded-xl border-sage/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-forest/70 mb-2 block">Phone</label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="021 123 4567" type="tel" className="rounded-xl border-sage/20" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-forest/70 mb-2 block">Email Address *</label>
                      <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" type="email" required className="rounded-xl border-sage/20" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-forest/70 mb-2 block">Message *</label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Tell us about your cat and when you'd like to book. Feel free to ask any questions!"
                        className="w-full rounded-xl border border-sage/20 p-3 min-h-36 resize-none focus:outline-none focus:ring-2 focus:ring-sage/30"
                        required
                      />
                    </div>
                    {error && <p className="text-rose text-sm">{error}</p>}
                    <Button type="submit" disabled={sending || !cattery?.email} className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl py-6 text-lg">
                      {sending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending…</> : 'Send Message'}
                    </Button>
                    {!cattery?.email && (
                      <p className="text-center text-sm text-forest/50">Contact email not configured yet.</p>
                    )}
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
