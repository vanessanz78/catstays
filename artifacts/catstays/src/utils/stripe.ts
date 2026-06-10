import { loadStripe, type Stripe } from '@stripe/stripe-js';

const key = import.meta.env.STRIPE_PUBLIC_KEY as string | undefined;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!key) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export const stripePublishableKey: string = key ?? '';
export const stripeConfigured: boolean = !!key && (key.startsWith('pk_live_') || key.startsWith('pk_test_'));
export const stripeLiveMode: boolean = !!key && key.startsWith('pk_live_');
