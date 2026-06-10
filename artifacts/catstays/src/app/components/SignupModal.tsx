import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';
const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoText = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan?: 'starter' | 'professional' | 'premium' | null;
}

const planDetails = {
  starter: {
    name: 'Starter',
    price: '$49',
    period: '/month',
    features: [
      'Online bookings',
      'Customer & cat profiles',
      'Calendar management',
      'Email confirmations',
      'Mobile dashboard'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$79',
    period: '/month',
    features: [
      'Everything in Starter',
      'Unlimited bookings',
      'Daily photo updates',
      'Automated reminders',
      'Priority support'
    ]
  },
  premium: {
    name: 'Premium',
    price: '$99',
    period: '/month',
    features: [
      'Everything in Professional',
      'Custom domain request workflow',
      'Advanced cat postcard and social AI',
      'Advanced website controls',
      'Priority platform support'
    ]
  }
};

export function SignupModal({ open, onOpenChange, selectedPlan = null }: SignupModalProps) {
  const navigate = useNavigate();

  const plan = selectedPlan ? planDetails[selectedPlan] : null;

  // Clear any cached signup data when modal opens (fresh start for free trial)
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Clear cached data when starting a new free trial
      localStorage.removeItem('catstays_signup_data');
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store selected plan for onboarding
    localStorage.setItem('catstays_signup_data', JSON.stringify({
      selectedPlan
    }));

    // Close modal first, then navigate after cleanup
    onOpenChange(false);
    setTimeout(() => {
      navigate('/onboarding');
    }, 200);
  };

  const handleLoginClick = () => {
    // Close modal first, then navigate after cleanup
    onOpenChange(false);
    setTimeout(() => {
      navigate('/login');
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#F8F7F5] border-[#0A1128]/10 p-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-300">
        {/* Hidden accessibility title and description */}
        <DialogTitle className="sr-only">
          {plan ? `Start your free trial with ${plan.name}` : 'Start your free trial'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Sign up for CatStays to create your cattery website and booking system. No credit card required.
        </DialogDescription>

        <div className="p-8">
          {/* CatStays Logo - Stacked Vertically */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <img src={logoIcon} alt="CatStays" className="h-16 w-16" />
            <img src={logoText} alt="CatStays" className="h-10" />
          </div>

          {/* Plan Badge */}
          {plan && (
            <div className="flex justify-center mb-4">
              <Badge className="bg-[#C46A3A]/10 text-[#C46A3A] border-[#C46A3A]/20 px-4 py-1.5 text-sm font-medium">
                {plan.name} Plan — {plan.price}{plan.period}
              </Badge>
            </div>
          )}

          {/* Headline */}
          <h2 className="text-3xl font-serif font-semibold text-[#0A1128] text-center mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {plan ? `Start your free trial with ${plan.name}` : 'Start your free trial'}
          </h2>

          {/* Subtext */}
          <p className="text-center text-[#0A1128]/60 text-sm mb-8">
            No credit card required • 14-day free trial
          </p>

          {/* Plan Confirmation Block */}
          {plan && (
            <div className="bg-white rounded-2xl border border-[#0A1128]/10 p-6 mb-8 shadow-sm">
              <h3 className="text-sm font-semibold text-[#0A1128] mb-4">What you'll get:</h3>
              <div className="space-y-3 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                    <span className="text-[#0A1128]/70 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#0A1128]/50 italic">
                You can change or upgrade anytime
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Button
              type="submit"
              className="w-full bg-[#A85A30] hover:bg-[#8A3F20] text-white rounded-xl py-6 text-base font-medium shadow-lg"
            >
              Continue to setup
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-[#0A1128]/60">
            Already have an account?{' '}
            <button
              onClick={handleLoginClick}
              className="text-[#C46A3A] hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
