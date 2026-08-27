# CatStays checkpoint: full product UAT and secure platform admin

Date: 2026-08-28

Branch: `feat/full-uat-platform-admin-20260828`

Base `main`: `e5808e481cdd9efdb31f076aeabc104e93175d43`

Supabase project: `iwyoezwqorddkmqnjbif` (`CatStays`, confirmed healthy before database work)

## Request and live evidence

The requested UAT covered five distinct production surfaces: the CatStays marketing website, Deloraine Cattery's published website and booking flow, the staff dashboard, the client portal, and an all-subdomains CatStays admin panel.

Read-only production UAT found:

- `/platform/dashboard` was publicly accessible without authentication and displayed hard-coded sample businesses, fake KPIs, and fake revenue. `/platform/admin-login` accepted any credentials and navigated directly to that screen. This was a security defect, not a usable admin panel.
- The live booking estimate correctly recalculated three inclusive care days for three cats at `$20` per cat/day: `$180.00` subtotal, `$27.00` GST, `$207.00` total. Copy correctly explained that arrival and departure days are included.
- Staff customer suggestions stayed hidden until text was entered and matched the live Deloraine records by partial customer text.
- The staff date-range picker opened inside the phone viewport, selected the stay in one calendar, and exposed a clear **Done** action.
- At a real `390 x 844` browser viewport, `document.documentElement.scrollWidth` equalled `390` for the marketing home, Deloraine public home, staff home, and client portal. No horizontal page overflow was present.
- A sweep of 19 staff routes at 390px produced no browser console warnings/errors and no horizontal overflow. Several menu destinations were only placeholders but were described as if they were operational.
- The **Open**, **Check in**, and **Check out** controls on staff-home booking rows had no action handler. The lower website card also used a tenant path that was inappropriate on a tenant subdomain.
- The room planner still described daily cattery pricing as “per night”, contrary to the inclusive-day business rule.
- The installed-app launch screen and browser favicon used a transparent icon variant while the maskable/app icon used the intended white-backed CatStays artwork, explaining the inconsistent/inverted appearance on some devices.

The live UAT was deliberately read-only. It did not submit a test booking, add a customer, confirm a booking, send email, request Stripe payment, dismiss a real alert, or alter live customer records.

## Implemented on this branch

### Secure platform admin

- Replaced the public mock dashboard with a real, responsive CatStays Admin Panel.
- Added a `platform_admins` allow-list keyed to Supabase Auth users, with RLS enabled and self-verification only for authenticated browser clients.
- Bootstrapped the platform owner from the existing Deloraine tenant owner without hard-coding a generated user UUID.
- Added authenticated `GET /api/platform/overview`. It verifies the Supabase access token and platform-admin membership server-side before using the service role.
- The endpoint returns operational tenant summaries only: cattery/subdomain, subscription and publishing state, booking/customer/room counts, pending/upcoming counts, and non-secret Stripe connection status.
- Stripe publishable keys, secret keys, webhook secrets, raw payment settings, customer records, and booking details are not returned by the platform overview.
- Replaced the demo admin login with real Supabase password authentication plus a server-side platform-access check.
- Added responsive KPI cards, cattery search, accurate live tenant cards, refresh, sign out, and public-site links.

### Dashboard and booking UX

- Made staff-home booking rows navigate to the exact booking details panel. Deep links use `?booking=<id>` and the bookings screen opens the matching full-screen sheet.
- Widened the new-booking workflow and booking list to `max-w-5xl` on larger displays while preserving the verified phone layout.
- Allowed sort controls to wrap instead of compressing on narrow displays.
- Turned the staff customer search affordance into a real search field covering customer name, cat name, email, and phone, with direct email/phone actions.
- Corrected the room planner rate label to “per cat, per day”.
- Corrected the tenant dashboard website link to the tenant home route.
- Relabelled unfinished workspace destinations as **Soon** and changed their screens to honest “coming soon” states instead of implying that placeholder screens were live.

### PWA identity

- Standardised manifest, shortcuts, launch screen, notification icon, and favicon on the same white-backed CatStays icon artwork.
- Advanced the service-worker cache to `catstays-pwa-v3` so installed apps replace the older cached artwork after the release.
- Preserved role-aware `/app` launch: owner/staff accounts open the staff dashboard; customer or signed-out accounts open the client portal.

