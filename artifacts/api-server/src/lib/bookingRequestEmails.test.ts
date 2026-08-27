import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingRequestCustomerHtml, bookingRequestOwnerHtml, paymentRequestHtml } from './emailTemplates';

const booking = {
  catteryName: 'Deloraine Cattery',
  customerName: 'UAT Customer',
  customerEmail: 'uat@example.com',
  phone: '0210000000',
  catNames: ['Molly', 'Milo'],
  checkIn: '28 Aug 2026',
  checkOut: '3 Sep 2026',
  days: 7,
  roomName: 'Private Suite',
  estimatedTotal: '$322.00 incl. GST',
};

test('owner request email uses inclusive days rather than nights', () => {
  const html = bookingRequestOwnerHtml(booking);

  assert.match(html, /7 days/);
  assert.match(html, /includes arrival and departure/);
  assert.doesNotMatch(html, /7 nights/);
});

test('customer request email stays customer-facing', () => {
  const html = bookingRequestCustomerHtml(booking);

  assert.match(html, /Request received/);
  assert.match(html, /7 days/);
  assert.doesNotMatch(html, /dashboard/i);
  assert.doesNotMatch(html, /7 nights/);
});

test('payment request email presents deposit and full-payment choices', () => {
  const html = paymentRequestHtml({
    customerName: 'UAT Customer',
    catteryName: 'Deloraine Cattery',
    bookingRef: 'ABC12345',
    catNames: 'Molly, Milo',
    total: 420,
    links: [
      { type: 'deposit', amount: 50, url: 'https://checkout.stripe.com/deposit-test' },
      { type: 'full', amount: 420, url: 'https://checkout.stripe.com/full-test' },
    ],
  });

  assert.match(html, /Pay deposit \$50\.00/);
  assert.match(html, /Pay full amount \$420\.00/);
  assert.match(html, /checkout\.stripe\.com\/deposit-test/);
  assert.match(html, /all payments must be cleared funds before your cat's arrival/i);
});
