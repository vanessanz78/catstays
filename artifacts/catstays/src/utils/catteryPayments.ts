import { supabase } from './supabase/client';

export interface CatteryPaymentStatus {
  connected: boolean;
  mode?: 'test' | 'live';
  accountId?: string;
  maskedPublishableKey?: string;
  lastValidatedAt?: string;
}

async function paymentApi<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Payment request failed.');
  return body as T;
}

export function getCatteryPaymentStatus(catteryId: string) {
  return paymentApi<CatteryPaymentStatus>(`/cattery-payments/status/${encodeURIComponent(catteryId)}`);
}

export function connectCatteryStripe(catteryId: string, publishableKey: string, secretKey: string) {
  return paymentApi<CatteryPaymentStatus>('/cattery-payments/connect', {
    method: 'POST',
    body: JSON.stringify({ catteryId, publishableKey, secretKey }),
  });
}

export function testCatteryStripe(catteryId: string) {
  return paymentApi<CatteryPaymentStatus>('/cattery-payments/test', {
    method: 'POST',
    body: JSON.stringify({ catteryId }),
  });
}

export function disconnectCatteryStripe(catteryId: string) {
  return paymentApi<CatteryPaymentStatus>('/cattery-payments/disconnect', {
    method: 'POST',
    body: JSON.stringify({ catteryId }),
  });
}

export function requestBookingPayment(bookingId: string, choice: 'deposit' | 'full' | 'both') {
  return paymentApi<{
    success: boolean;
    links: Array<{ type: 'deposit' | 'full'; amount: number; url: string }>;
    emailSent: boolean;
    emailError?: string;
  }>('/cattery-payments/request', {
    method: 'POST',
    body: JSON.stringify({ bookingId, choice }),
  });
}
