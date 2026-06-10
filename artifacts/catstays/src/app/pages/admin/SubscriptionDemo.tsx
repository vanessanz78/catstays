import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SubscriptionWarningBanner } from '../../components/SubscriptionWarningBanner';
import { AccountLockedScreen } from '../../components/AccountLockedScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AlertTriangle, Check, Lock, CreditCard, Shield, Info } from 'lucide-react';

export function SubscriptionDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleUpdatePayment = () => {
    alert('This would open the payment method update flow');
  };

  const handleRestoreAccess = () => {
    alert('This would initiate the account restoration process');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Subscription Lifecycle Management
          </h1>
          <p className="text-[#0A1128]/60">
            Demo of payment failure flows, grace periods, and account lock states
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-[#0A1128]/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment_due">Payment Due</TabsTrigger>
            <TabsTrigger value="grace_period">Grace Period</TabsTrigger>
            <TabsTrigger value="locked">Account Locked</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-[#0A1128]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Subscription States</CardTitle>
                <CardDescription>
                  Understanding the account lifecycle from active to locked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Active State */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-900">Active</h3>
                    </div>
                    <p className="text-sm text-green-800 mb-3">
                      Full access to dashboard, website is live, bookings accepted
                    </p>
                    <Badge className="bg-green-600 text-white">Current Status</Badge>
                  </div>

                  {/* Payment Due State */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-amber-900">Payment Due</h3>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">
                      Payment failed, soft warning banner, automatic retry in progress
                    </p>
                    <Badge variant="outline" className="border-amber-600 text-amber-900">
                      Day 0-1
                    </Badge>
                  </div>

                  {/* Grace Period State */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-orange-900">Grace Period</h3>
                    </div>
                    <p className="text-sm text-orange-800 mb-3">
                      Persistent warning, 7 days to update payment before lockout
                    </p>
                    <Badge variant="outline" className="border-orange-600 text-orange-900">
                      Day 1-7
                    </Badge>
                  </div>

                  {/* Locked State */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-red-900">Locked</h3>
                    </div>
                    <p className="text-sm text-red-800 mb-3">
                      Dashboard restricted, lock screen shown, data preserved
                    </p>
                    <Badge variant="outline" className="border-red-600 text-red-900">
                      Day 7+
                    </Badge>
                  </div>

                  {/* Retention State */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-purple-900">Data Retention</h3>
                    </div>
                    <p className="text-sm text-purple-800 mb-3">
                      Account locked, data stored for 30 days before deletion
                    </p>
                    <Badge variant="outline" className="border-purple-600 text-purple-900">
                      Day 7-37
                    </Badge>
                  </div>

                  {/* Deleted State */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Info className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Deleted</h3>
                    </div>
                    <p className="text-sm text-gray-800 mb-3">
                      All data permanently removed, subdomain released
                    </p>
                    <Badge variant="outline" className="border-gray-600 text-gray-900">
                      After Day 37
                    </Badge>
                  </div>
                </div>

                {/* UX Principles */}
                <div className="mt-8 bg-[#0A1128]/5 rounded-xl p-6 border border-[#0A1128]/10">
                  <h3 className="font-semibold text-[#0A1128] mb-4">UX Principles</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-[#C46A3A] mb-2">Calm & Reassuring</h4>
                      <p className="text-[#0A1128]/70">
                        No aggressive language or threatening tones
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#C46A3A] mb-2">Data Safety</h4>
                      <p className="text-[#0A1128]/70">
                        Always emphasize that data is safe until deletion
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#C46A3A] mb-2">Easy Recovery</h4>
                      <p className="text-[#0A1128]/70">
                        Clear path to restore access at any time
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Due Tab */}
          <TabsContent value="payment_due" className="space-y-6">
            <Card className="border-[#0A1128]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Payment Due State</CardTitle>
                <CardDescription>
                  Soft warning banner shown immediately after payment failure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Demo Banner */}
                  <div>
                    <h3 className="font-semibold text-[#0A1128] mb-4">Banner Preview:</h3>
                    <SubscriptionWarningBanner 
                      type="payment_due" 
                      onUpdatePayment={handleUpdatePayment}
                    />
                  </div>

                  {/* Details */}
                  <div className="bg-[#F8F7F5] rounded-xl p-6 border border-[#0A1128]/10">
                    <h4 className="font-semibold text-[#0A1128] mb-3">Behavior:</h4>
                    <ul className="space-y-2 text-sm text-[#0A1128]/70">
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Triggered immediately when payment fails</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Soft amber background (warning, not critical)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Mentions automatic retry to reduce panic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Clear CTA to update payment method</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Dashboard remains fully accessible</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grace Period Tab */}
          <TabsContent value="grace_period" className="space-y-6">
            <Card className="border-[#0A1128]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Grace Period State</CardTitle>
                <CardDescription>
                  Persistent warning with countdown (Days 1-7 after payment failure)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Demo Banners */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#0A1128] mb-4">Banner Previews:</h3>
                    
                    <div>
                      <p className="text-sm text-[#0A1128]/60 mb-2">With 7 days remaining:</p>
                      <SubscriptionWarningBanner 
                        type="grace_period"
                        daysRemaining={7}
                        onUpdatePayment={handleUpdatePayment}
                      />
                    </div>

                    <div>
                      <p className="text-sm text-[#0A1128]/60 mb-2">With 3 days remaining:</p>
                      <SubscriptionWarningBanner 
                        type="grace_period"
                        daysRemaining={3}
                        onUpdatePayment={handleUpdatePayment}
                      />
                    </div>

                    <div>
                      <p className="text-sm text-[#0A1128]/60 mb-2">With 1 day remaining:</p>
                      <SubscriptionWarningBanner 
                        type="grace_period"
                        daysRemaining={1}
                        onUpdatePayment={handleUpdatePayment}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-[#F8F7F5] rounded-xl p-6 border border-[#0A1128]/10">
                    <h4 className="font-semibold text-[#0A1128] mb-3">Behavior:</h4>
                    <ul className="space-y-2 text-sm text-[#0A1128]/70">
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Shown after payment remains unpaid for 1+ days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Stronger orange tone to indicate urgency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Countdown badge shows days remaining</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Reassurance that no data will be lost</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Persistent banner shown on all dashboard pages</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locked Tab */}
          <TabsContent value="locked" className="space-y-6">
            <Card className="border-[#0A1128]/10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Account Locked State</CardTitle>
                <CardDescription>
                  Full-page lock screen replaces dashboard (After 7 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Info Card */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h4 className="font-semibold text-red-900 mb-3">When This Appears:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>7 days after initial payment failure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>Grace period has expired without payment update</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>Dashboard access is restricted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>Website may be hidden (configurable)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Demo Button */}
                  <div>
                    <Button
                      onClick={() => {
                        const demoWindow = window.open('', '_blank');
                        if (demoWindow) {
                          demoWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>Account Locked - CatStays</title>
                                <style>body { margin: 0; font-family: system-ui; }</style>
                              </head>
                              <body>
                                <div id="root"></div>
                                <script>
                                  window.close();
                                  window.location.href = '/admin/subscription-locked-demo';
                                </script>
                              </body>
                            </html>
                          `);
                        }
                      }}
                      size="lg"
                      className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Preview Full Lock Screen
                    </Button>
                    <p className="text-sm text-[#0A1128]/60 mt-2">
                      See the actual lock screen in a new window
                    </p>
                  </div>

                  {/* Details */}
                  <div className="bg-[#F8F7F5] rounded-xl p-6 border border-[#0A1128]/10">
                    <h4 className="font-semibold text-[#0A1128] mb-3">Key Features:</h4>
                    <ul className="space-y-2 text-sm text-[#0A1128]/70">
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Calm, professional tone (not aggressive)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Shield icon emphasizes data security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Clear countdown to data deletion (30 days)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Two CTAs: "Restore Access" (primary) and "Update Payment"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#C46A3A] mt-0.5">•</span>
                        <span>Lists benefits of restoration to encourage action</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Separate component for the actual lock screen demo
export function SubscriptionLockedDemo() {
  const handleRestoreAccess = () => {
    alert('This would initiate the account restoration and payment process');
  };

  const handleUpdatePayment = () => {
    alert('This would open the payment method update modal');
  };

  return (
    <AccountLockedScreen
      daysUntilDeletion={23}
      onRestoreAccess={handleRestoreAccess}
      onUpdatePayment={handleUpdatePayment}
    />
  );
}
