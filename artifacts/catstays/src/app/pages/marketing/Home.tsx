import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Check,
  Camera,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { PREVIEW_URL_STORAGE_KEY } from '../../lib/deloraineDemo';
const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoWordmark = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';
const testimonialImage = '/assets/marketing/vanessa-with-cat.png';
const heroImage = '/assets/marketing/premium-cattery-sleeping-cat-hero.png';
const catUpdateImage = 'https://images.unsplash.com/photo-1709398668435-bc1222eb405e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBvcnRyYWl0JTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzM2NTQzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080';
const deloraineWebsitePreview = '/assets/marketing/deloraine-website-preview.png';
const dashboardPreview = '/assets/marketing/catstays-dashboard-preview.png';
import { useState } from 'react';
import { SignupModal } from '../../components/SignupModal';

export function MarketingHome() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'premium' | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState(() => {
    if (typeof window === 'undefined') return 'delorainecattery.com';
    return window.localStorage.getItem(PREVIEW_URL_STORAGE_KEY) || 'delorainecattery.com';
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(sectionId);
    }
  };

  const handleGeneratePreview = (event: React.FormEvent) => {
    event.preventDefault();
    const url = websiteUrl.trim() || 'delorainecattery.com';
    localStorage.setItem(PREVIEW_URL_STORAGE_KEY, url);
    sessionStorage.setItem(PREVIEW_URL_STORAGE_KEY, url);
    navigate(`/demo/deloraine?source=${encodeURIComponent(url)}`);
  };

  const handleStartFresh = () => {
    setSignupModalOpen(true);
    setSelectedPlan(null);
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
              <Link
                to="/demo/deloraine"
                className="text-forest/70 hover:text-forest transition-colors font-medium"
              >
                Demo Example
              </Link>
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
          alt="A relaxed cat sleeping in a premium cattery room"
          className="absolute inset-0 h-full w-full object-cover object-center"
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

            <form
              onSubmit={handleGeneratePreview}
              className="max-w-3xl rounded-2xl border border-white/20 bg-white/12 p-3 shadow-2xl backdrop-blur-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="hero-website-url">Cattery website URL</label>
                <div className="relative flex-1">
                  <input
                    id="hero-website-url"
                    type="text"
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    className="h-14 w-full rounded-xl border border-white/60 bg-white px-4 text-base font-semibold text-[#0A1128] shadow-inner outline-none transition focus:border-[#A85A30] focus:ring-4 focus:ring-white/25"
                    placeholder="yourcattery.com"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 bg-[#A85A30] px-7 text-base text-white shadow-lg hover:bg-[#8A3F20] rounded-xl"
                >
                  Generate preview
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            <p className="text-sm text-white/80">
              No website yet?{' '}
              <button
                type="button"
                onClick={handleStartFresh}
                className="font-semibold text-white underline underline-offset-4 hover:text-white/85"
              >
                Start from scratch with guided setup.
              </button>
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl pt-4">
              {[
                ['Website', 'Launch website in minutes'],
                ['Dashboard', 'Accept and manage bookings anywhere'],
                ['Client portal', 'Clients book cats and get updates'],
                ['Updates', 'Owners keep in touch with their cat'],
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
      <section id="features" className="py-20 bg-white">
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
              <div className="h-[410px] bg-gradient-to-br from-sage/5 to-rose/10 flex items-stretch">
                <div className="w-full overflow-hidden border border-sage/10 bg-white shadow-lg">
                  <div className="flex items-center gap-2 border-b border-sage/10 bg-white px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E36D5B]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F3B85C]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#75B983]" />
                    <div className="ml-3 flex-1 rounded-full bg-cream px-3 py-1 text-center text-[11px] font-medium text-forest/55">
                      delorainecattery.com
                    </div>
                  </div>
                  <div className="h-[360px] overflow-y-auto overflow-x-hidden bg-[#F8F7F5] p-4">
                    <div className="mx-auto w-full max-w-[330px] overflow-hidden rounded-lg bg-white shadow-sm">
                      <ImageWithFallback
                        src={deloraineWebsitePreview}
                        alt="Deloraine Cattery website above-the-fold preview"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader className="p-8 pt-6 flex-1">
                <CardTitle className="text-2xl font-serif text-forest min-h-[36px]">Website</CardTitle>
                <CardDescription className="text-base leading-7">
                  Beautiful website ready to take cat bookings.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2: Daily Cat Updates */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow h-full flex flex-col">
              <div className="h-[410px] bg-gradient-to-br from-rose/10 to-sage/5 p-6 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-[280px] mx-auto">
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
                        <p className="text-xs font-semibold text-forest">Update from Luna</p>
                      </div>
                    </div>
                    <p className="text-xs text-forest/70 leading-relaxed">
                      Hi Mum, I claimed the sunny shelf today and supervised breakfast beautifully.
                    </p>
                  </div>
                </div>
              </div>
              <CardHeader className="p-8 pt-6 flex-1">
                <CardTitle className="text-2xl font-serif text-forest min-h-[36px]">Keep in Touch</CardTitle>
                <CardDescription className="text-base leading-7">
                  Send warm photo updates through the customer portal in a few taps.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3: Mobile Cattery Dashboard */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow h-full flex flex-col">
              <div className="h-[410px] bg-gradient-to-br from-sage/5 to-rose/10 p-6 flex items-center justify-center">
                <div className="relative h-[350px] w-[198px] rounded-[2.1rem] bg-[#0A1128] p-2 shadow-2xl">
                  <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-b-2xl bg-[#0A1128]" />
                  <div className="h-full overflow-hidden rounded-[1.65rem] bg-white">
                    <ImageWithFallback
                      src={dashboardPreview}
                      alt="CatStays mobile dashboard preview"
                      className="h-full w-full object-contain object-top bg-white"
                    />
                  </div>
                </div>
              </div>
              <CardHeader className="p-8 pt-6 flex-1">
                <CardTitle className="text-2xl font-serif text-forest min-h-[36px]">Dashboard</CardTitle>
                <CardDescription className="text-base leading-7">
                  Accept bookings, check occupancy, and message owners from your phone.
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
      <section className="bg-[#F8F7F5]">
        <div className="mx-auto max-w-[1983px]">
          <img
            src={testimonialImage}
            alt="Vanessa from Deloraine Cattery with a cat, sharing why she built CatStays"
            className="block h-auto w-full"
          />
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
                View demo example
              </Button>
            </Link>
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

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12 items-stretch">
            {/* Starter */}
            <Card className="border-[#0A1128]/10 shadow-lg rounded-[20px] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 bg-[#F1ECE8] h-full flex flex-col">
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
                  Get online, take bookings, and start getting paid.
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex flex-1 flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Cattery website</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Booking dashboard</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Availability and rooms setup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Customer communication</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Stripe-ready payments</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-8 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6"
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
            <Card className="border-[#C46A3A] shadow-2xl rounded-[20px] overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 bg-[#F1ECE8] relative h-full flex flex-col">
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
                  Add client self-service, updates, and better reporting.
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex flex-1 flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Everything in Starter</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Client portal logins</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Cat photo updates</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Booking reminders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Revenue and occupancy reports</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-8 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6"
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
            <Card className="border-[#0A1128]/10 shadow-lg rounded-[20px] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 bg-[#F1ECE8] h-full flex flex-col">
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
                  Your own domain, marketing tools, and deeper business controls.
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex flex-1 flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Everything in Professional</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Own domain</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Marketing tools</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Advanced reports</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C46A3A] text-lg">🐾</span>
                    <span className="text-[#0A1128]/70">Accounting-ready exports</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-8 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6"
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
            Enter your website to begin
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Start with your current site and turn it into a booking-ready CatStays preview.
          </p>

          <form
            onSubmit={handleGeneratePreview}
            className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-white/12 p-3 text-left shadow-2xl backdrop-blur-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="final-website-url">Cattery website URL</label>
              <input
                id="final-website-url"
                type="text"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                className="h-14 flex-1 rounded-xl border border-white/60 bg-white px-4 text-base font-semibold text-[#0A1128] shadow-inner outline-none transition focus:border-[#A85A30] focus:ring-4 focus:ring-white/25"
                placeholder="yourcattery.com"
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 bg-[#A85A30] px-7 text-base text-white shadow-lg hover:bg-[#8A3F20] rounded-xl"
              >
                Generate preview
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>

          <p className="text-sm opacity-80 mt-6">
            No website yet?{' '}
            <button
              type="button"
              onClick={handleStartFresh}
              className="font-semibold text-white underline underline-offset-4 hover:text-white/85"
            >
              Start from scratch with guided setup.
            </button>
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
                <li><Link to="/demo/deloraine" className="hover:text-white transition-colors">Preview demo</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">Setup flow</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Plans</button></li>
                <li><Link to="/demo/deloraine" className="hover:text-white transition-colors">Preview demo</Link></li>
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
