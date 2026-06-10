// LocalStorage utilities for Room Planner

import { Room, Booking, PricingRule, SpecialEvent } from '../types/room-planner';

const STORAGE_KEYS = {
  ROOMS: 'catStays_rooms',
  BOOKINGS: 'catStays_bookings',
  PRICING_RULES: 'catStays_pricing_rules',
  SPECIAL_EVENTS: 'catStays_special_events',
};

// Rooms
export const getRooms = (): Room[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ROOMS);
  return stored ? JSON.parse(stored) : getDefaultRooms();
};

export const saveRooms = (rooms: Room[]): void => {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
};

// Bookings
export const getBookings = (): Booking[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return stored ? JSON.parse(stored) : getDefaultBookings();
};

export const saveBookings = (bookings: Booking[]): void => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

// Pricing Rules
export const getPricingRules = (): PricingRule[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRICING_RULES);
  return stored ? JSON.parse(stored) : getDefaultPricingRules();
};

export const savePricingRules = (rules: PricingRule[]): void => {
  localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(rules));
};

// Special Events
export const getSpecialEvents = (): SpecialEvent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SPECIAL_EVENTS);
  return stored ? JSON.parse(stored) : getDefaultSpecialEvents();
};

export const saveSpecialEvents = (events: SpecialEvent[]): void => {
  localStorage.setItem(STORAGE_KEYS.SPECIAL_EVENTS, JSON.stringify(events));
};

// Default Data
function getDefaultRooms(): Room[] {
  return [
    {
      id: '1',
      name: 'Suite 1',
      type: 'premium',
      baseRate: 65,
      maxOccupancy: 2,
      amenities: ['Window View', 'Premium Bedding', 'Play Area', 'Heating Pad'],
      status: 'available',
      size: 24,
      active: true,
    },
    {
      id: '2',
      name: 'Suite 2',
      type: 'premium',
      baseRate: 65,
      maxOccupancy: 2,
      amenities: ['Window View', 'Premium Bedding', 'Play Area'],
      status: 'available',
      size: 24,
      active: true,
    },
    {
      id: '3',
      name: 'Deluxe 1',
      type: 'deluxe',
      baseRate: 45,
      maxOccupancy: 1,
      amenities: ['Window View', 'Comfortable Bedding'],
      status: 'available',
      size: 16,
      active: true,
    },
    {
      id: '4',
      name: 'Deluxe 2',
      type: 'deluxe',
      baseRate: 45,
      maxOccupancy: 1,
      amenities: ['Window View', 'Comfortable Bedding'],
      status: 'available',
      size: 16,
      active: true,
    },
    {
      id: '5',
      name: 'Standard 1',
      type: 'standard',
      baseRate: 35,
      maxOccupancy: 1,
      amenities: ['Basic Bedding'],
      status: 'available',
      size: 12,
      active: true,
    },
    {
      id: '6',
      name: 'Standard 2',
      type: 'standard',
      baseRate: 35,
      maxOccupancy: 1,
      amenities: ['Basic Bedding'],
      status: 'available',
      size: 12,
      active: true,
    },
  ];
}

function getDefaultBookings(): Booking[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: '1',
      roomId: '1',
      catName: 'Whiskers',
      ownerName: 'Sarah Johnson',
      ownerEmail: 'sarah@example.com',
      ownerPhone: '555-0101',
      checkIn: today.toISOString().split('T')[0],
      checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numberOfNights: 5,
      basePrice: 65,
      finalPrice: 308,
      appliedDiscounts: ['Extended Stay -10%'],
      addOns: [
        { id: '1', name: 'Premium Food', price: 8, quantity: 5 },
      ],
      status: 'checked_in',
      specialNeeds: 'Medication twice daily',
      emergencyContact: '555-0102',
      vetContact: 'Dr. Smith - 555-0103',
      createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function getDefaultPricingRules(): PricingRule[] {
  return [
    {
      id: '1',
      name: 'Weekend Premium',
      type: 'weekend',
      enabled: true,
      multiplier: 1.2,
      daysOfWeek: [5, 6, 0], // Friday, Saturday, Sunday
      description: 'Add 20% on weekends (Fri-Sun)',
    },
    {
      id: '2',
      name: 'Extended Stay Discount',
      type: 'extended_stay',
      enabled: true,
      multiplier: 0.9,
      minNights: 7,
      description: '10% off for stays of 7+ nights',
    },
    {
      id: '3',
      name: 'Last Minute Booking',
      type: 'last_minute',
      enabled: true,
      multiplier: 0.85,
      daysThreshold: 3,
      description: '15% off for bookings within 3 days',
    },
    {
      id: '4',
      name: 'Weekday Discount',
      type: 'weekday',
      enabled: true,
      multiplier: 0.85,
      daysOfWeek: [1, 2, 3, 4], // Mon-Thu
      description: '15% off on weekdays (Mon-Thu)',
    },
    {
      id: '5',
      name: 'Summer Peak Season',
      type: 'seasonal',
      enabled: true,
      multiplier: 1.3,
      dateRange: {
        start: '2026-06-01',
        end: '2026-08-31',
      },
      description: '30% premium during summer (Jun-Aug)',
    },
    {
      id: '6',
      name: 'Holiday Premium',
      type: 'holiday',
      enabled: true,
      multiplier: 1.5,
      dateRange: {
        start: '2026-12-20',
        end: '2026-01-05',
      },
      description: '50% premium during holiday season',
    },
  ];
}

function getDefaultSpecialEvents(): SpecialEvent[] {
  return [
    {
      id: '1',
      name: 'Christmas & New Year',
      startDate: '2026-12-20',
      endDate: '2027-01-05',
      priceMultiplier: 1.5,
      minStay: 2,
      enabled: true,
    },
    {
      id: '2',
      name: 'Easter Weekend',
      startDate: '2026-04-03',
      endDate: '2026-04-06',
      priceMultiplier: 1.3,
      minStay: 1,
      enabled: true,
    },
  ];
}
