# Staff Settings recovery — 2026-08-30

## Issue and evidence

The live staff Settings workspace contained only one notification card even though its navigation description promised platform configuration. The earlier Admin Settings screen linked to profile, password, billing, subscription, data, and privacy paths that were not wired in the tenant router; on a live cattery subdomain `/admin/settings` fell through to the public homepage.

## Recovery

- Replaced the single-card Settings view with a responsive hub of six real staff workspaces: phone notifications, booking rules and hours, customer payments, CatStays subscription, data import/export, and business/website details.
- Kept customer Stripe payments and CatStays subscription billing visibly separate.
- Recovered legacy tenant settings bookmarks and mapped them to the closest live staff workspace.
- Preserved URL query strings so old return links and UAT markers survive redirects.
- Left password and privacy placeholders pointed at the honest Settings hub instead of presenting controls that do not exist.

## Workflow and UAT

1. Run the CatStays type check and production build locally and against the exact feature branch in Replit.
2. Review and merge the branch to GitHub main.
3. Pull the exact reviewed main commit into Replit, rebuild, and republish.
4. On Deloraine Cattery, open Staff Settings and verify all six cards reach the named live workspace.
5. Verify `/admin/settings` and representative legacy child routes redirect to the correct staff page with query strings preserved.
6. At 390 px, confirm cards stack cleanly and `document.documentElement.scrollWidth` does not exceed the viewport.
7. Check the live browser console for warnings and errors.

Automated UAT must not enable phone notifications, open Stripe Checkout or the billing portal, change booking rules, upload/import data, or save website edits. Those actions create persistent external or tenant data and belong in explicit customer UAT.
