import { useState, useRef, useEffect } from 'react';
import { Download, Eye, FileText, CreditCard, Instagram, Share2, Sparkles, Image as ImageIcon, Wand2, X, Upload, Palette, Star, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface MarketingStudioProps {
  businessData: {
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
    roomTypes?: Array<{
      name: string;
      numberOfRooms: string;
      maxCatsPerRoom: string;
    }>;
    servicesData?: any;
  };
}

interface MarketingAsset {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: 'flyer' | 'business-card' | 'social-post' | 'story-pack' | 'share-card' | 'review-card';
  format: string;
  size?: string;
}

interface AssetCustomization {
  headline?: string;
  subheadline?: string;
  primaryColor?: string;
  accentColor?: string;
  imageUrl?: string;
  layoutStyle?: 'minimal' | 'premium' | 'playful';
}

const marketingAssets: MarketingAsset[] = [
  {
    id: 'social-post',
    title: 'Instagram Post',
    description: 'Premium square post for Instagram & Facebook',
    icon: Instagram,
    type: 'social-post',
    format: 'PNG',
    size: '1080x1080'
  },
  {
    id: 'story-pack',
    title: 'Story Slides',
    description: 'Swipeable story sequence for Instagram',
    icon: ImageIcon,
    type: 'story-pack',
    format: 'PNG',
    size: '4 slides'
  },
  {
    id: 'flyer',
    title: 'Print Flyer',
    description: 'For vet clinics, pet shops & community boards',
    icon: FileText,
    type: 'flyer',
    format: 'PDF',
    size: 'A4 Print'
  },
  {
    id: 'share-card',
    title: 'Share Card',
    description: 'Facebook & WhatsApp optimized sharing image',
    icon: Share2,
    type: 'share-card',
    format: 'PNG',
    size: '1200x630'
  },
  {
    id: 'business-card',
    title: 'Business Card',
    description: 'Professional cards for customers & partners',
    icon: CreditCard,
    type: 'business-card',
    format: 'PDF',
    size: '3.5x2"'
  },
  {
    id: 'review-card',
    title: 'Google Review Card',
    description: 'Encourage customers to leave 5-star reviews',
    icon: Star,
    type: 'review-card',
    format: 'PNG',
    size: '1080x1350'
  }
];

// Cat image URLs from Unsplash - curated premium images
const catImages = [
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=1200&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=1200&h=1200&fit=crop'
];

export function MarketingStudio({ businessData }: MarketingStudioProps) {
  const [selectedAsset, setSelectedAsset] = useState<MarketingAsset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, AssetCustomization>>({});

  const handlePreview = (asset: MarketingAsset) => {
    setSelectedAsset(asset);
    setShowPreview(true);
    setIsEditing(false);
  };

  const handleEdit = (asset: MarketingAsset) => {
    setSelectedAsset(asset);
    setShowPreview(true);
    setIsEditing(true);
  };

  const handleDownload = async (asset: MarketingAsset) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const customization = customizations[asset.id] || {};
    const primaryColor = customization.primaryColor || businessData.primaryColor;
    const accentColor = customization.accentColor || businessData.accentColor;
    
    await generateAssetCanvas(canvas, ctx, asset, businessData, customization);
    
    // Download the canvas as PNG
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessData.subdomain}-${asset.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C46A3A] to-[#A85A30] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-semibold text-[#0A1128] mb-2">
            Marketing Studio
          </h3>
          <p className="text-[#0A1128]/70 max-w-xl mx-auto">
            Professional, editable marketing materials designed for your cattery. Edit with AI, customize colors, and download print-ready files.
          </p>
        </div>

        {/* Marketing Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketingAssets.map((asset) => (
            <Card
              key={asset.id}
              className="border-[#0A1128]/10 hover:border-[#C46A3A]/30 transition-all hover:shadow-lg group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A1128]/5 to-[#C46A3A]/5 flex items-center justify-center group-hover:from-[#C46A3A]/10 group-hover:to-[#A85A30]/10 transition-colors">
                    <asset.icon className="w-6 h-6 text-[#C46A3A]" />
                  </div>
                  <Badge variant="outline" className="text-xs border-[#0A1128]/20 text-[#0A1128]/60">
                    {asset.format}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-[#0A1128]">
                  {asset.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[#0A1128]/60 leading-relaxed">
                  {asset.description}
                </p>
                {asset.size && (
                  <p className="text-xs text-[#0A1128]/50">
                    {asset.size}
                  </p>
                )}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(asset)}
                      className="flex-1 border-[#0A1128]/20 hover:border-[#C46A3A] hover:bg-[#C46A3A]/5 gap-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(asset)}
                      className="flex-1 bg-[#C46A3A] hover:bg-[#A85A30] text-white gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(asset)}
                    className="w-full border-[#C46A3A]/30 hover:border-[#C46A3A] hover:bg-[#C46A3A]/5 gap-2"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    ✨ Edit with AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-[#C46A3A]/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#C46A3A]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0A1128] mb-1">
                  AI-Powered & Fully Customizable
                </h4>
                <p className="text-sm text-[#0A1128]/70 leading-relaxed">
                  Each asset uses real images, your business information, and premium design. 
                  Use "Edit with AI" to customize headlines, colors, images, and layout styles instantly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview/Edit Modal */}
      {showPreview && selectedAsset && (
        <AssetPreviewEditor
          asset={selectedAsset}
          businessData={businessData}
          isEditing={isEditing}
          customization={customizations[selectedAsset.id] || {}}
          onClose={() => {
            setShowPreview(false);
            setSelectedAsset(null);
            setIsEditing(false);
          }}
          onDownload={() => handleDownload(selectedAsset)}
          onSaveCustomization={(customization) => {
            setCustomizations({
              ...customizations,
              [selectedAsset.id]: customization
            });
          }}
        />
      )}
    </>
  );
}

