# Live Payment Setup Route Checkpoint

## Issue

Production UAT after PR #20 showed that `https://delorainecattery.catstays.app/staff-dashboard/payment` still rendered the generic staff-workspace placeholder. The secure per-cattery Stripe screen existed and built successfully, but neither the root-domain router nor the tenant-subdomain router connected that URL to `PaymentIntegration`.

## Evidence

- Replit successfully published merged `main` commit `1b116b39b5e3e9940719b88ef0888e401a6a2fa0`.
- The live Deloraine bookings page loaded the new five-step booking flow with no browser console errors.
- The live Payment Setup URL displayed `Payment Setup is ready for live tenant data`, proving the placeholder route remained active.
- Both route tables included `/staff-dashboard/payment` in their generic `StaffDashboard` path arrays, while `PaymentIntegration` was only connected to legacy `/admin/payment-integration` and `/dashboard/payment` URLs.

## Fix

- Remove `/staff-dashboard/payment` from both generic staff-dashboard route arrays.
- Add an explicit `PaymentIntegration` route for `/staff-dashboard/payment` in both the root and tenant-subdomain routers.
- Preserve the secure design from PR #20: each cattery supplies its own Stripe keys, secret material is validated server-side and stored in Supabase Vault, and browser responses contain only safe connection metadata.

## Release workflow

1. Test this branch and review the exact route diff.
2. Merge the reviewed pull request into GitHub `main`.
3. Pull that exact merged `main` SHA into CatStays Replit.
4. Restart all CatStays Replit services and republish.
5. Repeat signed-in production UAT on the Deloraine tenant domain.

## Customer UAT

1. Sign in to Deloraine CatStays and open **Payment Setup** from the dashboard menu.
2. Confirm the page heading is **Payment Integration**, not the placeholder message.
3. Confirm the page shows **Stripe Not Configured** until Deloraine supplies its keys.
4. Connect Stripe test keys and confirm only the masked publishable key is shown after validation.
5. Create or open a confirmed booking and request deposit only, full payment only, and both choices in test mode.
6. Confirm the customer email links, verified payment status update, and staff/customer alerts before switching to live keys.
