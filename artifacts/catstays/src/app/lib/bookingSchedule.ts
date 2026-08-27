export type BookingWindowSettings = Record<string, unknown> | null | undefined;

export interface CustomerSearchRecord {
  name: string;
  email: string;
  phone?: string | null;
  cats?: Array<{ name: string }>;
}

export interface NormalizedBookingSchedule {
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  bookingInterval: number;
  morningDays: number[];
  afternoonDays: number[];
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_SCHEDULE: NormalizedBookingSchedule = {
  morningStart: '08:00',
  morningEnd: '12:00',
  afternoonStart: '14:00',
  afternoonEnd: '18:00',
  bookingInterval: 30,
  morningDays: ALL_DAYS,
  afternoonDays: ALL_DAYS,
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function validTime(value: unknown, fallback: string) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    ? value
    : fallback;
}

function validDays(value: unknown, fallback: number[]) {
  if (!Array.isArray(value)) return fallback;

  const days = value
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);

  return [...new Set(days)];
}

export function normalizeBookingSchedule(settings: BookingWindowSettings): NormalizedBookingSchedule {
  const root = asObject(settings);
  const nested = asObject(root.bookingRules);
  const source = { ...nested, ...root };
  const interval = Number(source.bookingInterval);

  return {
    morningStart: validTime(source.morningStart, DEFAULT_SCHEDULE.morningStart),
    morningEnd: validTime(source.morningEnd, DEFAULT_SCHEDULE.morningEnd),
    afternoonStart: validTime(source.afternoonStart, DEFAULT_SCHEDULE.afternoonStart),
    afternoonEnd: validTime(source.afternoonEnd, DEFAULT_SCHEDULE.afternoonEnd),
    bookingInterval: Number.isInteger(interval) && interval >= 5 && interval <= 240
      ? interval
      : DEFAULT_SCHEDULE.bookingInterval,
    morningDays: validDays(source.morningDays, DEFAULT_SCHEDULE.morningDays),
    afternoonDays: validDays(source.afternoonDays, DEFAULT_SCHEDULE.afternoonDays),
  };
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTimeValue(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function buildTimeWindow(start: string, end: string, interval: number) {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (endMinutes < startMinutes) return [];

  const slots: string[] = [];
  for (let minute = startMinutes; minute <= endMinutes; minute += interval) {
    slots.push(toTimeValue(minute));
  }
  return slots;
}

export function bookingTimeSlotsForDate(settings: BookingWindowSettings, isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return [];

  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const schedule = normalizeBookingSchedule(settings);
  const weekday = date.getDay();
  const slots = [
    ...(schedule.morningDays.includes(weekday)
      ? buildTimeWindow(schedule.morningStart, schedule.morningEnd, schedule.bookingInterval)
      : []),
    ...(schedule.afternoonDays.includes(weekday)
      ? buildTimeWindow(schedule.afternoonStart, schedule.afternoonEnd, schedule.bookingInterval)
      : []),
  ];

  return [...new Set(slots)];
}

export function formatBookingTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value;

  return new Intl.DateTimeFormat('en-NZ', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(2000, 0, 1, hours, minutes)).toLowerCase();
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatBookingDays(days: number[]) {
  const uniqueDays = [...new Set(days)].sort((a, b) => a - b);
  const dayKey = uniqueDays.join(',');

  if (dayKey === '0,1,2,3,4,5,6') return 'Monday to Sunday';
  if (dayKey === '1,2,3,4,5,6') return 'Monday to Saturday';
  if (dayKey === '1,2,3,4,5') return 'Monday to Friday';
  if (dayKey === '0,6') return 'Saturday and Sunday';

  return uniqueDays.map((day) => DAY_LABELS[day]).join(', ');
}

export function bookingHoursSummary(settings: BookingWindowSettings) {
  const schedule = normalizeBookingSchedule(settings);
  const openDays = [...new Set([...schedule.morningDays, ...schedule.afternoonDays])];

  return {
    heading: openDays.length === 7 ? 'Open seven days a week.' : 'Appointment opening hours:',
    lines: [
      `Mornings: ${formatBookingDays(schedule.morningDays)}, ${formatBookingTime(schedule.morningStart)} to ${formatBookingTime(schedule.morningEnd)}.`,
      `Afternoons: ${formatBookingDays(schedule.afternoonDays)}, ${formatBookingTime(schedule.afternoonStart)} to ${formatBookingTime(schedule.afternoonEnd)}.`,
    ],
  };
}

export function customerMatchesSearch(customer: CustomerSearchRecord, rawQuery: string) {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return false;

  return [
    customer.name,
    customer.email,
    customer.phone ?? '',
    ...(customer.cats ?? []).map((cat) => cat.name),
  ].some((value) => value.toLocaleLowerCase().includes(query));
}
