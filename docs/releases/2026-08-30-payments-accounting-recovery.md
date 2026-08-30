# Payments and Accounting recovery checkpoint

Date: 2026-08-30

## Reported issue

The Deloraine Cattery staff dashboard showed Accounting as “Soon” and routed it to a generic coming-soon panel. Payment Setup existed separately, but the dashboard did not clearly explain how Stripe setup led to a customer payment request. The older Accounting component was not safe to expose because it displayed sample customers, sample bookings, sample expenses, and hard-coded revenue.

## Evidence and root cause

- `RightMenu.tsx` labelled Accounting with a `Soon` badge.
- `routes.tsx` sent `/staff-dashboard/accounting` to `StaffDashboard`.
- `StaffDashboard.tsx` rendered a generic coming-soon state for the accounting section.
- The legacy `AdminAccounting` page used `MOCK_REVENUE` plus in-memory sample bookings and expenses.
- The real CatStays Stripe workflow already existed through `PaymentIntegration`, `catteryPayments.ts`, Stripe Checkout Sessions, per-cattery Supabase Vault credentials, webhook verification, payment requests, and booking payment actions.
- StayDirect was reviewed for its host-facing setup, date filtering, expense, GST, and export workflow. CatStays keeps its newer Vault-backed per-cattery credential design rather than copying StayDirect’s older credential persistence.

## Recovery delivered

- `/staff-dashboard/accounting` now opens a production staff workspace backed only by the signed-in cattery’s bookings, completed payments, payment requests, and expenses.
- The Accounting navigation item no longer says `Soon`.
- A prominent Stripe card explains the full operational path:
  1. connect this cattery’s own Stripe account in Payment Setup;
  2. open a confirmed booking;
  3. choose “Request payment from customer”;
  4. email secure deposit and/or full-payment Checkout links.
- Added real period filters, payment/outstanding/expense totals, a booking payment ledger, expense add/delete, payments and expense CSV exports, and an explicitly qualified New Zealand GST estimate.
- Removed all sample accounting customers, bookings, revenue, and expenses from the live staff route.
- Payment Setup now uses the same desktop dashboard sidebar and links directly to the payment ledger.

## Security and data boundaries

- Each cattery continues to connect its own Stripe account.
- Stripe secret and webhook credentials remain server-only and encrypted in Supabase Vault.
- No Stripe secret is returned to the browser.
- Payment collection continues through Stripe-hosted Checkout Sessions; CatStays does not collect card details.
- No database migration was required for this slice; it uses the existing `payments`, `payment_requests`, `expenses`, and `bookings` tables.

## Branch verification

- Workspace TypeScript checks: passed.
- CatStays production frontend build: passed.
- Accounting route opens as a real page rather than a coming-soon panel: passed.
- Period preset can be changed to All time: passed.
- Expense form opens and exposes description, category, date, amount, save, and cancel controls: passed.
- GST summary opens and labels the estimate and accounting disclaimer: passed.
- Payment Setup and Bookings links are present: passed.
- Phone-width check at 390 × 844: `document.documentElement.scrollWidth === window.innerWidth === 390`: passed.

## Customer UAT after publish

1. Sign in at the Deloraine Cattery staff dashboard.
2. Open **Accounting** and confirm no `Soon` badge or coming-soon message remains.
3. Confirm the Stripe status card shows the correct connected/test/live state.
4. Change the period to **All time** and confirm existing bookings and totals appear.
5. Open a booking row and confirm the booking detail drawer/page opens.
6. For a confirmed unpaid booking, select **Request payment from customer**, choose deposit/full/both, and confirm the email arrives with Stripe Checkout links.
7. Complete only a Stripe test-mode Checkout with test card `4242 4242 4242 4242`; confirm the booking/payment ledger updates after the webhook.
8. Add a temporary expense, confirm it appears in Expenses and the GST estimate changes, then delete it.
9. Export Payments and Expenses CSV files and confirm the downloaded rows match the selected period.
10. Repeat Accounting, Payment Setup, and booking payment-request navigation on a phone/PWA and confirm there is no sideways page scrolling.
