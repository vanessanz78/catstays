import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Sparkles } from 'lucide-react';
const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoWordmark = '/assets/27a96bc77bb44652af8bbe48276cf991397c568f.png';

export function MarketingPricing() {
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <header className="border-b border-[#0A1128]/10 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-end gap-2">
            <img src={logoIcon} alt="" className="h-12 w-12" />
            <img src={logoWordmark} alt="CatStays" className="h-10" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-[#0A1128]/70 hover:text-[#0A1128] transition-colors font-medium">
              Features
            </Link>
            <Link to="/pricing" className="text-[#0A1128] font-medium">
              Pricing
            </Link>
            <Link to="/demo/deloraine" className="text-[#0A1128]/70 hover:text-[#0A1128] transition-colors font-medium">
              Live Example
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[#0A1128]">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#A85A30] hover:bg-[#8A3F20] text-white shadow-md rounded-xl">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#0A1128] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Simple pricing, built for real cattery life
          </h1>
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
              <Link to="/signup">
                <Button className="w-full mt-6 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6">
                  Start Free Trial
                </Button>
              </Link>
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
              <Link to="/signup">
                <Button className="w-full mt-6 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6">
                  Start Free Trial
                </Button>
              </Link>
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
              <Link to="/signup">
                <Button className="w-full mt-6 bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6">
                  Start Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="text-center space-y-3 mb-16">
          <p className="text-lg text-[#0A1128]/80 font-medium">
            No contracts. No surprises. Just a better way to run your cattery.
          </p>
          <p className="text-sm text-[#0A1128]/60">
            Switch in minutes with AI-powered data import
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1128] text-white py-16 mt-20">
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
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo/deloraine" className="hover:text-white transition-colors">Demo example</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/features" className="hover:text-white transition-colors">About CatStays</Link></li>
                <li><a href="mailto:hello@catstays.app" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="mailto:hello@catstays.app?subject=CatStays%20support" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>Made with love for cats and their caregivers.</p>
            <p className="mt-2">© 2026 CatStays. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
