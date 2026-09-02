export type SmartImportKind = 'customers' | 'cats' | 'bookings' | 'rooms';

export type SmartImportSourceRow = Record<string, unknown>;

export interface SmartImportCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  external_source?: string | null;
  external_id?: string | null;
  cats?: Array<{
    name: string;
    external_source?: string | null;
    external_id?: string | null;
  }>;
}

export interface SmartImportRoom {
  id: string;
  name: string;
}

export interface SmartImportContext {
  customers: SmartImportCustomer[];
  rooms: SmartImportRoom[];
  bookingKeys?: string[];
}

export interface SmartImportPreviewRow {
  rowNumber: number;
  summary: string;
  payload: Record<string, unknown>;
  errors: string[];
  warnings: string[];
  duplicate: boolean;
}

const HEADER_SANITISER = /[^a-z0-9]+/g;

export function normaliseImportHeader(value: string) {
  return value.trim().toLowerCase().replace(HEADER_SANITISER, '_').replace(/^_+|_+$/g, '');
}

function normalisedRow(row: SmartImportSourceRow) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normaliseImportHeader(key), String(value ?? '').trim()]),
  );
}

function cell(row: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = row[normaliseImportHeader(alias)];
    if (value) return value;
  }
  return '';
}

function normalisePhone(value: string) {
  return value.replace(/[^0-9+]/g, '');
}

