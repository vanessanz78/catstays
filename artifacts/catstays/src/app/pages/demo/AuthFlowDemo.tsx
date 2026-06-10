import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  Shield, 
  LogIn, 
  Sparkles,
  MousePointerClick,
  Keyboard,
  Globe,
  ArrowRight,
  Check,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { AdminLoginModal } from '../../components/AdminLoginModal';

export function AuthFlowDemo() {
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            CatStays Authentication System
          </h1>
          <p className="text-[#0A1128]/60">
            Seamless login flows, admin access, and post-publish handoff
          </p>
        </div>

        {/* Three Access Pathways */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#FAF9F6]">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-[#C46A3A]" />
              </div>
              <CardTitle className="text-xl">Customer Login</CardTitle>
              <CardDescription>
                Primary flow for cattery owners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Go to Login
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#0A1128]/20 bg-gradient-to-br from-white to-[#E8F0F2]">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#0A1128]/10 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-[#0A1128]" />
              </div>
              <CardTitle className="text-xl">Admin Access</CardTitle>
              <CardDescription>
                Hidden access for platform team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowAdminModal(true)}
                variant="outline"
                className="w-full border-[#0A1128]/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Open Admin Modal
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#4F6F5A]/20 bg-gradient-to-br from-white to-[#F0F5F1]">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-[#4F6F5A]" />
              </div>
              <CardTitle className="text-xl">Post-Publish</CardTitle>
              <CardDescription>
                Success screen after going live
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/publish-success')}
                variant="outline"
                className="w-full border-[#4F6F5A]/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Success Screen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Customer Login Flow */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">1. Customer Login Flow</CardTitle>
            <CardDescription>
              Smart routing based on onboarding status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Login Page Details */}
              <div>
                <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C46A3A]" />
                  Login Page (/login)
                </h3>
                <div className="bg-[#F8F7F5] rounded-lg p-4 space-y-2 text-sm">
                  <p><strong>Heading:</strong> "Welcome back"</p>
                  <p><strong>Subheading:</strong> "Continue setting up your cattery or access your dashboard"</p>
                  <p><strong>CTA:</strong> "Continue Setup" (with arrow)</p>
                  <p className="italic text-[#0A1128]/60">"Pick up right where you left off"</p>
                </div>
              </div>

              {/* Routing Logic */}
              <div>
                <h3 className="font-semibold text-[#0A1128] mb-3">Smart Routing Logic:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">If onboarding NOT complete:</p>
                      <p className="text-sm text-blue-800">→ Resume at last saved step (e.g., /onboarding?step=3)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-green-900">If onboarding complete & published:</p>
                      <p className="text-sm text-green-800">→ Redirect to their subdomain admin (theirname.catstays.app/admin)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved State */}
              <div>
                <h3 className="font-semibold text-[#0A1128] mb-3">Data Saved in localStorage:</h3>
                <ul className="space-y-2 text-sm text-[#0A1128]/70">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Last completed step</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>All entered data (business name, contact, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Selected plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Published status</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Methods */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">2. Admin Access (3 Methods)</CardTitle>
            <CardDescription>
              Hidden access for platform administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Method 1: Logo Click */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <MousePointerClick className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Method 1: Hidden Logo Click</h3>
                    <p className="text-sm text-purple-800">Easter egg trigger</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded p-3">
                  <p className="text-sm font-mono text-purple-900">
                    <strong>Trigger:</strong> Click CatStays logo 5 times within 3 seconds
                  </p>
                  <p className="text-xs text-purple-700 mt-2">
                    → Opens admin login modal
                  </p>
                </div>
              </div>

              {/* Method 2: Keyboard Shortcut */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Method 2: Keyboard Shortcut</h3>
                    <p className="text-sm text-blue-800">Power user access</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded p-3 space-y-2">
                  <p className="text-sm font-mono text-blue-900">
                    <strong>Mac:</strong> <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">⇧</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">A</kbd>
                  </p>
                  <p className="text-sm font-mono text-blue-900">
                    <strong>Windows:</strong> <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">A</kbd>
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    → Opens admin login modal
                  </p>
                </div>
              </div>

              {/* Method 3: Direct URL */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Method 3: Direct URL</h3>
                    <p className="text-sm text-gray-700">Direct navigation</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded p-3">
                  <p className="text-sm font-mono text-gray-900">
                    <strong>Production:</strong> admin.catstays.app
                  </p>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    <strong>Demo:</strong> /platform/admin-login
                  </p>
                  <p className="text-xs text-gray-700 mt-2">
                    → Goes directly to admin login page
                  </p>
                </div>
              </div>

              {/* Admin Login Details */}
              <div className="mt-6 p-4 bg-[#0A1128]/5 rounded-lg border border-[#0A1128]/10">
                <h4 className="font-semibold text-[#0A1128] mb-2">Admin Login Page:</h4>
                <ul className="space-y-1 text-sm text-[#0A1128]/70">
                  <li><strong>Heading:</strong> "CatStays Admin"</li>
                  <li><strong>Subheading:</strong> "Manage your platform, customers, and growth"</li>
                  <li><strong>CTA:</strong> "Login to Admin"</li>
                  <li><strong>After login:</strong> → /platform/dashboard (SaaS metrics ONLY)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-Publish Success */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">3. Post-Publish Success Screen</CardTitle>
            <CardDescription>
              Critical celebration and handoff moment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Key Elements */}
              <div>
                <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C46A3A]" />
                  Success Screen Elements
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#F8F7F5] rounded-lg p-4">
                    <h4 className="font-medium text-[#0A1128] mb-2">Content:</h4>
                    <ul className="space-y-1 text-sm text-[#0A1128]/70">
                      <li>✓ Headline: "Your cattery is live 🐾"</li>
                      <li>✓ Subheadline: "Website and booking system ready"</li>
                      <li>✓ Prominent URL display</li>
                      <li>✓ Copy button for easy sharing</li>
                      <li>✓ Access instructions</li>
                      <li>✓ Login credentials reminder</li>
                    </ul>
                  </div>

                  <div className="bg-[#F8F7F5] rounded-lg p-4">
                    <h4 className="font-medium text-[#0A1128] mb-2">CTAs:</h4>
                    <ul className="space-y-1 text-sm text-[#0A1128]/70">
                      <li><strong>Primary:</strong> "Go to My Website"</li>
                      <li><strong>Secondary:</strong> "Copy Link"</li>
                      <li><strong>Optional:</strong> "Open Dashboard"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* User Journey */}
              <div>
                <h3 className="font-semibold text-[#0A1128] mb-3">User Journey:</h3>
                <div className="space-y-2">
                  {[
                    { step: 1, text: 'User completes onboarding', color: 'blue' },
                    { step: 2, text: 'Clicks "Publish Website"', color: 'purple' },
                    { step: 3, text: 'Success screen appears with celebration', color: 'green' },
                    { step: 4, text: 'User sees their URL: theirname.catstays.app', color: 'orange' },
                    { step: 5, text: 'User bookmarks or copies link', color: 'pink' },
                    { step: 6, text: 'User visits their site or dashboard', color: 'teal' },
                  ].map(({ step, text, color }) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-${color}-100 border-2 border-${color}-400 text-${color}-700 flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
                        {step}
                      </div>
                      <p className="text-sm text-[#0A1128]/70">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What User Feels */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  User Should Feel:
                </h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>✓ "This is MY system now"</li>
                  <li>✓ "I know exactly where to go"</li>
                  <li>✓ "This is professional and complete"</li>
                  <li>✓ "I'm excited to share this link"</li>
                  <li>✓ "I can come back anytime"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Avoid */}
        <Card className="border-red-200 bg-red-50/50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-red-600" />
              <CardTitle className="text-xl text-red-900">What We Avoid</CardTitle>
            </div>
            <CardDescription className="text-red-800">
              Common mistakes that create confusion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-red-800">
              <p>❌ Confusing login paths (customers can't find their way back)</p>
              <p>❌ Losing onboarding progress (frustrating restarts)</p>
              <p>❌ Users not knowing where to go after publish (lost users)</p>
              <p>❌ Mixing customer and admin login (security risk)</p>
              <p>❌ No celebration moment (missed opportunity to create delight)</p>
              <p>❌ Unclear subdomain ownership (who owns what?)</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#FAF7F2]">
          <CardContent className="p-8">
            <h2 className="text-2xl font-serif font-bold text-[#0A1128] mb-6">
              Test All Flows
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white py-6 justify-start"
                size="lg"
              >
                <User className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Customer Login</div>
                  <div className="text-xs opacity-80">Smart routing based on status</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

              <Button
                onClick={() => navigate('/platform/admin-login')}
                variant="outline"
                className="w-full border-[#0A1128]/20 py-6 justify-start"
                size="lg"
              >
                <Shield className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Admin Login</div>
                  <div className="text-xs text-[#0A1128]/60">Platform management</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

              <Button
                onClick={() => navigate('/publish-success')}
                variant="outline"
                className="w-full border-[#4F6F5A]/20 py-6 justify-start"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Publish Success</div>
                  <div className="text-xs text-[#0A1128]/60">Post-publish celebration</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

              <Button
                onClick={() => navigate('/onboarding')}
                variant="outline"
                className="w-full border-[#0A1128]/20 py-6 justify-start"
                size="lg"
              >
                <Check className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Onboarding Wizard</div>
                  <div className="text-xs text-[#0A1128]/60">Complete setup flow</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />
    </div>
  );
}
