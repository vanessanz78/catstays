import { normalizeBookingSchedule } from './bookingSchedule';
import { normalizePaymentMethods, type PaymentMethod } from './bookingOperations';

export const BOOKING_DAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
] as const;

export type DepositType = 'fixed' | 'percentage';

export interface BookingSetupValues {
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  bookingInterval: number;
  morningDays: number[];
  afternoonDays: number[];
  openByAppointmentOnly: boolean;
  depositType: DepositType;
  depositAmount: number;
  pricingPer: 'day';
  pricingRates: Array<{
    numberOfCats: number;
    price: number;
    discountType: 'none' | 'fixed' | 'percentage';
    discountValue: number;
  }>;
  chargeTax: boolean;
  taxRate: number;
  taxType: string;
  cancellationPolicy: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  appointmentsEnabled: boolean;
  enabledPaymentMethods: PaymentMethod[];
  defaultConfirmationPayment: 'deposit' | 'full' | 'none';
  confirmationMessage: string;
}

export interface BookingBlackout {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeBookingSetup(settings: unknown): BookingSetupValues {
  const root = asObject(settings);
  const nested = asObject(root.bookingRules);
  const source = { ...nested, ...root };
  const schedule = normalizeBookingSchedule(source);
  const configuredDeposit = Number(source.depositAmount ?? source.depositPercentage ?? 50);
  const configuredTaxRate = Number(source.taxRate ?? 15);
  const pricingRates: BookingSetupValues['pricingRates'] = Array.isArray(source.pricingRates)
    ? source.pricingRates.flatMap((entry) => {
        const rate = asObject(entry);
        const numberOfCats = Number(rate.numberOfCats);
        const price = Number(rate.price);
        if (!Number.isFinite(numberOfCats) || numberOfCats < 1 || !Number.isFinite(price) || price < 0) return [];
        return [{
          numberOfCats: Math.floor(numberOfCats),
          price,
          discountType: rate.discountType === 'fixed' || rate.discountType === 'percentage'
            ? rate.discountType
            : 'none',
          discountValue: Math.max(0, Number(rate.discountValue) || 0),
        }];
      })
    : [];

  return {
    ...schedule,
    openByAppointmentOnly: source.openByAppointmentOnly === true,
    depositType: source.depositType === 'percentage' ? 'percentage' : 'fixed',
    depositAmount: Number.isFinite(configuredDeposit) ? Math.max(0, configuredDeposit) : 0,
    pricingPer: 'day',
    pricingRates,
    chargeTax: source.chargeTax !== false,
    taxRate: Number.isFinite(configuredTaxRate) ? Math.min(100, Math.max(0, configuredTaxRate)) : 15,
    taxType: typeof source.taxType === 'string' && source.taxType.trim() ? source.taxType.trim() : 'GST',
    cancellationPolicy: typeof source.cancellationPolicy === 'string' ? source.cancellationPolicy : '',
    defaultCheckInTime: typeof source.defaultCheckInTime === 'string' ? source.defaultCheckInTime : '09:30',
    defaultCheckOutTime: typeof source.defaultCheckOutTime === 'string' ? source.defaultCheckOutTime : '16:30',
    appointmentsEnabled: source.appointmentsEnabled === true,
    enabledPaymentMethods: normalizePaymentMethods(source.enabledPaymentMethods),
    defaultConfirmationPayment: source.defaultConfirmationPayment === 'full'
      ? 'full'
      : source.defaultConfirmationPayment === 'none' ? 'none' : 'deposit',
    confirmationMessage: typeof source.confirmationMessage === 'string'
      ? source.confirmationMessage
      : 'Your cat is booked in. Please check the dates, arrival and collection times, price, and terms below.',
  };
}

export function validateBookingSetup(values: BookingSetupValues) {
  const errors: string[] = [];
  if (values.morningEnd < values.morningStart) errors.push('Morning closing time must be after the opening time.');
  if (values.afternoonEnd < values.afternoonStart) errors.push('Afternoon closing time must be after the opening time.');
  if (![15, 30, 45, 60].includes(values.bookingInterval)) errors.push('Choose a supported booking interval.');
  if (!values.openByAppointmentOnly && values.morningDays.length === 0 && values.afternoonDays.length === 0) {
    errors.push('Select at least one open day, or turn on appointment-only bookings.');
  }
  if (!Number.isFinite(values.depositAmount) || values.depositAmount < 0) errors.push('Deposit amount cannot be negative.');
  if (values.depositType === 'percentage' && values.depositAmount > 100) errors.push('Deposit percentage cannot be more than 100%.');
  if (!Number.isFinite(values.taxRate) || values.taxRate < 0 || values.taxRate > 100) errors.push('Tax rate must be between 0% and 100%.');
  if (new Set(values.pricingRates.map((rate) => rate.numberOfCats)).size !== values.pricingRates.length) {
    errors.push('Keep only one shared-room rate for each number of cats.');
  }
  if (values.pricingRates.some((rate) => !Number.isInteger(rate.numberOfCats) || rate.numberOfCats < 1 || !Number.isFinite(rate.price) || rate.price < 0)) {
    errors.push('Shared-room rates need a valid cat count and daily total.');
  }
  if (!/^\d{2}:\d{2}$/.test(values.defaultCheckInTime) || !/^\d{2}:\d{2}$/.test(values.defaultCheckOutTime)) {
    errors.push('Choose valid default arrival and collection times.');
  }
  if (values.enabledPaymentMethods.length === 0) errors.push('Keep at least one manual payment method enabled.');
  return errors;
}

export function validateBlackouts(blackouts: BookingBlackout[]) {
  const errors: string[] = [];
  blackouts.forEach((blackout, index) => {
    const label = blackout.name.trim() || `Blackout ${index + 1}`;
    if (!blackout.name.trim()) errors.push(`${label} needs a name.`);
    if (!blackout.startDate || !blackout.endDate) errors.push(`${label} needs a start and end date.`);
    else if (blackout.endDate < blackout.startDate) errors.push(`${label} must end on or after its start date.`);
  });
  return errors;
}

export function dateIsBlackout(blackouts: BookingBlackout[], isoDate: string) {
  return blackouts.some((blackout) => isoDate >= blackout.startDate && isoDate <= blackout.endDate);
}

export function stayOverlapsBlackout(blackouts: BookingBlackout[], arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) return false;
  return blackouts.some((blackout) => arrivalDate <= blackout.endDate && departureDate >= blackout.startDate);
}

export function normalizePublicBlackouts(settings: unknown): BookingBlackout[] {
  const root = asObject(settings);
  if (!Array.isArray(root.bookingBlackouts)) return [];
  return root.bookingBlackouts.flatMap((entry, index) => {
    const item = asObject(entry);
    const startDate = typeof item.startDate === 'string' ? item.startDate : '';
    const endDate = typeof item.endDate === 'string' ? item.endDate : '';
    if (!startDate || !endDate) return [];
    return [{
      id: typeof item.id === 'string' ? item.id : `public-blackout-${index}`,
      name: typeof item.name === 'string' ? item.name : 'Unavailable',
      startDate,
      endDate,
    }];
  });
}