// Helper function to generate canvas for each asset type
async function generateAssetCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  asset: MarketingAsset,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization
) {
  const primaryColor = customization.primaryColor || businessData.primaryColor;
  const accentColor = customization.accentColor || businessData.accentColor;
  const layoutStyle = customization.layoutStyle || 'premium';
  
  // Get a random cat image or use customized one
  const catImageUrl = customization.imageUrl || catImages[Math.floor(Math.random() * catImages.length)];
  
  switch (asset.type) {
    case 'social-post':
      await generateSocialPost(canvas, ctx, businessData, customization, catImageUrl, primaryColor, accentColor);
      break;
    case 'review-card':
      await generateReviewCard(canvas, ctx, businessData, customization, primaryColor, accentColor);
      break;
    case 'flyer':
      await generateFlyer(canvas, ctx, businessData, customization, catImageUrl, primaryColor, accentColor);
      break;
    case 'business-card':
      await generateBusinessCard(canvas, ctx, businessData, customization, primaryColor, accentColor);
      break;
    case 'share-card':
      await generateShareCard(canvas, ctx, businessData, customization, catImageUrl, primaryColor, accentColor);
      break;
    case 'story-pack':
      await generateStoryPack(canvas, ctx, businessData, customization, catImageUrl, primaryColor, accentColor);
      break;
    // Add other types as needed
  }
}

async function generateSocialPost(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization,
  catImageUrl: string,
  primaryColor: string,
  accentColor: string
) {
  canvas.width = 1080;
  canvas.height = 1080;
  
  // Load and draw background image - full bleed
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = catImageUrl;
  });
  
  // Calculate scaling to cover entire canvas
  const imgAspect = img.width / img.height;
  const canvasAspect = 1;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (imgAspect > canvasAspect) {
    // Image is wider - fit to height
    drawHeight = 1080;
    drawWidth = 1080 * imgAspect;
    offsetX = -(drawWidth - 1080) / 2;
  } else {
    // Image is taller - fit to width
    drawWidth = 1080;
    drawHeight = 1080 / imgAspect;
    offsetY = -(drawHeight - 1080) / 2;
  }
  
  // Draw full bleed image
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  
  // Strong gradient overlay for contrast and readability
  // Darker at top and bottom, lighter in middle for dynamic feel
  const topGradient = ctx.createLinearGradient(0, 0, 0, 400);
  topGradient.addColorStop(0, `${primaryColor}DD`);
  topGradient.addColorStop(1, 'rgba(10, 17, 40, 0)');
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, 1080, 400);
  
  const bottomGradient = ctx.createLinearGradient(0, 680, 0, 1080);
  bottomGradient.addColorStop(0, 'rgba(10, 17, 40, 0)');
  bottomGradient.addColorStop(0.5, `${accentColor}99`);
  bottomGradient.addColorStop(1, `${accentColor}EE`);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, 680, 1080, 400);
  
  // Center vignette for depth
  const centerGradient = ctx.createRadialGradient(540, 540, 200, 540, 540, 700);
  centerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  centerGradient.addColorStop(1, 'rgba(10, 17, 40, 0.4)');
  ctx.fillStyle = centerGradient;
  ctx.fillRect(0, 0, 1080, 1080);
  
  // --- TOP CORNER: Logo Badge ---
  // Circular badge with business initial
  ctx.save();
  
  // Soft shadow for badge
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  
  // Badge background - white circle
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(920, 160, 70, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Badge border - brand color
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(920, 160, 70, 0, Math.PI * 2);
  ctx.stroke();
  
  // Business initial in badge
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 56px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initial = (customization.headline || businessData.businessName).charAt(0).toUpperCase();
  ctx.fillText(initial, 920, 160);
  
  ctx.restore();
  
  // --- CENTER: Main Content ---
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // BIG HEADLINE - with strong shadow for readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 4;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 108px serif';
  const headline = customization.headline || 'Now Taking Bookings';
  
  // Word wrap headline if needed
  const headlineWords = headline.split(' ');
  if (headlineWords.length <= 3) {
    ctx.fillText(headline, 540, 480);
  } else {
    // Split into two lines
    const mid = Math.ceil(headlineWords.length / 2);
    const line1 = headlineWords.slice(0, mid).join(' ');
    const line2 = headlineWords.slice(mid).join(' ');
    ctx.fillText(line1, 540, 440);
    ctx.fillText(line2, 540, 560);
  }
  
  // Subtext - emotional tagline
  ctx.font = '48px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  const subtext = customization.subheadline || 'Safe, loving care for your cat';
  ctx.fillText(subtext, 540, 640);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // --- CTA BUTTON ---
  const buttonY = 740;
  const buttonWidth = 380;
  const buttonHeight = 90;
  const buttonX = (1080 - buttonWidth) / 2;
  
  // Button shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 8;
  
  // Button background - solid white for maximum contrast
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 45);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Button text
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Book Now', 540, buttonY + 45);
  
  // Small arrow icon after text
  ctx.font = '48px sans-serif';
  ctx.fillText('→', 680, buttonY + 45);
  
  // --- BOTTOM: Website URL ---
  // Frosted glass effect bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 930, 1080, 150);
  
  // Website URL
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 15;
  ctx.fillText(`${businessData.subdomain}.catstays.com`, 540, 1000);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Small feature icons/text at very bottom
  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillText('📸 Daily Updates  •  🏠 Private Rooms  •  💝 Expert Care', 540, 1050);
}

