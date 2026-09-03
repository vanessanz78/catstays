import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';

// No real credentials, network, emails, or charges in this integration test.
process.env.VITE_SUPABASE_URL = 'http://127.0.0.1:1';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-only';
let authorized = true;
let ledgerFailure = false;
let mailFailure = false;
let missingUrl = false;
let bookingStatus = 'confirmed';
let paid = 20;
let connected = true;
const sessions: any[] = [];
const expired: string[] = [];
const emails: any[] = [];
const writes: any[] = [];
mock.method(globalThis, 'fetch', async (input: any, init: any = {}) => {
  const url = new URL(String(input));
  assert.equal(url.origin, 'http://127.0.0.1:1', 'unexpected outbound network request');
  let data: any = [];
  if (url.pathname === '/auth/v1/user') data = { id: 'staff' };
  else if (init.method && init.method !== 'GET' && !url.pathname.includes('/rpc/')) {
    writes.push({ path: url.pathname, body: JSON.parse(init.body || '{}') });
    return new Response(null, { status: 204 });
  } else if (url.pathname.endsWith('/bookings')) data = { id: 'booking-123', cattery_id: 'tenant', customer_id: 'customer', total_amount: 200, status: bookingStatus, check_in: '2026-09-10', check_out: '2026-09-12', booking_cats: [] };
  else if (url.pathname.endsWith('/catteries')) data = url.searchParams.has('owner_id') ? (authorized ? { id: 'tenant' } : null) : { id: 'tenant', name: 'Cattery', email: 'owner@example.com', website_settings: { depositAmount: 50, chargeTax: false } };
  else if (url.pathname.endsWith('/staff_memberships')) data = null;
  else if (url.pathname.endsWith('/customers')) data = { id: 'customer', name: 'Customer', email: 'saved@example.com' };
  else if (url.pathname.endsWith('/cattery_payment_accounts')) data = connected ? { status: 'active' } : null;
  else if (url.pathname.endsWith('/catstays_get_cattery_stripe_credentials')) data = { secret_key: 'mock-only' };
  else if (url.pathname.endsWith('/payments')) {
    if (ledgerFailure) return Response.json({ message: 'ledger unavailable' }, { status: 500 });
    data = [{ amount: paid, status: 'completed' }];
  }
  return Response.json(data);
});
const stripe = new Stripe('mock-only');
mock.method(Object.getPrototypeOf(stripe.checkout.sessions), 'create', async (params: any) => {
  sessions.push(params);
  return { id: 'cs_mock', url: missingUrl ? null : 'https://checkout.stripe.com/c/pay/mock' };
});
mock.method(Object.getPrototypeOf(stripe.checkout.sessions), 'expire', async (id: string) => { expired.push(id); return {}; });
const { resend } = await import('../lib/resend.js');
mock.method(resend.emails, 'send', async (payload: any) => {
  emails.push(payload);
  return mailFailure ? { data: null, error: { message: 'failed' } } : { data: { id: 'mail_mock' }, error: null };
});
const { requestBookingPayment } = await import('./catteryPayments.js');

async function run(choice = 'deposit') {
  const result = { code: 200, body: null as any };
  await requestBookingPayment({ headers: { authorization: 'Bearer mock', origin: 'https://delorainecattery.catstays.app' }, body: { bookingId: 'booking-123', paymentRequest: choice, customerEmail: 'tampered@example.com', totalAmount: '$9999', deposit: '$999', roomName: 'Private 1' } } as any, { status(code: number) { result.code = code; return this; }, json(body: any) { result.body = body; } } as any, true);
  return result;
}
function reset() {
  authorized = connected = true; ledgerFailure = mailFailure = missingUrl = false; bookingStatus = 'confirmed'; paid = 20;
  sessions.length = expired.length = emails.length = writes.length = 0;
}
test('confirmation requests use saved recipient and ledger amounts, not client money', async () => {
  reset();
  const result = await run();
  assert.equal(result.body.success, true);
  assert.equal(result.body.id, 'mail_mock');
  assert.equal(sessions[0].line_items[0].price_data.unit_amount, 3000);
  assert.equal(sessions[0].customer_email, 'saved@example.com');
  assert.equal(emails[0].to, 'saved@example.com');
  assert.match(emails[0].html, /checkout.stripe.com\/c\/pay\/mock/);
  assert.equal(writes.filter(row => row.path.endsWith('/payment_requests')).length, 1);
});
test('full confirmation requests only outstanding amount', async () => {
  reset(); await run('full');
  assert.equal(sessions[0].line_items[0].price_data.unit_amount, 18000);
});
test('unauthorized, unconfirmed, disconnected, failed ledger and paid requests send nothing', async () => {
  for (const setup of [() => { authorized = false; }, () => { bookingStatus = 'cancelled'; }, () => { connected = false; }, () => { ledgerFailure = true; }, () => { paid = 200; }]) {
    reset(); setup();
    const result = await run();
    assert.ok(result.code >= 400);
    assert.equal(sessions.length, 0);
    assert.equal(emails.length, 0);
  }
});
test('email failure expires checkout and reports failure instead of success', async () => {
  reset(); mailFailure = true;
  const result = await run();
  assert.equal(result.code, 500);
  assert.equal(result.body.success, undefined);
  assert.deepEqual(expired, ['cs_mock']);
  assert.ok(writes.some(row => row.body.status === 'cancelled'));
});
test('missing checkout URL prevents email and cleans up session', async () => {
  reset(); missingUrl = true;
  assert.equal((await run()).code, 500);
  assert.equal(emails.length, 0);
  assert.deepEqual(expired, ['cs_mock']);
});
