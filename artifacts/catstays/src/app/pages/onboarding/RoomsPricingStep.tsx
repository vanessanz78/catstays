import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Home, 
  DollarSign, 
  Receipt, 
  PawPrint, 
  Plus, 
  X, 
  Info,
  TrendingDown,
  Users
} from 'lucide-react';
import { detectTaxFromAddress, calculateTaxBreakdown } from '../../utils/taxDetection';

interface RoomType {
  id: string;
  name: string;
  numberOfRooms: number;
  maxCatsPerRoom: number;
  isShared: boolean;
}

interface RoomsPricingData {
  rooms: RoomType[];
  pricingType: 'per_day' | 'per_night';
  basePrice: number;
  taxType: string;
  taxLabel: string;
  taxRate: number;
  taxInclusive: boolean;
  country: string;
  multiCatDiscount: boolean;
  discountPerCat: number;
  roomPricingRules: boolean;
  sharedPriceAdjustment: number;
  privatePriceAdjustment: number;
}

interface RoomsPricingStepProps {
  data?: Partial<RoomsPricingData>;
  onComplete: (data: RoomsPricingData) => void;
  businessAddress?: string;
}

export function RoomsPricingStep({ data, onComplete, businessAddress = '' }: RoomsPricingStepProps) {
  // Room state
  const [rooms, setRooms] = useState<RoomType[]>(
    data?.rooms || [
      {
        id: '1',
        name: '',
        numberOfRooms: 1,
        maxCatsPerRoom: 1,
        isShared: false,
      }
    ]
  );

  // Pricing state
  const [pricingType, setPricingType] = useState<'per_day' | 'per_night'>(
    data?.pricingType || 'per_day'
  );
  const [basePrice, setBasePrice] = useState(data?.basePrice || 0);

  // Tax state (auto-detected)
  const [taxConfig, setTaxConfig] = useState(() => {
    if (data?.taxType) {
      return {
        taxType: data.taxType,
        taxLabel: data.taxLabel,
        defaultRate: data.taxRate,
        country: data.country,
      };
    }
    return detectTaxFromAddress(businessAddress);
  });
  
  const [taxRate, setTaxRate] = useState(data?.taxRate ?? taxConfig.defaultRate);
  const [taxInclusive, setTaxInclusive] = useState(data?.taxInclusive ?? true);

  // Multi-cat state
  const [multiCatDiscount, setMultiCatDiscount] = useState(data?.multiCatDiscount || false);
  const [discountPerCat, setDiscountPerCat] = useState(data?.discountPerCat || 0);

  // Room pricing rules state
  const [roomPricingRules, setRoomPricingRules] = useState(data?.roomPricingRules || false);
  const [sharedPriceAdjustment, setSharedPriceAdjustment] = useState(data?.sharedPriceAdjustment || 0);
  const [privatePriceAdjustment, setPrivatePriceAdjustment] = useState(data?.privatePriceAdjustment || 0);

  // Calculate tax breakdown
  const taxBreakdown = calculateTaxBreakdown(basePrice, taxRate, taxInclusive);

  // Add room type
  const addRoomType = () => {
    if (rooms.length < 3) {
      setRooms([
        ...rooms,
        {
          id: Date.now().toString(),
          name: '',
          numberOfRooms: 1,
          maxCatsPerRoom: 1,
          isShared: false,
        }
      ]);
    }
  };

  // Remove room type
  const removeRoomType = (id: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== id));
    }
  };

  // Update room field
  const updateRoom = (id: string, field: keyof RoomType, value: any) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, [field]: value } : room
    ));
  };

  // Handle continue
  const handleContinue = () => {
    const formData: RoomsPricingData = {
      rooms,
      pricingType,
      basePrice,
      taxType: taxConfig.taxType,
      taxLabel: taxConfig.taxLabel,
      taxRate,
      taxInclusive,
      country: taxConfig.country,
      multiCatDiscount,
      discountPerCat,
      roomPricingRules,
      sharedPriceAdjustment,
      privatePriceAdjustment,
    };
    onComplete(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section 1: Rooms */}
      <Card className="border-[#0A1128]/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-[#C46A3A]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Your Rooms</CardTitle>
              <CardDescription>Set up the types of rooms you offer</CardDescription>
            </div>
          </div>
          <p className="text-sm text-[#0A1128]/60 italic mt-2">
            Start simple — you can refine this later
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {rooms.map((room, index) => (
            <Card 
              key={room.id} 
              className="border-[#0A1128]/10 bg-[#F8F7F5]/50 transition-all duration-300"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="border-[#C46A3A] text-[#C46A3A]">
                    Room Type {index + 1}
                  </Badge>
                  {rooms.length > 1 && (
                    <button
                      onClick={() => removeRoomType(room.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Room Type Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`room-name-${room.id}`}>Room Type Name</Label>
                    <Input
                      id={`room-name-${room.id}`}
                      placeholder="Private Room, Family Room..."
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                      className="border-[#0A1128]/20"
                    />
                  </div>

                  {/* Number of Rooms */}
                  <div className="space-y-2">
                    <Label htmlFor={`room-number-${room.id}`}>Number of Rooms</Label>
                    <Input
                      id={`room-number-${room.id}`}
                      type="number"
                      min="1"
                      value={room.numberOfRooms}
                      onChange={(e) => updateRoom(room.id, 'numberOfRooms', parseInt(e.target.value) || 1)}
                      className="border-[#0A1128]/20"
                    />
                  </div>

                  {/* Max Cats per Room */}
                  <div className="space-y-2">
                    <Label htmlFor={`room-capacity-${room.id}`}>Max Cats per Room</Label>
                    <Input
                      id={`room-capacity-${room.id}`}
                      type="number"
                      min="1"
                      value={room.maxCatsPerRoom}
                      onChange={(e) => updateRoom(room.id, 'maxCatsPerRoom', parseInt(e.target.value) || 1)}
                      className="border-[#0A1128]/20"
                    />
                  </div>

                  {/* Shared Room Toggle */}
                  <div className="space-y-2">
                    <Label>Shared Room?</Label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`shared-${room.id}`}
                          checked={room.isShared}
                          onChange={() => updateRoom(room.id, 'isShared', true)}
                          className="w-4 h-4 text-[#C46A3A]"
                        />
                        <span className="text-sm">Yes — cats may share</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`shared-${room.id}`}
                          checked={!room.isShared}
                          onChange={() => updateRoom(room.id, 'isShared', false)}
                          className="w-4 h-4 text-[#C46A3A]"
                        />
                        <span className="text-sm">No — private only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Room Button */}
          {rooms.length < 3 && (
            <Button
              onClick={addRoomType}
              variant="outline"
              className="w-full border-dashed border-[#C46A3A] text-[#C46A3A] hover:bg-[#C46A3A]/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another room type
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Pricing */}
      <Card className="border-[#0A1128]/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#4F6F5A]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Your Pricing</CardTitle>
            </div>
          </div>
          <p className="text-sm text-[#0A1128]/60 italic mt-2">
            You can update pricing anytime
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Type */}
          <div className="space-y-2">
            <Label>How do you charge?</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing-type"
                  checked={pricingType === 'per_day'}
                  onChange={() => setPricingType('per_day')}
                  className="w-4 h-4 text-[#C46A3A]"
                />
                <span className="text-sm font-medium">Per Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing-type"
                  checked={pricingType === 'per_night'}
                  onChange={() => setPricingType('per_night')}
                  className="w-4 h-4 text-[#C46A3A]"
                />
                <span className="text-sm font-medium">Per Night</span>
              </label>
            </div>
          </div>

          {/* Base Price */}
          <div className="space-y-2">
            <Label htmlFor="base-price">Price per cat</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A1128]/60">$</span>
              <Input
                id="base-price"
                type="number"
                min="0"
                step="0.01"
                value={basePrice || ''}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="pl-8 border-[#0A1128]/20 text-lg font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Sales Tax (Auto-Detected) */}
      <Card className="border-[#0A1128]/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-[#C46A3A]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Sales Tax</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  Auto-detected
                </Badge>
                <span className="text-sm text-[#0A1128]/60">{taxConfig.taxLabel}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-[#0A1128]/60 italic mt-2">
            We've pre-filled this based on your location
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tax Inclusive Toggle */}
          <div className="space-y-2">
            <Label>Does your price include {taxConfig.taxType}?</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tax-inclusive"
                  checked={taxInclusive}
                  onChange={() => setTaxInclusive(true)}
                  className="w-4 h-4 text-[#C46A3A]"
                />
                <span className="text-sm font-medium">Yes — included</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tax-inclusive"
                  checked={!taxInclusive}
                  onChange={() => setTaxInclusive(false)}
                  className="w-4 h-4 text-[#C46A3A]"
                />
                <span className="text-sm font-medium">No — added on top</span>
              </label>
            </div>
          </div>

          {/* Tax Rate */}
          <div className="space-y-2">
            <Label htmlFor="tax-rate">{taxConfig.taxType} rate (%)</Label>
            <div className="relative">
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate || ''}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="pr-8 border-[#0A1128]/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A1128]/60">%</span>
            </div>
            <p className="text-xs text-[#0A1128]/50 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Based on your location — you can adjust if needed
            </p>
          </div>

          {/* Live Price Calculation */}
          {basePrice > 0 && (
            <Card className="bg-gradient-to-br from-[#4F6F5A]/5 to-[#4F6F5A]/10 border-[#4F6F5A]/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#0A1128]/70">
                      {taxInclusive ? 'Base (excl. tax)' : 'Base price'}:
                    </span>
                    <span className="font-semibold">${taxBreakdown.basePrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#0A1128]/70">{taxConfig.taxType} ({taxRate}%):</span>
                    <span className="font-semibold text-[#C46A3A]">+ ${taxBreakdown.taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-[#4F6F5A]/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0A1128]">Total price:</span>
                      <span className="text-2xl font-bold text-[#4F6F5A]">
                        ${taxBreakdown.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Multi-cat Pricing */}
      <Card className="border-[#0A1128]/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-[#C46A3A]" />
            </div>
            <CardTitle className="text-2xl">Multi-cat Setup</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F8F7F5] rounded-lg">
            <div>
              <p className="font-medium text-[#0A1128]">Offer multi-cat discounts?</p>
              <p className="text-sm text-[#0A1128]/60">Encourage customers to book multiple cats</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={multiCatDiscount}
                onChange={(e) => setMultiCatDiscount(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F6F5A]"></div>
            </label>
          </div>

          {/* Discount Field (Progressive Reveal) */}
          {multiCatDiscount && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="discount-per-cat" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#4F6F5A]" />
                Discount per additional cat
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A1128]/60">$</span>
                <Input
                  id="discount-per-cat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPerCat || ''}
                  onChange={(e) => setDiscountPerCat(parseFloat(e.target.value) || 0)}
                  className="pl-8 border-[#0A1128]/20"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-[#0A1128]/50">
                Example: If base is $30 and discount is $5, second cat costs $25
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Room Pricing Rules */}
      <Card className="border-[#0A1128]/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#4F6F5A]" />
            </div>
            <CardTitle className="text-2xl">Room Pricing Rules</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F8F7F5] rounded-lg">
            <div>
              <p className="font-medium text-[#0A1128]">Different pricing for shared vs private?</p>
              <p className="text-sm text-[#0A1128]/60">Adjust prices based on room type</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={roomPricingRules}
                onChange={(e) => setRoomPricingRules(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F6F5A]"></div>
            </label>
          </div>

          {/* Price Adjustments (Progressive Reveal) */}
          {roomPricingRules && (
            <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Shared Room Adjustment */}
              <div className="space-y-2">
                <Label htmlFor="shared-adjustment">Shared room adjustment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A1128]/60">$</span>
                  <Input
                    id="shared-adjustment"
                    type="number"
                    step="0.01"
                    value={sharedPriceAdjustment || ''}
                    onChange={(e) => setSharedPriceAdjustment(parseFloat(e.target.value) || 0)}
                    className="pl-8 border-[#0A1128]/20"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-[#0A1128]/50">Negative for discount (e.g., -5)</p>
              </div>

              {/* Private Room Adjustment */}
              <div className="space-y-2">
                <Label htmlFor="private-adjustment">Private room adjustment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A1128]/60">$</span>
                  <Input
                    id="private-adjustment"
                    type="number"
                    step="0.01"
                    value={privatePriceAdjustment || ''}
                    onChange={(e) => setPrivatePriceAdjustment(parseFloat(e.target.value) || 0)}
                    className="pl-8 border-[#0A1128]/20"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-[#0A1128]/50">Positive for premium (e.g., +10)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleContinue}
          size="lg"
          className="bg-[#C46A3A] hover:bg-[#A85A30] text-white px-12"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
