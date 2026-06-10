import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Check,
  Calendar,
  Smartphone,
  Camera,
  Globe,
  PlayCircle,
  ArrowRight,
  DollarSign,
  Bell,
  Shield,
  Users,
  MessageSquare,
  BarChart3,
  Heart,
  Sparkles,
  Monitor,
  CreditCard,
  FileText,
  Clock
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoWordmark = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';
const testimonialImage = '/assets/cf532b4a50a4305e3c8b2c2c4a7aaf8ff83e9a7e.png';
const heroImage = 'https://images.unsplash.com/photo-1760452824452-f731d397a704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXQlMjBib2FyZGluZyUyMHJvb20lMjBjb21mb3J0YWJsZXxlbnwxfHx8fDE3NzM2NTQzODF8MA&ixlib=rb-4.1.0&q=80&w=1600';
const catUpdateImage = 'https://images.unsplash.com/photo-1709398668435-bc1222eb405e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBvcnRyYWl0JTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzM2NTQzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080';
const dashboardImage = 'https://images.unsplash.com/photo-1630522790545-67ad2cb700fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWJzaXRlJTIwbW9ja3VwJTIwbGFwdG9wfGVufDF8fHx8MTc3MzYwMTY0M3ww&ixlib=rb-4.1.0&q=80&w=1080';
import { useState } from 'react';
import { SignupModal } from '../../components/SignupModal';

