import { randomInt } from 'node:crypto';
import { Router, type IRouter, type Request, type Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router: IRouter = Router();

const stripeKey = process.env['STRIPE_API_KEY'] || process.env['STRIPE_SECRET_KEY'] || process.env['STRIPE_LIVE_SECRET_KEY'];
const supabaseUrl = process.env['VITE_SUPABASE_URL']!;
const supabaseAnonKey = process.env['VITE_SUPABASE_ANON_KEY']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

if (!stripeKey) {
  console.warn('[billing] Stripe secret key not set — add STRIPE_API_KEY, STRIPE_SECRET_KEY, or STRIPE_LIVE_SECRET_KEY');
}

const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2026-07-29.dahlia' }) : null;

const PLAN_CATALOG = {
  starter: {
    name: 'Starter',
    amount: 4900,
    description: 'A calm, simple way to launch your cattery online.',
    features: ['Booking-ready cattery website', 'Dashboard to manage bookings', 'Customer communication tools', 'Payment request setup', 'Availability and room setup'],
    priceEnvironmentVariable: 'STRIPE_PRICE_STARTER',
  },
  professional: {
    name: 'Professional',
    amount: 7900,
    description: 'For catteries ready to give customers more self-service.',
    features: ['Everything in Starter', 'Client portal logins', 'Customer-managed bookings', 'Photo updates and reminders', 'Reports for bookings and revenue'],
    priceEnvironmentVariable: 'STRIPE_PRICE_PROFESSIONAL',
  },
  premium: {
    name: 'Premium',
    amount: 9900,
    description: 'For established catteries that want the complete growth toolkit.',
    features: ['Everything in Professional', 'Custom domain request workflow', 'Marketing kit and social assets', 'Accounting and financial tools', 'Advanced reports'],
    priceEnvironmentVariable: 'STRIPE_PRICE_PREMIUM',
  },
} as const;

type PlanKey = keyof typeof PLAN_CATALOG;

function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLAN_CATALOG, value);
}

function getAuthClient(req: Request) {
  const jwt = req.headers.authorization?.split(' ')[1];
  if (!jwt) return null;
  return createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
}

function getServiceClient() {
  return supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;
}

function getSafeOrigin(req: Request) {
  const fallback = 'https://catstays.app';
  const rawOrigin = req.headers.origin;
  if (!rawOrigin) return fallback;
  try {
    const origin = new URL(rawOrigin);
    const hostname = origin.hostname.toLowerCase();
    const isCatStays = hostname === 'catstays.app' || hostname.endsWith('.catstays.app');
    const isLocalDevelopment = process.env.NODE_ENV !== 'production' &&
      (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.replit.dev'));
    return origin.protocol === 'https:' && (isCatStays || isLocalDevelopment) ? origin.origin : fallback;
  } catch {
    return fallback;
  }
}

function createIntegrationIdentifier() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let suffix = '';
  for (let index = 0; index < 8; index += 1) suffix += alphabet[randomInt(0, alphabet.length)];
  return `catstays_subscription_${suffix}`;
}

function priceMatchesPlan(price: Stripe.Price, plan: PlanKey) {
  const expected = PLAN_CATALOG[plan];
  return price.active && price.currency.toLowerCase() === 'nzd' && price.unit_amount === expected.amount &&
    price.type === 'recurring' && price.recurring?.interval === 'month';
}

async function resolvePlanPrice(plan: PlanKey) {
  if (!stripe) throw new Error('Stripe not configured');
  const config = PLAN_CATALOG[plan];
  const configuredPriceId = process.env[config.priceEnvironmentVariable];
  if (configuredPriceId) {
    const configuredPrice = await stripe.prices.retrieve(configuredPriceId);
    if (!priceMatchesPlan(configuredPrice, plan)) {
      throw new Error(`${config.priceEnvironmentVariable} does not match the advertised ${config.name} plan`);
    }
    return configuredPrice.id;
  }

  const lookupKey = `catstays_${plan}_nzd_${config.amount}_monthly_v1`;
  const existingPrices = await stripe.prices.list({ active: true, lookup_keys: [lookupKey], limit: 1 });
  const existingPrice = existingPrices.data[0];
  if (existingPrice) {
    if (!priceMatchesPlan(existingPrice, plan)) {
      throw new Error(`The Stripe price for ${config.name} does not match the advertised plan`);
    }
    return existingPrice.id;
  }

  const product = await stripe.products.create({
    name: `CatStays ${config.name}`,
    description: config.description,
    metadata: { catstays_plan: plan },
  });
  const price = await stripe.prices.create({
    active: true,
    currency: 'nzd',
    lookup_key: lookupKey,
    product: product.id,
    recurring: { interval: 'month' },
    unit_amount: config.amount,
    metadata: { catstays_plan: plan },
  });
  return price.id;
}

async function requireAccessibleCattery(req: Request, res: Response, catteryId: unknown) {
  if (typeof catteryId !== 'string' || !catteryId) {
    res.status(400).json({ error: 'Missing catteryId' });
    return null;
  }
  const supabase = getAuthClient(req);
  if (!supabase) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const { data: cattery, error } = await supabase
    .from('catteries')
    .select('id, name, email, stripe_customer_id, subscription_status')
    .eq('id', catteryId)
    .single();
  if (error || !cattery) {
    res.status(404).json({ error: 'Cattery not found' });
    return null;
  }
  return { supabase, cattery };
}

