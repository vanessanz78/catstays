/** Optional read scope; callers that need accounting/history retain the full tenant snapshot. */
export interface BookingReadScope { checkOutFrom?: string }

export function bookingReadScope(options?: BookingReadScope & { allPages?: boolean }): BookingReadScope {
  if (options?.allPages || !options?.checkOutFrom) return {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.checkOutFrom)
    || Number.isNaN(Date.parse(options.checkOutFrom))
    || new Date(options.checkOutFrom).toISOString().slice(0, 10) !== options.checkOutFrom) {
    throw new Error('Invalid booking read date');
  }
  return { checkOutFrom: options.checkOutFrom };
}

export function applyBookingReadScope<Q extends { gte(column: string, value: string): Q }>(
  query: Q, scope: BookingReadScope,
): Q {
  return scope.checkOutFrom ? query.gte('check_out', scope.checkOutFrom) : query;
}
