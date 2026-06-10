import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  CreditCard, 
  Check, 
  Lock, 
  ArrowRight,
  Shield,
  Sparkles,
  MessageCircle,
  Camera,
  Sun
} from 'lucide-react';

export function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [planCost, setPlanCost] = useState(69);
  const [basePlanCost, setBasePlanCost] = useState(69);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Load selected features from localStorage
  useEffect(() => {
    const savedFeatures = localStorage.getItem('selectedUpsellFeatures');
    const savedPlanCost = localStorage.getItem('planCost');
    const savedBasePlanCost = localStorage.getItem('basePlanCost');
    
    if (savedFeatures) {
      setSelectedFeatures(JSON.parse(savedFeatures));
    }
    if (savedPlanCost) {
      setPlanCost(Number(savedPlanCost));
    }
    if (savedBasePlanCost) {
      setBasePlanCost(Number(savedBasePlanCost));
    }
  }, []);

  const featureDetails: Record<string, { icon: any; title: string; price: number }> = {
    sms: { icon: MessageCircle, title: 'SMS Updates', price: 10 },
    updates: { icon: Camera, title: 'Pet Updates', price: 15 },
    daycare: { icon: Sun, title: 'Daycare Module', price: 10 },
    grooming: { icon: Sparkles, title: 'Grooming Module', price: 10 },
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      // Save subscription status
      localStorage.setItem('subscriptionActive', 'true');
      localStorage.setItem('activeModules', JSON.stringify(selectedFeatures));
      
      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin/modern-dashboard');
      }, 2000);
    }, 2000);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-green-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1128] mb-2" style={{ fontFamily: 'Playfair Display' }}>
              Payment Successful!
            </h2>
            <p className="text-[#0A1128]/70 mb-4">
              Your subscription is now active and all modules have been enabled.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-700">
              <Shield className="w-4 h-4" />
              <span>Redirecting to dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0A1128] mb-2" style={{ fontFamily: 'Playfair Display' }}>
            Complete Your Subscription
          </h1>
          <p className="text-lg text-[#0A1128]/70">
            Secure payment to activate your cattery platform
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Summary */}
            <Card className="border-[#0A1128]/10 shadow-sm">
              <CardHeader className="border-b border-[#0A1128]/5">
                <CardTitle className="text-xl font-semibold text-[#0A1128]">
                  Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Base Plan */}
                <div className="flex items-center justify-between pb-4 border-b border-[#0A1128]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0A1128]">CatStays Base Plan</p>
                      <p className="text-sm text-[#0A1128]/60">Complete booking & management system</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#0A1128]">${basePlanCost}</p>
                    <p className="text-xs text-[#0A1128]/50">/month</p>
                  </div>
                </div>

                {/* Selected Add-ons */}
                {selectedFeatures.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#0A1128]/70 uppercase tracking-wide">
                      Add-on Modules ({selectedFeatures.length})
                    </p>
                    {selectedFeatures.map((featureId) => {
                      const feature = featureDetails[featureId];
                      if (!feature) return null;
                      const Icon = feature.icon;
                      
                      return (
                        <div key={featureId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-[#C46A3A]" />
                            </div>
                            <p className="text-sm font-medium text-[#0A1128]">{feature.title}</p>
                          </div>
                          <p className="text-sm font-semibold text-[#C46A3A]">+${feature.price}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="border-[#0A1128]/10 shadow-sm">
              <CardHeader className="border-b border-[#0A1128]/5">
                <CardTitle className="text-xl font-semibold text-[#0A1128] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C46A3A]" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Enter your payment information securely
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Card Number */}
                <div>
                  <Label htmlFor="cardNumber" className="text-[#0A1128] font-medium mb-2 block">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="border-[#0A1128]/20 focus:border-[#C46A3A] rounded-lg"
                    defaultValue="4242 4242 4242 4242"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <Label htmlFor="expiry" className="text-[#0A1128] font-medium mb-2 block">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="border-[#0A1128]/20 focus:border-[#C46A3A] rounded-lg"
                      defaultValue="12/26"
                    />
                  </div>

                  {/* CVC */}
                  <div>
                    <Label htmlFor="cvc" className="text-[#0A1128] font-medium mb-2 block">
                      CVC
                    </Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      className="border-[#0A1128]/20 focus:border-[#C46A3A] rounded-lg"
                      defaultValue="123"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <Label htmlFor="cardName" className="text-[#0A1128] font-medium mb-2 block">
                    Cardholder Name
                  </Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    className="border-[#0A1128]/20 focus:border-[#C46A3A] rounded-lg"
                    defaultValue="Jane Smith"
                  />
                </div>

                {/* Security Badge */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Secure Payment</p>
                    <p className="text-xs text-blue-700">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Total & Submit */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Total Summary */}
              <Card className="border-[#C46A3A]/20 shadow-lg">
                <CardHeader className="bg-gradient-to-br from-[#C46A3A]/5 to-transparent pb-4">
                  <CardTitle className="text-lg font-semibold text-[#0A1128]">
                    Order Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0A1128]/70">Subtotal</span>
                      <span className="font-medium text-[#0A1128]">${planCost}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pb-3 border-b border-[#0A1128]/10">
                      <span className="text-[#0A1128]/70">14-day free trial</span>
                      <span className="font-medium text-green-600">-${planCost}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-[#0A1128]">Due Today</span>
                      <span className="text-2xl font-bold text-[#0A1128]">$0</span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800">
                      <strong>Free for 14 days!</strong> You'll be charged ${planCost}/month after your trial ends.
                    </p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-[#0A1128]/50">
                    By continuing, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>

              {/* Features Included */}
              <Card className="border-[#0A1128]/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-[#0A1128]">
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                  {[
                    'Complete booking system',
                    'Customer portal',
                    'Mobile-friendly dashboard',
                    'Automated invoicing',
                    'Custom branding',
                    ...(selectedFeatures.length > 0 ? [`${selectedFeatures.length} premium modules`] : [])
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#0A1128]/80">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
