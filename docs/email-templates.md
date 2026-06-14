# CatStays Email Templates

CatStays uses one consistent branded email style across account emails and app emails.

## Brand

- Navy: `#0A1128`
- Terracotta: `#C46A3A`
- Cream: `#F8F7F5`
- Sage: `#4F6F5A`
- Logo: `/icons/icon-192.png`

## Supabase Auth Emails

Supabase Auth templates live in:

`supabase/auth-email-templates/`

Templates included:

- Confirm signup
- Reset password
- Magic link
- Invite user
- Confirm email change
- Reauthentication code

Paste each HTML file into Supabase Dashboard under Authentication > Emails.

## App Transactional Emails

CatStays app emails are generated from:

`artifacts/api-server/src/lib/emailTemplates.ts`

Templates included:

- Booking confirmation
- New website enquiry
- Booking request for cattery owners
- Booking request receipt for customers
- Email integration test
- Owner welcome
- Trial started
- Trial ending reminder
- Subscription active
- Subscription payment failed
- Subscription cancelled
- Customer photo update

All app email templates use `catstaysEmailLayout`, so future emails should be added through that shared wrapper rather than creating a one-off HTML design.

## Environment

Set these values in production where possible:

- `CATSTAYS_APP_URL=https://catstays.app`
- `CATSTAYS_EMAIL_LOGO_URL=https://catstays.app/icons/icon-192.png`
- `RESEND_API_KEY=...`

The fallback logo URL is generated from `CATSTAYS_APP_URL` if `CATSTAYS_EMAIL_LOGO_URL` is not set.

For Supabase Auth emails, keep the hosted Auth settings aligned with production:

- Site URL: `https://catstays.app`
- Additional Redirect URLs: include `https://catstays.app/confirm-email`

If either setting drifts back to `http://localhost:3000`, confirmation emails and password reset links will open the wrong destination.
