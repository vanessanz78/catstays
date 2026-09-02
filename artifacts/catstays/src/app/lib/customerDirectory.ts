import { bookingFinancials, customerCreditBalance } from './bookingOperations';
import { inclusiveStayDays } from './bookingPricing';

export type CustomerProfileField = 'name' | 'email' | 'phone' | 'address' | 'notes';
export type CustomerProfileChoice = Record<CustomerProfileField, 'primary' | 'secondary'>;

export type DirectoryCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  external_id?: string | null;
  legacy_last_booking?: string | null;
  cats?: Array<{ id?: string; name: string }> | null;
};

export type DirectoryBooking = {
  id: string;
  customer?: { id: string } | null;
  check_in: string;
  check_out: string;
  status: string;
  total_amount?: number | null;
  booking_adjustments?: Array<{ amount: number }> | null;
  payments?: Array<{ amount: number; status: string }> | null;
};

export const DEFAULT_CUSTOMER_PROFILE_CHOICE: CustomerProfileChoice = {
  name: 'primary',
  email: 'primary',
  phone: 'primary',
  address: 'primary',
  notes: 'primary',
};

export function customerMatchesDirectorySearch(customer: DirectoryCustomer, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  return [
    customer.id,
    customer.external_id,
    customer.name,
    customer.email,
    customer.phone,
    ...(customer.cats || []).map((cat) => cat.name),
  ].some((value) => String(value || '').toLowerCase().includes(query));
}

export function mergedCustomerProfile(
  primary: DirectoryCustomer,
  secondary: DirectoryCustomer,
  choices: CustomerProfileChoice,
) {
  return (Object.keys(choices) as CustomerProfileField[]).reduce((profile, field) => {
    const source = choices[field] === 'secondary' ? secondary : primary;
    profile[field] = source[field] ?? '';
    return profile;
  }, {} as Record<CustomerProfileField, string>);
}

export function customerDirectoryMetrics(
  customerId: string,
  bookings: DirectoryBooking[],
  creditEntries: Array<{ amount: number | string }> = [],
  tax: { chargeTax?: boolean; taxRate?: number } = {},
  importedLastBooking: string | null = null,
) {
  const customerBookings = bookings
    .filter((booking) => booking.customer?.id === customerId && booking.status !== 'cancelled')
    .sort((a, b) => b.check_out.localeCompare(a.check_out) || b.check_in.localeCompare(a.check_in));
  const outstanding = customerBookings.reduce((sum, booking) => {
    const financials = bookingFinancials(
      Number(booking.total_amount || 0),
      booking.booking_adjustments || [],
      booking.payments || [],
      tax,
    );
    return sum + Math.max(0, financials.owing);
  }, 0);
  const lastBooking = customerBookings[0] || null;
  return {
    bookingCount: customerBookings.length,
    lastBooking,
    importedLastBooking: lastBooking ? null : importedLastBooking,
    lastBookingDays: lastBooking ? inclusiveStayDays(lastBooking.check_in, lastBooking.check_out) : 0,
    outstanding: Number(outstanding.toFixed(2)),
    creditBalance: customerCreditBalance(creditEntries),
  };
}
