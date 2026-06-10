import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Save,
  X,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Booking, Room, AddOn } from '../../types/room-planner';
import { getRooms, getBookings, saveBookings, getPricingRules } from '../../utils/roomPlannerStorage';
import { calculatePrice } from '../../utils/pricingCalculator';
import { format, differenceInDays, parseISO } from 'date-fns';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  preSelectedRoom?: string;
  preSelectedDate?: Date;
  onSave: () => void;
}

const availableAddOns: Omit<AddOn, 'quantity'>[] = [
  { id: 'premium-food', name: 'Premium Food', price: 8 },
  { id: 'playtime', name: 'Extended Playtime', price: 12 },
  { id: 'grooming', name: 'Grooming', price: 35 },
  { id: 'medication', name: 'Medication Administration', price: 5 },
  { id: 'photo-updates', name: 'Daily Photo Updates', price: 5 },
  { id: 'outdoor-time', name: 'Private Outdoor Time', price: 10 },
];

export function BookingFormModal({
  isOpen,
  onClose,
  booking,
  preSelectedRoom,
  preSelectedDate,
  onSave
}: BookingFormModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    roomId: preSelectedRoom || '',
    catName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    checkIn: preSelectedDate ? format(preSelectedDate, 'yyyy-MM-dd') : '',
    checkOut: '',
    status: 'confirmed' as Booking['status'],
    specialNeeds: '',
    emergencyContact: '',
    vetContact: '',
    addOns: [] as AddOn[],
  });

  useEffect(() => {
    setRooms(getRooms().filter(r => r.active));
    
    if (booking) {
      setFormData({
        roomId: booking.roomId,
        catName: booking.catName,
        ownerName: booking.ownerName,
        ownerEmail: booking.ownerEmail,
        ownerPhone: booking.ownerPhone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        specialNeeds: booking.specialNeeds || '',
        emergencyContact: booking.emergencyContact || '',
        vetContact: booking.vetContact || '',
        addOns: booking.addOns || [],
      });
    }
  }, [booking]);

  const selectedRoom = rooms.find(r => r.id === formData.roomId);
  
  const numberOfNights = formData.checkIn && formData.checkOut
    ? Math.max(0, differenceInDays(parseISO(formData.checkOut), parseISO(formData.checkIn)))
    : 0;

  const pricingRules = getPricingRules();
  const priceCalculation = formData.checkIn && formData.checkOut && selectedRoom
    ? calculatePrice(
        selectedRoom.baseRate,
        parseISO(formData.checkIn),
        parseISO(formData.checkOut),
        pricingRules
      )
    : { total: 0, basePrice: 0, appliedRules: [] };

  const addOnsTotal = formData.addOns.reduce((sum, addon) => 
    sum + (addon.price * addon.quantity), 0
  );

  const finalPrice = priceCalculation.total + addOnsTotal;

  const handleSave = () => {
    if (!formData.roomId || !formData.catName || !formData.ownerName || !formData.checkIn || !formData.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    const bookings = getBookings();
    const newBooking: Booking = {
      id: booking?.id || Date.now().toString(),
      roomId: formData.roomId,
      catName: formData.catName,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      numberOfNights,
      basePrice: priceCalculation.basePrice,
      finalPrice,
      appliedDiscounts: priceCalculation.appliedRules,
      addOns: formData.addOns,
      status: formData.status,
      specialNeeds: formData.specialNeeds,
      emergencyContact: formData.emergencyContact,
      vetContact: formData.vetContact,
      createdAt: booking?.createdAt || new Date().toISOString(),
    };

    let updatedBookings;
    if (booking) {
      updatedBookings = bookings.map(b => b.id === booking.id ? newBooking : b);
    } else {
      updatedBookings = [...bookings, newBooking];
    }

    saveBookings(updatedBookings);
    onSave();
  };

  const handleAddOnToggle = (addOn: Omit<AddOn, 'quantity'>) => {
    const existing = formData.addOns.find(a => a.id === addOn.id);
    if (existing) {
      setFormData({
        ...formData,
        addOns: formData.addOns.filter(a => a.id !== addOn.id)
      });
    } else {
      setFormData({
        ...formData,
        addOns: [...formData.addOns, { ...addOn, quantity: 1 }]
      });
    }
  };

  const handleAddOnQuantityChange = (addOnId: string, quantity: number) => {
    setFormData({
      ...formData,
      addOns: formData.addOns.map(a => 
        a.id === addOnId ? { ...a, quantity: Math.max(1, quantity) } : a
      )
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A1128]">
            {booking ? 'Edit Booking' : 'Create New Booking'}
          </DialogTitle>
          <DialogDescription>
            {booking ? 'Update booking details below' : 'Fill in the details to create a new booking'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Room Selection */}
          <div>
            <Label htmlFor="room" className="text-sm font-semibold mb-2 block">
              Room <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.roomId} onValueChange={(value) => setFormData({ ...formData, roomId: value })}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} - {room.type} (${room.baseRate}/night)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="catName" className="text-sm font-semibold mb-2 block">
                Cat Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="catName"
                value={formData.catName}
                onChange={(e) => setFormData({ ...formData, catName: e.target.value })}
                placeholder="Fluffy"
              />
            </div>
            <div>
              <Label htmlFor="ownerName" className="text-sm font-semibold mb-2 block">
                Owner Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Sarah Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerEmail" className="text-sm font-semibold mb-2 block">
                Email
              </Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                placeholder="sarah@example.com"
              />
            </div>
            <div>
              <Label htmlFor="ownerPhone" className="text-sm font-semibold mb-2 block">
                Phone
              </Label>
              <Input
                id="ownerPhone"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                placeholder="555-1234"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="checkIn" className="text-sm font-semibold mb-2 block">
                Check-In <span className="text-red-500">*</span>
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="checkOut" className="text-sm font-semibold mb-2 block">
                Check-Out <span className="text-red-500">*</span>
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Nights</Label>
              <div className="h-10 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 flex items-center">
                <span className="text-lg font-bold text-[#8FBC8F]">{numberOfNights}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-sm font-semibold mb-2 block">
              Booking Status
            </Label>
            <Select value={formData.status} onValueChange={(value: Booking['status']) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add-ons */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Add-On Services</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableAddOns.map((addOn) => {
                const selected = formData.addOns.find(a => a.id === addOn.id);
                return (
                  <div
                    key={addOn.id}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selected
                        ? 'border-[#8FBC8F] bg-[#8FBC8F]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddOnToggle(addOn)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{addOn.name}</div>
                        <div className="text-xs text-gray-500">${addOn.price}/day</div>
                      </div>
                      {selected && (
                        <Badge className="bg-[#8FBC8F]">✓</Badge>
                      )}
                    </div>
                    {selected && (
                      <div className="mt-2 pt-2 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-xs mb-1 block">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={selected.quantity}
                          onChange={(e) => handleAddOnQuantityChange(addOn.id, parseInt(e.target.value))}
                          className="h-7 text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Notes */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="specialNeeds" className="text-sm font-semibold mb-2 block">
                Special Needs / Medical Notes
              </Label>
              <Textarea
                id="specialNeeds"
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                placeholder="Any dietary restrictions, medications, or special care requirements..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="emergencyContact" className="text-sm font-semibold mb-2 block">
                Emergency Contact
              </Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name and phone number"
              />
            </div>
            <div>
              <Label htmlFor="vetContact" className="text-sm font-semibold mb-2 block">
                Veterinarian Contact
              </Label>
              <Input
                id="vetContact"
                value={formData.vetContact}
                onChange={(e) => setFormData({ ...formData, vetContact: e.target.value })}
                placeholder="Vet clinic name and phone number"
              />
            </div>
          </div>

          {/* Pricing Breakdown */}
          {numberOfNights > 0 && selectedRoom && (
            <div className="p-4 bg-gradient-to-br from-[#8FBC8F]/10 to-white rounded-xl border-2 border-[#8FBC8F]/30">
              <h3 className="font-semibold text-[#0A1128] mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#8FBC8F]" />
                Pricing Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Rate ({numberOfNights} nights × ${selectedRoom.baseRate})</span>
                  <span className="font-medium">${priceCalculation.basePrice.toFixed(2)}</span>
                </div>
                
                {priceCalculation.appliedRules && priceCalculation.appliedRules.length > 0 && (
                  <div className="pl-4 space-y-1 text-xs text-gray-600">
                    {priceCalculation.appliedRules.map((rule, idx) => (
                      <div key={idx}>✨ {rule}</div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between font-semibold text-[#8FBC8F]">
                  <span>Room Subtotal (with dynamic pricing)</span>
                  <span>${priceCalculation.total.toFixed(2)}</span>
                </div>

                {formData.addOns.length > 0 && (
                  <>
                    <div className="pt-2 border-t border-gray-200">
                      {formData.addOns.map((addOn) => (
                        <div key={addOn.id} className="flex justify-between text-xs">
                          <span className="text-gray-600">{addOn.name} (×{addOn.quantity})</span>
                          <span className="font-medium">${(addOn.price * addOn.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Add-ons Total</span>
                      <span>${addOnsTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t-2 border-[#8FBC8F]/30 flex justify-between text-lg font-bold text-[#0A1128]">
                  <span>Total</span>
                  <span className="text-[#8FBC8F]">${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#8FBC8F] hover:bg-[#8FBC8F]/90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {booking ? 'Update Booking' : 'Create Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
