import { supabase } from '@/utils/supabase/client';

const API_BASE = '/api';

export interface BookingConfirmationPayload {
  catteryId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  catteryName: string;
  catName?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: string;
  deposit?: string;
  paymentRequest?: 'deposit' | 'full' | 'none';
  customMessage?: string;
  customerNote?: string;
  terms?: string;
  bookingRef?: string;
  catteryEmail?: string;
}

export interface ContactEnquiryPayload {
  catteryId?: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  message: string;
  catteryName: string;
  catteryEmail: string;
}

export interface CustomerMessagePayload {
  catteryId: string;
  customerId: string;
  bookingId?: string;
  draftId?: string;
  subject: string;
  body: string;
}

export interface CatUpdatePayload {
  catteryId: string;
  bookingId: string;
  customerId: string;
  catId: string;
  storagePath: string;
  caption: string;
}

export interface CatUpdateResult {
  success: boolean;
  saved?: boolean;
  updateId?: string;
  emailSent?: boolean;
  error?: string;
}

export interface CustomerReplyPayload {
  subject: string;
  body: string;
  bookingId?: string;
}

export interface CustomerReplyResult {
  success: boolean;
  saved?: boolean;
  messageId?: string;
  emailSent?: boolean;
  warning?: string;
  error?: string;
}

async function post(path: string, body: object): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data } = await supabase.auth.getSession();
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error('[email]', err);
    return { success: false, error: 'Network error' };
  }
}

export function sendBookingConfirmation(payload: BookingConfirmationPayload) {
  return post('/email/booking-confirmation', payload);
}

export function sendContactEnquiry(payload: ContactEnquiryPayload) {
  return post('/email/contact-enquiry', payload);
}

export function sendCustomerMessage(payload: CustomerMessagePayload) {
  return post('/email/customer-message', payload);
}

export async function sendCustomerReply(payload: CustomerReplyPayload): Promise<CustomerReplyResult> {
  try {
    const { data } = await supabase.auth.getSession();
    const response = await fetch(`${API_BASE}/email/customer-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error('[customer-reply]', error);
    return { success: false, saved: false, error: 'Network error while sending the message.' };
  }
}

export async function sendCatUpdate(payload: CatUpdatePayload): Promise<CatUpdateResult> {
  try {
    const { data } = await supabase.auth.getSession();
    const response = await fetch(`${API_BASE}/email/cat-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error('[cat-update]', error);
    return { success: false, saved: false, error: 'Network error while sending the photo update.' };
  }
}

export function sendTestEmail(to: string) {
  return post('/email/test', { to });
}
