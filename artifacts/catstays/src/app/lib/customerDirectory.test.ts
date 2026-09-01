import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_CUSTOMER_PROFILE_CHOICE,
  customerDirectoryMetrics,
  customerMatchesDirectorySearch,
  mergedCustomerProfile,
} from './customerDirectory';

const primary = {
  id: '9dc84975-1111-4444-8888-57bf658adb2c',
  name: 'Vanessa Wilson',
  email: 'first@example.com',
  phone: '021 111 111',
  address: 'First address',
  notes: 'Primary note',
  cats: [{ id: 'cat-1', name: 'Blaise' }],
};

const secondary = {
  id: 'bb7164d8-2222-4444-8888-e73b1682eeb3',
  name: 'Vanessa Bardett',
  email: 'second@example.com',
  phone: '021 222 222',
  address: 'Second address',
  notes: 'Secondary note',
  cats: [{ id: 'cat-2', name: 'Loop' }],
};

test('customer directory search matches names, customer ids, email, phone, and cats while typing', () => {
  assert.equal(customerMatchesDirectorySearch(primary, 'vaness'), true);
  assert.equal(customerMatchesDirectorySearch(primary, '9dc84975'), true);
  assert.equal(customerMatchesDirectorySearch(primary, 'first@'), true);
  assert.equal(customerMatchesDirectorySearch(primary, '111 111'), true);
  assert.equal(customerMatchesDirectorySearch(primary, 'bla'), true);
  assert.equal(customerMatchesDirectorySearch(primary, 'loop'), false);
});

test('customer metrics show latest stay, GST-aware outstanding money, and signed customer credit', () => {
  const metrics = customerDirectoryMetrics(primary.id, [
    {
      id: 'booking-1', customer: { id: primary.id }, check_in: '2026-09-01', check_out: '2026-09-03', status: 'confirmed', total_amount: 115,
      booking_adjustments: [{ amount: -10 }], payments: [{ amount: 50, status: 'completed' }],
    },
    {
      id: 'booking-2', customer: { id: primary.id }, check_in: '2026-10-01', check_out: '2026-10-05', status: 'cancelled', total_amount: 500,
      booking_adjustments: [], payments: [],
    },
  ], [{ amount: 50 }, { amount: -10 }], { chargeTax: true, taxRate: 15 });
  assert.equal(metrics.bookingCount, 1);
  assert.equal(metrics.lastBooking?.id, 'booking-1');
  assert.equal(metrics.lastBookingDays, 3);
  assert.equal(metrics.outstanding, 53.5);
  assert.equal(metrics.creditBalance, 40);
});

test('merge defaults to customer one but can keep individual fields from customer two', () => {
  const choices = { ...DEFAULT_CUSTOMER_PROFILE_CHOICE, email: 'secondary' as const, address: 'secondary' as const };
  assert.deepEqual(mergedCustomerProfile(primary, secondary, choices), {
    name: 'Vanessa Wilson',
    email: 'second@example.com',
    phone: '021 111 111',
    address: 'Second address',
    notes: 'Primary note',
  });
});
