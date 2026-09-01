import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

export function inclusiveStayDays(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) return 0;

  const arrival = parseISO(arrivalDate);
  const departure = parseISO(departureDate);
  if (!isValid(arrival) || !isValid(departure)) return 0;

  const calendarDayDifference = differenceInCalendarDays(departure, arrival);
  return calendarDayDifference >= 0 ? calendarDayDifference + 1 : 0;
}

export function longStayDiscountPercent(days: number) {
  if (days >= 60) return 15;
  if (days >= 30) return 10;
  if (days >= 15) return 5;
  return 0;
}

export function calculateAssignedRoomTotal(days: number, dailyRates: number[]) {
  const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const safeRates = dailyRates.map((rate) => Number.isFinite(rate) ? Math.max(0, rate) : 0);
  return safeDays * safeRates.reduce((total, rate) => total + rate, 0);
}

export function calculateStaffBookingPrice({
  days,
  dailyRates,
  arrangement,
  occupancyRates = [],
  chargeTax = true,
  taxRate = 15,
}: {
  days: number;
  dailyRates: number[];
  arrangement: 'shared' | 'separate';
  occupancyRates?: Array<{ numberOfCats: number; price: number }>;
  chargeTax?: boolean;
  taxRate?: number;
}) {
  const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const safeRates = dailyRates.map((rate) => Number.isFinite(rate) ? Math.max(0, rate) : 0);
  const occupancyRate = arrangement === 'shared'
    ? occupancyRates.find((rate) => rate.numberOfCats === safeRates.length && Number.isFinite(rate.price))
    : undefined;
  const dailyTotal = occupancyRate
    ? Math.max(0, Number(occupancyRate.price))
    : safeRates.reduce((total, rate) => total + rate, 0);
  const subtotal = Number((safeDays * dailyTotal).toFixed(2));
  const safeTaxRate = chargeTax && Number.isFinite(taxRate) ? Math.min(100, Math.max(0, taxRate)) : 0;
  const tax = Number((subtotal * (safeTaxRate / 100)).toFixed(2));
  return {
    days: safeDays,
    dailyTotal: Number(dailyTotal.toFixed(2)),
    subtotal,
    tax,
    total: Number((subtotal + tax).toFixed(2)),
    occupancyRateApplied: Boolean(occupancyRate),
  };
}

export function bookingOverlapsStay(
  existingCheckIn: string,
  existingCheckOut: string,
  requestedCheckIn: string,
  requestedCheckOut: string,
) {
  if (
    inclusiveStayDays(existingCheckIn, existingCheckOut) === 0
    || inclusiveStayDays(requestedCheckIn, requestedCheckOut) === 0
  ) return false;

  return existingCheckIn <= requestedCheckOut && existingCheckOut >= requestedCheckIn;
}

export function calculateBookingEstimate({
  dailyRate,
  days,
  numberOfCats,
  discountPercent = longStayDiscountPercent(days),
  gstRate = 0.15,
}: {
  dailyRate: number;
  days: number;
  numberOfCats: number;
  discountPercent?: number;
  gstRate?: number;
}) {
  const safeRate = Number.isFinite(dailyRate) ? Math.max(0, dailyRate) : 0;
  const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const safeCats = Number.isFinite(numberOfCats) ? Math.max(1, Math.floor(numberOfCats)) : 1;
  const safeDiscount = Number.isFinite(discountPercent) ? Math.min(100, Math.max(0, discountPercent)) : 0;
  const safeGstRate = Number.isFinite(gstRate) ? Math.max(0, gstRate) : 0;

  const beforeDiscount = safeRate * safeDays * safeCats;
  const discount = beforeDiscount * (safeDiscount / 100);
  const subtotal = beforeDiscount - discount;
  const gst = subtotal * safeGstRate;

  return {
    beforeDiscount,
    discount,
    subtotal,
    gst,
    total: subtotal + gst,
  };
}
