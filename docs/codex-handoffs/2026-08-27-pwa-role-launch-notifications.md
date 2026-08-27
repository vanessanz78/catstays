# CatStays PWA role launch, client access, and notifications

Date: 2026-08-27

## Issue

The installed CatStays PWA opened the public website for every user, provided no app shortcuts, and supplied transparent artwork as a maskable icon. Phone-generated install and splash treatments could therefore make the logo difficult to see. The live client portal was an informational demo rather than a customer sign-in, phone subscriptions were limited to cattery owners, and the staff dashboard bell displayed hard-coded sample notifications.

## Evidence before the change

- `manifest.webmanifest` used `start_url: "/"`, had no stable `id`, and had no `shortcuts`.
- The same transparent PNGs declared `purpose: "any maskable"` instead of supplying an opaque maskable asset.
- The service worker defaulted notification clicks to `/admin`.
- `AuthContext` resolved only `catteries.owner_id`; it did not resolve active staff memberships or linked customer records.
- `/client-portal` linked to a demo portal and did not authenticate customers.
- `NotificationBell` contained hard-coded example people, payments, and messages.
- `catstays_push_subscriptions` accepted only the cattery owner.

## Implemented workflow

1. Add a stable PWA identity, `/app` launch route, and long-press shortcuts for Dashboard, View website, and CatStays.
2. Separate transparent `any` icons from new opaque, safe-zone `maskable` icons; add an opaque Apple touch icon for iOS installation.
3. Resolve the signed-in account from durable records in this order: owner, active staff membership, linked customer.
4. Route owner/staff sessions to `/staff-dashboard`; route customer or signed-out sessions to `/client-portal`.
5. Replace the client demo entry with sign-in, customer access creation using the booking email, private linked bookings, sign-out, new booking, and phone-alert enablement.
6. Replace sample dashboard notifications with a live per-user inbox and read state.
7. Permit owner, active staff, and linked customers to register a phone subscription for their cattery.
8. Create in-app and native notification events for current real interactions: website enquiry, booking request, customer booking acknowledgement, and booking confirmation.
9. Create/update a customer record when a public booking is saved, link the booking to it, and backfill existing guest bookings without exposing customer data to anonymous users.

## Supabase checkpoint

Confirmed project: `iwyoezwqorddkmqnjbif` (CatStays).

Applied migrations:

- `20260827033847_pwa_role_launch_customer_notifications`
- `20260827033932_secure_booking_api_access`
- `20260827034007_remove_anon_booking_table_grants`
- `20260827034026_backfill_booking_customers`

Security rules use `auth.uid()` against owner, active staff, or linked customer rows. Anonymous `SELECT` and `INSERT` table grants were removed from `bookings`; validated public booking creation now runs through the CatStays API. The migration also prevents customer Auth signups from provisioning a cattery.

## Branch verification

- CatStays TypeScript check: passed.
- API server TypeScript check: passed.
- API content-source tests: 7 passed.
- API production build: passed.
- CatStays production build: passed (existing source-map and large-chunk warnings only).
- Manifest validation: stable ID, `/app` launch, three required shortcuts, and all icon files present.
- Service worker syntax check: passed.
- Browser smoke test: signed-out `/app` reached the real client sign-in; `/staff-dashboard/settings/notifications` rendered the native-alert settings.
- Database verification: existing guest booking was linked to a customer; anonymous booking select/insert privileges are false; no fabricated notification rows were inserted for testing.

## Release workflow

1. Commit this checkpoint and implementation on `feature/pwa-role-launch-notifications`.
2. Push and open a reviewed GitHub pull request.
3. Merge to GitHub `main` after checks pass.
4. Pull the exact merged `main` commit into the CatStays Replit.
5. Republish the Replit deployment.
6. Complete the phone and account UAT below.

## Customer UAT

### Existing cattery owner

1. Remove the existing CatStays installed app so the old icon and manifest are not retained.
2. Open the personalised cattery website in the phone browser and install CatStays again.
3. Confirm the install icon and launch splash show the navy/orange CatStays logo clearly on a light background.
4. Open the installed app while signed in as the cattery owner; confirm it opens the staff dashboard.
5. Long-press the installed icon; confirm Dashboard, View website, and CatStays are offered.
6. Open Dashboard and View website from those shortcuts and confirm each goes to the correct personalised cattery destination.
7. In the dashboard, open Settings -> Phone notification settings, enable alerts, and send a phone test.
8. Confirm the dashboard bell opens a live inbox without sample customer/payment data.

### Cat owner/client

1. Make a booking with an email address controlled by the tester.
2. Open Client portal, choose Create client access, and use the exact booking email.
3. Confirm the email, sign in, and confirm only that client's linked booking is visible.
4. Enable phone alerts from the client portal.
5. Close CatStays, reopen the installed app, and confirm it returns to the client portal for that customer session.
6. Confirm the booking acknowledgement appears in the client inbox/phone when the client already has a linked account and phone subscription.

### Bidirectional event checks

1. Submit a public website enquiry and confirm the owner/staff inbox receives it; confirm the native phone alert appears when enabled.
2. Submit a booking and confirm owner/staff receive a dashboard/native alert.
3. Confirm the booking from an authenticated staff workflow and confirm the linked customer receives the confirmation notification when their account and phone subscription are active.

## Honest boundary

Notifications are wired to CatStays interactions that exist as real server actions in this release. Placeholder payment, photo-update, and message screens do not emit fake notifications. When those actions become live, they must call the shared notification helper so both the in-app inbox and native push are created together.
