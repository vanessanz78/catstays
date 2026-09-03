import { Router, type IRouter, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { randomBytes } from 'node:crypto';
import { resend, FROM_ADDRESS } from '../lib/resend.js';
import { paymentRequestHtml, bookingConfirmationHtml } from '../lib/emailTemplates.js';
import { notifyCatteryStaff, notifyCustomer } from '../push/notifications.js';
import { calculatePaymentAmounts } from '../lib/catteryPaymentRules.js';

const router: IRouter = Router();
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

type PaymentChoice = 'deposit' | 'full' | 'both';

function bearerToken(req: Request) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
}

async function authenticatedUser(req: Request) {
  const token = bearerToken(req);
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

async function canManageCattery(userId: string, catteryId: string) {
  if (!admin) return false;
  const [{ data: owner }, { data: staff }] = await Promise.all([
    admin.from('catteries').select('id').eq('id', catteryId).eq('owner_id', userId).maybeSingle(),
    admin.from('staff_memberships').select('id').eq('cattery_id', catteryId).eq('user_id', userId).eq('status', 'active').maybeSingle(),
  ]);
  return Boolean(owner?.id || staff?.id);
}

function configuredAppUrl(req: Request) {
  const configured = process.env.CATSTAYS_APP_URL || process.env.PUBLIC_APP_URL || process.env.VITE_PUBLIC_APP_URL;
  const candidate = configured || req.headers.origin || 'https://catstays.app';
  return candidate.replace(/\/$/, '');
}

function publicReturnOrigin(req: Request) {
  const origin = String(req.headers.origin || '').replace(/\/$/, '');
  if (/^https:\/\/(?:[a-z0-9-]+\.)?catstays\.app$/i.test(origin)) return origin;
  return configuredAppUrl(req);
}

function maskKey(key: string) {
  return key.length > 20 ? `${key.slice(0, 12)}…${key.slice(-4)}` : 'Configured';
}

async function stripeCredentials(catteryId: string) {
  if (!admin) return null;
  const [{ data: account }, { data: credentials, error }] = await Promise.all([
    admin.from('cattery_payment_accounts')
      .select('cattery_id,publishable_key,provider_account_id,webhook_endpoint_id,mode,status')
      .eq('cattery_id', catteryId)
      .eq('status', 'active')
      .maybeSingle(),
    admin.rpc('catstays_get_cattery_stripe_credentials', { target_cattery_id: catteryId }),
  ]);
  const credential = Array.isArray(credentials) ? credentials[0] : credentials;
  if (error || !account || !credential?.secret_key) return null;
  return { account, secretKey: String(credential.secret_key), webhookSecret: String(credential.webhook_secret || '') };
}

router.get('/cattery-payments/status/:catteryId', async (req, res) => {
  if (!admin) { res.status(503).json({ error: 'Payment service is not configured' }); return; }
  const user = await authenticatedUser(req);
  const catteryId = String(req.params.catteryId || '');
  if (!user || !(await canManageCattery(user.id, catteryId))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { data } = await admin.from('cattery_payment_accounts')
    .select('publishable_key,provider_account_id,mode,status,last_validated_at')
    .eq('cattery_id', catteryId)
    .maybeSingle();
  res.json(data ? {
    connected: data.status === 'active',
    mode: data.mode,
    accountId: data.provider_account_id,
    maskedPublishableKey: maskKey(data.publishable_key),
    lastValidatedAt: data.last_validated_at,
  } : { connected: false });
});

router.post('/cattery-payments/connect', async (req, res) => {
  if (!admin) { res.status(503).json({ error: 'Payment service is not configured' }); return; }
  const user = await authenticatedUser(req);
  const catteryId = String(req.body?.catteryId || '');
  const publishableKey = String(req.body?.publishableKey || '').trim();
  const secretKey = String(req.body?.secretKey || '').trim();
  if (!user || !(await canManageCattery(user.id, catteryId))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!/^pk_(?:test|live)_/.test(publishableKey) || !/^sk_(?:test|live)_/.test(secretKey)) {
    res.status(400).json({ error: 'Enter a valid Stripe publishable key and secret key.' });
    return;
  }
  const mode = secretKey.startsWith('sk_live_') ? 'live' : 'test';
  if (!publishableKey.startsWith(`pk_${mode}_`)) {
    res.status(400).json({ error: 'The publishable and secret keys must both use the same Stripe mode.' });
    return;
  }

  const stripe = new Stripe(secretKey);
  const previousCredentials = await stripeCredentials(catteryId);
  let webhookEndpoint: Stripe.WebhookEndpoint | null = null;
  try {
    const account = await stripe.accounts.retrieve(null);
    webhookEndpoint = await stripe.webhookEndpoints.create({
      url: `${configuredAppUrl(req)}/api/cattery-payments/webhook`,
      enabled_events: ['checkout.session.completed', 'checkout.session.expired'],
      description: `CatStays booking payments for ${catteryId}`,
      metadata: { catteryId },
    });
    if (!webhookEndpoint.secret) throw new Error('Stripe did not return a webhook signing secret.');

    const { error } = await admin.rpc('catstays_store_cattery_stripe_credentials', {
      target_cattery_id: catteryId,
      new_publishable_key: publishableKey,
      new_secret_key: secretKey,
      new_webhook_secret: webhookEndpoint.secret,
      new_provider_account_id: account.id,
      new_webhook_endpoint_id: webhookEndpoint.id,
      new_mode: mode,
    });
    if (error) throw error;

    if (previousCredentials?.account.webhook_endpoint_id && previousCredentials.account.webhook_endpoint_id !== webhookEndpoint.id) {
      try {
        const previousStripe = new Stripe(previousCredentials.secretKey);
        await previousStripe.webhookEndpoints.del(previousCredentials.account.webhook_endpoint_id);
      } catch { /* the new validated connection remains authoritative */ }
    }

    const { data: cattery } = await admin.from('catteries').select('payment_settings').eq('id', catteryId).maybeSingle();
    const legacySettings = cattery?.payment_settings && typeof cattery.payment_settings === 'object'
      ? { ...cattery.payment_settings as Record<string, unknown> }
      : {};
    delete legacySettings.stripe_secret_key;
    delete legacySettings.stripe_publishable_key;
    await admin.from('catteries').update({ payment_settings: legacySettings }).eq('id', catteryId);

    res.json({ connected: true, mode, accountId: account.id, maskedPublishableKey: maskKey(publishableKey) });
  } catch (error: any) {
    if (webhookEndpoint?.id) {
      try { await stripe.webhookEndpoints.del(webhookEndpoint.id); } catch { /* best effort cleanup */ }
    }
    console.error('[cattery-payments/connect]', error);
    res.status(400).json({ error: error?.message || 'Stripe could not validate these keys.' });
  }
});

router.post('/cattery-payments/disconnect', async (req, res) => {
  if (!admin) { res.status(503).json({ error: 'Payment service is not configured' }); return; }
  const user = await authenticatedUser(req);
  const catteryId = String(req.body?.catteryId || '');
  if (!user || !(await canManageCattery(user.id, catteryId))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const credentials = await stripeCredentials(catteryId);
  if (credentials) {
    try {
      const stripe = new Stripe(credentials.secretKey);
      await stripe.webhookEndpoints.del(credentials.account.webhook_endpoint_id);
    } catch { /* credential removal remains authoritative */ }
  }
  const { error } = await admin.rpc('catstays_delete_cattery_stripe_credentials', { target_cattery_id: catteryId });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ connected: false });
});

router.post('/cattery-payments/test', async (req, res) => {
  if (!admin) { res.status(503).json({ error: 'Payment service is not configured' }); return; }
  const user = await authenticatedUser(req);
  const catteryId = String(req.body?.catteryId || '');
  if (!user || !(await canManageCattery(user.id, catteryId))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const credentials = await stripeCredentials(catteryId);
  if (!credentials) {
    res.status(409).json({ error: 'Connect this cattery\'s Stripe keys first.' });
    return;
  }

  try {
    const stripe = new Stripe(credentials.secretKey);
    const account = await stripe.accounts.retrieve(null);
    const validatedAt = new Date().toISOString();
    const { error: updateError } = await admin.from('cattery_payment_accounts')
      .update({ last_validated_at: validatedAt, provider_account_id: account.id })
      .eq('cattery_id', catteryId);
    if (updateError) throw updateError;
    res.json({
      connected: true,
      mode: credentials.account.mode,
      accountId: account.id,
      maskedPublishableKey: maskKey(credentials.account.publishable_key),
      lastValidatedAt: validatedAt,
    });
  } catch (error: any) {
    console.error('[cattery-payments/test]', error);
    res.status(400).json({ error: error?.message || 'Stripe connection test failed.' });
  }
});

export async function requestBookingPayment(req: Request, res: Response, confirmation = false) {
  if (!admin) { res.status(503).json({ error: 'Payment service is not configured' }); return; }
  const user = await authenticatedUser(req);
  const bookingId = String(req.body?.bookingId || '');
  const choice = String((confirmation ? req.body?.paymentRequest : req.body?.choice) || '') as PaymentChoice;
  if (!user || !['deposit', 'full', 'both'].includes(choice)) {
    res.status(400).json({ error: 'Choose deposit, full payment, or both.' });
    return;
  }

  const { data: booking } = await admin.from('bookings')
    .select('id,cattery_id,customer_id,total_amount,status,check_in,check_out,booking_cats(cat:cats(name))')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking || !(await canManageCattery(user.id, booking.cattery_id))) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  if (booking.status !== 'confirmed') {
    res.status(409).json({ error: 'Confirm the booking before requesting payment.' });
    return;
  }

  const [{ data: cattery }, { data: customer }, credentials] = await Promise.all([
    admin.from('catteries').select('id,name,slug,email,website_settings').eq('id', booking.cattery_id).maybeSingle(),
    admin.from('customers').select('id,name,email').eq('id', booking.customer_id).maybeSingle(),
    stripeCredentials(booking.cattery_id),
  ]);
  if (!cattery || !customer?.email || !credentials) {
    res.status(409).json({ error: credentials ? 'The booking customer needs an email address.' : 'Connect this cattery\'s Stripe keys in Payment Setup first.' });
    return;
  }

  const [payments, adjustments] = await Promise.all([
    admin.from('payments').select('amount,status').eq('cattery_id', booking.cattery_id).eq('booking_id', booking.id),
    admin.from('booking_adjustments').select('amount').eq('cattery_id', booking.cattery_id).eq('booking_id', booking.id),
  ]);
  if (payments.error || adjustments.error) {
    res.status(503).json({ error: 'Could not verify the booking balance. No payment request was sent.' });
    return;
  }
  const { total, deposit, outstanding } = calculatePaymentAmounts(cattery.website_settings, Number(booking.total_amount), payments.data || [], adjustments.data || []);
  if (outstanding <= 0 || !Number.isFinite(outstanding) || ((choice === 'deposit' || choice === 'both') && deposit <= 0)) {
    res.status(409).json({ error: 'No amount is due for this payment option. Choose confirmation only, or request the remaining balance.' });
    return;
  }

  const kinds: Array<'deposit' | 'full'> = choice === 'both' && deposit < outstanding
    ? ['deposit', 'full']
    : [choice === 'deposit' ? 'deposit' : 'full'];
  const stripe = new Stripe(credentials.secretKey);
  const expiresAt = Math.floor(Date.now() / 1000) + (23 * 60 * 60);
  const returnOrigin = publicReturnOrigin(req);
  const createdSessions: Stripe.Checkout.Session[] = [];

  try {
    for (const kind of kinds) {
      const amount = kind === 'deposit' ? deposit : outstanding;
      const session = await stripe.checkout.sessions.create({
        integration_identifier: `catstays-booking-${Array.from(randomBytes(8), byte => String.fromCharCode(97 + byte % 26)).join('')}`,
        mode: 'payment',
        customer_email: customer.email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'nzd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `${kind === 'deposit' ? 'Booking deposit' : 'Full booking payment'} — ${cattery.name}`,
              description: `CatStays booking ${booking.id.slice(0, 8).toUpperCase()}`,
            },
          },
        }],
        metadata: {
          catteryId: booking.cattery_id,
          bookingId: booking.id,
          customerId: customer.id,
          requestType: kind,
        },
        payment_intent_data: {
          metadata: {
            catteryId: booking.cattery_id,
            bookingId: booking.id,
            customerId: customer.id,
            requestType: kind,
          },
        },
        success_url: `${configuredAppUrl(req)}/api/cattery-payments/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnOrigin}/client-portal?payment=cancelled`,
        expires_at: expiresAt,
      });
      createdSessions.push(session);
      if (!session.url) throw new Error('Stripe did not return a payment link. Nothing was emailed.');
    }

    const requestRows = createdSessions.map((session, index) => {
      const kind = kinds[index];
      return {
        cattery_id: booking.cattery_id,
        booking_id: booking.id,
        customer_id: customer.id,
        request_type: kind,
        amount: kind === 'deposit' ? deposit : outstanding,
        provider_session_id: session.id,
        checkout_url: session.url,
        expires_at: new Date(expiresAt * 1000).toISOString(),
        created_by: user.id,
      };
    });
    const { error: insertError } = await admin.from('payment_requests').insert(requestRows);
    if (insertError) throw insertError;

    const links = requestRows.map((row) => ({ type: row.request_type, amount: row.amount, url: String(row.checkout_url) }));
    const catNames = (booking.booking_cats || []).map((entry: any) => entry.cat?.name).filter(Boolean).join(', ');
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: customer.email,
      ...(confirmation && cattery.email ? { cc: cattery.email } : {}),
      replyTo: cattery.email || undefined,
      subject: `${confirmation ? 'Booking confirmed' : 'Payment options for your booking'} at ${cattery.name}`,
      html: confirmation ? bookingConfirmationHtml({
        customerName: customer.name,
        catteryName: cattery.name,
        catName: catNames,
        roomName: String(req.body.roomName || 'See booking details'),
        checkIn: String(req.body.checkIn || booking.check_in),
        checkOut: String(req.body.checkOut || booking.check_out),
        totalAmount: `$${total.toFixed(2)}`,
        deposit: choice === 'deposit' ? `$${deposit.toFixed(2)}` : undefined,
        paymentRequest: choice === 'deposit' ? 'deposit' : 'full',
        paymentLink: links[0],
        customMessage: req.body.customMessage,
        customerNote: req.body.customerNote,
        terms: req.body.terms,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
      }) : paymentRequestHtml({
        customerName: customer.name,
        catteryName: cattery.name,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        catNames,
        total,
        links,
      }),
    });
    if (emailError || !emailData?.id) throw new Error('The email provider could not send the payment request. Please try again.');
    void notifyCustomer(customer.id, booking.cattery_id, {
      type: 'payment_requested',
      title: 'Booking payment requested',
      body: `${cattery.name} sent payment options for booking ${booking.id.slice(0, 8).toUpperCase()}.`,
      url: '/client-portal',
      tag: `catstays-payment-request-${booking.id}`,
    });
    res.json({ success: true, id: emailData.id, links, emailSent: true });
  } catch (error: any) {
    await Promise.all(createdSessions.map(async (session) => {
      try {
        await stripe.checkout.sessions.expire(session.id);
        await admin.from('payment_requests').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('provider_session_id', session.id);
      } catch { /* best effort cleanup */ }
    }));
    console.error('[cattery-payments/request]', error);
    res.status(500).json({ error: error?.message || 'Payment request could not be created.' });
  }
}