function money(value: string) {
  if (!value) return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function jsonObject(value: string) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function positiveInteger(value: string, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

export function normaliseImportDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const local = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
  if (!iso && !local) return '';
  const candidate = iso
    ? trimmed
    : `${local![3]}-${local![2].padStart(2, '0')}-${local![1].padStart(2, '0')}`;
  const parsed = new Date(`${candidate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== candidate ? '' : candidate;
}

export function normaliseImportTime(value: string) {
  const trimmed = value.trim().toLowerCase().replace(/\s+/g, '');
  if (!trimmed) return null;
  const twentyFourHour = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    if (hour <= 23 && minute <= 59) return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  }
  const twelveHour = /^(\d{1,2})(?::(\d{2}))?(am|pm)$/.exec(trimmed);
  if (!twelveHour) return null;
  let hour = Number(twelveHour[1]);
  const minute = Number(twelveHour[2] || 0);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  if (twelveHour[3] === 'am' && hour === 12) hour = 0;
  if (twelveHour[3] === 'pm' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

export function splitImportList(value: string) {
  return value.split(/[|;,]/).map((item) => item.trim()).filter(Boolean);
}

function findCustomer(row: Record<string, string>, customers: SmartImportCustomer[]) {
  const externalOwnerId = cell(row, ['owner_external_id', 'customer_external_id', 'external_customer_id']);
  if (externalOwnerId) {
    const source = cell(row, ['external_source', 'source']) || 'revelation_pets';
    return customers.find((customer) => customer.external_id === externalOwnerId && customer.external_source === source) || null;
  }
  const email = cell(row, ['owner_email', 'customer_email', 'client_email', 'email']).toLowerCase();
  if (email) return customers.find((customer) => customer.email.toLowerCase() === email) || null;
  const name = cell(row, ['owner_name', 'customer_name', 'client_name', 'owner', 'customer', 'client']).toLowerCase();
  if (!name) return null;
  const matches = customers.filter((customer) => customer.name.toLowerCase() === name);
  return matches.length === 1 ? matches[0] : null;
}

function findRoom(row: Record<string, string>, rooms: SmartImportRoom[]) {
  const name = cell(row, ['room_name', 'room', 'accommodation', 'suite']).toLowerCase();
  return rooms.find((room) => room.name.toLowerCase() === name) || null;
}

function previewCustomer(row: Record<string, string>, rowNumber: number, context: SmartImportContext): SmartImportPreviewRow {
  const name = cell(row, ['customer_name', 'client_name', 'owner_name', 'full_name', 'customer', 'client', 'owner', 'name']);
  const email = cell(row, ['email_address', 'customer_email', 'client_email', 'owner_email', 'email']).toLowerCase();
  const phone = cell(row, ['phone_number', 'mobile_number', 'cell_phone', 'mobile', 'phone']);
  const externalSource = cell(row, ['external_source', 'source']);
  const externalId = cell(row, ['external_id', 'customer_id', 'custid']);
  const errors: string[] = [];
  if (!name) errors.push('Customer name is required.');
  if (!email) errors.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email is not valid.');
  const duplicate = context.customers.some((customer) => (
    !!externalSource && !!externalId
      ? customer.external_source === externalSource && customer.external_id === externalId
      : customer.email.toLowerCase() === email || (!!phone && normalisePhone(customer.phone || '') === normalisePhone(phone))
  ));
  return {
    rowNumber,
    summary: [name || 'Unnamed customer', email].filter(Boolean).join(' · '),
    payload: {
      name,
      email,
      phone: phone || null,
      address: cell(row, ['postal_address', 'street_address', 'address']) || null,
      notes: cell(row, ['customer_notes', 'client_notes', 'notes']) || null,
      created_at: cell(row, ['created_at', 'customer_added']) || null,
      external_source: externalSource || null,
      external_id: externalId || null,
      legacy_last_booking: normaliseImportDate(cell(row, ['legacy_last_booking', 'last_booking'])) || null,
      legacy_account_balance: money(cell(row, ['legacy_account_balance', 'account_balance'])),
      legacy_total_spent: money(cell(row, ['legacy_total_spent', 'total_amount_spent', 'total_spent'])),
      legacy_metadata: jsonObject(cell(row, ['legacy_metadata', 'metadata'])),
    },
    errors,
    warnings: duplicate ? ['An existing customer has the same email or phone number.'] : [],
    duplicate,
  };
}

function previewCat(row: Record<string, string>, rowNumber: number, context: SmartImportContext): SmartImportPreviewRow {
  const name = cell(row, ['cat_name', 'pet_name', 'animal_name', 'cat', 'pet', 'name']);
  const customer = findCustomer(row, context.customers);
  const ownerLabel = cell(row, ['owner_external_id', 'customer_external_id', 'external_customer_id', 'owner_email', 'customer_email', 'client_email', 'owner_name', 'customer_name', 'client_name', 'owner', 'customer', 'client']);
  const externalSource = cell(row, ['external_source', 'source']);
  const externalId = cell(row, ['external_id', 'pet_id']);
  const errors: string[] = [];
  if (!name) errors.push('Cat name is required.');
  if (!ownerLabel) errors.push('Owner email or exact owner name is required.');
  else if (!customer) errors.push('Owner could not be matched to one existing customer.');
  const duplicate = !!customer?.cats?.some((cat) => (
    externalSource && externalId
      ? cat.external_source === externalSource && cat.external_id === externalId
      : cat.name.toLowerCase() === name.toLowerCase()
  ));
  return {
    rowNumber,
    summary: `${name || 'Unnamed cat'} · ${customer?.name || ownerLabel || 'Owner not found'}`,
    payload: {
      name,
      customer_id: customer?.id || '',
      breed: cell(row, ['cat_breed', 'pet_breed', 'breed']) || null,
      age: cell(row, ['cat_age', 'pet_age', 'age']) || null,
      medical_notes: cell(row, ['medical_notes', 'health_notes', 'medication_notes']) || null,
      dietary_requirements: cell(row, ['dietary_requirements', 'feeding_instructions', 'diet', 'food']) || null,
      external_source: externalSource || null,
      external_id: externalId || null,
      legacy_metadata: jsonObject(cell(row, ['legacy_metadata', 'metadata'])),
    },
    errors,
    warnings: duplicate ? ['This customer already has a cat with the same name.'] : [],
    duplicate,
  };
}

function previewRoom(row: Record<string, string>, rowNumber: number, context: SmartImportContext): SmartImportPreviewRow {
  const name = cell(row, ['room_name', 'suite_name', 'accommodation_name', 'room', 'suite', 'name']);
  const rate = money(cell(row, ['price_per_day', 'daily_rate', 'day_rate', 'price_per_night', 'rate', 'price']));
  const capacity = positiveInteger(cell(row, ['max_cats', 'cat_capacity', 'capacity']), 1);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!name) errors.push('Room name is required.');
  if (!Number.isFinite(rate) || rate < 0) errors.push('Daily rate must be zero or more.');
  if (!Number.isFinite(capacity)) errors.push('Capacity must be a whole number greater than zero.');
  if (rate === 0) warnings.push('Daily rate is $0.00; check this before importing.');
  const duplicate = context.rooms.some((room) => room.name.toLowerCase() === name.toLowerCase());
  if (duplicate) warnings.push('A room with the same name already exists.');
  return {
    rowNumber,
    summary: `${name || 'Unnamed room'} · $${Number.isFinite(rate) ? rate.toFixed(2) : '—'}/day`,
    payload: {
      name,
      type: cell(row, ['room_type', 'accommodation_type', 'type']) || 'standard',
      description: cell(row, ['room_description', 'description']) || null,
      price_per_night: Number.isFinite(rate) ? rate : 0,
      capacity: Number.isFinite(capacity) ? capacity : 1,
      amenities: splitImportList(cell(row, ['amenities', 'features'])),
      is_active: !['false', 'no', 'inactive', '0'].includes(cell(row, ['is_active', 'active', 'status']).toLowerCase()),
    },
    errors,
    warnings,
    duplicate,
  };
}

function previewBooking(row: Record<string, string>, rowNumber: number, context: SmartImportContext): SmartImportPreviewRow {
  const customer = findCustomer(row, context.customers);
  const room = findRoom(row, context.rooms);
  const customerLabel = cell(row, ['customer_email', 'client_email', 'owner_email', 'customer_name', 'client_name', 'owner_name', 'customer', 'client', 'owner']);
  const roomLabel = cell(row, ['room_name', 'room', 'accommodation', 'suite']);
  const checkInRaw = cell(row, ['check_in_date', 'checkin_date', 'arrival_date', 'start_date', 'check_in', 'checkin', 'arrival']);
  const checkOutRaw = cell(row, ['check_out_date', 'checkout_date', 'departure_date', 'end_date', 'check_out', 'checkout', 'departure']);
  const checkIn = normaliseImportDate(checkInRaw);
  const checkOut = normaliseImportDate(checkOutRaw);
  const cats = splitImportList(cell(row, ['cat_names', 'pet_names', 'cats', 'pets', 'cat_name', 'pet_name']));
  const total = money(cell(row, ['total_amount', 'booking_total', 'total', 'amount']));
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!customerLabel) errors.push('Customer email or exact customer name is required.');
  else if (!customer) errors.push('Customer could not be matched.');
  if (!roomLabel) errors.push('Room name is required.');
  else if (!room) errors.push('Room could not be matched.');
  if (!checkIn) errors.push('Check-in date is missing or invalid.');
  if (!checkOut) errors.push('Check-out date is missing or invalid.');
  if (checkIn && checkOut && checkOut < checkIn) errors.push('Check-out date is before check-in date.');
  if (!Number.isFinite(total) || total < 0) errors.push('Total amount must be zero or more.');
  if (!cats.length) warnings.push('No cat names were supplied.');
  const catCountRaw = cell(row, ['number_of_cats', 'cat_count', 'cats_count']);
  const numberOfCats = cats.length || positiveInteger(catCountRaw, 1);
  if (!cats.length && catCountRaw && !Number.isFinite(numberOfCats)) errors.push('Number of cats must be a whole number greater than zero.');
  const checkInTimeRaw = cell(row, ['check_in_time', 'checkin_time', 'arrival_time']);
  const checkOutTimeRaw = cell(row, ['check_out_time', 'checkout_time', 'departure_time']);
  const checkInTime = normaliseImportTime(checkInTimeRaw);
  const checkOutTime = normaliseImportTime(checkOutTimeRaw);
  if (checkInTimeRaw && !checkInTime) errors.push('Check-in time is invalid.');
  if (checkOutTimeRaw && !checkOutTime) errors.push('Check-out time is invalid.');
  if (!checkInTimeRaw || !checkOutTimeRaw) warnings.push('No complete arrival/departure time was supplied; add the visit times after import.');
  const duplicateKey = customer && room && checkIn && checkOut ? `${customer.id}|${room.id}|${checkIn}|${checkOut}` : '';
  const duplicate = !!duplicateKey && (context.bookingKeys || []).includes(duplicateKey);
  if (duplicate) warnings.push('A matching booking already exists for this customer, room, and date range.');
  const statusValue = cell(row, ['booking_status', 'status']).toLowerCase();
  const status = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].includes(statusValue) ? statusValue : 'confirmed';
  if (statusValue && statusValue !== status) warnings.push(`Unknown booking status “${statusValue}” changed to confirmed.`);
  const paymentValue = cell(row, ['payment_status']).toLowerCase();
  const paymentStatus = ['unpaid', 'deposit_paid', 'paid', 'refunded'].includes(paymentValue) ? paymentValue : 'unpaid';
  if (paymentValue && paymentValue !== paymentStatus) warnings.push(`Unknown payment status “${paymentValue}” changed to unpaid.`);
  return {
    rowNumber,
    summary: `${customer?.name || customerLabel || 'Customer not found'} · ${checkIn || checkInRaw || 'No date'} to ${checkOut || checkOutRaw || 'No date'}`,
    payload: {
      customer_id: customer?.id || '',
      room_id: room?.id || '',
      check_in: checkIn,
      check_out: checkOut,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      status,
      payment_status: paymentStatus,
      total_amount: Number.isFinite(total) ? total : 0,
      notes: cell(row, ['booking_notes', 'notes']) || null,
      guest_name: customer?.name || null,
      guest_email: customer?.email || null,
      guest_phone: customer?.phone || null,
      cat_names: cats.join(', ') || null,
      number_of_cats: Number.isFinite(numberOfCats) ? numberOfCats : 1,
      room_arrangement: cell(row, ['room_arrangement']).toLowerCase() === 'separate' ? 'separate' : 'shared',
    },
    errors,
    warnings,
    duplicate,
  };
}

export function buildSmartImportPreview(
  kind: SmartImportKind,
  rows: SmartImportSourceRow[],
  context: SmartImportContext,
) {
  const mappedRows = rows.map((sourceRow, index) => {
    const row = normalisedRow(sourceRow);
    const rowNumber = index + 2;
    if (kind === 'customers') return previewCustomer(row, rowNumber, context);
    if (kind === 'cats') return previewCat(row, rowNumber, context);
    if (kind === 'rooms') return previewRoom(row, rowNumber, context);
    return previewBooking(row, rowNumber, context);
  });

  const seen = new Set<string>();
  return mappedRows.map((row) => {
    const payload = row.payload;
    const key = kind === 'customers'
      ? payload.external_source && payload.external_id
        ? `${payload.external_source}|${payload.external_id}`
        : `${String(payload.email || '').toLowerCase()}|${normalisePhone(String(payload.phone || ''))}`
      : kind === 'cats'
        ? payload.external_source && payload.external_id
          ? `${payload.external_source}|${payload.external_id}`
          : `${payload.customer_id}|${String(payload.name || '').toLowerCase()}`
        : kind === 'rooms'
          ? String(payload.name || '').toLowerCase()
          : `${payload.customer_id}|${payload.room_id}|${payload.check_in}|${payload.check_out}`;
    if (!key || key.replace(/\|/g, '') === '') return row;
    if (seen.has(key) && !row.duplicate) {
      return {
        ...row,
        duplicate: true,
        warnings: [...row.warnings, 'This row duplicates another row in the same CSV file.'],
      };
    }
    seen.add(key);
    return row;
  });
}