async function generateReviewCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization,
  primaryColor: string,
  accentColor: string
) {
  canvas.width = 1080;
  canvas.height = 1350;
  
  // Warm, friendly background - soft gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, 1350);
  bgGradient.addColorStop(0, '#FFFBF7'); // Very light warm cream
  bgGradient.addColorStop(1, '#FFF3E8'); // Slightly warmer at bottom
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1080, 1350);
  
  // Decorative top arc - soft accent color
  ctx.fillStyle = `${accentColor}15`;
  ctx.beginPath();
  ctx.arc(540, -200, 600, 0, Math.PI);
  ctx.fill();
  
  // --- TOP: Star Rating Visual ---
  ctx.font = '140px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⭐⭐⭐⭐⭐', 540, 280);
  
  // --- CENTER: Main Content ---
  
  // Headline - Friendly, conversational
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 86px serif';
  ctx.textBaseline = 'middle';
  const headline = customization.headline || 'Loved your stay?';
  ctx.fillText(headline, 540, 480);
  
  // Subtext - Trust-building
  ctx.font = '38px sans-serif';
  ctx.fillStyle = `${primaryColor}BB`;
  ctx.fillText('Help others find a safe home', 540, 600);
  ctx.fillText('for their cat', 540, 655);
  
  // Small cat emoji for warmth
  ctx.font = '56px sans-serif';
  ctx.fillText('🐱', 540, 750);
  
  // --- CTA BUTTON - Friendly, inviting ---
  const buttonX = 290;
  const buttonY = 840;
  const buttonWidth = 500;
  const buttonHeight = 90;
  
  // Button shadow - soft for friendly feel
  ctx.shadowColor = 'rgba(196, 106, 58, 0.25)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 8;
  
  // Button gradient - warm, inviting
  const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
  buttonGradient.addColorStop(0, accentColor);
  buttonGradient.addColorStop(1, '#A85A30');
  ctx.fillStyle = buttonGradient;
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 45);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Button text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Leave a Review', 540, buttonY + 45);
  
  // Small arrow
  ctx.font = '40px sans-serif';
  ctx.fillText('→', 710, buttonY + 45);
  
  // --- BOTTOM: Google Branding ---
  
  // Subtle divider line
  ctx.strokeStyle = `${primaryColor}20`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 1000);
  ctx.lineTo(840, 1000);
  ctx.stroke();
  
  // "Review us on" text
  ctx.fillStyle = `${primaryColor}99`;
  ctx.font = '32px sans-serif';
  ctx.fillText('Review us on', 540, 1070);
  
  // Google logo placeholder (large G with colors suggestion)
  // Since we can't easily draw the multicolor Google logo, we'll use a styled "G" and "Google"
  
  // Google-style text
  ctx.font = 'bold 72px sans-serif';
  ctx.fillStyle = '#4285F4'; // Google blue
  ctx.fillText('G', 450, 1160);
  
  ctx.fillStyle = '#EA4335'; // Google red
  ctx.fillText('o', 495, 1160);
  
  ctx.fillStyle = '#FBBC05'; // Google yellow
  ctx.fillText('o', 535, 1160);
  
  ctx.fillStyle = '#4285F4'; // Google blue
  ctx.fillText('g', 575, 1160);
  
  ctx.fillStyle = '#34A853'; // Google green
  ctx.fillText('l', 615, 1160);
  
  ctx.fillStyle = '#EA4335'; // Google red
  ctx.fillText('e', 640, 1160);
  
  // Business name below
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 42px serif';
  ctx.fillText(businessData.businessName, 540, 1240);
  
  // Optional: QR code placeholder for future enhancement
  // Small text hint at bottom
  ctx.fillStyle = `${primaryColor}66`;
  ctx.font = '24px sans-serif';
  ctx.fillText('Scan QR code (coming soon) or search our name', 540, 1310);
}