router.post('/cattery-payments/request', (req, res) => requestBookingPayment(req, res));

router.get('/cattery-payments/complete', async (req, res) => {
  if (!admin) { res.redirect('/client-portal?payment=error'); return; }
  const sessionId = String(req.query.session_id || '');
  const { data: request } = await admin.from('payment_requests')
    .select('id,cattery_id,booking_id,customer_id,request_type,amount,status')
    .eq('provider_session_id', sessionId)
    .maybeSingle();
  if (!request) { res.redirect('/client-portal?payment=error'); return; }
  const credentials = await stripeCredentials(request.cattery_id);
  const { data: cattery } = await admin.from('catteries').select('slug').eq('id', request.cattery_id).maybeSingle();
  const redirectUrl = cattery?.slug ? `https://${cattery.slug}.catstays.app/client-portal` : `${configuredAppUrl(req)}/client-portal`;
  if (!credentials) { res.redirect(`${redirectUrl}?payment=error`); return; }
  try {
    const stripe = new Stripe(credentials.secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') await recordCompletedPayment(request, session.payment_intent);
    res.redirect(`${redirectUrl}?payment=${session.payment_status === 'paid' ? 'success' : 'pending'}`);
  } catch {
    res.redirect(`${redirectUrl}?payment=error`);
  }
});

router.post('/cattery-payments/webhook', async (req, res) => {
  if (!admin || !Buffer.isBuffer(req.body)) { res.status(400).send('Invalid webhook body'); return; }
  const signature = String(req.headers['stripe-signature'] || '');
  let untrustedPayload: any;
  try { untrustedPayload = JSON.parse(req.body.toString('utf8')); } catch { res.status(400).send('Invalid JSON'); return; }
  const catteryId = String(untrustedPayload?.data?.object?.metadata?.catteryId || '');
  const credentials = catteryId ? await stripeCredentials(catteryId) : null;
  if (!credentials?.webhookSecret || !signature) { res.status(400).send('Unknown payment account'); return; }

  try {
    const stripe = new Stripe(credentials.secretKey);
    const event = stripe.webhooks.constructEvent(req.body, signature, credentials.webhookSecret);
    const session = event.data.object as Stripe.Checkout.Session;
    const { data: request } = await admin.from('payment_requests')
      .select('id,cattery_id,booking_id,customer_id,request_type,amount,status')
      .eq('provider_session_id', session.id)
      .maybeSingle();
    if (request && event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
      await recordCompletedPayment(request, session.payment_intent);
    } else if (request && event.type === 'checkout.session.expired') {
      await admin.from('payment_requests').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('id', request.id);
    }
    res.json({ received: true });
  } catch (error: any) {
    console.error('[cattery-payments/webhook]', error);
    res.status(400).send('Webhook signature verification failed');
  }
});

async function recordCompletedPayment(request: any, paymentIntent: string | Stripe.PaymentIntent | null) {
  if (!admin) return;
  const now = new Date().toISOString();
  const providerPaymentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
  const { data: newlyRecorded, error: recordError } = await admin.rpc('catstays_record_completed_payment', {
    target_request_id: request.id,
    target_provider_payment_id: providerPaymentId || '',
  });
  if (recordError) throw recordError;
  if (!newlyRecorded) return;

  const { data: alternatives } = await admin.from('payment_requests')
    .select('id,provider_session_id')
    .eq('booking_id', request.booking_id)
    .eq('status', 'pending')
    .neq('id', request.id);
  if (alternatives?.length) {
    const credentials = await stripeCredentials(request.cattery_id);
    if (credentials) {
      const stripe = new Stripe(credentials.secretKey);
      await Promise.all(alternatives.map(async (alternative) => {
        try { await stripe.checkout.sessions.expire(alternative.provider_session_id); } catch { /* best effort */ }
      }));
    }
    await admin.from('payment_requests')
      .update({ status: 'cancelled', updated_at: now })
      .in('id', alternatives.map((alternative) => alternative.id));
  }

  const { data: booking } = await admin.from('bookings').select('customer_id').eq('id', request.booking_id).maybeSingle();
  const { data: cattery } = await admin.from('catteries').select('name').eq('id', request.cattery_id).maybeSingle();
  void notifyCatteryStaff(request.cattery_id, {
    type: 'payment_received',
    title: 'Booking payment received',
    body: `$${Number(request.amount).toFixed(2)} received for booking ${request.booking_id.slice(0, 8).toUpperCase()}.`,
    url: '/staff-dashboard/bookings',
    tag: `catstays-payment-received-${request.id}`,
  });
  if (booking?.customer_id) {
    void notifyCustomer(booking.customer_id, request.cattery_id, {
      type: 'payment_received',
      title: 'Payment received',
      body: `${cattery?.name || 'Your cattery'} received your $${Number(request.amount).toFixed(2)} payment.`,
      url: '/client-portal',
      tag: `catstays-customer-payment-${request.id}`,
    });
  }
}

export default router;
