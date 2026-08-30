# Promotions and Social Media recovery — 30 August 2026

## Issue

The staff navigation advertised Promotions and Social Media but marked both as `Soon`. Their tenant routes were captured by the generic staff dashboard and rendered a coming-soon panel. Separate `/admin` components existed, but they were static demo cards with no tenant data, persistence, truthful publishing workflow, or phone-width proof.

## Evidence before the fix

- `RightMenu.tsx` added `Soon` badges to both tools.
- `/staff-dashboard/promotions` and `/staff-dashboard/social` were included in the generic `StaffDashboard` route arrays in both routers.
- `Promotions.tsx` showed one hard-coded AI card and a button without an action.
- `Social.tsx` only linked to Cat Updates and did not create or retain social content.
- CatStays had no normalized cattery promotion or social-post records, although StayDirect already used tenant-owned promotion and marketing tables as its durable pattern.

## Recovery

- Added `cattery_promotions`, scoped by `cattery_id`, with offer code, percentage/fixed value, validity, minimum stay, optional usage limit, lifecycle status, terms, audit fields, indexes, grants, and staff-only row-level security.
- Added `cattery_social_posts`, scoped by `cattery_id`, with optional promotion link, caption, platforms, schedule, lifecycle status, audit fields, indexes, grants, and staff-only row-level security.
- Replaced Promotions with a real searchable CRUD workspace: create, validate, normalize, edit, pause, resume, track state, and preserve usage metadata.
- Replaced Social Media with a real composer and durable history: cattery-specific safe templates, promotion-aware copy, Facebook/Instagram targets, optional scheduling, save/edit, copy, native share, and manual published status.
- Kept product truth explicit: a CatStays schedule is a content plan and does not pretend to auto-publish to social networks.
- Connected both staff routes directly to their production components and removed both `Soon` badges.
- Added focused tests for code normalization, offer formatting, lifecycle state, safe cattery copy, and workspace search.

## Release workflow

1. Branch from the exact GitHub `main` used by the Messages release.
2. Add implementation, migration, tests, and this durable checkpoint.
3. Run targeted tests, API and app typechecks, production build, and responsive browser UAT.
4. Push the branch and open a reviewed pull request.
5. Merge the reviewed branch to GitHub `main`.
6. Apply the committed idempotent migration to the CatStays Supabase project.
7. Pull the exact merged `main` SHA into CatStays Replit, rerun tests/build, republish, and verify the live Deloraine tenant.

## Automated and local UAT evidence

- Seven focused tests pass, including all new marketing helper tests.
- API server TypeScript check passes.
- CatStays TypeScript check passes.
- CatStays production build passes; only the repository's existing sourcemap and large-chunk warnings remain.
- Promotions desktop UAT: direct route renders the real workspace, no `Soon` badge, new-offer editor opens, `spring 15!` normalizes to `SPRING15`, and the preview shows `15% off`.
- Social Media desktop UAT: direct route renders the real composer, template generation fills a cattery-specific caption, and the interface explains the publishing boundary.
- Promotions and Social Media phone-width UAT: `innerWidth`, document client width, document scroll width, and body scroll width all equal `390px`.

## Customer UAT after publish

1. Sign in to `delorainecattery.catstays.app` and open **Promotions**. Confirm there is no `Soon` badge or coming-soon panel.
2. Select **New promotion**. Enter a temporary offer name, `UAT15`, 15%, dates, minimum days, and terms. Confirm the preview is correct, save it, edit it, pause it, and resume it. Archive or clearly label it as UAT afterward.
3. Open **Social Media**. Choose **Promotion**, select `UAT15`, and create a cattery-specific draft. Confirm the cattery name, code, amount, dates, and website are correct and no unapproved claims were invented.
4. Save the post as a draft, reopen it, add a future schedule time, and confirm it appears as scheduled.
5. Use **Copy** and paste into a private note. On a phone, use **Share** and confirm the native share sheet opens; cancel without publishing.
6. At a 390px phone width, confirm both pages have readable full-width fields, no one-character wrapping, and no sideways page scrolling.

## Rollback boundary

The feature can be rolled back by reverting the application commit. The new tables are additive and tenant-scoped; leaving them in place preserves created records and is safe. Removing the tables would delete marketing data and therefore requires a separately reviewed destructive migration.
