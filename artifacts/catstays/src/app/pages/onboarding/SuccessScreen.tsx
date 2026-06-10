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
  Instagram,
  FileImage,
  FileText,
  Palette
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { MarketingStudio } from '../../components/MarketingStudio';

interface SuccessScreenProps {
  subdomain: string;
  onGoToWebsite: () => void;
  subscriptionTier?: 'starter' | 'professional';
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

export function SuccessScreen({ subdomain, onGoToWebsite, businessData, subscriptionTier }: SuccessScreenProps) {
  const isProfessional = subscriptionTier === 'professional';
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${subdomain}.catstays.app`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = `https://${subdomain}.catstays.app`;
  const shareText = `Check out my new cat boarding website! Book your cat's luxury stay at ${subdomain}.catstays.app 🐱`;
  
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

  const handleDownloadMaterials = () => {
    setShowMaterialsModal(true);
  };

  const handleDownloadGraphic = async (type: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const primaryColor = businessData?.primaryColor || '#0A1128';
    const accentColor = businessData?.accentColor || '#C46A3A';
    const businessName = businessData?.businessName || 'Premium Cat Boarding';
    const tagline = businessData?.heroSubheading || businessData?.heroHeading || 'Luxury Cat Boarding & Care';
    const phone = businessData?.phone || '';
    const heroImageUrl = businessData?.heroImage || '';

    // Helper to load an image for canvas drawing
    const loadImage = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        if (!src) { resolve(null); return; }
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    
    const heroImg = await loadImage(heroImageUrl);

    if (type === 'social-post') {
      // 1080x1080 Instagram/Facebook post
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Soft cream background
      ctx.fillStyle = '#F8F7F5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hero image — draw in top strip if available
      if (heroImg) {
        const imgH = 200;
        const imgY = 90;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(90, imgY, 900, imgH, 16);
        ctx.clip();
        const scale = Math.max(900 / heroImg.width, imgH / heroImg.height);
        const sw = heroImg.width * scale;
        const sh = heroImg.height * scale;
        ctx.drawImage(heroImg, 90 + (900 - sw) / 2, imgY + (imgH - sh) / 2, sw, sh);
        // Darken overlay for legibility
        ctx.fillStyle = '#00000030';
        ctx.fillRect(90, imgY, 900, imgH);
        ctx.restore();
      }
      
      // Large primary circle (decorative element top-left)
      ctx.fillStyle = primaryColor + '15';
      ctx.beginPath();
      ctx.arc(-100, -100, 500, 0, Math.PI * 2);
      ctx.fill();
      
      // Accent circle (decorative element bottom-right)
      ctx.fillStyle = accentColor + '10';
      ctx.beginPath();
      ctx.arc(1180, 1180, 600, 0, Math.PI * 2);
      ctx.fill();
      
      // Central focus area - subtle border
      ctx.strokeStyle = primaryColor + '08';
      ctx.lineWidth = 2;
      ctx.strokeRect(90, 90, 900, 900);
      
      // Business name - large and centered
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 80px serif';
      ctx.textAlign = 'center';
      
      // Wrap business name intelligently
      const maxWidth = 800;
      const words = businessName.split(' ');
      let line = '';
      let lines: string[] = [];
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
      lines.push(line.trim());
      
      // Push text below hero image if present (image occupies Y=90..290)
      const nameStartY = heroImg ? 340 : 280;
      lines.forEach((textLine, index) => {
        ctx.fillText(textLine, 540, nameStartY + (index * 90));
      });
      
      // Small accent line
      const lineY = nameStartY + (lines.length * 90) + 40;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(390, lineY);
      ctx.lineTo(690, lineY);
      ctx.stroke();
      
      // Cat emoji
      ctx.font = '60px sans-serif';
      ctx.fillText('🐱', 540, lineY + 75);
      
      // Tagline
      ctx.font = '38px sans-serif';
      ctx.fillStyle = primaryColor + 'CC';
      
      const taglineWords = tagline.split(' ');
      let taglineLine = '';
      let taglineLines: string[] = [];
      
      taglineWords.forEach(word => {
        const testLine = taglineLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && taglineLine !== '') {
          taglineLines.push(taglineLine.trim());
          taglineLine = word + ' ';
        } else {
          taglineLine = testLine;
        }
      });
      taglineLines.push(taglineLine.trim());
      
      const taglineStartY = lineY + 140;
      taglineLines.forEach((textLine, index) => {
        ctx.fillText(textLine, 540, taglineStartY + (index * 48));
      });
      
      // Website URL
      const urlY = 770;
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = primaryColor;
      ctx.fillText(`${subdomain}.catstays.app`, 540, urlY);

      // Phone number (if available)
      if (phone) {
        ctx.font = '36px sans-serif';
        ctx.fillStyle = primaryColor + 'CC';
        ctx.fillText(`📞 ${phone}`, 540, urlY + 55);
      }
      
      // Call to action
      ctx.font = '32px sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText('Book Your Cat\'s Stay Today', 540, phone ? urlY + 110 : urlY + 60);
      
      // Bottom decorative text
      ctx.font = '24px sans-serif';
      ctx.fillStyle = primaryColor + '30';
      ctx.fillText('Premium Boarding • Daily Updates • Personalized Care', 540, 950);
      
    } else if (type === 'flyer') {
      // 8.5x11 flyer (letter size at 300dpi)
      canvas.width = 2550;
      canvas.height = 3300;
      
      // Background
      ctx.fillStyle = '#F8F7F5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Header section
      const headerGradient = ctx.createLinearGradient(0, 0, 0, 800);
      headerGradient.addColorStop(0, primaryColor);
      headerGradient.addColorStop(1, primaryColor + 'E0');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, canvas.width, 800);
      
      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 140px serif';
      ctx.textAlign = 'center';
      ctx.fillText(businessName, 1275, 350);
      
