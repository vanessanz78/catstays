import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Pause, 
  Check, 
  Info, 
  Shield,
  CreditCard,
  ArrowRight,
  Eye,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function PaymentPausedDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Payment Paused Screen
          </h1>
          <p className="text-[#0A1128]/60">
            Premium, calm, reassuring lock screen for failed subscription payments
          </p>
        </div>

        {/* Design Principles */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Calm & Reassuring</CardTitle>
              <CardDescription>
                Not a scary error screen - feels like a gentle pause
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#0A1128]/70">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Soft background gradient</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Terracotta pause icon (warm tone)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>No harsh red errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gentle fade-in animation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Data Security</CardTitle>
              <CardDescription>
                Reassures users their data is safe and protected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#0A1128]/70">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Data safety message prominent</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>30-day restoration window clear</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Professional, not aggressive</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Support contact available</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-[#C46A3A]" />
              </div>
              <CardTitle className="text-lg">Easy to Fix</CardTitle>
              <CardDescription>
                Clear path to restoration with prominent CTAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#0A1128]/70">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                  <span>Primary "Restore Access" CTA</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                  <span>Secondary "Update Payment" option</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                  <span>Clear instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                  <span>Minimal friction</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* What We Avoid */}
        <Card className="border-red-200 bg-red-50/50 mb-8">
          <CardHeader>
            <CardTitle className="text-lg text-red-900">❌ What We Avoid</CardTitle>
            <CardDescription className="text-red-800">
              Common mistakes that create panic and frustration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-red-900 mb-2">Language to Avoid:</h4>
                <ul className="space-y-1 text-red-800">
                  <li>❌ "ERROR"</li>
                  <li>❌ "FAILED"</li>
                  <li>❌ "URGENT ACTION REQUIRED"</li>
                  <li>❌ "Your account has been suspended"</li>
                  <li>❌ "Payment DECLINED"</li>
                </ul>
              </div>
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-red-900 mb-2">Design to Avoid:</h4>
                <ul className="space-y-1 text-red-800">
                  <li>❌ Aggressive red UI</li>
                  <li>❌ Alarm icons or warning triangles</li>
                  <li>❌ Abrupt animations</li>
                  <li>❌ Overwhelming text blocks</li>
                  <li>❌ Hidden support options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Screen Features</CardTitle>
            <CardDescription>
              What makes this screen effective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C46A3A]" />
                  Visual Design
                </h4>
                <ul className="space-y-2 text-sm text-[#0A1128]/70">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-2 flex-shrink-0"></div>
                    <span><strong>Soft gradient background:</strong> Beige with subtle blur overlay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-2 flex-shrink-0"></div>
                    <span><strong>Rounded card:</strong> 20px radius with generous padding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-2 flex-shrink-0"></div>
                    <span><strong>Terracotta pause icon:</strong> Warm, non-threatening color</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-2 flex-shrink-0"></div>
                    <span><strong>Pulse animation:</strong> Subtle ring around icon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-2 flex-shrink-0"></div>
                    <span><strong>Ambient light effects:</strong> Soft blur glow in background</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#4F6F5A]" />
                  Content Structure
                </h4>
                <ul className="space-y-2 text-sm text-[#0A1128]/70">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F5A] mt-2 flex-shrink-0"></div>
                    <span><strong>Headline:</strong> "Your account is temporarily paused"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F5A] mt-2 flex-shrink-0"></div>
                    <span><strong>Clear reason:</strong> "We couldn't process your payment"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F5A] mt-2 flex-shrink-0"></div>
                    <span><strong>Solution:</strong> "Update payment details below"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F5A] mt-2 flex-shrink-0"></div>
                    <span><strong>Reassurance box:</strong> "Your data is safe" with shield icon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F6F5A] mt-2 flex-shrink-0"></div>
                    <span><strong>Time limit:</strong> "30 days to restore access"</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Call-to-Action Hierarchy</CardTitle>
            <CardDescription>
              Prioritized actions with clear visual distinction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Primary CTA */}
              <div className="flex items-start gap-4">
                <Badge className="bg-[#C46A3A] text-white px-3 py-1">Primary</Badge>
                <div className="flex-1">
                  <div className="mb-3">
                    <Button
                      size="lg"
                      className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-12 py-6 text-lg shadow-lg"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Restore Access
                    </Button>
                  </div>
                  <p className="text-sm text-[#0A1128]/70">
                    Most prominent action - terracotta color with shadow and hover animation
                  </p>
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="flex items-start gap-4">
                <Badge variant="outline" className="px-3 py-1">Secondary</Badge>
                <div className="flex-1">
                  <div className="mb-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5 rounded-xl px-10 py-5"
                    >
                      Update Payment Method
                    </Button>
                  </div>
                  <p className="text-sm text-[#0A1128]/70">
                    Alternative action - outlined style, less emphasis
                  </p>
                </div>
              </div>

              {/* Tertiary Link */}
              <div className="flex items-start gap-4">
                <Badge variant="outline" className="px-3 py-1 text-[#0A1128]/50">Tertiary</Badge>
                <div className="flex-1">
                  <div className="mb-3">
                    <button className="text-sm text-[#0A1128]/50 hover:text-[#0A1128]/70 underline decoration-dotted underline-offset-4">
                      View plans
                    </button>
                  </div>
                  <p className="text-sm text-[#0A1128]/70">
                    Low priority link - not pushed heavily, subtle styling
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#FAF7F2]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#0A1128] mb-2">
                  View the Payment Paused Screen
                </h2>
                <p className="text-[#0A1128]/70">
                  Experience the calm, reassuring design in action
                </p>
              </div>
              <Button
                onClick={() => navigate('/subscription/payment-paused')}
                size="lg"
                className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-8 py-6 shadow-lg whitespace-nowrap"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Screen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="border-[#0A1128]/10 mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Technical Implementation</CardTitle>
            <CardDescription>
              Animation and interaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-[#0A1128] mb-3">Animations</h4>
                <ul className="space-y-2 text-[#0A1128]/70">
                  <li>• <strong>Fade in:</strong> 700ms ease-out on page load</li>
                  <li>• <strong>Scale up:</strong> Card starts at 95% scale</li>
                  <li>• <strong>Translate:</strong> Gentle upward movement (4px)</li>
                  <li>• <strong>Pulse:</strong> Continuous 3s pulse on icon ring</li>
                  <li>• <strong>Hover:</strong> Button scale (1.02) + shadow increase</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#0A1128] mb-3">Responsive Design</h4>
                <ul className="space-y-2 text-[#0A1128]/70">
                  <li>• <strong>Mobile:</strong> Full-width card with reduced padding</li>
                  <li>• <strong>Tablet:</strong> Centered card, max-width 2xl</li>
                  <li>• <strong>Desktop:</strong> Full effects with ambient light</li>
                  <li>• <strong>Typography:</strong> Responsive font sizes (3xl → 4xl)</li>
                  <li>• <strong>Buttons:</strong> Stack on mobile, inline on desktop</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
