import { useState } from 'react';
import { Smartphone, Tablet, Laptop } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { SubscriptionCheckout } from './SubscriptionCheckout';

type DeviceType = 'mobile' | 'tablet' | 'laptop';

export function SubscriptionPreviewStep() {
  const [device, setDevice] = useState<DeviceType>('laptop');

  const deviceFrames = {
    mobile: {
      width: 375,
      height: 667,
      scale: 0.8,
      borderRadius: '36px',
      bezel: true
    },
    tablet: {
      width: 768,
      height: 1024,
      scale: 0.5,
      borderRadius: '24px',
      bezel: true
    },
    laptop: {
      width: 1440,
      height: 900,
      scale: 0.55,
      borderRadius: '12px',
      bezel: false
    }
  };

  const currentDevice = deviceFrames[device];

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-serif font-semibold text-[#0A1128] mb-3">
            Complete Your Subscription
          </h3>
          <p className="text-[#0A1128]/70 max-w-2xl mx-auto">
            Review your plan and complete payment to activate your cattery platform
          </p>
        </div>

        {/* Device Selector */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setDevice('mobile')}
            variant={device === 'mobile' ? 'default' : 'outline'}
            className={`rounded-xl gap-2 ${
              device === 'mobile' 
                ? 'bg-[#0A1128] hover:bg-[#0A1128]/90 text-white' 
                : 'border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </Button>
          <Button
            onClick={() => setDevice('tablet')}
            variant={device === 'tablet' ? 'default' : 'outline'}
            className={`rounded-xl gap-2 ${
              device === 'tablet' 
                ? 'bg-[#0A1128] hover:bg-[#0A1128]/90 text-white' 
                : 'border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5'
            }`}
          >
            <Tablet className="w-4 h-4" />
            Tablet
          </Button>
          <Button
            onClick={() => setDevice('laptop')}
            variant={device === 'laptop' ? 'default' : 'outline'}
            className={`rounded-xl gap-2 ${
              device === 'laptop' 
                ? 'bg-[#0A1128] hover:bg-[#0A1128]/90 text-white' 
                : 'border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Laptop
          </Button>
        </div>

        {/* Device Preview Frame */}
        <div className="flex justify-center items-center py-8 bg-gradient-to-b from-[#0A1128]/5 to-transparent rounded-3xl">
          <div 
            className="relative bg-[#1a1a1a] shadow-2xl"
            style={{
              width: `${currentDevice.width * currentDevice.scale}px`,
              height: `${currentDevice.height * currentDevice.scale}px`,
              borderRadius: currentDevice.borderRadius,
              padding: currentDevice.bezel ? '12px' : '0px',
              overflow: 'hidden'
            }}
          >
            {/* Device Notch (for mobile only) */}
            {device === 'mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-10" />
            )}

            {/* Inner Screen Container */}
            <div 
              className="w-full h-full bg-white overflow-hidden"
              style={{
                borderRadius: currentDevice.bezel ? '24px' : '8px',
              }}
            >
              {/* Scaled Subscription Content */}
              <div 
                style={{
                  width: `${currentDevice.width}px`,
                  height: `${currentDevice.height}px`,
                  transform: `scale(${currentDevice.scale})`,
                  transformOrigin: 'top left',
                  overflow: 'auto'
                }}
              >
                <SubscriptionCheckout />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