      // Subtitle
      ctx.font = '72px sans-serif';
      ctx.fillText(tagline, 1275, 520);
      
      // Website URL box
      ctx.fillStyle = accentColor;
      ctx.fillRect(375, 1000, 1800, 300);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 100px monospace';
      ctx.fillText(`${subdomain}.catstays.app`, 1275, 1180);
      
      // Hero image — draw between URL box and features
      if (heroImg) {
        const flyerImgY = 1320;
        const flyerImgH = 240;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(375, flyerImgY, 1800, flyerImgH, 12);
        ctx.clip();
        const scale = Math.max(1800 / heroImg.width, flyerImgH / heroImg.height);
        const sw = heroImg.width * scale;
        const sh = heroImg.height * scale;
        ctx.drawImage(heroImg, 375 + (1800 - sw) / 2, flyerImgY + (flyerImgH - sh) / 2, sw, sh);
        ctx.fillStyle = '#00000020';
        ctx.fillRect(375, flyerImgY, 1800, flyerImgH);
        ctx.restore();
      }

      // Features
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'left';
      const features = [
        '🏠 Private, comfortable rooms',
        '📸 Daily photo updates',
        '💝 Personalized care',
        '🌟 Easy online booking'
      ];
      features.forEach((feature, i) => {
        ctx.fillText(feature, 400, 1600 + i * 180);
      });

      if (phone) {
        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText(`📞 ${phone}`, 400, 2380);
      }
      
