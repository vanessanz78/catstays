import { Clock, Percent, Home, DollarSign, Tag, CalendarX, Plus, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';

interface BookingRulesFormProps {
  data: any;
  setData: (data: any) => void;
}

export function BookingRulesForm({ data, setData }: BookingRulesFormProps) {
  const roomTypes = Array.isArray(data.roomTypes) ? data.roomTypes : [];
  const pricingRates = Array.isArray(data.pricingRates) ? data.pricingRates : [];
  const additionalServices = Array.isArray(data.additionalServices) ? data.additionalServices : [];
  const discounts = Array.isArray(data.discounts) ? data.discounts : [];
  const blockOutDates = Array.isArray(data.blockOutDates) ? data.blockOutDates : [];

  // Helper functions for dynamic lists
  const addRoomType = () => {
    setData({
      ...data,
      roomTypes: [
        ...(data.roomTypes || []),
        { name: '', numberOfRooms: '1', maxCatsPerRoom: '1', sameFamilyOnly: false }
      ]
    });
  };

  const removeRoomType = (index: number) => {
    setData({
      ...data,
      roomTypes: (data.roomTypes || []).filter((_: any, i: number) => i !== index)
    });
  };

  const updateRoomType = (index: number, field: string, value: any) => {
    const newRoomTypes = [...(data.roomTypes || [])];
    newRoomTypes[index] = { ...newRoomTypes[index], [field]: value };
    setData({ ...data, roomTypes: newRoomTypes });
  };

  const addPricingRate = () => {
    setData({
      ...data,
      pricingRates: [
        ...(data.pricingRates || []),
        { numberOfCats: '2', price: '50', discountType: 'none', discountValue: '0' }
      ]
    });
  };

  const removePricingRate = (index: number) => {
    setData({
      ...data,
      pricingRates: (data.pricingRates || []).filter((_: any, i: number) => i !== index)
    });
  };

  const updatePricingRate = (index: number, field: string, value: any) => {
    const newRates = [...(data.pricingRates || [])];
    newRates[index] = { ...newRates[index], [field]: value };
    setData({ ...data, pricingRates: newRates });
  };

  const addDiscount = () => {
    setData({
      ...data,
      discounts: [
        ...(data.discounts || []),
        { name: '', type: 'percentage', value: '10' }
      ]
    });
  };

  const removeDiscount = (index: number) => {
    setData({
      ...data,
      discounts: (data.discounts || []).filter((_: any, i: number) => i !== index)
    });
  };

  const updateDiscount = (index: number, field: string, value: any) => {
    const newDiscounts = [...(data.discounts || [])];
    newDiscounts[index] = { ...newDiscounts[index], [field]: value };
    setData({ ...data, discounts: newDiscounts });
  };

  const addBlockOutDate = () => {
    setData({
      ...data,
      blockOutDates: [
        ...(data.blockOutDates || []),
        { name: 'Christmas / New Years', startDate: '', endDate: '' }
      ]
    });
  };

  const removeBlockOutDate = (index: number) => {
    setData({
      ...data,
      blockOutDates: (data.blockOutDates || []).filter((_: any, i: number) => i !== index)
    });
  };

  const updateBlockOutDate = (index: number, field: string, value: any) => {
    const newDates = [...(data.blockOutDates || [])];
    newDates[index] = { ...newDates[index], [field]: value };
    setData({ ...data, blockOutDates: newDates });
  };

  return (
    <div className="space-y-6">
      {/* Opening Hours */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <h4 className="font-semibold text-forest mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sage" />
          Opening Hours
        </h4>
        
        {/* Open by Appointment Only */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.openByAppointmentOnly}
              onChange={(e) => setData({ ...data, openByAppointmentOnly: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-forest/70">Open by appointment only</span>
          </label>
        </div>

        {/* Booking Interval */}
        <div className="mb-4">
          <Label className="text-forest/70 mb-2 block text-sm">Booking Intervals (minutes)</Label>
          <select
            value={data.bookingInterval}
            onChange={(e) => setData({ ...data, bookingInterval: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        {!data.openByAppointmentOnly && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-forest/70 mb-2 block text-sm">Morning Start</Label>
              <Input
                type="time"
                value={data.morningStart}
                onChange={(e) => setData({ ...data, morningStart: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-forest/70 mb-2 block text-sm">Morning End</Label>
              <Input
                type="time"
                value={data.morningEnd}
                onChange={(e) => setData({ ...data, morningEnd: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-forest/70 mb-2 block text-sm">Afternoon Start</Label>
              <Input
                type="time"
                value={data.afternoonStart}
                onChange={(e) => setData({ ...data, afternoonStart: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-forest/70 mb-2 block text-sm">Afternoon End</Label>
              <Input
                type="time"
                value={data.afternoonEnd}
                onChange={(e) => setData({ ...data, afternoonEnd: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      {/* Deposit Requirements */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <h4 className="font-semibold text-forest mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-sage" />
          Deposit Requirements
        </h4>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setData({ ...data, depositType: 'percentage' })}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              data.depositType === 'percentage' 
                ? 'bg-sage text-white' 
                : 'bg-white text-forest border border-sage/20'
            }`}
          >
            Percentage (%)
          </button>
          <button
            onClick={() => setData({ ...data, depositType: 'fixed' })}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              data.depositType === 'fixed' 
                ? 'bg-sage text-white' 
                : 'bg-white text-forest border border-sage/20'
            }`}
          >
            Fixed Amount ($)
          </button>
        </div>

        <div>
          <Label className="text-forest/70 mb-2 block text-sm">
            Deposit Amount {data.depositType === 'percentage' ? '(%)' : '($)'}
          </Label>
          <div className="flex items-center gap-3">
            {data.depositType === 'fixed' && (
              <span className="text-forest/60">$</span>
            )}
            <Input
              type="number"
              min="0"
              max={data.depositType === 'percentage' ? '100' : undefined}
              value={data.depositAmount}
              onChange={(e) => setData({ ...data, depositAmount: e.target.value })}
              className="rounded-xl w-32"
            />
            {data.depositType === 'percentage' && (
              <span className="text-forest/70">% of total booking</span>
            )}
          </div>
          <p className="text-xs text-forest/60 mt-2">
            Recommended: 50% deposit to secure bookings
          </p>
        </div>
      </div>

      {/* Room Cleaning Buffer */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <h4 className="font-semibold text-forest mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-sage" />
          Room Cleaning Buffer
        </h4>
        
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.cleaningBufferEnabled}
              onChange={(e) => setData({ ...data, cleaningBufferEnabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-forest/70">Enable cleaning buffer between bookings</span>
          </label>
        </div>

        {data.cleaningBufferEnabled && (
          <div>
            <Label className="text-forest/70 mb-2 block text-sm">Minutes between bookings</Label>
            <select
              value={data.cleaningBuffer}
              onChange={(e) => setData({ ...data, cleaningBuffer: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
            <p className="text-xs text-forest/60 mt-2">
              Time needed to clean and prepare room between guests
            </p>
          </div>
        )}
      </div>

      {/* Room Capacity */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-forest flex items-center gap-2">
            <Home className="w-5 h-5 text-sage" />
            Room Capacity
          </h4>
          <Button
            type="button"
            onClick={addRoomType}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Room Type
          </Button>
        </div>

        <div className="space-y-4">
          {roomTypes.map((room: any, index: number) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-sage/10">
              <div className="grid md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-2">
                  <Label className="text-forest/70 mb-1 block text-xs">Room Type Name</Label>
                  <Input
                    value={room.name}
                    onChange={(e) => updateRoomType(index, 'name', e.target.value)}
                    placeholder="Private Suite"
                    className="rounded-lg h-9"
                  />
                </div>
                <div>
                  <Label className="text-forest/70 mb-1 block text-xs">Number of Rooms</Label>
                  <Input
                    type="number"
                    min="1"
                    value={room.numberOfRooms}
                    onChange={(e) => updateRoomType(index, 'numberOfRooms', e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
                <div>
                  <Label className="text-forest/70 mb-1 block text-xs">Max Cats</Label>
                  <Input
                    type="number"
                    min="1"
                    value={room.maxCatsPerRoom}
                    onChange={(e) => updateRoomType(index, 'maxCatsPerRoom', e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={room.sameFamilyOnly}
                    onChange={(e) => updateRoomType(index, 'sameFamilyOnly', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-forest/70">Must be from same family</span>
                </label>
                
                {roomTypes.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeRoomType(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Rates */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-forest flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sage" />
            Pricing Rates
          </h4>
          <Button
            type="button"
            onClick={addPricingRate}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Rate
          </Button>
        </div>

        {/* Pricing Per Toggle */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setData({ ...data, pricingPer: 'day' })}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              data.pricingPer === 'day' 
                ? 'bg-sage text-white' 
                : 'bg-white text-forest border border-sage/20'
            }`}
          >
            Per Day
          </button>
          <button
            onClick={() => setData({ ...data, pricingPer: 'night' })}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              data.pricingPer === 'night' 
                ? 'bg-sage text-white' 
                : 'bg-white text-forest border border-sage/20'
            }`}
          >
            Per Night
          </button>
        </div>

        <div className="space-y-3">
          {pricingRates.map((rate: any, index: number) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-sage/10">
              <div className="grid md:grid-cols-5 gap-3 mb-3">
                <div>
                  <Label className="text-forest/70 mb-1 block text-xs">Number of Cats</Label>
                  <Input
                    type="number"
                    min="1"
                    value={rate.numberOfCats}
                    onChange={(e) => updatePricingRate(index, 'numberOfCats', e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
                <div>
                  <Label className="text-forest/70 mb-1 block text-xs">Price per {data.pricingPer}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/60 text-sm">$</span>
                    <Input
                      type="number"
                      min="0"
                      value={rate.price}
                      onChange={(e) => updatePricingRate(index, 'price', e.target.value)}
                      className="rounded-lg h-9 pl-6"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-forest/70 mb-1 block text-xs">Multi-Cat Discount</Label>
                  <div className="flex gap-2">
                    <select
                      value={rate.discountType}
                      onChange={(e) => updatePricingRate(index, 'discountType', e.target.value)}
                      className="flex-1 h-9 px-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                    {rate.discountType !== 'none' && (
                      <Input
                        type="number"
                        min="0"
                        value={rate.discountValue}
                        onChange={(e) => updatePricingRate(index, 'discountValue', e.target.value)}
                        className="rounded-lg h-9 w-20"
                        placeholder="10"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-end">
                  {pricingRates.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removePricingRate(index)}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Services (from Additional Services) */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-forest flex items-center gap-2">
            <Home className="w-5 h-5 text-sage" />
            Our Services
          </h4>
          <Button
            type="button"
            onClick={() => {
              setData({
                ...data,
                additionalServices: [
                  ...(data.additionalServices || []),
                  { title: '', price: '', description: '', priceType: 'fixed' }
                ]
              });
            }}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Service
          </Button>
        </div>
        
        {additionalServices.length === 0 ? (
          <p className="text-sm text-forest/60 italic">No services configured. Click "Add Service" to create one.</p>
        ) : (
          <div className="space-y-2">
            {additionalServices.map((service: any, index: number) => (
              <div key={index} className="bg-white rounded-xl p-3 border border-sage/10">
                <div className="grid md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label className="text-forest/70 mb-1 block text-xs">Service Name</Label>
                    <Input
                      value={service.title}
                      onChange={(e) => {
                        const newServices = [...(data.additionalServices || [])];
                        newServices[index] = { ...newServices[index], title: e.target.value };
                        setData({ ...data, additionalServices: newServices });
                      }}
                      placeholder="Grooming"
                      className="rounded-lg h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-forest/70 mb-1 block text-xs">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/60 text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          value={service.price?.replace(/[^0-9.]/g, '') || ''}
                          onChange={(e) => {
                            const newServices = [...(data.additionalServices || [])];
                            newServices[index] = { ...newServices[index], price: e.target.value };
                            setData({ ...data, additionalServices: newServices });
                          }}
                          placeholder="35"
                          className="rounded-lg h-9 pl-6"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-forest/70 mb-1 block text-xs">Price Type</Label>
                      <select
                        value={service.priceType || 'fixed'}
                        onChange={(e) => {
                          const newServices = [...(data.additionalServices || [])];
                          newServices[index] = { ...newServices[index], priceType: e.target.value };
                          setData({ ...data, additionalServices: newServices });
                        }}
                        className="w-full h-9 px-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                      >
                        <option value="fixed">Fixed</option>
                        <option value="daily">Per Day</option>
                        <option value="each">Each</option>
                        <option value="per-visit">Per Visit</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <Label className="text-forest/70 mb-1 block text-xs">Description</Label>
                  <Textarea
                    value={service.description}
                    onChange={(e) => {
                      const newServices = [...(data.additionalServices || [])];
                      newServices[index] = { ...newServices[index], description: e.target.value };
                      setData({ ...data, additionalServices: newServices });
                    }}
                    placeholder="Professional bathing and brushing"
                    className="rounded-lg h-12 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      setData({
                        ...data,
                        additionalServices: (data.additionalServices || []).filter((_: any, i: number) => i !== index)
                      });
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tax Logic */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <h4 className="font-semibold text-forest mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-sage" />
          Tax Settings
        </h4>
        
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.chargeTax}
              onChange={(e) => setData({ ...data, chargeTax: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-forest/70">Charge tax on bookings</span>
          </label>
        </div>

        {data.chargeTax && (
          <div className="space-y-3">
            <div className="bg-sage/10 border border-sage/30 rounded-lg p-3 text-sm text-forest">
              <strong>Auto-detected:</strong> {data.taxType} at {data.taxRate}% based on your location ({data.location || 'Not set'})
            </div>
            
            <div>
              <Label className="text-forest/70 mb-2 block text-sm">Tax Type</Label>
              <select
                value={data.taxType}
                onChange={(e) => setData({ ...data, taxType: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
              >
                <option value="GST">GST (New Zealand, Australia)</option>
                <option value="VAT">VAT (UK, Europe)</option>
                <option value="Sales Tax">Sales Tax (US)</option>
              </select>
            </div>

            <div>
              <Label className="text-forest/70 mb-2 block text-sm">Tax Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.taxRate}
                onChange={(e) => setData({ ...data, taxRate: e.target.value })}
                className="rounded-xl w-32"
              />
            </div>
          </div>
        )}
      </div>

      {/* Discounts */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-forest flex items-center gap-2">
            <Tag className="w-5 h-5 text-sage" />
            Discounts
          </h4>
          <Button
            type="button"
            onClick={addDiscount}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Discount
          </Button>
        </div>

        {discounts.length === 0 ? (
          <p className="text-sm text-forest/60 italic">No discounts configured. Click "Add Discount" to create one.</p>
        ) : (
          <div className="space-y-3">
            {discounts.map((discount: any, index: number) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-sage/10">
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-forest/70 mb-1 block text-xs">Discount Name</Label>
                    <Input
                      value={discount.name}
                      onChange={(e) => updateDiscount(index, 'name', e.target.value)}
                      placeholder="Early Bird Special"
                      className="rounded-lg h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-forest/70 mb-1 block text-xs">Type</Label>
                    <select
                      value={discount.type}
                      onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                      className="w-full h-9 px-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-forest/70 mb-1 block text-xs">Value</Label>
                      <Input
                        type="number"
                        min="0"
                        value={discount.value}
                        onChange={(e) => updateDiscount(index, 'value', e.target.value)}
                        className="rounded-lg h-9"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeDiscount(index)}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block Out Dates */}
      <div className="bg-cream-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-forest flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-sage" />
            Block Out Dates
          </h4>
          <Button
            type="button"
            onClick={addBlockOutDate}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Block Out
          </Button>
        </div>

        {blockOutDates.length === 0 ? (
          <p className="text-sm text-forest/60 italic">No block out dates configured. Click "Add Block Out" to create one.</p>
        ) : (
          <div className="space-y-3">
            {blockOutDates.map((blockOut: any, index: number) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-sage/10">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-forest/70 mb-1 block text-xs">Period Name</Label>
                    <Input
                      value={blockOut.name}
                      onChange={(e) => updateBlockOutDate(index, 'name', e.target.value)}
                      placeholder="Christmas / New Years"
                      className="rounded-lg h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-forest/70 mb-1 block text-xs">Start Date</Label>
                    <div className="relative">
                      <CalendarX className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
                      <Input
                        type="date"
                        id={`start-date-${index}`}
                        value={blockOut.startDate}
                        onChange={(e) => updateBlockOutDate(index, 'startDate', e.target.value)}
                        className="rounded-lg h-9 pl-10 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-forest/70 mb-1 block text-xs">End Date</Label>
                    <div className="relative">
                      <CalendarX className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
                      <Input
                        type="date"
                        id={`end-date-${index}`}
                        value={blockOut.endDate}
                        onChange={(e) => updateBlockOutDate(index, 'endDate', e.target.value)}
                        className="rounded-lg h-9 pl-10 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => removeBlockOutDate(index)}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
