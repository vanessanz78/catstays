import { useState } from 'react';
import { 
  Cat, 
  Check, 
  Copy, 
  Download, 
  Globe, 
  Rocket, 
  Share2, 
  Calendar,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { getTenantWebsiteDisplayUrl, getTenantWebsiteUrl } from '../../../utils/appUrl';

interface SuccessScreenProps {
  subdomain: string;
  onGoToWebsite: () => void;
  onContinueToDataImport?: () => void;
  subscriptionTier?: 'starter' | 'professional' | 'premium';
  trialFullAccess?: boolean;
  businessData?: {
    businessName: string;
    location: string;
    subdomain: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    heroHeading?: string;
    heroSubheading?: string;
    aboutText?: string;
    phone?: string;
    email?: string;
    address?: string;
    pricePerNight?: string;
    heroImage?: string;
    headingFont?: string;
    subheadingFont?: string;
    roomTypes?: any[];
    servicesData?: any;
  };
}

export function SuccessScreen({ subdomain, onGoToWebsite, onContinueToDataImport, businessData }: SuccessScreenProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const websiteUrl = getTenantWebsiteUrl(subdomain);
  const websiteDisplayUrl = getTenantWebsiteDisplayUrl(subdomain);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = websiteUrl;
  const shareText = `Check out my new cat boarding website! Book your cat's luxury stay at ${websiteDisplayUrl} 🐱`;
  
  const socialShareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent('Check out my cat boarding website')}&body=${encodeURIComponent(shareText)}`,
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My CatStays Website',
        text: shareText,
        url: shareUrl
      });
    } else {
      setShowShareModal(true);
    }
  };

  const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <Card className="border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-12 md:p-16 text-center">
          {/* Celebration Animation - Cat Icon with Glow */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C46A3A]/30 to-[#4F6F5A]/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#C46A3A] to-[#4F6F5A] flex items-center justify-center shadow-2xl">
              <Cat className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#0A1128] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your cattery is live 🐾
          </h1>
          <p className="text-xl md:text-2xl text-[#0A1128]/70 mb-10">
            You're now ready to accept your first booking
          </p>

          {/* URL Display with Copy Button */}
          <div className="max-w-2xl mx-auto mb-10">
            <Label className="text-sm text-[#0A1128]/50 mb-3 block font-medium">Your Website URL</Label>
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#F8F7F5] to-white rounded-2xl p-4 md:p-5 border-2 border-[#C46A3A]/20 shadow-lg">
              <Globe className="w-6 h-6 text-[#C46A3A] flex-shrink-0" />
              <code className="text-xl md:text-2xl font-mono text-[#0A1128] flex-1 break-all">
                {websiteDisplayUrl}
              </code>
              <Button 
                variant="outline" 
                size="sm"
                className={`rounded-xl flex-shrink-0 transition-all ${copied ? 'border-green-400 bg-green-50 text-green-700' : 'border-[#C46A3A]/30 hover:bg-[#C46A3A]/10'}`}
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <><Check className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Copied!</span></>
                ) : (
                  <><Copy className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Copy</span></>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] border-2 border-[#C46A3A]/20 rounded-2xl p-8 md:p-10 max-w-2xl mx-auto mb-10">
            <h3 className="text-xl font-semibold text-[#0A1128] mb-4">This is your website and your dashboard</h3>
            <p className="text-[#0A1128]/60 mb-6">Use this link to:</p>
            <ul className="space-y-3 text-left max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <span className="text-[#0A1128]/80">Accept bookings from customers</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <span className="text-[#0A1128]/80">Manage your calendar and rooms</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <span className="text-[#0A1128]/80">Track payments and revenue</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <span className="text-[#0A1128]/80">Send photo updates to customers</span>
              </li>
            </ul>
          </div>

          {/* Trial Info */}
          <div className="bg-gradient-to-br from-[#4F6F5A]/10 to-[#F8F7F5] border-2 border-[#4F6F5A]/20 rounded-2xl p-6 max-w-2xl mx-auto mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#4F6F5A]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-[#4F6F5A]" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-[#0A1128] mb-2">Your 14-Day Free Trial is Active</h4>
                <p className="text-sm text-[#0A1128]/70 mb-3">
                  Full access to all features. No credit card required. We'll send you a reminder before your trial ends.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#4F6F5A]">
                  <Calendar className="w-4 h-4" />
                  <span>Trial ends on {trialEndDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#C46A3A]/20 rounded-2xl p-6 max-w-2xl mx-auto mb-10 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#C46A3A]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0A1128] mb-2">Confirm your email when you are ready</h4>
                <p className="text-sm text-[#0A1128]/70 leading-relaxed">
                  We sent the secure confirmation link to {businessData?.email || 'your email'}. Finish exploring first, then confirm your login from your inbox.
                </p>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <Button
            size="lg"
            className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-12 py-7 text-xl shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-200 mb-6"
            onClick={onGoToWebsite}
          >
            <Rocket className="w-6 h-6 mr-3" />
            Go to My Website
          </Button>

          {/* Secondary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button 
              className="text-[#C46A3A] hover:text-[#A85A30] hover:underline transition-colors flex items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share on social media
            </button>
          </div>

          {onContinueToDataImport && (
            <div className="mt-8">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-[#0A1128]/20 px-10 py-6 text-[#0A1128] hover:bg-[#F8F7F5]"
                onClick={onContinueToDataImport}
              >
                Continue to Data Import
                <Download className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 md:p-10 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-[#0A1128]">Share Your Website</h3>
              <button 
                className="text-[#0A1128]/50 hover:text-[#0A1128] transition-colors"
                onClick={() => setShowShareModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-[#0A1128]/60 mb-6">Choose a platform to share your website:</p>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={socialShareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white rounded-xl p-4 shadow-lg transition-colors"
              >
                <Facebook className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Facebook</span>
              </a>
              <a 
                href={socialShareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white rounded-xl p-4 shadow-lg transition-colors"
              >
                <Twitter className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Twitter</span>
              </a>
              <a 
                href={socialShareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#0077B5] hover:bg-[#0077B5]/90 text-white rounded-xl p-4 shadow-lg transition-colors"
              >
                <Linkedin className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">LinkedIn</span>
              </a>
              <a 
                href={socialShareLinks.email}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl p-4 shadow-lg transition-colors"
              >
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
