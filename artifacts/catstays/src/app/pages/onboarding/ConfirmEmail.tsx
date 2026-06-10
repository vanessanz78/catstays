import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Check, Loader2, AlertTriangle } from 'lucide-react';

export function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (token) {
      // In production, verify the token with the backend
      // For now, simulate verification
      setTimeout(() => {
        // Mark email as confirmed
        const accountData = localStorage.getItem('catstays_account');
        if (accountData) {
          try {
            const account = JSON.parse(accountData);
            account.emailConfirmed = true;
            localStorage.setItem('catstays_account', JSON.stringify(account));
          } catch (e) {
            console.error('Failed to update account');
          }
        }
        
        // Update onboarding data
        const onboardingData = localStorage.getItem('catstays_onboarding');
        if (onboardingData) {
          try {
            const saved = JSON.parse(onboardingData);
            saved.data.emailConfirmed = true;
            localStorage.setItem('catstays_onboarding', JSON.stringify(saved));
          } catch (e) {
            console.error('Failed to update onboarding data');
          }
        }
      }, 1500);
    }
  }, [token]);

  const handleContinue = () => {
    navigate('/onboarding');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#0A1128]/10 shadow-2xl rounded-3xl">
          <CardHeader className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#0A1128] mb-2">
              Invalid Link
            </CardTitle>
            <CardDescription>
              This confirmation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Button
              onClick={() => navigate('/onboarding')}
              className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl"
            >
              Return to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-[#0A1128]/10 shadow-2xl rounded-3xl">
        <CardHeader className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-serif text-[#0A1128] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Email Confirmed! 🎉
          </CardTitle>
          <CardDescription className="text-base">
            Your account has been verified successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-0">
          <div className="space-y-4">
            <div className="bg-[#F8F7F5] rounded-2xl p-6 border border-[#0A1128]/10">
              <p className="text-sm text-[#0A1128]/70 mb-4">
                You're all set! Continue setting up your cattery website and booking system.
              </p>
              <ul className="space-y-2 text-sm text-[#0A1128]/70">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C46A3A]" />
                  <span>Custom branded website</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C46A3A]" />
                  <span>Online booking system</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C46A3A]" />
                  <span>Mobile dashboard</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-6 text-lg shadow-lg"
            >
              Continue Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
