import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Share2, 
  Facebook,
  Twitter,
  Link as LinkIcon,
  Cat,
  Copy,
  Check,
  Instagram
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

// Mock update data (in production, this would be fetched based on update ID)
const mockUpdate = {
  id: 'abc123',
  catName: 'Whiskers',
  catteryName: 'Deloraine Cattery',
  catteryLogo: '',
  photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  caption: `Having the BEST time at my holiday home! Just finished a delicious breakfast and now it's time for my morning sunbathing session. The staff here really know how to treat a cat right! 😸`,
  date: '2026-03-16',
  catteryColors: {
    primary: '#D97B3C',
    secondary: '#3D5A80'
  }
};

export function UpdatePage() {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = `Check out ${mockUpdate.catName}'s update from ${mockUpdate.catteryName}! 🐱`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-sage/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-forest flex items-center justify-center">
              <Cat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-serif font-semibold text-forest">{mockUpdate.catteryName}</div>
              <div className="text-xs text-forest/60">Photo Update</div>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="rounded-xl">
              Visit Website
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
          {/* Cat Photo */}
          <div className="relative">
            <img 
              src={mockUpdate.photo} 
              alt={`${mockUpdate.catName} update`}
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 backdrop-blur-sm text-forest border-0">
                {new Date(mockUpdate.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Badge>
            </div>
          </div>

          {/* Update Content */}
          <div className="p-8 bg-white">
            {/* Cat Info */}
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${mockUpdate.catteryColors.primary}, ${mockUpdate.catteryColors.secondary})`
                }}
              >
                <Cat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-forest">{mockUpdate.catName}</h1>
                <p className="text-forest/60">at {mockUpdate.catteryName}</p>
              </div>
            </div>

            {/* Caption */}
            <div className="bg-cream rounded-2xl p-6 mb-6">
              <p className="text-lg text-forest/80 leading-relaxed">
                {mockUpdate.caption}
              </p>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-forest mb-3">Share this update</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="rounded-xl flex-1 min-w-[140px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={shareToFacebook}
                  variant="outline"
                  className="rounded-xl flex-1 min-w-[140px] hover:bg-blue-50"
                  style={{ borderColor: '#1877F2' }}
                >
                  <Facebook className="w-4 h-4 mr-2" style={{ color: '#1877F2' }} />
                  <span>Facebook</span>
                </Button>
                
                <Button
                  onClick={shareToTwitter}
                  variant="outline"
                  className="rounded-xl flex-1 min-w-[140px] hover:bg-sky-50"
                  style={{ borderColor: '#1DA1F2' }}
                >
                  <Twitter className="w-4 h-4 mr-2" style={{ color: '#1DA1F2' }} />
                  <span>Twitter</span>
                </Button>
              </div>
            </div>

            {/* Cattery Branding */}
            <div className="pt-6 border-t border-sage/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-forest/70 mb-1">Want updates like this for your cattery?</p>
                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="rounded-xl text-white hover:opacity-90"
                      style={{ backgroundColor: mockUpdate.catteryColors.primary }}
                    >
                      Learn More About {mockUpdate.catteryName}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* CatStays Branding Footer */}
        <div className="text-center mt-8">
          <a 
            href="https://catstays.com" 
            className="inline-flex items-center gap-2 text-forest/50 hover:text-sage transition-colors text-sm"
          >
            <span>Sent with</span>
            <div className="flex items-center gap-1 font-semibold">
              <Cat className="w-4 h-4" />
              <span>CatStays</span>
            </div>
          </a>
          <p className="text-xs text-forest/40 mt-2">
            Premium booking & management platform for boutique catteries
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-sage to-forest py-12">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Love these updates?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            CatStays helps boutique catteries send automated photo updates with AI-generated captions
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-forest hover:bg-cream rounded-2xl px-8 py-6">
              Get CatStays for Your Cattery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
