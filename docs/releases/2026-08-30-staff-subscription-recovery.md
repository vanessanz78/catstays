# Staff Subscription recovery checkpoint — 2026-08-30

## Issue

The staff navigation labelled Subscription as `Soon` and routed to the generic placeholder. A separate legacy page claimed that every account was on Professional at $49/month, only supported two plans, sent Stripe back to `/admin/subscription`, and exposed a platform Stripe Dashboard link that a cattery tenant should not use.

The subscription API also charged $29/$49 even though CatStays onboarding and public pricing advertise Starter $49, Professional $79, and Premium $99 NZD/month. Invalid plan values silently defaulted to Professional, completed sessions could be verified without first proving cattery access, and webhook database failures still returned success.

This CatStays platform subscription is distinct from a cattery's own Stripe connection for accepting customer booking payments.

## Evidence and decisions

- Public Pricing and onboarding both define the same three-plan catalogue: Starter $49, Professional $79, Premium $99 NZD/month.
- The API now exposes that catalogue at `GET /api/billing/plans` and accepts only those exact plan identifiers.
- Stripe Checkout uses recurring Stripe Prices. Existing configured `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, and `STRIPE_PRICE_PREMIUM` values are validated against the advertised currency, interval, and amount. When they are absent, a stable amount-versioned lookup key is resolved or created on the first explicitly requested checkout.
- Checkout and the Customer Portal return to `/staff-dashboard/subscription` on an allow-listed CatStays origin.
- Tenant access is checked through the signed-in Supabase client before customer, checkout, verification, or portal operations.
- The webhook remains the ongoing subscription-status authority and now returns an error when its database update fails so Stripe can retry.
- The page does not link tenants to CatStays' platform Stripe Dashboard. Payment details are entered only in hosted Stripe surfaces.
- Stripe Tax was not enabled because no CatStays tax registration was established in this task. Tax configuration must be completed deliberately before automatic tax collection is turned on.

## Workflow

1. Implement on `feat/staff-subscription-recovery-20260830` from the reviewed Insights main commit.
2. Typecheck and build both the CatStays web app and API from the exact branch commit in Replit.
3. Open a GitHub pull request, record an approving review, and merge with the exact tested head SHA.
4. Reset Replit to the exact GitHub main merge SHA, repeat app/API verification, republish, and prove the wrapper commit has that merge as its parent with no source diff.

## UAT boundaries

Safe automated UAT is read-only:

- Open the signed-in Deloraine Cattery staff Subscription page.
- Confirm the `Soon` badge and placeholder are gone.
- Confirm Starter $49, Professional $79, and Premium $99 NZD/month appear without wrapping or horizontal overflow at 390 px.
- Confirm the displayed trial/current status is tenant data and the page explains the separation between CatStays billing and customer-payment Stripe setup.
- Confirm the browser console has no page errors and `GET /api/billing/plans` returns the same catalogue.
- Confirm legacy `/admin/subscription` and `/dashboard/subscription` bookmarks redirect to the staff page.

Do not press a plan button or Manage billing during automated UAT: those actions intentionally create a real hosted Stripe session. Customer UAT may open Stripe Checkout, verify the chosen plan and amount, and cancel before entering or confirming payment details.