router.get('/billing/plans', (_req: Request, res: Response) => {
  res.json({
    currency: 'NZD',
    interval: 'month',
    plans: Object.entries(PLAN_CATALOG).map(([id, plan]) => ({
      id,
      name: plan.name,
      priceNzd: plan.amount / 100,
      description: plan.description,
      features: plan.features,
    })),
  });
});

router.post('/billing/create-checkout-session', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  const { catteryId, plan: rawPlan } = req.body ?? {};
  if (!isPlanKey(rawPlan)) { res.status(400).json({ error: 'Choose a valid CatStays plan' }); return; }
  const access = await requireAccessibleCattery(req, res, catteryId);
  if (!access) return;
  const { supabase, cattery } = access;

  try {
    const priceId = await resolvePlanPrice(rawPlan);
    let customerId: string = cattery.stripe_customer_id || '';
    if (!customerId) {
      const customer = await stripe.customers.create({ email: cattery.email || undefined, name: cattery.name, metadata: { catteryId: cattery.id } });
      customerId = customer.id;
      const { error: updateError } = await supabase.from('catteries').update({ stripe_customer_id: customerId }).eq('id', cattery.id);
      if (updateError) throw updateError;
    }

    const origin = getSafeOrigin(req);
    const returnPath = '/staff-dashboard/subscription';
    const sessionParameters = {
      mode: 'subscription' as const,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${returnPath}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}`,
      metadata: { catteryId: cattery.id, plan: rawPlan },
      subscription_data: { metadata: { catteryId: cattery.id, plan: rawPlan } },
      integration_identifier: createIntegrationIdentifier(),
    } as Stripe.Checkout.SessionCreateParams & { integration_identifier: string };
    const session = await stripe.checkout.sessions.create(sessionParameters);
    res.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    console.error('[billing/create-checkout-session]', err);
    res.status(500).json({ error: message });
  }
});

router.post('/billing/verify-subscription', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  if (!getAuthClient(req)) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { sessionId } = req.body ?? {};
  if (typeof sessionId !== 'string' || !sessionId) { res.status(400).json({ error: 'Missing sessionId' }); return; }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    const catteryId = session.metadata?.catteryId;
    const rawPlan = session.metadata?.plan;
    if (!catteryId || !isPlanKey(rawPlan)) {
      res.status(400).json({ error: 'Checkout session is missing CatStays subscription details' });
      return;
    }
    const access = await requireAccessibleCattery(req, res, catteryId);
    if (!access) return;
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const subscription = session.subscription as Stripe.Subscription | null;
      const { error: updateError } = await access.supabase.from('catteries').update({
        subscription_status: rawPlan,
        stripe_subscription_id: subscription?.id || null,
      }).eq('id', catteryId);
      if (updateError) throw updateError;
      res.json({ success: true, status: rawPlan, plan: rawPlan });
      return;
    }
    res.json({ success: false, status: session.payment_status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify subscription';
    console.error('[billing/verify-subscription]', err);
    res.status(500).json({ error: message });
  }
});

router.post('/billing/portal', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  const access = await requireAccessibleCattery(req, res, req.body?.catteryId);
  if (!access) return;
  if (!access.cattery.stripe_customer_id) {
    res.status(400).json({ error: 'No Stripe billing profile found. Choose a plan first.' });
    return;
  }
  try {
    const origin = getSafeOrigin(req);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: access.cattery.stripe_customer_id,
      return_url: `${origin}/staff-dashboard/subscription`,
    });
    res.json({ url: portalSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to open billing portal';
    console.error('[billing/portal]', err);
    res.status(500).json({ error: message });
  }
});

router.post('/billing/webhook', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).send('Stripe not configured'); return; }
  const signature = req.headers['stripe-signature'];
  if (!signature || !webhookSecret) { res.status(400).send('Missing webhook signature or secret'); return; }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid webhook signature';
    console.error('[billing/webhook] signature verification failed:', message);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  const serviceClient = getServiceClient();
  if (!serviceClient) {
    console.error('[billing/webhook] SUPABASE_SERVICE_ROLE_KEY not set');
    res.status(500).send('Billing database connection is not configured');
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const catteryId = subscription.metadata?.catteryId;
        const rawPlan = subscription.metadata?.plan;
        if (!catteryId || !isPlanKey(rawPlan)) break;
        let status: string = subscription.status;
        if (subscription.status === 'active') status = rawPlan;
        if (subscription.status === 'trialing') status = `trial_${rawPlan}`;
        const { error } = await serviceClient.from('catteries').update({
          subscription_status: status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
        }).eq('id', catteryId);
        if (error) throw error;
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const catteryId = subscription.metadata?.catteryId;
        if (catteryId) {
          const { error } = await serviceClient.from('catteries').update({ subscription_status: 'cancelled', stripe_subscription_id: null }).eq('id', catteryId);
          if (error) throw error;
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const { error } = await serviceClient.from('catteries').update({ subscription_status: 'past_due' }).eq('stripe_customer_id', customerId);
          if (error) throw error;
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[billing/webhook] DB update error:', err);
    res.status(500).send('Webhook update failed');
    return;
  }
  res.json({ received: true });
});

export default router;