export function MarketingHome() {
  const [activeNav, setActiveNav] = useState('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'premium' | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <img src={logoIcon} alt="" className="h-12 w-12" />
              <img src={logoWordmark} alt="CatStays" className="h-11 m-[0px]" />
            </button>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-forest/70 hover:text-forest transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-forest/70 hover:text-forest transition-colors font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-forest/70 hover:text-forest transition-colors font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="text-forest/70 hover:text-forest transition-colors font-medium"
              >
                Demo
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-forest">Sign In</Button>
              </Link>
              <Button
                className="bg-sage hover:bg-sage-dark text-white shadow-md rounded-xl"
                onClick={() => {
                  // Clear any cached session data
                  localStorage.clear();
                  sessionStorage.clear();
                  setSignupModalOpen(true);
                  setSelectedPlan('starter');
                }}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[72vh] overflow-hidden bg-forest text-white">
        <ImageWithFallback
          src={heroImage}
          alt="A comfortable cat boarding room"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128]/90 via-[#0A1128]/70 to-[#0A1128]/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl space-y-8">
            <Badge className="bg-white/15 text-white border-white/25 text-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Cat boarding software only for catteries
            </Badge>

            <h1 className="text-4xl md:text-6xl font-serif font-semibold leading-tight">
              Run your cattery from your phone, with a website and booking system built for cats.
            </h1>

            <p className="text-lg md:text-2xl text-white/85 leading-relaxed max-w-3xl">
              CatStays gives each cattery a public website, owner dashboard, customer portal, Stripe-ready payments, and cat-voice photo updates in one simple SaaS platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-[#C46A3A] hover:bg-[#A85A30] text-white shadow-lg rounded-xl px-8 py-6 text-lg"
                onClick={() => {
                  setSignupModalOpen(true);
                  setSelectedPlan('starter');
                }}
              >
                Start with your cattery
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white text-[#0A1128] hover:bg-cream hover:text-[#0A1128] rounded-xl px-8 py-6 text-lg shadow-lg"
                onClick={() => scrollToSection('how-it-works')}
              >
                <Globe className="w-5 h-5 mr-2" />
                See setup flow
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl pt-4">
              {[
                ['Website', 'Launch on your CatStays subdomain'],
                ['Dashboard', 'Accept and manage bookings anywhere'],
                ['Customer portal', 'Owners manage cats, bookings and invoices'],
                ['Postcards', 'AI-assisted photo updates from each cat'],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-white/75 mt-1">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What CatStays Does Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-forest mb-4">
              Everything Your Cattery Needs in One Platform
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Beautiful Booking Website */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-sage/5 to-rose/10 p-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-sage/10">
                  <ImageWithFallback
                    src={heroImage}
                    alt="Cattery website preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-sage font-semibold">Website import</p>
                      <p className="text-lg font-serif font-semibold text-forest">delorainecattery.co.nz</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-sage/10 p-2 text-forest">Logo found</div>
                      <div className="rounded-lg bg-sage/10 p-2 text-forest">Photos found</div>
                      <div className="rounded-lg bg-sage/10 p-2 text-forest">Rooms drafted</div>
                      <div className="rounded-lg bg-sage/10 p-2 text-forest">Prices detected</div>
                    </div>
                    <div className="rounded-xl bg-[#C46A3A] px-4 py-3 text-center text-sm font-semibold text-white">
                      Preview four site styles
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-forest">Fast Cattery Website</CardTitle>
                <CardDescription className="text-base">
                  Paste an existing website link or start fresh. CatStays drafts the site, booking flow, and dashboard setup.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2: Daily Cat Updates */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-rose/10 to-sage/5 p-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-[200px] mx-auto">
                  <ImageWithFallback
                    src={catUpdateImage}
                    alt="Cat update"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center">
                        <Camera className="w-4 h-4 text-sage" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-forest">Postcard from Luna</p>
                      </div>
                    </div>
                    <p className="text-xs text-forest/70 leading-relaxed">
                      Hi Mum, I claimed the sunny shelf today and supervised breakfast beautifully.
                    </p>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-forest">Cat-Voice Updates</CardTitle>
                <CardDescription className="text-base">
                  Upload a stay photo, let AI draft the postcard from the cat, then approve or edit before sending.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3: Mobile Cattery Dashboard */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-sage/5 to-rose/10 p-8">
                <div className="bg-forest rounded-2xl shadow-lg overflow-hidden max-w-[200px] mx-auto">
                  <div className="p-4 space-y-3">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Today</p>
                      <Bell className="w-5 h-5 text-white/70" />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-sage/20 backdrop-blur-sm rounded-xl p-3 space-y-1">
                        <p className="text-[10px] text-white/70">Cats in</p>
                        <p className="text-xl font-bold text-white">18</p>
                      </div>
                      <div className="bg-sage/20 backdrop-blur-sm rounded-xl p-3 space-y-1">
                        <p className="text-[10px] text-white/70">Arrivals</p>
                        <p className="text-xl font-bold text-white">5</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="rounded-lg bg-sage/40 px-3 py-2 text-xs font-medium text-white">Accept new booking</div>
                      <div className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white">Take photo update</div>
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-forest">Mobile Cattery Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Manage check-ins, rooms, payments and customer messages from your phone.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Come back to why you started Section */}
      <section className="py-24 bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif font-semibold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Come back to why you started
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-4 leading-relaxed max-w-3xl mx-auto">
            Less admin. Less stress.
          </p>
          <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            More time with the cats — and the people who trust you with them.
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-[#F8F7F5]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-12">
            <img src={testimonialImage} alt="Testimonial" className="max-w-full h-auto rounded-2xl" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-sage/10 text-sage border-sage/20 mb-4">Simple Setup</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-forest mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-sage/20 via-sage to-sage/20 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10">
              <Card className="border-sage/10 shadow-lg rounded-3xl p-8 text-center bg-white">
                <div className="w-16 h-16 rounded-full bg-sage text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-serif font-semibold text-forest mb-4">Import or Start Fresh</h3>
                <div className="space-y-3 text-forest/70 text-left">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Paste your current cattery website link</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Or answer a few guided setup questions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>AI drafts your website copy and room setup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Real photos are used wherever available</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative z-10">
              <Card className="border-sage/10 shadow-lg rounded-3xl p-8 text-center bg-white">
                <div className="w-16 h-16 rounded-full bg-sage text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-serif font-semibold text-forest mb-4">Choose Your Preview</h3>
                <div className="space-y-3 text-forest/70 text-left">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Compare four cattery website styles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Adjust colors, fonts, and photos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Claim your cattery handle</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Preview your live booking flow</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative z-10">
              <Card className="border-sage/10 shadow-lg rounded-3xl p-8 text-center bg-white">
                <div className="w-16 h-16 rounded-full bg-sage text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-serif font-semibold text-forest mb-4">Launch & Accept Bookings</h3>
                <p className="text-forest/70 text-left">
                  Publish to your CatStays subdomain, connect Stripe when ready, and receive booking requests straight in the owner dashboard.
                </p>
                <Button
                  className="w-full mt-6 bg-sage hover:bg-sage-dark text-white rounded-xl"
                  onClick={() => {
                    setSignupModalOpen(true);
                    setSelectedPlan(null);
                  }}
                >
                  Get Started Now
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 bg-gradient-to-b from-white to-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-sage/10 text-sage border-sage/20 mb-4">Watch Demo</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-forest mb-4">
              See CatStays in Action
            </h2>
          </div>

          <Card className="border-sage/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="relative bg-gradient-to-br from-forest to-sage aspect-video flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform">
              <ImageWithFallback
                src={dashboardImage}
                alt="CatStays dashboard preview"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-2xl hover:scale-110 transition-transform">
                  <PlayCircle className="w-12 h-12 text-sage" />
                </div>
                <p className="text-white text-xl font-semibold">Watch 2-Minute Demo</p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-sage" />
              </div>
              <p className="text-sm text-forest/70">Creating a website</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-3">
                <Monitor className="w-6 h-6 text-sage" />
              </div>
              <p className="text-sm text-forest/70">Preview design</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-sage" />
              </div>
              <p className="text-sm text-forest/70">Booking calendar</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-sage" />
              </div>
              <p className="text-sm text-forest/70">Admin dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-sage/10 text-sage border-sage/20 mb-4">Complete Platform</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-forest mb-4">
              Everything You Need to Run Your Cattery
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Feature Grid */}
            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Online Booking Calendar</h3>
              <p className="text-sm text-forest/60">Real-time availability</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Room Availability</h3>
              <p className="text-sm text-forest/60">Track occupancy</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Cat Profiles</h3>
              <p className="text-sm text-forest/60">Detailed guest info</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Vaccination Tracking</h3>
              <p className="text-sm text-forest/60">Stay compliant</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Payment Requests</h3>
              <p className="text-sm text-forest/60">Online payments</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Daily Photo Updates</h3>
              <p className="text-sm text-forest/60">Keep owners happy</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Customer Portal</h3>
              <p className="text-sm text-forest/60">Bookings, invoices and cat updates</p>
            </Card>

            <Card className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Mobile Dashboard</h3>
              <p className="text-sm text-forest/60">Manage anywhere</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-[#F8F7F5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#0A1128] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Simple pricing, built for real cattery life
            </h2>
            <p className="text-xl text-[#0A1128]/70 mb-4">
              Start where you are. Grow when you're ready. No limits on rooms, no pressure to upgrade.
            </p>
            <p className="text-sm text-[#0A1128]/50 italic">
              Built from real experience running a cattery since 2014
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {/* Starter */}
            <Card className="border-[#0A1128]/10 shadow-lg rounded-[20px] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 bg-[#F1ECE8]">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl text-[#0A1128] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Starter
                </CardTitle>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-[#0A1128]">$29</span>
                    <span className="text-[#0A1128]/60 ml-2">/month</span>
                  </div>
                </div>
                <p className="text-[#0A1128]/70 italic text-sm">
                  A calm, simple way to run your cattery
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Online bookings</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Customer & cat profiles</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Calendar management</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Email confirmations</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Mobile dashboard</span>
                </div>
                <Button
                  className="w-full mt-6 bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-6"
                  onClick={() => {
                    setSignupModalOpen(true);
                    setSelectedPlan('starter');
                  }}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional - Most Popular */}
            <Card className="border-[#C46A3A] border-2 shadow-2xl rounded-[20px] overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 bg-[#F1ECE8] relative scale-105">
              <div className="absolute top-4 right-4 bg-[#C46A3A] text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                Most Popular
              </div>
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl text-[#0A1128] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Professional
                </CardTitle>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-[#0A1128]">$69</span>
                    <span className="text-[#0A1128]/60 ml-2">/month</span>
                  </div>
                </div>
                <p className="text-[#0A1128]/70 italic text-sm">
                  Where your cattery starts to flow
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Everything in Starter</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Unlimited bookings</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Daily photo updates</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Automated reminders</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Priority support</span>
                </div>
                <Button
                  className="w-full mt-6 bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-6"
                  onClick={() => {
                    setSignupModalOpen(true);
                    setSelectedPlan('professional');
                  }}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="border-[#0A1128]/10 shadow-lg rounded-[20px] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 bg-[#F1ECE8]">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl text-[#0A1128] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Premium
                </CardTitle>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-[#0A1128]">$99</span>
                    <span className="text-[#0A1128]/60 ml-2">/month</span>
                  </div>
                </div>
                <p className="text-[#0A1128]/70 italic text-sm">
                  For established catteries that want their own domain and deeper automation
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Everything in Professional</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Custom domain request workflow</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Advanced cat postcard and social AI</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Premium website setup support</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">VIP support</span>
                </div>
                <Button
                  className="w-full mt-6 bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-6"
                  onClick={() => {
                    setSignupModalOpen(true);
                    setSelectedPlan('premium');
                  }}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trust Section */}
          <div className="text-center space-y-3">
            <p className="text-lg text-[#0A1128]/80 font-medium">
              No contracts. No surprises. Just a better way to run your cattery.
            </p>
            <p className="text-sm text-[#0A1128]/60">
              Switch in minutes with AI-powered data import
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-sage to-forest text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
            Give Cat Owners Peace of Mind
          </h2>
          <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
            Create a beautiful cattery website and manage everything in one place.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-forest hover:bg-cream shadow-xl rounded-2xl px-8 py-6 text-lg"
              onClick={() => {
                setSignupModalOpen(true);
                setSelectedPlan('starter');
              }}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 rounded-2xl px-8 py-6 text-lg backdrop-blur-sm"
              onClick={() => scrollToSection('demo')}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Book Demo
            </Button>
          </div>

          <p className="text-sm opacity-75 mt-8">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoIcon} alt="" className="h-10 w-10 brightness-0 invert" />
                <img src={logoWordmark} alt="CatStays" className="h-10 brightness-0 invert" />
              </div>
              <p className="text-white/70 mb-4 max-w-md">
                Beautiful websites and booking software built specifically for boutique cat boarding businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Demo</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">Setup flow</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Plans</button></li>
                <li><button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Book demo</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>Made with love for cats and their caregivers.</p>
            <p className="mt-2">© 2026 CatStays. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
