import { useState } from 'react';
import { RoomsPricingStep } from '../onboarding/RoomsPricingStep';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Globe, 
  MapPin, 
  DollarSign, 
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';

export function RoomsPricingDemo() {
  const [selectedLocation, setSelectedLocation] = useState('123 Queen St, Auckland, New Zealand');
  const [showForm, setShowForm] = useState(false);
  const [completedData, setCompletedData] = useState<any>(null);

  const locationExamples = [
    {
      address: '123 Queen St, Auckland, New Zealand',
      country: 'New Zealand',
      taxType: 'GST',
      rate: '15%',
      color: 'blue'
    },
    {
      address: '456 George St, Sydney, Australia',
      country: 'Australia',
      taxType: 'GST',
      rate: '10%',
      color: 'green'
    },
    {
      address: '789 Oxford St, London, United Kingdom',
      country: 'United Kingdom',
      taxType: 'VAT',
      rate: '20%',
      color: 'purple'
    },
    {
      address: '101 Main St, San Francisco, California, USA',
      country: 'California, USA',
      taxType: 'Sales Tax',
      rate: '7.25%',
      color: 'orange'
    },
    {
      address: '222 Rue de Rivoli, Paris, France',
      country: 'France',
      taxType: 'VAT',
      rate: '20%',
      color: 'pink'
    },
    {
      address: '333 Yonge St, Toronto, Canada',
      country: 'Canada',
      taxType: 'GST/HST',
      rate: '5%',
      color: 'red'
    },
  ];

  const handleComplete = (data: any) => {
    console.log('Form completed with data:', data);
    setCompletedData(data);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#C46A3A]" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Intelligent Rooms & Pricing
            </h1>
          </div>
          <p className="text-[#0A1128]/60 text-lg">
            Auto-detects tax based on location • Flexible room setup • Real-time calculations
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#FAF9F6]">
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-[#C46A3A]" />
              </div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Smart Tax Detection</h3>
              <p className="text-sm text-[#0A1128]/70">
                Automatically detects GST, VAT, or Sales Tax based on business address
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#4F6F5A]/20 bg-gradient-to-br from-white to-[#F0F5F1]">
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-[#4F6F5A]" />
              </div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Live Calculations</h3>
              <p className="text-sm text-[#0A1128]/70">
                Real-time price breakdown showing base + tax = total
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#0A1128]/20 bg-gradient-to-br from-white to-[#E8F0F2]">
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-full bg-[#0A1128]/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#0A1128]" />
              </div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Flexible Setup</h3>
              <p className="text-sm text-[#0A1128]/70">
                Up to 3 room types, multi-cat discounts, room pricing rules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Location Selector */}
        <Card className="border-[#0A1128]/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C46A3A]" />
              Test Tax Auto-Detection
            </CardTitle>
            <CardDescription>
              Select a location to see how the system automatically detects the correct tax type and rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {locationExamples.map((location) => (
                <button
                  key={location.address}
                  onClick={() => {
                    setSelectedLocation(location.address);
                    setShowForm(false);
                    setCompletedData(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedLocation === location.address
                      ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                      : 'border-[#0A1128]/10 hover:border-[#0A1128]/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${location.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                        ${location.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        ${location.color === 'purple' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                        ${location.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                        ${location.color === 'pink' ? 'bg-pink-100 text-pink-800 border-pink-200' : ''}
                        ${location.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                      `}
                    >
                      {location.country}
                    </Badge>
                    {selectedLocation === location.address && (
                      <CheckCircle2 className="w-5 h-5 text-[#C46A3A]" />
                    )}
                  </div>
                  <p className="text-sm text-[#0A1128]/70 mb-2">{location.address}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0A1128]">{location.taxType}:</span>
                    <span className="text-xs text-[#0A1128]/70">{location.rate}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>How it works:</strong> The system analyzes the business address entered in Step 2 of onboarding and automatically detects the country/region. Based on this, it selects the appropriate tax type (GST, VAT, Sales Tax) and pre-fills the default rate. Users can override if needed.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show Form or Results */}
        {!showForm && !completedData && (
          <div className="text-center py-12">
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-[#C46A3A] hover:bg-[#A85A30] text-white px-12"
            >
              Try the Form with "{selectedLocation.split(',')[selectedLocation.split(',').length - 1].trim()}"
            </Button>
          </div>
        )}

        {showForm && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RoomsPricingStep
              businessAddress={selectedLocation}
              onComplete={handleComplete}
            />
          </div>
        )}

        {/* Completed Data Display */}
        {completedData && (
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle className="text-2xl text-green-900">Form Completed!</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                Here's what was captured:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rooms */}
                <div>
                  <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                    🏠 Rooms ({completedData.rooms.length})
                  </h3>
                  <div className="space-y-2">
                    {completedData.rooms.map((room: any, index: number) => (
                      <div key={room.id} className="p-3 bg-white rounded border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{room.name || 'Unnamed Room'}</span>
                          <Badge variant="outline">{room.isShared ? 'Shared' : 'Private'}</Badge>
                        </div>
                        <p className="text-sm text-[#0A1128]/60 mt-1">
                          {room.numberOfRooms} rooms • Max {room.maxCatsPerRoom} cats per room
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                    💲 Pricing
                  </h3>
                  <div className="p-4 bg-white rounded border border-green-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Type:</span>
                      <span className="font-medium">{completedData.pricingType === 'per_day' ? 'Per Day' : 'Per Night'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Base Price:</span>
                      <span className="font-medium">${completedData.basePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tax */}
                <div>
                  <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                    🧾 Tax
                  </h3>
                  <div className="p-4 bg-white rounded border border-green-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tax Type:</span>
                      <span className="font-medium">{completedData.taxLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tax Rate:</span>
                      <span className="font-medium">{completedData.taxRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tax Inclusive:</span>
                      <span className="font-medium">{completedData.taxInclusive ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Country:</span>
                      <span className="font-medium">{completedData.country}</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Cat */}
                {completedData.multiCatDiscount && (
                  <div>
                    <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                      🐾 Multi-Cat Discount
                    </h3>
                    <div className="p-4 bg-white rounded border border-green-200">
                      <p className="text-sm">
                        Discount per additional cat: <strong>${completedData.discountPerCat.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Room Pricing Rules */}
                {completedData.roomPricingRules && (
                  <div>
                    <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                      📊 Room Pricing Rules
                    </h3>
                    <div className="p-4 bg-white rounded border border-green-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Shared Room Adjustment:</span>
                        <span className="font-medium">
                          {completedData.sharedPriceAdjustment >= 0 ? '+' : ''}${completedData.sharedPriceAdjustment.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Private Room Adjustment:</span>
                        <span className="font-medium">
                          {completedData.privatePriceAdjustment >= 0 ? '+' : ''}${completedData.privatePriceAdjustment.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-green-200 flex gap-3">
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Edit Form
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setCompletedData(null);
                  }}
                  className="flex-1 bg-[#C46A3A] hover:bg-[#A85A30] text-white"
                >
                  Try Another Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Features */}
        <Card className="border-[#0A1128]/10 mt-8">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#0A1128] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Flexible Room Setup
                </h4>
                <ul className="text-sm text-[#0A1128]/70 space-y-1 ml-6">
                  <li>• Up to 3 room types</li>
                  <li>• Shared or private configuration</li>
                  <li>• Set max cats per room</li>
                  <li>• Smooth add/remove animations</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#0A1128] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Smart Tax Detection
                </h4>
                <ul className="text-sm text-[#0A1128]/70 space-y-1 ml-6">
                  <li>• Auto-detects from address</li>
                  <li>• Supports GST, VAT, Sales Tax</li>
                  <li>• Pre-fills default rates</li>
                  <li>• User can override</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#0A1128] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Real-Time Calculations
                </h4>
                <ul className="text-sm text-[#0A1128]/70 space-y-1 ml-6">
                  <li>• Live price breakdown</li>
                  <li>• Base + Tax = Total</li>
                  <li>• Handles tax-inclusive pricing</li>
                  <li>• Clear visual feedback</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#0A1128] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Advanced Features
                </h4>
                <ul className="text-sm text-[#0A1128]/70 space-y-1 ml-6">
                  <li>• Multi-cat discounts</li>
                  <li>• Room pricing adjustments</li>
                  <li>• Progressive reveal UI</li>
                  <li>• Helpful microcopy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
