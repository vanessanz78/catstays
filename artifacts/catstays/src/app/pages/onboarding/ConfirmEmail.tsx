import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'confirmed' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('This confirmation link is invalid or has expired.');
  
  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash') || searchParams.get('token');
        const type = searchParams.get('type') || 'signup';
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else {
          throw new Error('Missing confirmation token.');
        }

        const accountData = localStorage.getItem('catstays_account');
        if (accountData) {
          const account = JSON.parse(accountData);
          account.emailConfirmed = true;
          account.status = 'confirmed';
          localStorage.setItem('catstays_account', JSON.stringify(account));
        }

        const onboardingData = localStorage.getItem('catstays_onboarding');
        if (onboardingData) {
          const saved = JSON.parse(onboardingData);
          const savedData = saved.data || {};
          saved.data = {
            name: savedData.name,
            email: savedData.email,
            emailConfirmed: true,
            businessName: savedData.businessName,
            location: savedData.location,
            websiteUrl: savedData.websiteUrl,
            importSourceUrl: savedData.importSourceUrl,
            sourceUrl: savedData.sourceUrl,
            sourceHost: savedData.sourceHost,
            previewImportRecordId: savedData.previewImportRecordId,
            previewRecordStatus: savedData.previewRecordStatus,
            selectedTemplate: savedData.selectedTemplate,
            liveTemplate: savedData.liveTemplate,
            subdomain: savedData.subdomain,
            importComplete: savedData.importComplete,
            importError: savedData.importError,
          };
          localStorage.setItem('catstays_onboarding', JSON.stringify(saved));
        }

        setStatus('confirmed');
      } catch (error) {
        console.error('Email confirmation failed', error);
        setErrorMessage(error instanceof Error ? error.message : 'This confirmation link is invalid or has expired.');
        setStatus('error');
      }
    };

    confirmEmail();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/staff-dashboard');
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#0A1128]/10 shadow-2xl rounded-3xl">
          <CardHeader className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#C46A3A]/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-[#C46A3A] animate-spin" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#0A1128] mb-2">
              Confirming your email
            </CardTitle>
            <CardDescription>
              Just a moment while we secure your CatStays login.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
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
              {errorMessage}
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
            Email confirmed
          </CardTitle>
          <CardDescription className="text-base">
            Your account has been verified successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-0">
          <div className="space-y-4">
            <div className="bg-[#F8F7F5] rounded-2xl p-6 border border-[#0A1128]/10">
              <p className="text-sm text-[#0A1128]/70 mb-4">
                You're all set. Your cattery website, booking system, and dashboard are ready for you.
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
              Go to Staff Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
