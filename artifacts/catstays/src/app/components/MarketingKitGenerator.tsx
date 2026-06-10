import { useState } from 'react';
import { Download, Eye, FileText, CreditCard, Instagram, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface MarketingKitGeneratorProps {
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
  type: 'flyer' | 'business-card' | 'social-post' | 'story-pack' | 'share-card';
  format: string;
  size?: string;
}

const marketingAssets: MarketingAsset[] = [
  {
    id: 'flyer',
    title: 'Flyer',
    description: 'Perfect for vet clinics, pet shops, and local promotion',
    icon: FileText,
    type: 'flyer',
    format: 'PDF',
    size: 'A4 Print'
  },
  {
    id: 'business-card',
    title: 'Business Card',
    description: 'Hand out to customers and partners',
    icon: CreditCard,
    type: 'business-card',
    format: 'PDF',
    size: 'Standard'
  },
  {
    id: 'social-post',
    title: 'Social Post',
    description: 'Share your cattery online',
    icon: Instagram,
    type: 'social-post',
    format: 'PNG',
    size: '1080x1080'
  },
  {
    id: 'story-pack',
    title: 'Story Pack',
    description: 'Promote your cattery in stories',
    icon: ImageIcon,
    type: 'story-pack',
    format: 'PNG',
    size: '4 slides'
  },
  {
    id: 'share-card',
    title: 'Share Card',
    description: 'Perfect for Facebook, messages, and sharing',
    icon: Share2,
    type: 'share-card',
    format: 'PNG',
    size: '1200x630'
  }
];

export function MarketingKitGenerator({ businessData }: MarketingKitGeneratorProps) {
  const [selectedAsset, setSelectedAsset] = useState<MarketingAsset | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = (asset: MarketingAsset) => {
    setSelectedAsset(asset);
    setShowPreview(true);
  };

  const handleDownload = (asset: MarketingAsset) => {
    // In a real implementation, this would generate and download the asset
    console.log('Downloading:', asset.id);
    // For now, we'll trigger the preview which shows the design
    handlePreview(asset);
  };

  const handleDownloadAll = () => {
    console.log('Downloading all marketing materials');
    // Would generate a ZIP file with all assets
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
            Your Marketing Kit
          </h3>
          <p className="text-[#0A1128]/70 max-w-xl mx-auto">
            Professional marketing materials automatically branded with your cattery's colors, fonts, and information
          </p>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleDownloadAll}
            className="bg-[#C46A3A] hover:bg-[#A85A30] text-white gap-2 rounded-xl px-6"
          >
            <Download className="w-4 h-4" />
            Download All Materials
          </Button>
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
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs border-[#0A1128]/20 text-[#0A1128]/60">
                      {asset.format}
                    </Badge>
                  </div>
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
                    Size: {asset.size}
                  </p>
                )}
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
                  Professionally Designed & Print-Ready
                </h4>
                <p className="text-sm text-[#0A1128]/70 leading-relaxed">
                  All materials are automatically branded with your business information, colors, and fonts. 
                  Print materials are high-resolution and ready for professional printing. 
                  Digital assets are optimized for social media.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedAsset && (
        <MarketingAssetPreview
          asset={selectedAsset}
          businessData={businessData}
          onClose={() => {
            setShowPreview(false);
            setSelectedAsset(null);
          }}
          onDownload={() => handleDownload(selectedAsset)}
        />
      )}
    </>
  );
}

interface MarketingAssetPreviewProps {
  asset: MarketingAsset;
  businessData: MarketingKitGeneratorProps['businessData'];
  onClose: () => void;
  onDownload: () => void;
}