      // Bottom section
      ctx.font = 'bold 80px serif';
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'center';
      ctx.fillText('Book Today!', 1275, 2900);
      
    } else if (type === 'business-card') {
      // Standard business card (3.5x2 inches at 300dpi)
      canvas.width = 1050;
      canvas.height = 600;
      
      // Background
      const cardGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      cardGradient.addColorStop(0, primaryColor);
      cardGradient.addColorStop(1, primaryColor + 'E8');
      ctx.fillStyle = cardGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hero image — right side photo strip
      if (heroImg) {
        const cardImgW = 300;
        const cardImgX = canvas.width - cardImgW;
        ctx.save();
        ctx.beginPath();
        ctx.rect(cardImgX, 0, cardImgW, canvas.height);
        ctx.clip();
        const scale = Math.max(cardImgW / heroImg.width, canvas.height / heroImg.height);
        const sw = heroImg.width * scale;
        const sh = heroImg.height * scale;
        ctx.drawImage(heroImg, cardImgX + (cardImgW - sw) / 2, (canvas.height - sh) / 2, sw, sh);
        ctx.fillStyle = primaryColor + '60';
        ctx.fillRect(cardImgX, 0, cardImgW, canvas.height);
        ctx.restore();
      }
      
      // Decorative corner
      ctx.fillStyle = accentColor + '40';
      ctx.beginPath();
      ctx.arc(900, 100, 150, 0, Math.PI * 2);
      ctx.fill();
      
      // Cat emoji
      ctx.font = '80px sans-serif';
      ctx.fillText('🐱', 80, 120);
      
      // Business name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 52px serif';
      ctx.textAlign = 'left';
      ctx.fillText(businessName, 80, 260);
      
      // Tagline
      ctx.fillStyle = '#FFFFFF99';
      ctx.font = '32px sans-serif';
      ctx.fillText(tagline, 80, 310);
      
      // Phone (if available)
      if (phone) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '34px sans-serif';
        ctx.fillText(phone, 80, 400);
      }
      
      // URL
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 38px monospace';
      ctx.fillText(`${subdomain}.catstays.app`, 80, phone ? 470 : 460);
    }
    
    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catstays-${type}-${subdomain}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
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
                {subdomain}.catstays.app
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

          {/* Primary CTA */}
          <Button
            size="lg"
            className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-12 py-7 text-xl shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-200 mb-6"
            onClick={() => window.open(`https://${subdomain}.catstays.app`, '_blank', 'noopener,noreferrer')}
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
            <span className="text-[#0A1128]/20 hidden sm:inline">•</span>
            {isProfessional ? (
              <button 
                className="text-[#C46A3A] hover:text-[#A85A30] hover:underline transition-colors flex items-center gap-2"
                onClick={handleDownloadMaterials}
              >
                <Download className="w-4 h-4" />
                Download marketing materials
              </button>
            ) : (
              <span className="flex items-center gap-2 text-[#0A1128]/40 cursor-default select-none" title="Available on Professional plan">
                <Download className="w-4 h-4" />
                Marketing materials
                <span className="text-xs bg-[#0A1128]/10 px-2 py-0.5 rounded-full font-medium">Professional only</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Kit Generator Section */}
      {isProfessional && businessData && (
        <div>
          <MarketingStudio businessData={businessData} />
        </div>
      )}

      {/* Upgrade prompt for non-Professional subscribers */}
      {!isProfessional && (
        <Card className="border-[#0A1128]/10 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0A1128]/5 flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-[#0A1128]/30" />
            </div>
            <h3 className="text-xl font-semibold text-[#0A1128] mb-2">Marketing Materials Kit</h3>
            <p className="text-[#0A1128]/60 mb-4 max-w-md mx-auto">
              Generate branded social posts, flyers, and business cards pre-filled with your cattery's name, colours, and website URL.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#C46A3A]/10 border border-[#C46A3A]/30 rounded-xl px-5 py-3 text-sm font-medium text-[#C46A3A]">
              Available on Professional — upgrade to unlock
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Marketing Materials Modal */}
      {showMaterialsModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMaterialsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 md:p-10 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-[#0A1128]">Download Marketing Materials</h3>
              <button 
                className="text-[#0A1128]/50 hover:text-[#0A1128] transition-colors"
                onClick={() => setShowMaterialsModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-[#0A1128]/60 mb-6">Choose a material to download. Each graphic is customized with your cattery's website URL.</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] hover:from-[#C46A3A]/20 hover:to-[#F8F7F5] border-2 border-[#C46A3A]/20 hover:border-[#C46A3A]/40 text-[#0A1128] rounded-xl p-5 shadow-lg transition-all"
                onClick={() => handleDownloadGraphic('social-post')}
              >
                <Instagram className="w-8 h-8 text-[#C46A3A] flex-shrink-0" />
                <div className="text-center">
                  <div className="font-semibold">Social Post</div>
                  <div className="text-xs text-[#0A1128]/60">1080x1080px</div>
                </div>
              </button>
              <button 
                className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] hover:from-[#C46A3A]/20 hover:to-[#F8F7F5] border-2 border-[#C46A3A]/20 hover:border-[#C46A3A]/40 text-[#0A1128] rounded-xl p-5 shadow-lg transition-all"
                onClick={() => handleDownloadGraphic('flyer')}
              >
                <FileImage className="w-8 h-8 text-[#C46A3A] flex-shrink-0" />
                <div className="text-center">
                  <div className="font-semibold">Flyer</div>
                  <div className="text-xs text-[#0A1128]/60">Letter size</div>
                </div>
              </button>
              <button 
                className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] hover:from-[#C46A3A]/20 hover:to-[#F8F7F5] border-2 border-[#C46A3A]/20 hover:border-[#C46A3A]/40 text-[#0A1128] rounded-xl p-5 shadow-lg transition-all"
                onClick={() => handleDownloadGraphic('business-card')}
              >
                <FileText className="w-8 h-8 text-[#C46A3A] flex-shrink-0" />
                <div className="text-center">
                  <div className="font-semibold">Business Card</div>
                  <div className="text-xs text-[#0A1128]/60">3.5x2 inches</div>
                </div>
              </button>
              <button 
                className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] hover:from-[#C46A3A]/20 hover:to-[#F8F7F5] border-2 border-[#C46A3A]/20 hover:border-[#C46A3A]/40 text-[#0A1128] rounded-xl p-5 shadow-lg transition-all"
                onClick={() => {
                  // Copy text for Instagram caption
                  const caption = `🐱 Your cat deserves the best! Book their luxury stay at ${subdomain}.catstays.app\n\n✨ Premium cat boarding\n📸 Daily photo updates\n🏠 Private, comfortable rooms\n💝 Personalized care\n\nBook today! Link in bio 👆`;
                  navigator.clipboard.writeText(caption);
                }}
              >
                <Palette className="w-8 h-8 text-[#C46A3A] flex-shrink-0" />
                <div className="text-center">
                  <div className="font-semibold">IG Caption</div>
                  <div className="text-xs text-[#0A1128]/60">Copy text</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}