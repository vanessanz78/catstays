import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { 
  MessageCircle, 
  Camera, 
  Sun, 
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

interface Feature {
  id: string;
  icon: any;
  title: string;
  description: string;
  price: number;
  preview: React.ReactNode;
}

export function UpsellScreen() {
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  
  const basePlan = 69;
  
  const features: Feature[] = [
    {
      id: 'sms',
      icon: MessageCircle,
      title: 'SMS Updates',
      description: 'Send booking reminders and updates automatically',
      price: 10,
      preview: (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-gray-900">Booking confirmed</div>
              <div className="text-[9px] text-gray-500 truncate">Hi Sarah! Fluffy's stay is...</div>
            </div>
            <div className="text-[8px] text-gray-400">2:34 PM</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-gray-900">Reminder: Pick-up</div>
              <div className="text-[9px] text-gray-500 truncate">Your cat is ready tomorrow...</div>
            </div>
            <div className="text-[8px] text-gray-400">Yesterday</div>
          </div>
        </div>
      ),
    },
    {
      id: 'updates',
      icon: Camera,
      title: 'Pet Updates',
      description: 'Share photos and updates with owners during their stay',
      price: 15,
      preview: (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
              F
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-gray-900">Fluffy's Update</div>
              <div className="text-[8px] text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="bg-white rounded-md overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=120&fit=crop" 
              alt="Cat"
              className="w-full h-16 object-cover"
            />
          </div>
          <div className="text-[9px] text-gray-700 leading-tight">
            "Having a purrfect nap in the sunny spot! 😺"
          </div>
        </div>
      ),
    },
    {
      id: 'daycare',
      icon: Sun,
      title: 'Daycare Module',
      description: 'Manage day stays alongside overnight bookings',
      price: 10,
      preview: (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-medium text-gray-900">Today's Daycare</div>
              <div className="text-[9px] text-gray-500">4 cats</div>
            </div>
            <div className="flex gap-1">
              {['#C46A3A', '#4F6F5A', '#9C6F4E', '#6B8E7A'].map((color, i) => (
                <div 
                  key={i}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ backgroundColor: color }}
                >
                  {['M', 'T', 'B', 'L'][i]}
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-gray-500">Drop-off: 8:00 AM</span>
                <span className="text-gray-500">Pick-up: 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'grooming',
      icon: Sparkles,
      title: 'Grooming Module',
      description: 'Offer grooming services and bookings',
      price: 10,
      preview: (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3">
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-gray-900 mb-2">
              Grooming Services
            </div>
            <div className="space-y-1">
              {[
                { name: 'Bath & Brush', price: '$35' },
                { name: 'Nail Trim', price: '$15' },
                { name: 'Full Groom', price: '$65' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded px-2 py-1">
                  <div className="text-[9px] text-gray-700">{service.name}</div>
                  <div className="text-[9px] font-semibold text-[#C46A3A]">{service.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const totalAddonCost = features
    .filter(f => selectedFeatures.has(f.id))
    .reduce((sum, f) => sum + f.price, 0);
  
  const totalCost = basePlan + totalAddonCost;

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#C46A3A]/10 text-[#C46A3A] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Recommended for you
          </div>
          <h1 className="text-5xl font-bold text-[#0A1128] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            Enhance your cattery experience
          </h1>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter' }}>
            Add powerful features to delight your customers and save time
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map(feature => {
            const Icon = feature.icon;
            const isSelected = selectedFeatures.has(feature.id);

            return (
              <Card
                key={feature.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-[#C46A3A] shadow-xl bg-white' 
                    : 'hover:shadow-lg bg-white border border-gray-200'
                }`}
                onClick={() => toggleFeature(feature.id)}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-[#C46A3A] text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl transition-colors ${
                      isSelected 
                        ? 'bg-[#C46A3A] text-white' 
                        : 'bg-[#C46A3A]/10 text-[#C46A3A]'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#0A1128] mb-1" style={{ fontFamily: 'Playfair Display' }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Visual Preview */}
                  <div className="mb-4">
                    {feature.preview}
                  </div>

                  {/* Price & Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-2xl font-bold text-[#C46A3A]">
                        +${feature.price}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFeature(feature.id);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isSelected ? 'bg-[#C46A3A]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isSelected ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Your plan</div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-bold text-[#0A1128]">
                  ${totalCost}
                </div>
                <div className="text-xl text-gray-400">/month</div>
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-gray-500">Base plan</span>
                  <span className="font-semibold text-gray-900">${basePlan}</span>
                </div>
                {totalAddonCost > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-gray-500">Add-ons ({selectedFeatures.size})</span>
                      <span className="font-semibold text-[#C46A3A]">+${totalAddonCost}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-900 font-semibold">Total</span>
                        <span className="text-xl font-bold text-[#0A1128]">${totalCost}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Savings Message */}
          {selectedFeatures.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <span className="font-semibold">Smart choice!</span> These features typically save 5+ hours per week and increase customer satisfaction by 40%.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            size="lg"
            className="bg-[#C46A3A] hover:bg-[#A85A30] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
            onClick={() => {
              // Save selected features to localStorage for subscription module
              if (selectedFeatures.size > 0) {
                localStorage.setItem('selectedUpsellFeatures', JSON.stringify(Array.from(selectedFeatures)));
              }
              // Save total pricing for subscription module
              localStorage.setItem('planCost', totalCost.toString());
              localStorage.setItem('basePlanCost', basePlan.toString());
              // Navigate to subscription preview (shows within website preview container)
              navigate('/subscription-preview');
            }}
          >
            {selectedFeatures.size > 0 ? 'Upgrade & Continue' : 'Continue with Base Plan'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {selectedFeatures.size > 0 && (
            <Button
              size="lg"
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 px-8 py-6 text-lg"
              onClick={() => setSelectedFeatures(new Set())}
            >
              Skip for now
            </Button>
          )}
        </div>

        {/* Trust Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>✓ Cancel anytime • ✓ 14-day free trial • ✓ No setup fees</p>
        </div>
      </div>
    </div>
  );
}