async function generateFlyer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization,
  catImageUrl: string,
  primaryColor: string,
  accentColor: string
) {
  // A4 size at 150 DPI for print quality (1240 x 1754 pixels)
  canvas.width = 1240;
  canvas.height = 1754;
  
  // Background - soft cream
  ctx.fillStyle = '#F8F7F5';
  ctx.fillRect(0, 0, 1240, 1754);
  
  // Load and draw hero image (Top 40%)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = catImageUrl;
  });
  
  const heroHeight = 1754 * 0.4; // 701 pixels
  
  // Draw hero image - cover the top section
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, 1240, heroHeight, [0, 0, 40, 40]);
  ctx.clip();
  
  // Calculate scaling to cover the hero area
  const imgAspect = img.width / img.height;
  const heroAspect = 1240 / heroHeight;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (imgAspect > heroAspect) {
    // Image is wider - fit to height
    drawHeight = heroHeight;
    drawWidth = heroHeight * imgAspect;
    offsetX = -(drawWidth - 1240) / 2;
  } else {
    // Image is taller - fit to width
    drawWidth = 1240;
    drawHeight = 1240 / imgAspect;
    offsetY = -(drawHeight - heroHeight) / 2;
  }
  
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  ctx.restore();
  
  // Warm gradient overlay on hero image
  const gradient = ctx.createLinearGradient(0, 0, 0, heroHeight);
  gradient.addColorStop(0, `${primaryColor}40`);
  gradient.addColorStop(0.5, `${primaryColor}20`);
  gradient.addColorStop(1, `${accentColor}60`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1240, heroHeight);
  
  // Business name over hero image
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 92px serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 30;
  const headline = customization.headline || businessData.businessName;
  ctx.fillText(headline, 620, 320);
  
  // Tagline over hero
  ctx.font = '48px sans-serif';
  const tagline = customization.subheadline || businessData.heroSubheading || 'Premium Cat Boarding & Care';
  ctx.fillText(tagline, 620, 400);
  
  // Decorative cat emoji
  ctx.font = '72px sans-serif';
  ctx.fillText('🐱', 620, 550);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // --- MIDDLE SECTION: Two-column layout ---
  const contentY = heroHeight + 80;
  const padding = 80;
  const columnGap = 60;
  const columnWidth = (1240 - (padding * 2) - columnGap) / 2;
  
  // LEFT COLUMN: About Us
  ctx.textAlign = 'left';
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 42px serif';
  ctx.fillText('About Us', padding, contentY);
  
  // About text
  ctx.font = '28px sans-serif';
  ctx.fillStyle = `${primaryColor}CC`;
  const aboutText = businessData.aboutText || 
    'We provide a safe, loving home for your cat while you\'re away. Every cat gets individual attention, daily updates, and premium care in our boutique cattery.';
  
  // Word wrap about text
  const words = aboutText.split(' ');
  let line = '';
  let y = contentY + 60;
  const lineHeight = 42;
  const maxWidth = columnWidth;
  
  words.forEach((word, index) => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), padding, y);
      line = word + ' ';
      y += lineHeight;
      
      // Limit to 6 lines
      if (y > contentY + 60 + (lineHeight * 5)) {
        return;
      }
    } else {
      line = testLine;
    }
    
    // Last word
    if (index === words.length - 1) {
      ctx.fillText(line.trim(), padding, y);
    }
  });
  
  // RIGHT COLUMN: Services
  const rightColX = padding + columnWidth + columnGap;
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 42px serif';
  ctx.fillText('Our Services', rightColX, contentY);
  
  // Services list with icons
  const services = [
    '🏠 Luxury Boarding',
    '📸 Daily Photo Updates',
    '💝 Personalized Care',
    '🩺 Medication Support',
    '🎮 Playtime & Exercise',
    '✨ Premium Amenities'
  ];
  
  ctx.font = '30px sans-serif';
  ctx.fillStyle = `${primaryColor}DD`;
  let serviceY = contentY + 70;
  
  services.forEach((service) => {
    ctx.fillText(service, rightColX, serviceY);
    serviceY += 56;
  });
  
  // --- ROOMS & FACILITIES SECTION ---
  const roomsY = contentY + 420;
  
  // Soft rounded background card
  ctx.fillStyle = `${accentColor}15`;
  ctx.beginPath();
  ctx.roundRect(padding, roomsY, 1240 - (padding * 2), 180, 24);
  ctx.fill();
  
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 38px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Our Facilities', 620, roomsY + 50);
  
  // Room types
  ctx.font = '28px sans-serif';
  ctx.fillStyle = `${primaryColor}CC`;
  const roomInfo = businessData.roomTypes && businessData.roomTypes.length > 0
    ? businessData.roomTypes.map(r => `${r.name} (${r.numberOfRooms} rooms)`).join(' • ')
    : 'Private Rooms • Luxury Suites • Group Play Areas';
  ctx.fillText(roomInfo, 620, roomsY + 100);
  
  // Amenities
  ctx.font = '26px sans-serif';
  ctx.fillStyle = `${primaryColor}99`;
  ctx.fillText('Climate Controlled • Secure • Spotlessly Clean', 620, roomsY + 145);
  
  // --- PRICING SECTION ---
  const pricingY = roomsY + 240;
  
  // Gradient pricing card with soft shadow
  const pricingGradient = ctx.createLinearGradient(300, pricingY, 940, pricingY + 140);
  pricingGradient.addColorStop(0, accentColor);
  pricingGradient.addColorStop(1, `${accentColor}DD`);
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  
  ctx.fillStyle = pricingGradient;
  ctx.beginPath();
  ctx.roundRect(300, pricingY, 640, 140, 20);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Pricing text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Starting From', 620, pricingY + 50);
  
  const priceText = businessData.pricePerNight ? `$${businessData.pricePerNight}` : '$35';
  ctx.font = 'bold 68px serif';
  ctx.fillText(priceText, 620, pricingY + 110);
  
  ctx.font = '28px sans-serif';
  ctx.fillText('per night', 780, pricingY + 110);
  
  // --- CALL TO ACTION ---
  const ctaY = pricingY + 220;
  
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 56px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Book Your Cat\'s Stay Today', 620, ctaY);
  
  // Website URL - prominent
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(220, ctaY + 30, 800, 100);
  
  // Border for URL box
  ctx.strokeStyle = `${accentColor}40`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(220, ctaY + 30, 800, 100, 16);
  ctx.stroke();
  
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(`${businessData.subdomain}.catstays.com`, 620, ctaY + 95);
  
  // --- FOOTER ---
  const footerY = 1754 - 140;
  
  // Soft footer background
  ctx.fillStyle = `${primaryColor}08`;
  ctx.fillRect(0, footerY - 20, 1240, 160);
  
  // Contact details
  ctx.fillStyle = `${primaryColor}AA`;
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'center';
  
  const contactDetails = [];
  if (businessData.phone) contactDetails.push(`📞 ${businessData.phone}`);
  if (businessData.email) contactDetails.push(`✉️ ${businessData.email}`);
  if (businessData.address) contactDetails.push(`📍 ${businessData.address}`);
  
  if (contactDetails.length > 0) {
    const contactLine = contactDetails.join('  •  ');
    ctx.fillText(contactLine, 620, footerY + 30);
  }
  
  // Bottom tagline
  ctx.font = '24px sans-serif';
  ctx.fillStyle = `${primaryColor}66`;
  ctx.fillText('Where Every Cat is Treated Like Family', 620, footerY + 80);
}

