// Room Planner Type Definitions

export interface Room {
  id: string;
  name: string;
  type: 'standard' | 'deluxe' | 'premium';
  baseRate: number;
  maxOccupancy: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  size: number;
  active: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  roomId: string;
  catName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  basePrice: number;
  finalPrice: number;
  appliedDiscounts: string[];
  addOns: AddOn[];
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  specialNeeds: string;
  emergencyContact: string;
  vetContact: string;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'weekend' | 'seasonal' | 'last_minute' | 'extended_stay' | 'gap_filler' | 'holiday' | 'weekday';
  enabled: boolean;
  multiplier?: number;
  fixedAmount?: number;
  dateRange?: { start: string; end: string };
  daysThreshold?: number;
  minNights?: number;
  daysOfWeek?: number[];
  description: string;
}

export interface SpecialEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  minStay?: number;
  enabled: boolean;
}