function MarketingAssetPreview({ asset, businessData, onClose, onDownload }: MarketingAssetPreviewProps) {
  const renderPreview = () => {
    const tagline = businessData.heroSubheading || "A safe, loving home for your cat";
    const priceText = businessData.pricePerNight ? `From $${businessData.pricePerNight}/night` : "From $25/night";

    switch (asset.type) {
      case 'flyer':
        return (
          <div 
            className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{ aspectRatio: '210/297' }} // A4 ratio
          >
            <div className="p-8 space-y-6" style={{ backgroundColor: businessData.backgroundColor }}>
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 
                  className="text-4xl font-serif font-bold"
                  style={{ color: businessData.primaryColor }}
                >
                  {businessData.businessName}
                </h1>
                <p className="text-lg" style={{ color: businessData.accentColor }}>
                  {tagline}
                </p>
              </div>

              {/* Hero Image */}
              {businessData.heroImage && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img src={businessData.heroImage} alt="Hero" className="w-full h-full object-cover" />
                </div>
              )}

              {/* About */}
              {businessData.aboutText && (
                <div className="space-y-2">
                  <h2 className="text-xl font-serif font-semibold" style={{ color: businessData.primaryColor }}>
                    About Us
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: businessData.primaryColor, opacity: 0.8 }}>
                    {businessData.aboutText.substring(0, 200)}...
                  </p>
                </div>
              )}

              {/* Services */}
              <div className="space-y-2">
                <h2 className="text-xl font-serif font-semibold" style={{ color: businessData.primaryColor }}>
                  Our Services
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: businessData.accentColor }}></div>
                    <span style={{ color: businessData.primaryColor, opacity: 0.8 }}>Luxury Boarding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: businessData.accentColor }}></div>
                    <span style={{ color: businessData.primaryColor, opacity: 0.8 }}>Day Care</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: businessData.accentColor }}></div>
                    <span style={{ color: businessData.primaryColor, opacity: 0.8 }}>Special Care</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: businessData.accentColor }}></div>
                    <span style={{ color: businessData.primaryColor, opacity: 0.8 }}>Photo Updates</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center py-4 rounded-lg" style={{ backgroundColor: `${businessData.accentColor}15` }}>
                <p className="text-2xl font-serif font-semibold" style={{ color: businessData.accentColor }}>
                  {priceText}
                </p>
              </div>

              {/* CTA */}
              <div className="text-center space-y-3 py-4">
                <h3 className="text-xl font-serif font-semibold" style={{ color: businessData.primaryColor }}>
                  Book Your Cat's Stay Today
                </h3>
                <p className="text-lg" style={{ color: businessData.accentColor }}>
                  {businessData.subdomain}.catstays.com
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t space-y-1 text-sm text-center" style={{ borderColor: `${businessData.primaryColor}20` }}>
                {businessData.phone && (
                  <p style={{ color: businessData.primaryColor, opacity: 0.7 }}>📞 {businessData.phone}</p>
                )}
                {businessData.email && (
                  <p style={{ color: businessData.primaryColor, opacity: 0.7 }}>✉️ {businessData.email}</p>
                )}
                {businessData.address && (
                  <p style={{ color: businessData.primaryColor, opacity: 0.7 }}>📍 {businessData.address}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'business-card':
        return (
          <div className="w-full max-w-md mx-auto space-y-4">
            {/* Front */}
            <div 
              className="w-full bg-white rounded-lg shadow-xl p-8 text-center"
              style={{ aspectRatio: '3.5/2', backgroundColor: businessData.backgroundColor }}
            >
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <h2 className="text-3xl font-serif font-bold" style={{ color: businessData.primaryColor }}>
                  {businessData.businessName}
                </h2>
                <p className="text-sm" style={{ color: businessData.accentColor }}>
                  {tagline}
                </p>
              </div>
            </div>
            {/* Back */}
            <div 
              className="w-full bg-white rounded-lg shadow-xl p-8"
              style={{ aspectRatio: '3.5/2', backgroundColor: businessData.primaryColor }}
            >
              <div className="h-full flex flex-col justify-center space-y-2 text-sm text-white">
                {businessData.phone && <p>📞 {businessData.phone}</p>}
                {businessData.email && <p>✉️ {businessData.email}</p>}
                <p>🌐 {businessData.subdomain}.catstays.com</p>
                {businessData.address && <p>📍 {businessData.address}</p>}
              </div>
            </div>
          </div>
        );

      case 'social-post':
        return (
          <div className="w-full max-w-lg mx-auto">
            <div 
              className="w-full rounded-lg shadow-2xl overflow-hidden relative"
              style={{ aspectRatio: '1/1' }}
            >
              {businessData.heroImage && (
                <img src={businessData.heroImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${businessData.primaryColor}CC 0%, ${businessData.accentColor}CC 100%)`
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white space-y-4">
                <h2 className="text-5xl font-serif font-bold">
                  Now Taking Bookings
                </h2>
                <p className="text-2xl">
                  Safe, loving care for your cat
                </p>
                <div className="mt-6 px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <p className="text-xl font-semibold">
                    {businessData.subdomain}.catstays.com
                  </p>
                </div>
              </div>
              <div className="absolute top-6 right-6">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold" style={{ color: businessData.primaryColor }}>
                    {businessData.businessName.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'story-pack':
        return (
          <div className="w-full max-w-xs mx-auto space-y-4">
            <p className="text-sm text-center text-[#0A1128]/60">4 Story Slides</p>
            {/* Slide 1 - Intro */}
            <div 
              className="w-full rounded-lg shadow-xl p-8 flex flex-col items-center justify-center text-center"
              style={{ aspectRatio: '9/16', backgroundColor: businessData.primaryColor }}
            >
              <h2 className="text-4xl font-serif font-bold text-white mb-4">
                {businessData.businessName}
              </h2>
              <p className="text-xl text-white/90">
                {tagline}
              </p>
            </div>
          </div>
        );

      case 'share-card':
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div 
              className="w-full rounded-lg shadow-2xl overflow-hidden relative"
              style={{ aspectRatio: '1200/630' }}
            >
              {businessData.heroImage && (
                <img src={businessData.heroImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, ${businessData.primaryColor}E6 0%, ${businessData.accentColor}CC 100%)`
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 text-white space-y-4">
                <h2 className="text-6xl font-serif font-bold">
                  {businessData.businessName}
                </h2>
                <p className="text-3xl">
                  {tagline}
                </p>
                <div className="mt-8 px-12 py-4 bg-white text-2xl font-semibold rounded-full" style={{ color: businessData.primaryColor }}>
                  Book Now
                </div>
                <p className="text-xl mt-4">
                  {businessData.subdomain}.catstays.com
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#F8F7F5] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#F8F7F5] border-b border-[#0A1128]/10 p-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-2xl font-serif font-semibold text-[#0A1128]">
              {asset.title} Preview
            </h3>
            <p className="text-sm text-[#0A1128]/60 mt-1">
              {asset.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                // Trigger download
                console.log('Download:', asset.id);
                onClose();
              }}
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

        {/* Preview Content */}
        <div className="p-8 bg-gradient-to-b from-[#F8F7F5] to-[#E8E7E5]">
          {renderPreview()}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-[#0A1128]/5 border-t border-[#0A1128]/10">
          <div className="flex items-center gap-3 text-sm text-[#0A1128]/70">
            <Sparkles className="w-4 h-4 text-[#C46A3A]" />
            <p>
              This preview shows how your marketing material will look. 
              Download to get the high-resolution {asset.format} file ready for {asset.format === 'PDF' ? 'printing' : 'sharing online'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