async function generateBusinessCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization,
  primaryColor: string,
  accentColor: string
) {
  // Standard business card size at 300 DPI (3.5" × 2")
  canvas.width = 1050;
  canvas.height = 600;
  
  // --- ELEGANT CREAM BACKGROUND ---
  ctx.fillStyle = '#F8F7F5';
  ctx.fillRect(0, 0, 1050, 600);
  
  // --- LEFT SIDE: Decorative Accent Panel (30% width) ---
  const accentWidth = 315; // 30% of 1050
  
  // Gradient accent panel - sophisticated vertical gradient
  const accentGradient = ctx.createLinearGradient(0, 0, 0, 600);
  accentGradient.addColorStop(0, accentColor);
  accentGradient.addColorStop(0.5, `${accentColor}F0`);
  accentGradient.addColorStop(1, accentColor);
  ctx.fillStyle = accentGradient;
  ctx.fillRect(0, 0, accentWidth, 600);
  
  // Subtle decorative pattern overlay on accent panel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(accentWidth / 2, 100 + (i * 100), 40, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // --- CAT SILHOUETTE ICON ---
  // Elegant cat icon in white
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  
  // Cat icon at top of accent panel
  ctx.font = '110px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐱', accentWidth / 2, 130);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.restore();
  
  // Decorative flourish below cat
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(accentWidth / 2 - 60, 210);
  ctx.lineTo(accentWidth / 2 + 60, 210);
  ctx.stroke();
  
  // Small paw prints decoration
  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.textAlign = 'center';
  ctx.fillText('🐾', accentWidth / 2 - 40, 480);
  ctx.fillText('🐾', accentWidth / 2 + 40, 520);
  
  // Boutique tagline on accent panel
  ctx.font = 'italic 18px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.fillText('Boutique', accentWidth / 2, 260);
  ctx.fillText('Cat Boarding', accentWidth / 2, 285);
  
  // --- RIGHT SIDE: Business Information ---
  const contentX = accentWidth + 60; // Padding from accent panel
  const contentWidth = 1050 - accentWidth - 60;
  
  // Business Name - Elegant serif
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 56px serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // Handle long business names by wrapping
  const businessName = businessData.businessName;
  const maxNameWidth = contentWidth - 40;
  let nameY = 80;
  
  if (ctx.measureText(businessName).width > maxNameWidth) {
    // Split business name into words and wrap
    const words = businessName.split(' ');
    let line = '';
    
    words.forEach((word, i) => {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxNameWidth && line !== '') {
        ctx.fillText(line.trim(), contentX, nameY);
        line = word + ' ';
        nameY += 60;
      } else {
        line = testLine;
      }
      
      if (i === words.length - 1) {
        ctx.fillText(line.trim(), contentX, nameY);
      }
    });
    nameY += 70; // Space after wrapped name
  } else {
    ctx.fillText(businessName, contentX, nameY);
    nameY += 85; // Space after single-line name
  }
  
  // Elegant divider line
  ctx.strokeStyle = `${accentColor}40`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(contentX, nameY);
  ctx.lineTo(1050 - 40, nameY);
  ctx.stroke();
  
  // Tagline - italicized
  ctx.fillStyle = `${primaryColor}CC`;
  ctx.font = 'italic 24px serif';
  const tagline = customization.subheadline || businessData.heroSubheading || 'Premium Cat Boarding & Care';
  ctx.fillText(tagline, contentX, nameY + 25);
  
  // --- CONTACT DETAILS SECTION ---
  const contactY = nameY + 90;
  ctx.fillStyle = primaryColor;
  ctx.font = '22px sans-serif';
  ctx.textBaseline = 'top';
  
  let currentY = contactY;
  const lineSpacing = 38;
  
  // Phone
  if (businessData.phone) {
    ctx.fillText(`☎  ${businessData.phone}`, contentX, currentY);
    currentY += lineSpacing;
  }
  
  // Email
  if (businessData.email) {
    ctx.font = '20px sans-serif'; // Slightly smaller for email
    ctx.fillText(`✉  ${businessData.email}`, contentX, currentY);
    currentY += lineSpacing;
    ctx.font = '22px sans-serif'; // Back to normal
  }
  
  // Address (if available)
  if (businessData.address) {
    ctx.fillText(`📍 ${businessData.address}`, contentX, currentY);
    currentY += lineSpacing;
  }
  
  // --- WEBSITE - PROMINENT ---
  const websiteY = 600 - 95;
  
  // Website background highlight
  ctx.fillStyle = `${accentColor}15`;
  ctx.beginPath();
  ctx.roundRect(contentX - 10, websiteY - 10, contentWidth - 30, 65, 12);
  ctx.fill();
  
  // Website text
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 28px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🌐 ${businessData.subdomain}.catstays.com`, contentX + 8, websiteY + 22);
  
  // --- SUBTLE BORDER FRAME ---
  ctx.strokeStyle = `${primaryColor}20`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(8, 8, 1034, 584, 12);
  ctx.stroke();
  
  // Corner flourishes for elegance
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(1050 - 50, 20);
  ctx.lineTo(1050 - 20, 20);
  ctx.lineTo(1050 - 20, 50);
  ctx.stroke();
  
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(1050 - 50, 580);
  ctx.lineTo(1050 - 20, 580);
  ctx.lineTo(1050 - 20, 550);
  ctx.stroke();
}

async function generateShareCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization,
  catImageUrl: string,
  primaryColor: string,
  accentColor: string
) {
  canvas.width = 1200;
  canvas.height = 630;
  
  // Load and draw background image - full bleed
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = catImageUrl;
  });
  
  // Calculate scaling to cover entire canvas
  const imgAspect = img.width / img.height;
  const canvasAspect = 1200 / 630;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (imgAspect > canvasAspect) {
    drawHeight = 630;
    drawWidth = 630 * imgAspect;
    offsetX = -(drawWidth - 1200) / 2;
  } else {
    drawWidth = 1200;
    drawHeight = 1200 / imgAspect;
    offsetY = -(drawHeight - 630) / 2;
  }
  
  // Draw full bleed image
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  
  // Dynamic gradient overlay - diagonal for energy
  const gradientAngle = ctx.createLinearGradient(0, 0, 1200, 630);
  gradientAngle.addColorStop(0, `${primaryColor}E6`);
  gradientAngle.addColorStop(0.5, `${primaryColor}99`);
  gradientAngle.addColorStop(1, `${accentColor}CC`);
  ctx.fillStyle = gradientAngle;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Vignette for depth
  const vignette = ctx.createRadialGradient(600, 315, 200, 600, 315, 600);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(10, 17, 40, 0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1200, 630);
  
  // --- TOP CORNER: Logo Badge ---
  ctx.save();
  
  // Badge shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  
  // Badge background - white circle
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(100, 80, 50, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Badge border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(100, 80, 50, 0, Math.PI * 2);
  ctx.stroke();
  
  // Business initial
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 42px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initial = (customization.headline || businessData.businessName).charAt(0).toUpperCase();
  ctx.fillText(initial, 100, 80);
  
  ctx.restore();
  
  // --- CENTER LEFT: Main Content (asymmetric, ad-style) ---
  const contentStartX = 80;
  const contentStartY = 220;
  
  ctx.textAlign = 'left';
  
  // Eyebrow text - small accent
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.globalAlpha = 0.9;
  ctx.fillText('PREMIUM CAT BOARDING', contentStartX, contentStartY - 40);
  ctx.globalAlpha = 1;
  
  // Small accent line
  ctx.fillStyle = accentColor;
  ctx.fillRect(contentStartX, contentStartY - 25, 80, 4);
  
  // BIG HEADLINE - Left aligned, dynamic
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 3;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 68px serif';
  const headline = customization.headline || 'A home away from';
  ctx.fillText(headline, contentStartX, contentStartY);
  
  ctx.font = 'bold 68px serif';
  const headline2 = 'home for your cat';
  ctx.fillText(headline2, contentStartX, contentStartY + 75);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Subtext - benefits
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '28px sans-serif';
  ctx.globalAlpha = 0.95;
  ctx.fillText('✓ Daily photo updates', contentStartX, contentStartY + 150);
  ctx.fillText('✓ Expert care', contentStartX, contentStartY + 190);
  ctx.fillText('✓ Safe & comfortable', contentStartX, contentStartY + 230);
  ctx.globalAlpha = 1;
  
  // --- CTA BUTTON - prominent, clickable style ---
  const buttonX = contentStartX;
  const buttonY = contentStartY + 280;
  const buttonWidth = 260;
  const buttonHeight = 70;
  
  // Button shadow - strong for clickable feel
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  
  // Button background - solid white
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 35);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Button text
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Book Now', buttonX + 40, buttonY + 35);
  
  // Arrow icon
  ctx.font = '32px sans-serif';
  ctx.fillText('→', buttonX + 200, buttonY + 35);
  
  // Hover indicator - subtle pulse effect suggestion
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.roundRect(buttonX - 4, buttonY - 4, buttonWidth + 8, buttonHeight + 8, 37);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // --- BOTTOM: Website URL bar ---
  // Frosted glass bar
  ctx.fillStyle = 'rgba(10, 17, 40, 0.5)';
  ctx.fillRect(0, 530, 1200, 100);
  
  // Glass blur effect simulation - gradient
  const glassGradient = ctx.createLinearGradient(0, 530, 0, 630);
  glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = glassGradient;
  ctx.fillRect(0, 530, 1200, 100);
  
  // Website URL - prominent
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 15;
  ctx.fillText(`${businessData.subdomain}.catstays.com`, 600, 585);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Trust badges/icons
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'left';
  ctx.fillText('⭐ 5-Star Care', 80, 600);
  
  ctx.textAlign = 'right';
  ctx.fillText('Book Online 24/7 →', 1120, 600);
}

async function generateStoryPack(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  businessData: MarketingStudioProps['businessData'],
  customization: AssetCustomization,
  catImageUrl: string,
  primaryColor: string,
  accentColor: string
) {
  // Story dimensions: 1080x1920 (9:16)
  // We'll create 4 slides side by side for preview (4320x1920)
  canvas.width = 4320; // 1080 * 4
  canvas.height = 1920;
  
  // Load hero image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = catImageUrl;
  });
  
  // --- SLIDE 1: Hero image + logo + name ---
  const slide1X = 0;
  
  // Draw full-bleed hero image
  const imgAspect = img.width / img.height;
  const slideAspect = 1080 / 1920;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (imgAspect > slideAspect) {
    drawHeight = 1920;
    drawWidth = 1920 * imgAspect;
    offsetX = -(drawWidth - 1080) / 2;
  } else {
    drawWidth = 1080;
    drawHeight = 1080 / imgAspect;
    offsetY = -(drawHeight - 1920) / 2;
  }
  
  ctx.save();
  ctx.translate(slide1X, 0);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  
  // Gradient overlay - darker at bottom
  const slide1Gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  slide1Gradient.addColorStop(0, 'rgba(10, 17, 40, 0.2)');
  slide1Gradient.addColorStop(0.6, 'rgba(10, 17, 40, 0.4)');
  slide1Gradient.addColorStop(1, `${primaryColor}DD`);
  ctx.fillStyle = slide1Gradient;
  ctx.fillRect(0, 0, 1080, 1920);
  
  // Logo badge at top
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(540, 200, 90, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(540, 200, 90, 0, Math.PI * 2);
  ctx.stroke();
  
  // Business initial
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 72px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initial = (customization.headline || businessData.businessName).charAt(0).toUpperCase();
  ctx.fillText(initial, 540, 200);
  
  // Business name at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 92px serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  const businessName = customization.headline || businessData.businessName;
  ctx.fillText(businessName, 540, 1600);
  
  // Tagline
  ctx.font = '48px sans-serif';
  const tagline = customization.subheadline || businessData.heroSubheading || 'Premium Cat Boarding';
  ctx.fillText(tagline, 540, 1700);
  
  // Cat emoji
  ctx.font = '80px sans-serif';
  ctx.shadowBlur = 20;
  ctx.fillText('🐱', 540, 1820);
  
  ctx.restore();
  
  // --- SLIDE 2: What We Offer ---
  const slide2X = 1080;
  
  ctx.save();
  ctx.translate(slide2X, 0);
  
  // Background - gradient from primary to accent
  const slide2Gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  slide2Gradient.addColorStop(0, primaryColor);
  slide2Gradient.addColorStop(1, accentColor);
  ctx.fillStyle = slide2Gradient;
  ctx.fillRect(0, 0, 1080, 1920);
  
  // Pattern overlay for texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 1080; i += 40) {
    ctx.fillRect(i, 0, 20, 1920);
  }
  
  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 96px serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 20;
  ctx.fillText('What We Offer', 540, 280);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Services with icons - centered, large, readable
  const services = [
    { icon: '🏠', text: 'Luxury Boarding', subtext: 'Private & comfortable' },
    { icon: '📸', text: 'Daily Updates', subtext: 'See your cat every day' },
    { icon: '💝', text: 'Personalized Care', subtext: 'Individual attention' },
    { icon: '🩺', text: 'Health Support', subtext: 'Medication & special needs' },
    { icon: '🎮', text: 'Play & Exercise', subtext: 'Active & engaged' },
    { icon: '✨', text: 'Premium Comfort', subtext: 'Five-star amenities' }
  ];
  
  let serviceY = 450;
  const serviceSpacing = 240;
  
  services.forEach((service) => {
    // Service card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(80, serviceY - 80, 920, 200, 20);
    ctx.fill();
    
    // Icon
    ctx.font = '72px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(service.icon, 140, serviceY + 10);
    
    // Service text
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(service.text, 260, serviceY - 10);
    
    // Subtext
    ctx.font = '32px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(service.subtext, 260, serviceY + 45);
    
    serviceY += serviceSpacing;
  });
  
  ctx.restore();
  
  // --- SLIDE 3: Rooms Preview ---
  const slide3X = 2160;
  
  ctx.save();
  ctx.translate(slide3X, 0);
  
  // Background - cream
  ctx.fillStyle = '#F8F7F5';
  ctx.fillRect(0, 0, 1080, 1920);
  
  // Title
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 96px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Our Rooms', 540, 220);
  
  // Subtitle
  ctx.font = '42px sans-serif';
  ctx.fillStyle = `${primaryColor}CC`;
  ctx.fillText('Comfort & Safety', 540, 300);
  
  // Room image 1 - top (reuse hero image as room example)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(80, 400, 920, 580, 24);
  ctx.clip();
  
  // Draw image scaled
  const room1Aspect = img.width / img.height;
  const room1FrameAspect = 920 / 580;
  let room1W, room1H, room1X = 80, room1Y = 400;
  
  if (room1Aspect > room1FrameAspect) {
    room1H = 580;
    room1W = 580 * room1Aspect;
    room1X = 80 - (room1W - 920) / 2;
  } else {
    room1W = 920;
    room1H = 920 / room1Aspect;
    room1Y = 400 - (room1H - 580) / 2;
  }
  
  ctx.drawImage(img, room1X, room1Y, room1W, room1H);
  ctx.restore();
  
  // Room label 1
  ctx.fillStyle = accentColor;
  ctx.fillRect(120, 900, 280, 60);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Private Suite', 140, 940);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Room image 2 - middle (another view)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(80, 1040, 440, 360, 24);
  ctx.clip();
  ctx.drawImage(img, 80, 1040, 440, 360);
  ctx.restore();
  
  ctx.fillStyle = accentColor;
  ctx.fillRect(120, 1330, 200, 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('Deluxe', 140, 1365);
  
  // Room image 3 - middle right
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(560, 1040, 440, 360, 24);
  ctx.clip();
  ctx.drawImage(img, 560, 1040, 440, 360);
  ctx.restore();
  
  ctx.fillStyle = accentColor;
  ctx.fillRect(600, 1330, 200, 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Standard', 620, 1365);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Bottom info
  ctx.fillStyle = primaryColor;
  ctx.font = '38px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Climate Controlled • Secure • Clean', 540, 1500);
  
  // Room count
  const roomInfo = businessData.roomTypes && businessData.roomTypes.length > 0
    ? businessData.roomTypes.map(r => `${r.numberOfRooms} ${r.name}`).join(' • ')
    : 'Multiple room options available';
  ctx.font = '32px sans-serif';
  ctx.fillStyle = `${primaryColor}AA`;
  ctx.fillText(roomInfo, 540, 1580);
  
  // Pricing
  const priceText = businessData.pricePerNight ? `From $${businessData.pricePerNight}/night` : 'From $35/night';
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 56px serif';
  ctx.fillText(priceText, 540, 1680);
  
  ctx.restore();
  
  // --- SLIDE 4: CTA ---
  const slide4X = 3240;
  
  ctx.save();
  ctx.translate(slide4X, 0);
  
  // Background - hero image with strong overlay
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  
  // Strong dark overlay
  const slide4Gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  slide4Gradient.addColorStop(0, `${primaryColor}EE`);
  slide4Gradient.addColorStop(1, `${accentColor}DD`);
  ctx.fillStyle = slide4Gradient;
  ctx.fillRect(0, 0, 1080, 1920);
  
  // Center content
  ctx.textAlign = 'center';
  
  // Big emoji
  ctx.font = '160px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('🐱', 540, 600);
  
  // Main CTA
  ctx.font = 'bold 108px serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 30;
  ctx.fillText('Book Your Cat\'s', 540, 850);
  ctx.fillText('Stay Today', 540, 980);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Button
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 8;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(240, 1100, 600, 120, 60);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 64px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Book Now', 540, 1160);
  
  ctx.font = '56px sans-serif';
  ctx.fillText('→', 700, 1160);
  
  // Website
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 56px sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${businessData.subdomain}.catstays.com`, 540, 1380);
  
  // Features
  ctx.font = '36px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillText('📸 Daily Updates', 540, 1500);
  ctx.fillText('🏠 Private Rooms', 540, 1570);
  ctx.fillText('💝 Expert Care', 540, 1640);
  
  // Phone if available
  if (businessData.phone) {
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`📞 ${businessData.phone}`, 540, 1760);
  }
  
  ctx.restore();
}

