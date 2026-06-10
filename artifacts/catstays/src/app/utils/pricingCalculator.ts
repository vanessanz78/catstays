// Pricing Calculator for Room Planner

import { PricingRule, SpecialEvent, Room } from '../types/room-planner';
import { parseISO, eachDayOfInterval, getDay, differenceInDays, isWithinInterval } from 'date-fns';

export interface PriceBreakdown {
  basePrice: number;
  totalNights: number;
  appliedRules: Array<{
    name: string;
    adjustment: number;
    type: 'discount' | 'premium';
  }>;
  finalPrice: number;
  averagePerNight: number;
}

export function calculatePrice(
  room: Room,
  checkIn: string,
  checkOut: string,
  pricingRules: PricingRule[],
  specialEvents: SpecialEvent[]
): PriceBreakdown {
  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);
  const totalNights = differenceInDays(checkOutDate, checkInDate);
  
  if (totalNights <= 0) {
    return {
      basePrice: 0,
      totalNights: 0,
      appliedRules: [],
      finalPrice: 0,
      averagePerNight: 0,
    };
  }

  const basePrice = room.baseRate * totalNights;
  const appliedRules: Array<{ name: string; adjustment: number; type: 'discount' | 'premium' }> = [];
  
  let totalMultiplier = 1;
  const bookingDate = new Date();
  const daysUntilCheckIn = differenceInDays(checkInDate, bookingDate);

  // Get all days in the stay
  const stayDays = eachDayOfInterval({ start: checkInDate, end: checkOutDate });

  // Check special events (highest priority)
  const activeEvents = specialEvents.filter(event => 
    event.enabled &&
    isWithinInterval(checkInDate, {
      start: parseISO(event.startDate),
      end: parseISO(event.endDate),
    })
  );

  if (activeEvents.length > 0) {
    const highestMultiplier = Math.max(...activeEvents.map(e => e.priceMultiplier));
    const adjustment = ((highestMultiplier - 1) * 100);
    appliedRules.push({
      name: activeEvents[0].name,
      adjustment,
      type: 'premium',
    });
    totalMultiplier *= highestMultiplier;
  }

  // Apply pricing rules
  const enabledRules = pricingRules.filter(rule => rule.enabled);

  for (const rule of enabledRules) {
    let applies = false;

    switch (rule.type) {
      case 'holiday':
      case 'seasonal':
        if (rule.dateRange && !activeEvents.length) {
          const inRange = isWithinInterval(checkInDate, {
            start: parseISO(rule.dateRange.start),
            end: parseISO(rule.dateRange.end),
          });
          if (inRange && rule.multiplier) {
            applies = true;
            const adjustment = ((rule.multiplier - 1) * 100);
            appliedRules.push({
              name: rule.name,
              adjustment,
              type: rule.multiplier > 1 ? 'premium' : 'discount',
            });
            totalMultiplier *= rule.multiplier;
          }
        }
        break;

      case 'weekend':
        if (rule.daysOfWeek && rule.multiplier) {
          const weekendDays = stayDays.filter(day => 
            rule.daysOfWeek!.includes(getDay(day))
          );
          if (weekendDays.length > 0) {
            applies = true;
            const adjustment = ((rule.multiplier - 1) * 100);
            appliedRules.push({
              name: rule.name,
              adjustment,
              type: 'premium',
            });
            totalMultiplier *= rule.multiplier;
          }
        }
        break;

      case 'weekday':
        if (rule.daysOfWeek && rule.multiplier) {
          const weekdayCount = stayDays.filter(day => 
            rule.daysOfWeek!.includes(getDay(day))
          ).length;
          if (weekdayCount > 0 && weekdayCount === stayDays.length) {
            applies = true;
            const adjustment = ((rule.multiplier - 1) * 100);
            appliedRules.push({
              name: rule.name,
              adjustment,
              type: 'discount',
            });
            totalMultiplier *= rule.multiplier;
          }
        }
        break;

      case 'extended_stay':
        if (rule.minNights && totalNights >= rule.minNights && rule.multiplier) {
          applies = true;
          const adjustment = ((rule.multiplier - 1) * 100);
          appliedRules.push({
            name: rule.name,
            adjustment,
            type: 'discount',
          });
          totalMultiplier *= rule.multiplier;
        }
        break;

      case 'last_minute':
        if (rule.daysThreshold && daysUntilCheckIn <= rule.daysThreshold && rule.multiplier) {
          applies = true;
          const adjustment = ((rule.multiplier - 1) * 100);
          appliedRules.push({
            name: rule.name,
            adjustment,
            type: 'discount',
          });
          totalMultiplier *= rule.multiplier;
        }
        break;

      case 'gap_filler':
        // This would require checking existing bookings
        // Skip for now
        break;
    }
  }

  const finalPrice = Math.round(basePrice * totalMultiplier);
  const averagePerNight = Math.round(finalPrice / totalNights);

  return {
    basePrice,
    totalNights,
    appliedRules,
    finalPrice,
    averagePerNight,
  };
}

export function getDailyPriceForDate(
  room: Room,
  date: Date,
  pricingRules: PricingRule[],
  specialEvents: SpecialEvent[]
): { price: number; multiplier: number } {
  const dateStr = date.toISOString().split('T')[0];
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  const breakdown = calculatePrice(room, dateStr, nextDayStr, pricingRules, specialEvents);
  
  return {
    price: breakdown.finalPrice,
    multiplier: breakdown.finalPrice / room.baseRate,
  };
}
