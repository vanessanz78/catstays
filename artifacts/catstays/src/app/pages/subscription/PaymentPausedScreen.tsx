import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Pause, CreditCard, Shield, Calendar } from 'lucide-react';

export function PaymentPausedScreen() {
  const navigate = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(30);

  useEffect(() => {
    // Gentle fade-in animation
    setTimeout(() => setIsAnimated(true), 100);

    // Calculate days remaining (demo - in production, get from API)
    // For now, simulate 30 days from pause date
    setDaysRemaining(30);
  }, []);

  const handleRestoreAccess = () => {
    // In production: open payment modal or redirect to Stripe checkout
    console.log('Opening payment restoration flow...');
    // For demo, navigate to subscription settings
    navigate('/admin/subscription-settings');
  };

  const handleUpdatePayment = () => {
    // In production: open payment method update modal
    console.log('Opening payment method update...');
    navigate('/admin/subscription-settings');
  };

  const handleViewPlans = () => {
    navigate('/plans');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7F5] via-[#FAF7F2] to-[#F5F2EC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #0A1128 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Main Card */}
      <div 
        className={`relative z-10 w-full max-w-2xl transition-all duration-700 ease-out ${
          isAnimated 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <Card className="border-[#0A1128]/10 shadow-2xl rounded-[20px] overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardContent className="p-12 md:p-16 text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {/* Pulse Animation Ring */}
                <div className="absolute inset-0 rounded-full bg-[#C46A3A]/10 animate-pulse" 
                     style={{ animation: 'pulse 3s ease-in-out infinite' }} />
                
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#C46A3A]/10 to-[#C46A3A]/5 flex items-center justify-center border-2 border-[#C46A3A]/20">
                  <Pause className="w-10 h-10 md:w-12 md:h-12 text-[#C46A3A]" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 
              className="text-3xl md:text-4xl font-serif font-bold text-[#0A1128] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Your account is temporarily paused
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#0A1128]/70 mb-6">
              We couldn't process your subscription payment.
            </p>

            {/* Body Text */}
            <p className="text-base text-[#0A1128]/60 mb-8 max-w-lg mx-auto leading-relaxed">
              To restore access to your website, bookings, and dashboard, 
              simply update your payment details below.
            </p>

            {/* Reassurance Box */}
            <div className="bg-gradient-to-br from-[#4F6F5A]/5 to-[#4F6F5A]/10 rounded-2xl p-6 mb-10 border border-[#4F6F5A]/10">
              <div className="flex items-start gap-4 justify-center text-left max-w-md mx-auto">
                <div className="w-10 h-10 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5 text-[#4F6F5A]" />
                </div>
                <div>
                  <p className="text-[#0A1128] font-medium mb-1 text-base">
                    Your data is safe
                  </p>
                  <p className="text-sm text-[#0A1128]/70 leading-relaxed">
                    Everything will be restored as soon as payment is completed. 
                    All your bookings, customer data, and settings remain secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4 mb-8">
              <Button
                onClick={handleRestoreAccess}
                size="lg"
                className="w-full md:w-auto bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-12 py-6 text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Restore Access
              </Button>

              {/* Secondary CTA */}
              <div>
                <Button
                  onClick={handleUpdatePayment}
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5 rounded-xl px-10 py-5 transition-all duration-300"
                >
                  Update Payment Method
                </Button>
              </div>
            </div>

            {/* Optional Small Link */}
            <div className="mb-8">
              <button
                onClick={handleViewPlans}
                className="text-sm text-[#0A1128]/50 hover:text-[#0A1128]/70 transition-colors underline decoration-dotted underline-offset-4"
              >
                View plans
              </button>
            </div>

            {/* Data Retention Notice */}
            <div className="pt-8 border-t border-[#0A1128]/10">
              <div className="flex items-center justify-center gap-3 text-sm text-[#0A1128]/60">
                <Calendar className="w-4 h-4" />
                <p>
                  You have <span className="font-semibold text-[#C46A3A]">{daysRemaining} days</span> to restore access before your data is permanently removed.
                </p>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-[#0A1128]/5">
              <p className="text-xs text-[#0A1128]/50">
                Having trouble? <a href="mailto:support@catstays.com" className="text-[#C46A3A] hover:underline">Contact support</a> for assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ambient Light Effect */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#C46A3A] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#4F6F5A] rounded-full" />
        </div>
      </div>
    </div>
  );
}
