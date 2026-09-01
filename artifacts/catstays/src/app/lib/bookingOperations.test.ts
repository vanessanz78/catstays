import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustmentAmount,
  bookingFinancials,
  customerCreditBalance,
  normalizePaymentMethods,
} from './bookingOperations';

test('fixed and percentage discounts keep their sign explicit', () => {
  assert.equal(adjustmentAmount(200, 'charge', 'fixed', 15), 15);
  assert.equal(adjustmentAmount(200, 'discount', 'fixed', 15), -15);
  assert.equal(adjustmentAmount(200, 'discount', 'percentage', 10), -20);
});

test('financial summary includes adjustments and only completed payments', () => {
  assert.deepEqual(bookingFinancials(124.2, [{ amount: -10 }], [
    { amount: 50, status: 'completed' },
    { amount: 20, status: 'pending' },
  ]), {
    baseTotal: 124.2,
    adjustmentsTotal: -10,
    subtotal: 114.2,
    tax: 0,
    total: 114.2,
    paid: 50,
    owing: 64.2,
  });
});

test('taxable adjustments recalculate GST and expose an overpayment as credit', () => {
  assert.deepEqual(bookingFinancials(124.2, [{ amount: -10 }], [
    { amount: 124.2, status: 'completed' },
  ], { chargeTax: true, taxRate: 15 }), {
    baseTotal: 124.2,
    adjustmentsTotal: -10,
    subtotal: 98,
    tax: 14.7,
    total: 112.7,
    paid: 124.2,
    owing: -11.5,
  });
});

test('customer credit is a signed ledger and methods stay intentionally short', () => {
  assert.equal(customerCreditBalance([{ amount: 75 }, { amount: '-25.50' }]), 49.5);
  assert.deepEqual(normalizePaymentMethods(['cash', 'stripe', 'cash', 'cheque']), ['cash', 'stripe']);
});
