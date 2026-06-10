const API_BASE = '/api';

export interface BookingConfirmationPayload {
  customerName: string;
  customerEmail: string;
  catteryName: string;
  catName?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: string;
  bookingRef?: string;
  catteryEmail?: string;
}

export interface ContactEnquiryPayload {
  customerName: string;
  customerEmail: string;
  message: string;
  catteryName: string;
  catteryEmail: string;
}

async function post(path: string, body: object): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export function sendTestEmail(to: string) {
  return post('/email/test', { to });
}
