import assert from 'node:assert/strict';
import test from 'node:test';
import { applyBookingReadScope, bookingReadScope } from './bookingReadScope.ts';

test('reports and default consumers retain complete history', () => {
  assert.deepEqual(bookingReadScope(), {});
  assert.deepEqual(bookingReadScope({ allPages: true, checkOutFrom: '2026-09-03' }), {});
});
test('current scope includes stays already in progress and departure today', () => {
  const calls: unknown[] = [];
  const query = { gte(column: string, value: string) { calls.push([column, value]); return this; } };
  assert.equal(applyBookingReadScope(query, bookingReadScope({ checkOutFrom: '2026-09-03' })), query);
  assert.deepEqual(calls, [['check_out', '2026-09-03']]);
});
test('full-history scope adds no date filter', () => {
  const query = { gte() { throw new Error('Unexpected date filter'); } };
  assert.equal(applyBookingReadScope(query, bookingReadScope()), query);
});
test('reject malformed and impossible dates before querying', () => {
  for (const date of ['03/09/2026', '2026-02-30', '2026-13-03', 'bad']) {
    assert.throws(() => bookingReadScope({ checkOutFrom: date }), /Invalid booking read date/);
  }
});
