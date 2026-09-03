/** Optional read scope; callers that need accounting/history retain the full tenant snapshot. */
export interface BookingReadScope { checkOutFrom?: string; checkOutThrough?: string; checkInFrom?: string; checkInThrough?: string }

export function bookingReadScope(options?: BookingReadScope & { allPages?: boolean }): BookingReadScope {
  if (options?.allPages) return {};
  const scope: BookingReadScope = {};
  for (const key of ['checkOutFrom', 'checkOutThrough', 'checkInFrom', 'checkInThrough'] as const) {
    const value = options?.[key];
    if (!value) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))
      || new Date(value).toISOString().slice(0, 10) !== value) throw new Error('Invalid booking read date');
    scope[key] = value;
  }
  return scope;
}

export function applyBookingReadScope<Q extends { gte(column: string, value: string): Q; lte(column: string, value: string): Q }>(
  query: Q, scope: BookingReadScope,
): Q {
  if (scope.checkOutFrom) query = query.gte('check_out', scope.checkOutFrom);
  if (scope.checkOutThrough) query = query.lte('check_out', scope.checkOutThrough);
  if (scope.checkInFrom) query = query.gte('check_in', scope.checkInFrom);
  if (scope.checkInThrough) query = query.lte('check_in', scope.checkInThrough);
  return query;
}

export type BookingListView = 'current' | 'recent' | 'future';
export function bookingListScope(view: BookingListView, today: string, search = ''): BookingReadScope {
  bookingReadScope({ checkOutFrom: today });
  if (search.trim()) return {}; // Search includes historical and cancelled stays.
  const shift = (days: number) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };
  if (view === 'current') return { checkOutFrom: today, checkInThrough: today };
  if (view === 'future') return { checkInFrom: shift(1) };
  return { checkOutFrom: shift(-30), checkOutThrough: shift(-1) };
}

export function matchesBookingListView(booking: { checkIn: string; checkOut: string; status: string }, view: BookingListView, today: string, search = '') {
  if (search.trim()) return true;
  const scope = bookingListScope(view, today);
  if (view !== 'recent' && ['cancelled', 'waitlist', 'checked_out'].includes(booking.status)) return false;
  return (!scope.checkOutFrom || booking.checkOut >= scope.checkOutFrom)
    && (!scope.checkOutThrough || booking.checkOut <= scope.checkOutThrough)
    && (!scope.checkInFrom || booking.checkIn >= scope.checkInFrom)
    && (!scope.checkInThrough || booking.checkIn <= scope.checkInThrough);
}
