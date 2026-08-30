# Staff Insights recovery checkpoint — 30 August 2026

## Issue

The staff **Insights** menu was still marked **Soon** and opened the generic coming-soon panel even though CatStays contained an older analytics hook and a narrow prototype page. The prototype used booking counts against cat capacity for occupancy, excluded partial and pending balances, and had a fake local-only **Send Payment Request** action that did not contact a customer.

## Evidence and tenant boundary

- Every analytics query is filtered by the signed-in cattery ID.
- Bookings, linked cats, customer names, payment status, totals, and active room capacity come from Supabase.
- Cancelled bookings are excluded from operating metrics.
- No customer message, payment request, promotion, booking, or payment is created by the Insights page.
- An outstanding balance links to its real booking so staff can verify the customer and amount before using the established payment workflow.

## Implemented workflow

1. Replace the coming-soon panel with a responsive staff Insights report inside the existing dashboard shell.
2. Calculate weekly and monthly occupancy as occupied cat-days divided by active cat-space days.
3. Count arrival and departure as inclusive care days, matching CatStays booking pricing.
4. Treat stays as active in a reporting period when any part of the stay overlaps that period.
5. Show booked stay value separately from cleared revenue and direct staff to Accounting for paid, refunded, and GST figures.
6. Forecast next-week cat-day occupancy and link low-occupancy action to the real Promotions page.
7. Show unpaid, partial, and pending balances with real booking links instead of a simulated send action.
8. Add a visible retry state if tenant analytics cannot be loaded.
9. Remove the **Soon** badge from the Insights navigation item.

## Branch verification

- CatStays TypeScript check must pass.
- CatStays production build must pass.
- Git diff whitespace validation must pass.
- Live Deloraine UAT must verify real metrics or truthful zero states, real booking/accounting/promotions links, no **Soon** badge, no coming-soon copy, and no customer-facing mutation.

## Release workflow

- Feature branch: `feat/staff-insights-recovery-20260830`
- Baseline main: `863a2250ad1c08f4a2218d2c1519e3810b5e2135`
- Review, merged main SHA, exact Replit sync, publish wrapper, and live UAT are recorded in the pull request release comment.

## Customer UAT

1. Open **Dashboard → Insights** and confirm the page belongs to the signed-in cattery and no longer says **Soon** or **coming soon**.
2. Check this week's booked value, active stays, occupancy, and average inclusive stay length.
3. Confirm next week's forecast shows cats booked, active cat spaces, and an occupancy percentage.
4. Select **Create promotion** and confirm it opens the cattery's Promotions page without creating an offer.
5. Check the monthly summary and select **Open full accounting report**.
6. If balances are shown, open one and confirm it navigates to the matching booking; do not send a payment request during read-only UAT.
7. At phone width, confirm every metric, forecast, balance, and explanatory note stays readable without sideways scrolling.
