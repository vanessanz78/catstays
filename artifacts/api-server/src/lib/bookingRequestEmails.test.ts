import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingRequestCustomerHtml, bookingRequestOwnerHtml } from './emailTemplates';

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
