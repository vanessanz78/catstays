# Accounting subdomain route hotfix

## Issue

The Payments and Accounting release was present in the published bundle, but tenant subdomains still rendered the generic `StaffDashboard` placeholder at `/staff-dashboard/accounting`.

## Evidence

- Live Deloraine UAT after the first publish showed the updated navigation label (`Payments, expenses & GST`) while the page body still said `Accounting is coming soon`.
- `App.tsx` selects `subdomainRouter` for tenant subdomains.
- `subdomainRouter.tsx` still included `/staff-dashboard/accounting` in its generic `staffDashboardRoutes` list, whereas the main-domain router used the real `AdminAccounting` component.

## Fix

- Remove Accounting from the generic tenant-subdomain route list.
- Route `/staff-dashboard/accounting` directly to `AdminAccounting` in `subdomainRouter.tsx`.

## Verification

- `git diff --check`
- `pnpm --filter @workspace/catstays typecheck`
- `pnpm --filter @workspace/catstays build`
- Published Deloraine UAT must show the real Accounting heading, Stripe status, payment totals/ledger, expenses, date filters, and exports without the coming-soon copy.
- Mobile UAT at 390 px must have no document-level horizontal overflow.

## Customer UAT

1. Sign in at `https://delorainecattery.catstays.app` as staff.
2. Choose **Accounting** from the dashboard menu.
3. Confirm there is no **Soon** badge and no **Accounting is coming soon** message.
4. Confirm the Stripe status card, payment summary, Payments and Expenses tabs, date range, and CSV export actions are visible.
5. Open **Payment Setup** from Accounting and confirm the Stripe connection screen opens for Deloraine Cattery.

