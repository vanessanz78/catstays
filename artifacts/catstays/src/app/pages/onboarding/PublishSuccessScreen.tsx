import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  LayoutDashboard,
  Bookmark,
  Globe,
  Calendar,
  Heart
} from 'lucide-react';

export function PublishSuccessScreen() {
  const navigate = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    // Gentle animation trigger
    setTimeout(() => setIsAnimated(true), 100);

    // Get subdomain from onboarding data
    const onboardingProgress = localStorage.getItem('onboarding_progress');
    const onboardingData = onboardingProgress ? JSON.parse(onboardingProgress) : null;
    const businessName = onboardingData?.businessName || 'whiskerhaven';
    const generatedSubdomain = businessName.toLowerCase().replace(/\s+/g, '');
    setSubdomain(generatedSubdomain);

    // Mark as published
    if (onboardingData) {
      onboardingData.published = true;
      localStorage.setItem('onboarding_progress', JSON.stringify(onboardingData));
    }
  }, []);

  const fullUrl = `${subdomain}.catstays.app`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${fullUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToWebsite = () => {
    // In production: window.location.href = `https://${fullUrl}`;
    // For demo: navigate to tenant site
    navigate('/site');
  };

  const handleOpenDashboard = () => {
    // In production: window.location.href = `https://${fullUrl}/admin`;
    // For demo: navigate to admin
    navigate('/staff-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7F5] via-[#FAF9F6] to-[#F5F2EC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Celebration Background Effects */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #C46A3A 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }} />

      {/* Confetti-like Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#C46A3A]/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div 
        className={`relative z-10 w-full max-w-3xl transition-all duration-700 ease-out ${
          isAnimated 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <Card className="border-[#0A1128]/10 shadow-2xl rounded-[20px] overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardContent className="p-12 md:p-16 text-center">
            {/* Celebration Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {/* Pulse Ring */}
                <div className="absolute inset-0 rounded-full bg-[#C46A3A]/10 animate-pulse" 
                     style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                
                {/* Icon Container */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#C46A3A]/20 to-[#C46A3A]/10 flex items-center justify-center border-2 border-[#C46A3A]/30">
                  <Sparkles className="w-12 h-12 text-[#C46A3A]" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 
              className="text-4xl md:text-5xl font-serif font-bold text-[#0A1128] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Your cattery is live 🐾
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#0A1128]/70 mb-10">
              Your website and booking system are ready to go
            </p>

            {/* URL Display - PROMINENT */}
            <div className="bg-gradient-to-br from-[#4F6F5A]/5 to-[#4F6F5A]/10 rounded-2xl p-8 mb-10 border-2 border-[#4F6F5A]/20">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Globe className="w-6 h-6 text-[#4F6F5A]" />
                <p className="text-sm font-medium text-[#0A1128]/70 uppercase tracking-wide">
                  Your Website
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <a
                  href={`https://${fullUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl md:text-3xl font-bold text-[#C46A3A] hover:underline transition-all"
                >
                  {fullUrl}
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-white/50 hover:bg-white transition-colors border border-[#0A1128]/10"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#0A1128]/60" />
                  )}
                </button>
              </div>

              {copied && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Link copied to clipboard!
                </p>
              )}
            </div>

            {/* Instructions Section */}
            <div className="bg-white rounded-2xl p-8 mb-8 border border-[#0A1128]/10 text-left">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-5 h-5 text-[#C46A3A]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    How to access your system
                  </h3>
                  <p className="text-[#0A1128]/70 leading-relaxed mb-4">
                    This is now your website <strong>and</strong> your dashboard.
                  </p>
                  <p className="text-[#0A1128]/70 leading-relaxed mb-6">
                    In future, access everything here: <span className="font-mono font-semibold text-[#C46A3A]">{fullUrl}</span>
                  </p>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <LayoutDashboard className="w-5 h-5 text-[#4F6F5A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#0A1128]/70">Use this link to manage bookings</p>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#4F6F5A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#0A1128]/70">This is where your customers will book</p>
                </div>
                <div className="flex items-start gap-3">
                  <Bookmark className="w-5 h-5 text-[#4F6F5A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#0A1128]/70">Bookmark it for easy access</p>
                </div>
              </div>

              {/* Login Info */}
              <div className="pt-6 border-t border-[#0A1128]/10">
                <p className="text-sm text-[#0A1128]/60">
                  <strong className="text-[#0A1128]">Login info:</strong> You'll log in using the email and password you just created.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              {/* Primary CTA */}
              <Button
                onClick={handleGoToWebsite}
                size="lg"
                className="w-full md:w-auto bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-12 py-6 text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Go to My Website
              </Button>

              {/* Secondary Actions */}
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="lg"
                  className="border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5 rounded-xl px-8 py-5"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>

                <Button
                  onClick={handleOpenDashboard}
                  variant="outline"
                  size="lg"
                  className="border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5 rounded-xl px-8 py-5"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Button>
              </div>
            </div>

            {/* Reassurance Note */}
            <div className="mt-8 pt-6 border-t border-[#0A1128]/5">
              <p className="text-sm text-[#0A1128]/60 italic">
                We've saved your progress — you can always log back in anytime
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ambient Light Effect */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#C46A3A] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#4F6F5A] rounded-full" />
        </div>
      </div>

      {/* Floating Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