## Branch verification

- Full workspace TypeScript check: passed for CatStays, API server, mockup sandbox, and scripts.
- Focused product tests: 33 passed (booking pricing, customer search, schedules, inclusive days, room totals, emails, deposit rules, content sources, and source rebuilds).
- CatStays production build: passed.
- API server production build: passed.
- `git diff --check`: passed.
- Existing source-map and large JavaScript chunk warnings remain; there were no build errors.

The first recursive workspace build encountered an esbuild service stop in the unrelated mockup-sandbox build. The CatStays and API targets were rerun directly and both built successfully.

## Release workflow

1. Review this branch, especially the platform-admin allow-list, RLS, and server authorization boundary.
2. Push the completed branch and open a pull request.
3. Merge the reviewed branch into GitHub `main`.
4. Apply the reviewed `platform_admins` migration to Supabase project `iwyoezwqorddkmqnjbif` and run security/performance advisors.
5. Pull the exact merged `main` SHA into the CatStays Replit without discarding unrelated Replit state.
6. Restart the CatStays/API workflows, republish, and verify the exact SHA on production.
7. Complete the platform, staff, public, PWA, and client UAT below.

## Customer and founder UAT

### Platform admin

1. On `catstays.app`, open `/platform/admin-login` and sign in with the CatStays platform-owner account.
2. Confirm `/platform/dashboard` shows exactly the live catteries (currently Deloraine Cattery and Fancy Felines), not sample companies.
3. Confirm the totals match the tenant cards and that no Stripe keys or customer details are displayed.
4. Search for `Deloraine`, `Fancy`, a slug, and a city. Confirm the list filters immediately.
5. Open each public website from its tenant card. Confirm the correct subdomain opens in a new tab.
6. Sign out and confirm the admin dashboard can no longer be opened. Sign in with a non-platform cattery/client account and confirm access is denied.

### Staff dashboard and mobile booking

1. Open the installed Deloraine PWA. Confirm it launches the staff dashboard and **View Website** remains the first menu item.
2. Open a booking from **Arrivals Today**, **Currently Occupied**, or **Calendar**. Confirm the exact booking opens in the full-screen details panel and closing it returns to the booking list.
3. Open **Customers** and search by owner name, cat name, email, and phone. Confirm unrelated customers disappear and email/phone actions are usable.
4. Start **New Booking**. Confirm no customer suggestions appear until text is entered, select dates in one calendar, choose valid visit times, select cats, choose shared or separate rooms, and review the inclusive-day total.
5. Confirm unfinished tools display a clear **Soon** badge and do not imply live data is available.
6. In Room Planner, confirm every rate is labelled per cat, per day.

### Public website and booking

1. Open `delorainecattery.catstays.app` on phone and desktop. Confirm **Book Now** is used consistently and the page has no sideways scrolling.
2. Book three cats from 10–12 September 2026. Confirm the estimate shows three inclusive days and updates to `$207.00` including 15% GST at the current `$20` rate.
3. Change the cat count and dates; confirm every amount updates immediately and the copy continues to say days, not nights.
4. Move between all four booking step buttons and confirm entered values persist. Do not press final submit unless a deliberate live test booking is wanted.

### PWA and client portal

1. Remove the old CatStays installation, revisit the Deloraine subdomain, and install again so the updated manifest/icon cache is used.
2. Confirm the home-screen icon, installation icon, browser favicon, launch artwork, and notification icon use the same navy/terracotta/white CatStays artwork.
3. Long-press the installed app and confirm **Dashboard**, **View website**, and **CatStays** shortcuts appear where the phone launcher supports PWA shortcuts.
4. With a staff account last signed in, open the app and confirm it defaults to the staff dashboard.
5. In a separate customer test account linked to an existing booking, open `/client-portal`; confirm only that customer's bookings appear and **Enable phone alerts** requests native notification permission.

The customer-authenticated branch could not be exercised against production during the read-only audit because no separate client test credential was supplied. Its RLS and role-routing code was reviewed, but the release still requires the customer-account UAT in step 5.

This release is not complete from a build or branch commit alone. Completion requires reviewed GitHub `main`, the reviewed Supabase migration, the exact merged SHA running in Replit, a republish, and signed-in production UAT.
