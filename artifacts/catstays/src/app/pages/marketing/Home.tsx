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
  ArrowRight,
  Shield,
  Users,
  Sparkles,
  Monitor,
  CreditCard,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoWordmark = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';
const testimonialImage = '/assets/cf532b4a50a4305e3c8b2c2c4a7aaf8ff83e9a7e.png';
const heroImage = 'https://images.unsplash.com/photo-1760452824452-f731d397a704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXQlMjBib2FyZGluZyUyMHJvb20lMjBjb21mb3J0YWJsZXxlbnwxfHx8fDE3NzM2NTQzODF8MA&ixlib=rb-4.1.0&q=80&w=1600';
const catUpdateImage = 'https://images.unsplash.com/photo-1709398668435-bc1222eb405e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBvcnRyYWl0JTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzM2NTQzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080';
const deloraineWebsitePreview = '/assets/marketing/deloraine-website-preview.png';
const dashboardPreview = '/assets/marketing/catstays-dashboard-preview.png';
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
                Live Example
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-forest">Sign In</Button>
              </Link>
              <Button
                className="bg-[#A85A30] hover:bg-[#8A3F20] text-white shadow-md rounded-xl"
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
              A calmer way to run your cattery.
            </h1>

            <p className="text-lg md:text-2xl text-white/85 leading-relaxed max-w-3xl">
              Set up a polished cattery website, take bookings, and keep owners reassured without living in admin.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-[#A85A30] hover:bg-[#8A3F20] text-white shadow-lg rounded-xl px-8 py-6 text-lg"
                onClick={() => {
                  setSignupModalOpen(true);
                  setSelectedPlan('starter');
                }}
              >
                Start with your cattery
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/demo/deloraine">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-white !text-[#0A1128] hover:bg-cream hover:!text-[#0A1128] rounded-xl px-8 py-6 text-lg shadow-lg"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  See live example
                </Button>
              </Link>
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
              Everything your cattery needs in one platform
            </h2>
            <p className="text-lg text-forest/65 max-w-2xl mx-auto">
              A public website, owner dashboard, client portal, payments, and photo updates working together from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Card 1: Beautiful Booking Website */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow h-full flex flex-col">
              <div className="bg-gradient-to-br from-sage/5 to-rose/10 p-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-sage/10">
                  <ImageWithFallback
                    src={deloraineWebsitePreview}
                    alt="Imported Deloraine Cattery website preview"
                    className="w-full h-64 object-cover object-top"
                  />
                  <div className="p-4">
                    <div className="rounded-xl bg-[#A85A30] px-4 py-3 text-center text-sm font-semibold text-white">
                      delorainecattery.com imported
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader className="p-8 pt-2 flex-1">
                <CardTitle className="text-2xl font-serif text-forest">Fast Cattery Website</CardTitle>
                <CardDescription className="text-base leading-7">
                  Paste your current cattery website or start fresh. CatStays drafts your copy, rooms, photos, booking flow, and public cattery site.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2: Daily Cat Updates */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow h-full flex flex-col">
              <div className="bg-gradient-to-br from-rose/10 to-sage/5 p-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-[240px] mx-auto">
                  <ImageWithFallback
                    src={catUpdateImage}
                    alt="Postcard from a cat"
                    className="w-full h-56 object-cover"
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
              <CardHeader className="p-8 pt-2 flex-1">
                <CardTitle className="text-2xl font-serif text-forest">Postcards from your cat</CardTitle>
                <CardDescription className="text-base leading-7">
                  Upload a stay photo, add a quick note, and let AI draft a warm postcard owners can receive through their client portal.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3: Mobile Cattery Dashboard */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow h-full flex flex-col">
              <div className="bg-gradient-to-br from-sage/5 to-rose/10 p-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-sage/10 max-w-[240px] mx-auto">
                  <ImageWithFallback
                    src={dashboardPreview}
                    alt="CatStays mobile dashboard preview"
                    className="w-full h-80 object-cover object-top"
                  />
                </div>
              </div>
              <CardHeader className="p-8 pt-2 flex-1">
                <CardTitle className="text-2xl font-serif text-forest">Mobile Cattery Dashboard</CardTitle>
                <CardDescription className="text-base leading-7">
                  See arrivals, departures, occupancy, bookings, payments, and owner messages while you are away from the desk.
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

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
            {[
              {
                number: '1',
                title: 'Import or Start Fresh',
                items: [
                  'Paste your current cattery website link',
                  'Or answer a few guided setup questions',
                  'AI drafts your website copy and room setup',
                  'Real photos are used wherever possible',
                ],
              },
              {
                number: '2',
                title: 'Choose Your Preview',
                items: [
                  'Compare four cattery website styles',
                  'Adjust colors, fonts, and photos',
                  'Claim your cattery handle',
                  'Preview the live booking flow',
                ],
              },
              {
                number: '3',
                title: 'Launch & Accept Bookings',
                items: [
                  'Publish your CatStays subdomain',
                  'Connect Stripe when ready',
                  'Receive booking requests in your dashboard',
                  'Manage rooms, stays, and payments',
                ],
              },
              {
                number: '4',
                title: 'Keep Owners Close',
                items: [
                  'Invite customers into the client portal',
                  'Send cat postcards and photos',
                  'Let owners manage cats, bookings, and invoices',
                  'Keep conversations in one place',
                ],
              },
            ].map((step) => (
              <Card key={step.number} className="border-sage/10 shadow-lg rounded-3xl p-7 text-center bg-white h-full min-h-[430px] flex flex-col">
                <div className="w-16 h-16 rounded-full bg-sage text-white flex items-center justify-center text-2xl font-bold mx-auto mb-7 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-2xl font-serif font-semibold text-forest mb-6 min-h-[64px] flex items-center justify-center">
                  {step.title}
                </h3>
                <div className="space-y-4 text-forest/70 text-left flex-1">
                  {step.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                      <span className="leading-7">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              className="bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl px-8 py-6 text-base"
              onClick={() => {
                setSignupModalOpen(true);
                setSelectedPlan(null);
              }}
            >
              Start your setup
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Link to="/demo/deloraine">
              <Button
                variant="outline"
                className="border-sage/30 bg-white !text-forest hover:bg-sage/5 hover:!text-forest rounded-xl px-8 py-6 text-base"
              >
                View Deloraine example
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Example Section */}
      <section id="demo" className="py-20 bg-gradient-to-b from-white to-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-sage/10 text-sage border-sage/20 mb-4">Self-serve setup</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-forest mb-4">
              Try a real cattery import
            </h2>
            <p className="text-lg text-forest/65 max-w-2xl mx-auto">
              Start with your current website link and CatStays turns it into a previewable cattery website and dashboard setup.
            </p>
          </div>

          <Card className="border-sage/10 shadow-2xl rounded-3xl overflow-hidden bg-white">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-0">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="rounded-2xl border border-sage/15 bg-cream p-3 flex flex-col sm:flex-row gap-3 shadow-inner">
                  <div className="flex-1 rounded-xl bg-white px-4 py-3 text-left text-forest/75 border border-sage/10">
                    delorainecattery.com
                  </div>
                  <Link to="/demo/deloraine">
                    <Button className="w-full sm:w-auto bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl px-5 py-6">
                      Generate preview
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  {[
                    ['Website copy', 'Drafted from the public site'],
                    ['Real photos', 'Used wherever available'],
                    ['Rooms', 'Created from service data'],
                    ['Dashboard', 'Prepared for bookings'],
                  ].map(([label, detail]) => (
                    <div key={label} className="rounded-2xl bg-cream border border-sage/10 p-4">
                      <p className="font-semibold text-forest">{label}</p>
                      <p className="text-sm text-forest/60 mt-1">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-forest/5 p-6 md:p-8">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-sage/10 bg-white">
                  <ImageWithFallback
                    src={deloraineWebsitePreview}
                    alt="Deloraine Cattery imported website preview"
                    className="w-full h-[420px] object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-sage/10 text-sage border-sage/20 mb-4">Complete Platform</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-forest mb-4">
              Built for cat boarding, not generic pet care
            </h2>
            <p className="text-lg text-forest/65 max-w-3xl mx-auto">
              Every feature supports the daily rhythm of a cattery: rooms, cats, owners, photos, payments, and repeat stays.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
            {[
              {
                icon: Globe,
                title: 'AI Website Import',
                copy: 'Turn an existing cattery website into a fresh CatStays preview with real photos and room content.',
              },
              {
                icon: Calendar,
                title: 'Room Calendar',
                copy: 'See arrivals, departures, occupancy, room holds, and blockout dates without spreadsheet juggling.',
              },
              {
                icon: Smartphone,
                title: 'Owner Mobile Dashboard',
                copy: 'Accept bookings, check cats in and out, update rooms, and answer customers from your phone.',
              },
              {
                icon: Users,
                title: 'Client Portal',
                copy: 'Customers can manage their cats, details, bookings, invoices, repeat stays, and reminders.',
              },
              {
                icon: Camera,
                title: 'Cat Postcards',
                copy: 'Upload stay photos and send approved postcard-style updates that feel personal to each owner.',
              },
              {
                icon: CreditCard,
                title: 'Stripe-Ready Payments',
                copy: 'Request deposits, take balances, and keep payment status beside the booking record.',
              },
              {
                icon: Shield,
                title: 'Care Notes & Vaccinations',
                copy: 'Keep feeding notes, medication instructions, vaccination status, and behavioural details close.',
              },
              {
                icon: Monitor,
                title: 'Subdomain or Own Domain',
                copy: 'Launch quickly on your CatStays handle, then upgrade to your own domain when ready.',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-sage/10 shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow h-full min-h-[245px] flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-sage" />
                  </div>
                  <h3 className="font-semibold text-forest mb-3 min-h-[48px] flex items-center">{feature.title}</h3>
                  <p className="text-sm text-forest/60 leading-6">{feature.copy}</p>
                </Card>
              );
            })}
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
                    <span className="text-5xl font-bold text-[#0A1128]">$49</span>
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
                  className="w-full mt-6 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6"
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
              <div className="absolute top-4 right-4 bg-[#A85A30] text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                Most Popular
              </div>
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl text-[#0A1128] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Professional
                </CardTitle>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-[#0A1128]">$79</span>
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
                  className="w-full mt-6 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6"
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
                  <span className="text-[#0A1128]/70">Advanced website controls</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Priority platform support</span>
                </div>
                <Button
                  className="w-full mt-6 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6"
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
            Set up your cattery with ease
          </h2>
          <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
            Launch your website, booking flow, dashboard, payments, and customer portal in one guided setup.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white !text-[#0A1128] hover:bg-cream hover:!text-[#0A1128] shadow-xl rounded-2xl px-8 py-6 text-lg"
              onClick={() => {
                setSignupModalOpen(true);
                setSelectedPlan('starter');
              }}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link to="/demo/deloraine">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-[#0A1128] text-white hover:bg-white hover:!text-[#0A1128] rounded-2xl px-8 py-6 text-lg backdrop-blur-sm"
              >
                View live example
              </Button>
            </Link>
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
                <li><button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Live example</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">Setup flow</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Plans</button></li>
                <li><button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Live example</button></li>
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
