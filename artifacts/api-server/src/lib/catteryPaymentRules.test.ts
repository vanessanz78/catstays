import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateConfiguredDeposit } from './catteryPaymentRules';

test('Deloraine fixed deposit uses the saved $50 rule', () => {
  assert.deepEqual(calculateConfiguredDeposit({ depositType: 'fixed', depositAmount: 50 }, 420), {
    deposit: 50,
    depositType: 'fixed',
  });
});

test('percentage deposits work from nested booking rules and never exceed total', () => {
  assert.deepEqual(calculateConfiguredDeposit({ bookingRules: { depositType: 'percentage', depositAmount: 30 } }, 200), {
    deposit: 60,
    depositType: 'percentage',
  });
  assert.equal(calculateConfiguredDeposit({ depositType: 'fixed', depositAmount: 500 }, 120).deposit, 120);
});
