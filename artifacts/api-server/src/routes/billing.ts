import { Router, type IRouter, type Request, type Response, type NextFunction } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import express from 'express';

const router: IRouter = Router();

const stripeKey = process.env['STRIPE_API_KEY'];
const supabaseUrl = process.env['VITE_SUPABASE_URL']!;
const supabaseAnonKey = process.env['VITE_SUPABASE_ANON_KEY']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

if (!stripeKey) {
  console.warn('[billing] STRIPE_API_KEY not set — billing routes will fail');
}

const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' }) : null;

function getAuthClient(req: Request) {
  const jwt = req.headers.authorization?.split(' ')[1];
  if (!jwt) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

function getServiceClient() {
  if (!supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST /api/billing/create-checkout-session
router.post('/billing/create-checkout-session', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }

  const supabase = getAuthClient(req);
  if (!supabase) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { catteryId, plan: rawPlan } = req.body;
  if (!catteryId) { res.status(400).json({ error: 'Missing catteryId' }); return; }

  // Validate plan — only 'starter' or 'professional' are accepted
  const plan = rawPlan === 'starter' ? 'starter' : 'professional';
  const isProfessional = plan === 'professional';
  const planAmount = isProfessional ? 4900 : 2900; // $49 or $29 NZD in cents
  const planName = isProfessional ? 'CatStays Professional' : 'CatStays Starter';
  const planDescription = isProfessional
    ? 'Monthly cattery management — unlimited rooms, bookings, analytics, marketing materials & more'
    : 'Monthly cattery management — bookings, calendar, customer portal & more';

  try {
    const { data: cattery, error } = await supabase
      .from('catteries')
      .select('id, name, email, stripe_customer_id, subscription_status')
      .eq('id', catteryId)
      .single();

    if (error || !cattery) {
      res.status(404).json({ error: 'Cattery not found' });
      return;
    }

    let customerId: string = cattery.stripe_customer_id || '';

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: cattery.email || undefined,
        name: cattery.name,
        metadata: { catteryId: cattery.id },
      });
      customerId = customer.id;
      await supabase
        .from('catteries')
        .update({ stripe_customer_id: customerId })
        .eq('id', catteryId);
    }

    const origin = req.headers.origin || 'https://catstays.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: planName,
              description: planDescription,
            },
            unit_amount: planAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/admin/subscription`,
      metadata: { catteryId: cattery.id, plan: plan || 'professional' },
      subscription_data: {
        metadata: { catteryId: cattery.id, plan: plan || 'professional' },
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[billing/create-checkout-session]', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// POST /api/billing/verify-subscription — called by frontend after Stripe redirect
router.post('/billing/verify-subscription', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }

  const supabase = getAuthClient(req);
  if (!supabase) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { sessionId } = req.body;
  if (!sessionId) { res.status(400).json({ error: 'Missing sessionId' }); return; }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status === 'paid' || session.status === 'complete') {
      const sub = session.subscription as Stripe.Subscription | null;
      const catteryId = session.metadata?.catteryId;
      const plan = session.metadata?.plan || 'professional';
      const newStatus = plan === 'professional' ? 'professional' : 'active';

      if (catteryId) {
        await supabase
          .from('catteries')
          .update({
            subscription_status: newStatus,
            stripe_subscription_id: sub?.id || null,
          })
          .eq('id', catteryId);
      }

      res.json({ success: true, status: newStatus });
    } else {
      res.json({ success: false, status: session.payment_status });
    }
  } catch (err: any) {
    console.error('[billing/verify-subscription]', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/portal — Stripe Customer Portal
router.post('/billing/portal', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }

  const supabase = getAuthClient(req);
  if (!supabase) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { catteryId } = req.body;
  if (!catteryId) { res.status(400).json({ error: 'Missing catteryId' }); return; }

  try {
    const { data: cattery } = await supabase
      .from('catteries')
      .select('stripe_customer_id')
      .eq('id', catteryId)
      .single();

    if (!cattery?.stripe_customer_id) {
      res.status(400).json({ error: 'No Stripe customer found. Subscribe first.' });
      return;
    }

    const origin = req.headers.origin || 'https://catstays.app';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: cattery.stripe_customer_id,
      return_url: `${origin}/admin/subscription`,
    });

    res.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('[billing/portal]', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/webhook — Stripe webhook events
// Must use raw body — mounted before express.json() in app
router.post(
  '/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    if (!stripe) { res.status(500).send('Stripe not configured'); return; }

    const sig = req.headers['stripe-signature'];
    if (!sig || !webhookSecret) {
      res.status(400).send('Missing webhook signature or secret');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('[billing/webhook] signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      console.warn('[billing/webhook] SUPABASE_SERVICE_ROLE_KEY not set — cannot update DB from webhook');
      res.json({ received: true });
      return;
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const sub = event.data.object as Stripe.Subscription;
          const catteryId = sub.metadata?.catteryId;
          const plan = sub.metadata?.plan || 'professional';
          let status: string;
          if (sub.status === 'active') {
            status = plan === 'professional' ? 'professional' : 'active';
          } else if (sub.status === 'past_due') {
            status = 'past_due';
          } else {
            status = sub.status;
          }
          if (catteryId) {
            await serviceClient.from('catteries').update({
              subscription_status: status,
              stripe_subscription_id: sub.id,
              stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
            }).eq('id', catteryId);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          const catteryId = sub.metadata?.catteryId;
          if (catteryId) {
            await serviceClient.from('catteries').update({
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
            }).eq('id', catteryId);
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
          if (customerId) {
            await serviceClient.from('catteries').update({
              subscription_status: 'past_due',
            }).eq('stripe_customer_id', customerId);
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('[billing/webhook] DB update error:', err);
    }

    res.json({ received: true });
  }
);

export default router;
