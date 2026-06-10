import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Calendar, Smartphone, Sparkles, TrendingUp, MessageSquare, Settings,
  BarChart3, Zap, Clock, DollarSign, Users, Image, FileText, Shield
} from 'lucide-react';

export function MarketingFeatures() {
  const features = [
    {
      icon: Calendar,
      title: "Smart Booking System",
      description: "Real-time availability checking with intelligent room allocation. Customers can book instantly 24/7.",
      color: "text-blue-500",
      details: [
        "Instant availability widget",
        "15-minute time slots",
        "Automatic room turnaround",
        "Waitlist management"
      ]
    },
    {
      icon: Smartphone,
      title: "Mobile-First Dashboard",
      description: "Manage your entire cattery from your phone. Optimized for speed with swipe gestures.",
      color: "text-purple-500",
      details: [
        "Swipe between days",
        "One-tap check-in/out",
        "Offline-friendly",
        "Fast loading on weak internet"
      ]
    },
    {
      icon: Sparkles,
      title: "AI Cat Updates",
      description: "Take a photo and AI writes personalized updates from your cat's perspective.",
      color: "text-pink-500",
      details: [
        "Owner updates via SMS/email",
        "Social media captions",
        "Website carousel posts",
        "Stay Story timeline"
      ]
    },
    {
      icon: TrendingUp,
      title: "Occupancy Health Meter",
      description: "Monitor bookings and get alerted when occupancy drops below optimal levels.",
      color: "text-orange-500",
      details: [
        "Weekly forecasting",
        "Visual health indicators",
        "Automatic promo triggers",
        "Revenue tracking"
      ]
    },
    {
      icon: Zap,
      title: "Last-Minute Promotions",
      description: "AI generates promotional campaigns when you have empty rooms.",
      color: "text-yellow-500",
      details: [
        "Auto-generated SMS campaigns",
        "Email templates",
        "Homepage banners",
        "Social media posts"
      ]
    },
    {
      icon: MessageSquare,
      title: "Messaging Centre",
      description: "Automated SMS and email for confirmations, reminders, and updates.",
      color: "text-green-500",
      details: [
        "Booking confirmations",
        "Payment reminders",
        "Cat updates",
        "Message history"
      ]
    },
    {
      icon: Settings,
      title: "Room Planner",
      description: "Visual calendar with drag-and-drop booking management.",
      color: "text-indigo-500",
      details: [
        "Horizontal timeline view",
        "Cleaning buffer logic",
        "Conflict detection",
        "Room optimization"
      ]
    },
    {
      icon: BarChart3,
      title: "GST & Accounting",
      description: "Track revenue, expenses, and GST automatically.",
      color: "text-violet-500",
      details: [
        "GST period tracking",
        "Expense categories",
        "Receipt photo capture",
        "Xero export"
      ]
    },
    {
      icon: DollarSign,
      title: "Payment Processing",
      description: "Accept payments via Stripe, bank transfer, or cash.",
      color: "text-emerald-500",
      details: [
        "Stripe integration",
        "Automatic deposit tracking",
        "Payment reminders",
        "Outstanding balance alerts"
      ]
    },
    {
      icon: Users,
      title: "Customer Portal",
      description: "Give customers a dedicated login to manage bookings and view cat updates.",
      color: "text-cyan-500",
      details: [
        "Self-service booking",
        "Stay Story viewing",
        "Vaccination uploads",
        "Payment history"
      ]
    },
    {
      icon: Image,
      title: "Social Media Manager",
      description: "Create and schedule posts for Facebook, Instagram, and TikTok.",
      color: "text-rose-500",
      details: [
        "AI caption generation",
        "Multi-platform publishing",
        "Website carousel sync",
        "Post scheduling"
      ]
    },
    {
      icon: FileText,
      title: "Blog Generator",
      description: "AI suggests and writes blog posts about cat care and boarding.",
      color: "text-amber-500",
      details: [
        "Topic suggestions",
        "AI draft generation",
        "SEO optimization",
        "Auto-publishing"
      ]
    },
    {
      icon: Shield,
      title: "Petcover Integration",
      description: "Offer complimentary 4-week insurance and earn commission.",
      color: "text-teal-500",
      details: [
        "Auto-offer during booking",
        "One-click activation",
        "10% commission tracking",
        "Customer dashboard widget"
      ]
    },
    {
      icon: Clock,
      title: "Rebooking Automation",
      description: "Automatically remind customers to rebook for holidays and special dates.",
      color: "text-fuchsia-500",
      details: [
        "School holiday reminders",
        "Anniversary invites",
        "One-tap rebooking",
        "Preferred room tracking"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Petstays
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-gray-900 font-medium">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </Link>
            <Link to="/demo" className="text-gray-600 hover:text-gray-900 transition">
              Demo
            </Link>
            <Link to="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Everything you need to run a modern cattery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From booking to check-out, Petstays handles every aspect of your cat boarding business
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2">
                <CardHeader>
                  <Icon className={`w-12 h-12 ${feature.color} mb-4`} />
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your 14-day free trial today
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
