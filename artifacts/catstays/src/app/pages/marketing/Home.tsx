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
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-cream to-white">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <Badge className="bg-sage/10 text-sage border-sage/20 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Built Specifically for Boutique Catteries
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-serif font-semibold text-forest leading-tight">
                Beautiful Websites & Booking Software for Boutique Catteries
              </h1>
              
              <p className="text-xl text-forest/70 leading-relaxed">
                CatStays helps small catteries create a stunning website, accept online bookings, and manage their guests from a simple mobile dashboard.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-sage hover:bg-sage-dark text-white shadow-lg rounded-2xl px-8 py-6 text-lg"
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
                  className="border-forest/20 text-forest hover:bg-forest/5 rounded-2xl px-8 py-6 text-lg"
                  onClick={() => scrollToSection('demo')}
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <p className="text-sm text-forest/60 flex items-center gap-2">
                <Check className="w-4 h-4 text-sage" />
                Built specifically for boutique catteries.
              </p>
            </div>

            {/* Right Side - Website Mockup */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <Card className="border-0 rounded-none overflow-hidden">
                  {/* Mockup Browser Bar */}
                  <div className="bg-rose px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-sage/30"></div>
                      <div className="w-3 h-3 rounded-full bg-sage/30"></div>
                      <div className="w-3 h-3 rounded-full bg-sage/30"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-forest/60">
                      whisker-haven.catstays.app
                    </div>
                  </div>
                  
                  {/* Mockup Website Content */}
                  <div className="bg-cream">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1760452824452-f731d397a704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXQlMjBib2FyZGluZyUyMHJvb20lMjBjb21mb3J0YWJsZXxlbnwxfHx8fDE3NzM2NTQzODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Cattery hero"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6 space-y-4">
                      <h3 className="text-2xl font-serif font-semibold text-forest">Luxury Cat Boarding</h3>
                      <p className="text-forest/70 text-sm">Premium accommodation for your feline friends</p>
                      
                      {/* Room Gallery */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="aspect-square rounded-lg bg-rose"></div>
                        <div className="aspect-square rounded-lg bg-sage/10"></div>
                        <div className="aspect-square rounded-lg bg-rose"></div>
                      </div>
                      
                      {/* Booking Button */}
                      <Button className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl">
                        <Calendar className="w-4 h-4 mr-2" />
                        Check Availability
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-sage/5 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-rose/30 rounded-full blur-3xl"></div>
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
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 space-y-3">
                    <div className="w-full h-32 bg-gradient-to-br from-sage/20 to-rose/20 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-sage/10 rounded w-3/4"></div>
                      <div className="h-3 bg-sage/10 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-sage/5 rounded-lg"></div>
                      <div className="aspect-square bg-sage/5 rounded-lg"></div>
                      <div className="aspect-square bg-sage/5 rounded-lg"></div>
                    </div>
                    <div className="h-8 bg-sage/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-forest">Beautiful Booking Website</CardTitle>
                <CardDescription className="text-base">
                  Create a stunning website in minutes. Cat owners can check availability and book instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2: Daily Cat Updates */}
            <Card className="border-sage/10 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-rose/10 to-sage/5 p-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-[200px] mx-auto">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1709398668435-bc1222eb405e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBvcnRyYWl0JTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzM2NTQzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Cat update"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sage/20"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-sage/10 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-sage/10 rounded"></div>
                      <div className="h-2 bg-sage/10 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-forest">Daily Cat Updates</CardTitle>
                <CardDescription className="text-base">
                  Send owners daily photos and updates that build trust and keep them connected.
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
                      <div className="h-3 bg-white/30 rounded w-20"></div>
                      <div className="w-6 h-6 rounded-full bg-white/30"></div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-sage/20 backdrop-blur-sm rounded-xl p-3 space-y-1">
                        <div className="h-2 bg-white/40 rounded w-16"></div>
                        <div className="h-4 bg-white/60 rounded w-8"></div>
                      </div>
                      <div className="bg-sage/20 backdrop-blur-sm rounded-xl p-3 space-y-1">
                        <div className="h-2 bg-white/40 rounded w-16"></div>
                        <div className="h-4 bg-white/60 rounded w-8"></div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="h-8 bg-sage/40 rounded-lg"></div>
                      <div className="h-8 bg-sage/40 rounded-lg"></div>
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#C46A3A] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
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
                <h3 className="text-2xl font-serif font-semibold text-forest mb-4">Import Your Existing Website</h3>
                <div className="space-y-3 text-forest/70 text-left">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Logo</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Photos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Copy text</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Contact information</span>
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
                <h3 className="text-2xl font-serif font-semibold text-forest mb-4">Customize Your Website</h3>
                <div className="space-y-3 text-forest/70 text-left">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Choose colors</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Select fonts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Pick layouts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span>Live preview editor</span>
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
                  Publish instantly and start receiving online bookings from cat owners looking for premium boarding.
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
                src="https://images.unsplash.com/photo-1630522790545-67ad2cb700fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWJzaXRlJTIwbW9ja3VwJTIwbGFwdG9wfGVufDF8fHx8MTc3MzYwMTY0M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Demo video preview"
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
                <Bell className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-semibold text-forest mb-2">Automated Reminders</h3>
              <p className="text-sm text-forest/60">Never miss a thing</p>
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
                  For catteries ready to grow and expand
                </p>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Everything in Professional</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Daycare module</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Grooming module</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C46A3A] text-lg">🐾</span>
                  <span className="text-[#0A1128]/70">Advanced automation</span>
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
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
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
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