interface AssetPreviewEditorProps {
  asset: MarketingAsset;
  businessData: MarketingStudioProps['businessData'];
  isEditing: boolean;
  customization: AssetCustomization;
  onClose: () => void;
  onDownload: () => void;
  onSaveCustomization: (customization: AssetCustomization) => void;
}

function AssetPreviewEditor({
  asset,
  businessData,
  isEditing,
  customization,
  onClose,
  onDownload,
  onSaveCustomization
}: AssetPreviewEditorProps) {
  const [localCustomization, setLocalCustomization] = useState<AssetCustomization>(customization);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        generateAssetCanvas(canvasRef.current, ctx, asset, businessData, localCustomization);
      }
    }
  }, [asset, businessData, localCustomization]);

  const handleSave = () => {
    onSaveCustomization(localCustomization);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#F8F7F5] rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Preview */}
        <div className="flex-1 p-8 bg-gradient-to-b from-[#F8F7F5] to-[#E8E7E5] overflow-y-auto">
          <div className="sticky top-0 mb-6">
            <h3 className="text-2xl font-serif font-semibold text-[#0A1128] mb-2">
              {asset.title}
            </h3>
            <p className="text-sm text-[#0A1128]/60">
              {asset.description}
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-2xl"
              style={{ maxHeight: '600px' }}
            />
          </div>
        </div>

        {/* Right: Editor Panel (if editing) */}
        {isEditing && (
          <div className="w-96 bg-white border-l border-[#0A1128]/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-[#0A1128]">
                ✨ Edit with AI
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Headline */}
              <div>
                <Label className="text-sm text-[#0A1128] mb-2 block">
                  Headline
                </Label>
                <Input
                  value={localCustomization.headline || businessData.businessName}
                  onChange={(e) => setLocalCustomization({ ...localCustomization, headline: e.target.value })}
                  className="rounded-xl"
                  placeholder="Your cattery name"
                />
              </div>

              {/* Subheadline */}
              <div>
                <Label className="text-sm text-[#0A1128] mb-2 block">
                  Subheadline
                </Label>
                <Input
                  value={localCustomization.subheadline || businessData.heroSubheading || ''}
                  onChange={(e) => setLocalCustomization({ ...localCustomization, subheadline: e.target.value })}
                  className="rounded-xl"
                  placeholder="Tagline or description"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-[#0A1128] mb-2 block">
                    Primary Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.primaryColor || businessData.primaryColor}
                      onChange={(e) => setLocalCustomization({ ...localCustomization, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localCustomization.primaryColor || businessData.primaryColor}
                      onChange={(e) => setLocalCustomization({ ...localCustomization, primaryColor: e.target.value })}
                      className="rounded-xl flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-[#0A1128] mb-2 block">
                    Accent Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localCustomization.accentColor || businessData.accentColor}
                      onChange={(e) => setLocalCustomization({ ...localCustomization, accentColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localCustomization.accentColor || businessData.accentColor}
                      onChange={(e) => setLocalCustomization({ ...localCustomization, accentColor: e.target.value })}
                      className="rounded-xl flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Style */}
              <div>
                <Label className="text-sm text-[#0A1128] mb-2 block">
                  Layout Style
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minimal', 'premium', 'playful'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setLocalCustomization({ ...localCustomization, layoutStyle: style })}
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                        (localCustomization.layoutStyle || 'premium') === style
                          ? 'bg-[#C46A3A] text-white'
                          : 'bg-[#0A1128]/5 text-[#0A1128] hover:bg-[#0A1128]/10'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <Label className="text-sm text-[#0A1128] mb-2 block">
                  Background Image
                </Label>
                <Input
                  value={localCustomization.imageUrl || ''}
                  onChange={(e) => setLocalCustomization({ ...localCustomization, imageUrl: e.target.value })}
                  className="rounded-xl"
                  placeholder="Image URL or leave blank for auto"
                />
                <p className="text-xs text-[#0A1128]/50 mt-1">
                  Leave blank to use curated cat images
                </p>
              </div>

              {/* AI Regenerate */}
              <Button
                className="w-full bg-gradient-to-r from-[#C46A3A] to-[#A85A30] text-white gap-2"
                onClick={() => {
                  // Simulate AI regeneration by randomizing cat image
                  const randomCat = catImages[Math.floor(Math.random() * catImages.length)];
                  setLocalCustomization({ ...localCustomization, imageUrl: randomCat });
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate with AI
              </Button>

              {/* Save */}
              <Button
                className="w-full bg-[#0A1128] text-white gap-2"
                onClick={() => {
                  handleSave();
                  onClose();
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Action Bar (if not editing) */}
        {!isEditing && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#0A1128]/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-[#0A1128]/70">
              <Sparkles className="w-4 h-4 text-[#C46A3A]" />
              <p>
                High-resolution {asset.format} • Ready for {asset.format === 'PDF' ? 'printing' : 'social media'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onDownload}
                className="bg-[#C46A3A] hover:bg-[#A85A30] text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Download {asset.format}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#0A1128]/20"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}