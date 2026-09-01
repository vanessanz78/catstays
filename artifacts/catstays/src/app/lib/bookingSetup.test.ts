import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dateIsBlackout,
  normalizeBookingSetup,
  normalizePublicBlackouts,
  stayOverlapsBlackout,
  validateBlackouts,
  validateBookingSetup,
} from './bookingSetup';

test('normalizes Deloraine opening hours, intervals, and percentage deposit', () => {
  const result = normalizeBookingSetup({
    morningStart: '09:00', morningEnd: '10:30', afternoonStart: '16:30', afternoonEnd: '18:00',
    bookingInterval: '15', morningDays: [1, 2, 3, 4, 5, 6], afternoonDays: [0, 1, 2, 3, 4, 5, 6],
    depositType: 'percentage', depositAmount: '25', pricingPer: 'night',
    pricingRates: [{ numberOfCats: '2', price: '36', discountType: 'none', discountValue: '0' }],
    chargeTax: true, taxRate: '15', taxType: 'GST',
    defaultCheckInTime: '09:30', defaultCheckOutTime: '16:30',
    enabledPaymentMethods: ['cash', 'stripe'], defaultConfirmationPayment: 'deposit',
  });
  assert.equal(result.bookingInterval, 15);
  assert.deepEqual(result.morningDays, [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(result.afternoonDays, [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(result.depositType, 'percentage');
  assert.equal(result.depositAmount, 25);
  assert.equal(result.pricingPer, 'day');
  assert.deepEqual(result.pricingRates, [{ numberOfCats: 2, price: 36, discountType: 'none', discountValue: 0 }]);
  assert.equal(result.chargeTax, true);
  assert.equal(result.taxRate, 15);
  assert.deepEqual(result.enabledPaymentMethods, ['cash', 'stripe']);
});

test('defaults fast staff workflow to 9:30 arrival, 4:30 collection, and a $50 deposit', () => {
  const result = normalizeBookingSetup({});
  assert.equal(result.defaultCheckInTime, '09:30');
  assert.equal(result.defaultCheckOutTime, '16:30');
  assert.equal(result.depositAmount, 50);
  assert.equal(result.defaultConfirmationPayment, 'deposit');
  assert.equal(result.appointmentsEnabled, false);
  assert.deepEqual(result.enabledPaymentMethods, ['bank_transfer', 'cash', 'stripe', 'customer_credit']);
});

test('validates schedule and deposit boundaries', () => {
  const values = normalizeBookingSetup({ morningStart: '11:00', morningEnd: '09:00', depositType: 'percentage', depositAmount: 120 });
  const errors = validateBookingSetup(values);
  assert.ok(errors.some((error) => error.includes('Morning closing')));
  assert.ok(errors.some((error) => error.includes('100%')));
});

test('validates and matches inclusive blackout dates', () => {
  const blackouts = [{ id: 'one', name: 'Christmas', startDate: '2026-12-24', endDate: '2026-12-27' }];
  assert.deepEqual(validateBlackouts(blackouts), []);
  assert.equal(dateIsBlackout(blackouts, '2026-12-24'), true);
  assert.equal(dateIsBlackout(blackouts, '2026-12-27'), true);
  assert.equal(dateIsBlackout(blackouts, '2026-12-28'), false);
  assert.equal(stayOverlapsBlackout(blackouts, '2026-12-23', '2026-12-25'), true);
  assert.equal(stayOverlapsBlackout(blackouts, '2026-12-28', '2026-12-30'), false);
});

test('reads only complete public blackout records', () => {
  const blackouts = normalizePublicBlackouts({ bookingBlackouts: [
    { id: 'one', name: 'Maintenance', startDate: '2026-09-01', endDate: '2026-09-02' },
    { name: 'Incomplete', startDate: '2026-10-01' },
  ] });
  assert.equal(blackouts.length, 1);
  assert.equal(blackouts[0].name, 'Maintenance');
});
