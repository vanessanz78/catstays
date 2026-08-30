import { normalizeBookingSchedule } from './bookingSchedule';

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
  cancellationPolicy: string;
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
  const configuredDeposit = Number(source.depositAmount ?? source.depositPercentage ?? 0);

  return {
    ...schedule,
    openByAppointmentOnly: source.openByAppointmentOnly === true,
    depositType: source.depositType === 'percentage' ? 'percentage' : 'fixed',
    depositAmount: Number.isFinite(configuredDeposit) ? Math.max(0, configuredDeposit) : 0,
    pricingPer: 'day',
    cancellationPolicy: typeof source.cancellationPolicy === 'string' ? source.cancellationPolicy : '',
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
