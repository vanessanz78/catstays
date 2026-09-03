import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaymentAmounts } from './catteryPaymentRules.js';
import { bookingConfirmationHtml } from './emailTemplates.js';

const settings = { depositType: 'fixed', depositAmount: 50, chargeTax: false };
test('deposit and full requests deduct completed payments only', () => {
  assert.deepEqual(calculatePaymentAmounts(settings, 200, [{ amount: 20, status: 'completed' }, { amount: 100, status: 'pending' }], []), { total: 200, outstanding: 180, deposit: 30 });
});
test('paid deposits and fully paid bookings cannot be requested again', () => {
  assert.equal(calculatePaymentAmounts(settings, 200, [{ amount: 50, status: 'completed' }], []).deposit, 0);
  assert.deepEqual(calculatePaymentAmounts(settings, 200, [{ amount: 210, status: 'completed' }], []), { total: 200, outstanding: 0, deposit: 0 });
});
test('adjustments include configured tax and percentage deposit', () => {
  assert.deepEqual(calculatePaymentAmounts({ depositType: 'percentage', depositAmount: 50 }, 115, [], [{ amount: 10 }]), { total: 126.5, outstanding: 126.5, deposit: 63.25 });
});
test('refunds restore the balance and deposit never exceeds amount due', () => {
  assert.deepEqual(calculatePaymentAmounts(settings, 40, [{ amount: 30, status: 'completed' }, { amount: -10, status: 'completed' }], []), { total: 40, outstanding: 20, deposit: 20 });
});
const confirmation = { customerName: 'Test', catteryName: 'Test Cattery', roomName: 'Private 1', checkIn: '3 Sep 2026', checkOut: '5 Sep 2026', bookingRef: 'TEST1234' };
for (const paymentRequest of ['deposit', 'full'] as const) {
  test(`${paymentRequest} confirmation includes secure checkout and escaped notes`, () => {
    const html = bookingConfirmationHtml({ ...confirmation, paymentRequest, paymentLink: { amount: 50, url: 'https://checkout.stripe.com/c/pay/test' }, customMessage: '<script>bad</script>', customerNote: 'Bring food' });
    assert.match(html, /https:\/\/checkout.stripe.com\/c\/pay\/test/);
    assert.match(html, /Pay (deposit|remaining balance) \$50.00/);
    assert.match(html, /23 hours/);
    assert.match(html, /Private 1/);
    assert.match(html, /Bring food/);
    assert.doesNotMatch(html, /<script>/);
  });
}
test('confirmation only has no payment action', () => {
  assert.doesNotMatch(bookingConfirmationHtml({ ...confirmation, paymentRequest: 'none' }), /Payment requested|Pay deposit|checkout.stripe/);
});
