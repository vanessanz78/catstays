# CatStays checkpoint: guided per-cattery Stripe setup

Date: 2026-08-27

Branch: `fix/guided-stripe-setup`

Base `main`: `a5396aee047f1fda48643d68b2ce0164f5e11a66`

Supabase project: `iwyoezwqorddkmqnjbif`

## Reported issue and evidence

Deloraine Cattery's live **Payment Setup** page did not offer any place to add Stripe keys. Signed-in production UAT showed the older generic `Payment Setup is ready for live tenant data` placeholder at `/staff-dashboard/payment`.

The route correction was already reviewed and merged into GitHub `main`, but it had not yet been republished from Replit. The underlying payment screen also placed the real per-cattery key fields below several informational and non-persisted settings cards, making the required action unnecessarily difficult to find.

Signed-in StayDirect UAT was used as the working reference. Its useful pattern is a clear Stripe integration card with **Setup required** status, test/live modes, visible setup progress, key fields, webhook guidance, connection testing, and connected-account actions.

## Security boundary

StayDirect Stripe credentials are not copied, read, exported, or reused. Each CatStays cattery must connect the Stripe account that should receive that cattery's customer payments.

CatStays sends the supplied secret key once to its authenticated server, validates the account with Stripe, creates the cattery-specific webhook, and stores the secret and webhook signing secret encrypted in Supabase Vault. The browser receives only the masked publishable key, Stripe account ID, mode, and validation time.

## Implemented on this branch

- Reworked **Payment Setup** so the Stripe setup action and key fields are immediately visible.
- Added a four-step setup guide based on the proven StayDirect workflow.
- Added explicit **Test Mode** and **Live Mode** choices with matching-key validation and a live-money warning.
- Added direct links to Stripe and its API keys page.
- Explained that CatStays creates and manages the webhook automatically; the cattery does not paste a webhook signing secret.
- Added a safe server-side **Test connection** action that re-validates the encrypted saved credential and records the latest validation time.
- Added connected-account details plus **Replace keys** and confirmed **Disconnect** actions.
- Kept the test-booking card guidance when test keys are connected.
- Removed the previous payment switches that changed only local screen state and were not persisted or enforced.
- Kept email-delivery testing separate from the cattery's Stripe connection.

## Branch verification

- Focused booking, payment-rule, email, and source-service tests: 12 passed.
- CatStays TypeScript check: passed.
- API server TypeScript check: passed.
- CatStays production build: passed.
- API server production build: passed.
- `git diff --check`: passed.

The CatStays build retains the repository's existing source-map and large-chunk warnings; there were no build errors.

## Release workflow

1. Review this branch and the authenticated Stripe test endpoint.
2. Push the completed branch and open a pull request.
3. Merge the reviewed branch into GitHub `main`.
4. Pull the exact merged `main` SHA into the CatStays Replit.
5. Restart the CatStays web and API processes, republish, and verify the deployed SHA.
6. Complete the signed-in Deloraine UAT below with Stripe test keys before adding live keys.

## Customer UAT

1. Sign in to `delorainecattery.catstays.app` as the cattery owner and open **Payment Setup**.
2. Confirm the first Stripe card says **Setup required** and the publishable/secret key fields are visible on the same page.
3. Leave **Test Mode** selected, open **Stripe API keys**, and paste Deloraine's matching `pk_test_...` and `sk_test_...` keys.
4. Select **Connect and validate Stripe**. Confirm the secret disappears, only a masked publishable key is shown, and the account is marked **Test Mode**.
5. Select **Test connection** and confirm the success message and validation time update.
6. Confirm a test booking, request a deposit or full payment, and pay using `4242 4242 4242 4242`, any future expiry, and any three-digit CVC.
7. Confirm the customer email, verified booking payment status, and staff/customer alerts.
8. Only after test UAT passes, choose **Replace keys**, select **Live Mode**, and connect Deloraine's matching live keys.

This release is not complete from a branch build alone. Completion requires reviewed GitHub `main`, the exact merged SHA running in Replit, a republish, and successful signed-in customer UAT.
