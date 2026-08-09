import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('[resend] RESEND_API_KEY is not set — emails will not be sent');
}

export const resend = resendApiKey
  ? new Resend(resendApiKey)
  : {
      emails: {
        send: async () => ({
          data: null,
          error: new Error('RESEND_API_KEY is not configured'),
        }),
      },
    };

export const FROM_ADDRESS = 'bookings@catstays.app';
