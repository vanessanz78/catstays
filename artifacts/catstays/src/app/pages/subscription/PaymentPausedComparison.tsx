import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  AlertTriangle,
  XCircle,
  Pause,
  Shield,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function PaymentPausedComparison() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-[#0A1128] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Payment Paused Screen: Design Comparison
          </h1>
          <p className="text-lg text-[#0A1128]/60 max-w-2xl mx-auto">
            Side-by-side comparison of common mistakes vs. our calm, reassuring approach
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* BAD EXAMPLE */}
          <div>
            <Badge className="bg-red-600 text-white mb-4">❌ What NOT to Do</Badge>
            
            <div className="bg-white rounded-[20px] shadow-2xl border-4 border-red-500">
              <div className="p-8 bg-gradient-to-br from-red-50 to-red-100 border-b-4 border-red-500">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-red-900 mb-2 text-center uppercase">
                  ⚠️ PAYMENT FAILED ⚠️
                </h2>
                
                <div className="bg-red-200 border-2 border-red-600 p-3 rounded mb-3">
                  <p className="text-red-900 font-bold text-center text-sm uppercase">
                    URGENT ACTION REQUIRED
                  </p>
                </div>
                
                <p className="text-red-800 text-center mb-4 font-semibold">
                  Your subscription payment was DECLINED.
                </p>
                
                <div className="bg-white border-2 border-red-500 rounded p-3 mb-4">
                  <p className="text-red-900 text-sm">
                    <strong>ERROR:</strong> We were unable to process your payment. Your account has been SUSPENDED and you will lose access to all features.
                  </p>
                </div>
                
                <p className="text-xs text-red-700 mb-4">
                  ⚠️ WARNING: If you do not fix this immediately, your account and all data will be permanently deleted!
                </p>
                
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-6 mb-2">
                  <XCircle className="w-5 h-5 mr-2" />
                  FIX PAYMENT NOW
                </Button>
                
                <p className="text-xs text-center text-red-600 font-semibold">
                  Act now before it's too late!
                </p>
              </div>
            </div>

            {/* Problems List */}
            <Card className="mt-6 border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">Why This Fails:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>❌ <strong>Aggressive red everywhere</strong> - creates panic</li>
                  <li>❌ <strong>ALL CAPS SHOUTING</strong> - feels hostile</li>
                  <li>❌ <strong>"FAILED", "ERROR", "URGENT"</strong> - threatening language</li>
                  <li>❌ <strong>Warning triangles</strong> - associated with danger</li>
                  <li>❌ <strong>Deletion threats</strong> - creates fear, not action</li>
                  <li>❌ <strong>No reassurance</strong> - user feels punished</li>
                  <li>❌ <strong>Harsh borders</strong> - visually aggressive</li>
                  <li>❌ <strong>Dense text</strong> - overwhelming to read</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* GOOD EXAMPLE */}
          <div>
            <Badge className="bg-green-600 text-white mb-4">✅ Our Approach</Badge>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-[20px] shadow-2xl border border-[#0A1128]/10">
              <div className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#C46A3A]/10 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#C46A3A]/10 to-[#C46A3A]/5 flex items-center justify-center border-2 border-[#C46A3A]/20">
                      <Pause className="w-10 h-10 text-[#C46A3A]" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-serif font-bold text-[#0A1128] mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Your account is temporarily paused
                </h2>
                
                <p className="text-lg text-[#0A1128]/70 mb-4">
                  We couldn't process your subscription payment.
                </p>
                
                <p className="text-base text-[#0A1128]/60 mb-6 leading-relaxed">
                  To restore access to your website, bookings, and dashboard, simply update your payment details below.
                </p>
                
                <div className="bg-gradient-to-br from-[#4F6F5A]/5 to-[#4F6F5A]/10 rounded-2xl p-4 mb-6 border border-[#4F6F5A]/10">
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-[#4F6F5A]" />
                    </div>
                    <div>
                      <p className="text-[#0A1128] font-medium mb-1 text-sm">
                        Your data is safe
                      </p>
                      <p className="text-xs text-[#0A1128]/70 leading-relaxed">
                        Everything will be restored as soon as payment is completed.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-8 py-5 mb-3 shadow-lg">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Restore Access
                </Button>
                
                <Button variant="outline" className="w-full border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5 rounded-xl px-8 py-4">
                  Update Payment Method
                </Button>
              </div>
            </div>

            {/* Success Factors */}
            <Card className="mt-6 border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Why This Works:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>✅ <strong>Warm terracotta</strong> - inviting, not threatening</li>
                  <li>✅ <strong>Sentence case</strong> - feels human and friendly</li>
                  <li>✅ <strong>"Paused", "temporarily"</strong> - implies easy fix</li>
                  <li>✅ <strong>Pause icon</strong> - neutral, not alarming</li>
                  <li>✅ <strong>Data safety reassurance</strong> - builds trust</li>
                  <li>✅ <strong>Clear solution</strong> - "simply update payment"</li>
                  <li>✅ <strong>Soft borders</strong> - gentle and calm</li>
                  <li>✅ <strong>Generous spacing</strong> - easy to read and digest</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Language Comparison */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Language Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#0A1128]/10">
                    <th className="text-left p-4 font-semibold text-[#0A1128]">Concept</th>
                    <th className="text-left p-4 font-semibold text-red-700">❌ Avoid This</th>
                    <th className="text-left p-4 font-semibold text-green-700">✅ Use This Instead</th>
                  </tr>
                </thead>
                <tbody className="text-[#0A1128]/70">
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-4 font-medium">Account Status</td>
                    <td className="p-4 text-red-700">Account SUSPENDED</td>
                    <td className="p-4 text-green-700">Account temporarily paused</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-4 font-medium">Payment Issue</td>
                    <td className="p-4 text-red-700">Payment FAILED / DECLINED</td>
                    <td className="p-4 text-green-700">We couldn't process your payment</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-4 font-medium">Required Action</td>
                    <td className="p-4 text-red-700">URGENT ACTION REQUIRED!</td>
                    <td className="p-4 text-green-700">Simply update your payment details</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-4 font-medium">Consequence</td>
                    <td className="p-4 text-red-700">Account will be DELETED!</td>
                    <td className="p-4 text-green-700">30 days to restore access</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-4 font-medium">Data Safety</td>
                    <td className="p-4 text-red-700">(Not mentioned)</td>
                    <td className="p-4 text-green-700">Your data is safe and will be restored</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Call to Action</td>
                    <td className="p-4 text-red-700">FIX PAYMENT NOW!</td>
                    <td className="p-4 text-green-700">Restore Access</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Psychology */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <CardTitle className="text-lg text-red-900">Panic-Driven Design</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-4">
                <strong>User Emotional Response:</strong>
              </p>
              <ul className="space-y-2 text-sm text-red-800">
                <li>😰 <strong>Panic:</strong> "Oh no, what did I do wrong?"</li>
                <li>😠 <strong>Anger:</strong> "Why are they yelling at me?"</li>
                <li>😟 <strong>Anxiety:</strong> "Am I going to lose everything?"</li>
                <li>🤔 <strong>Confusion:</strong> "What exactly do I need to do?"</li>
                <li>😤 <strong>Frustration:</strong> "This feels like my fault"</li>
              </ul>
              <p className="text-xs text-red-700 mt-4 italic">
                Result: User may ignore the message, procrastinate, or abandon the service entirely
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-lg text-green-900">Calm-Confidence Design</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 mb-4">
                <strong>User Emotional Response:</strong>
              </p>
              <ul className="space-y-2 text-sm text-green-800">
                <li>😌 <strong>Calm:</strong> "Okay, this happens, no big deal"</li>
                <li>💪 <strong>Empowered:</strong> "I know exactly how to fix this"</li>
                <li>🛡️ <strong>Reassured:</strong> "My data is safe, that's good"</li>
                <li>✅ <strong>Clear:</strong> "Just update payment, simple"</li>
                <li>🤝 <strong>Trust:</strong> "They're handling this professionally"</li>
              </ul>
              <p className="text-xs text-green-700 mt-4 italic">
                Result: User takes immediate action with confidence and maintains positive relationship with service
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View Actual Screen */}
        <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#FAF7F2]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#0A1128] mb-2">
                  See Our Implementation
                </h2>
                <p className="text-[#0A1128]/70">
                  View the full payment paused screen with all features and animations
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/subscription/payment-paused-demo')}
                  variant="outline"
                  className="rounded-xl whitespace-nowrap"
                >
                  Documentation
                </Button>
                <Button
                  onClick={() => navigate('/subscription/payment-paused')}
                  className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-6 shadow-lg whitespace-nowrap"
                >
                  View Live Screen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
