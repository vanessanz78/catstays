import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, X } from 'lucide-react';
import { useState } from 'react';

export function PreviewBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 shadow-lg"
      style={{ backgroundColor: '#E9C46A' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5" style={{ color: '#2d3e2f' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#2d3e2f' }}>
              Preview Mode
            </p>
            <p className="text-xs" style={{ color: '#2d3e2f', opacity: 0.8 }}>
              This is a temporary preview. Subscribe to publish your website.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            className="rounded-xl bg-[#2d3e2f] hover:bg-[#2d3e2f]/90 text-white"
            onClick={() => window.location.href = '/onboarding'}
          >
            Subscribe to Publish
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-black/10"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" style={{ color: '#2d3e2f' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
