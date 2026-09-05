# Public Booking And Waitlist Handoff

Date: 2026-09-05

Working ref: `feat/booking-flow-details-cats-waitlist-20260905`

Base: GitHub `main` at `3e2daf90a1d03f544a3cb8838221d5b24cb71571`

## Scope

- Details-first public booking flow with collapsible cat cards and cat-derived count.
- Petcover copy and validation corrections, optional microchip, required date of birth, and Accept all declarations.
- Server-authoritative whole-room, continuous split-room, and waitlist outcomes.
- Staff slot action with a fresh availability check.
- Idempotent waitlist availability alerts after CatStays booking changes and completed manual/nightly Revelation changes-only syncs.

## Release-Coupled Database Change

Review and apply `supabase/migrations/20260905070812_booking_waitlist_availability_alerts.sql`. It adds waitlist availability/alert timestamps and a partial lookup index to `public.bookings`. It does not add a public table, broaden grants, or change existing RLS.

## Required Verification

1. Run the physical-room, staff-booking, live-sync, Petcover, and booking-email test suites.
2. Run complete workspace typecheck and production build.
3. Rehearse the additive migration in a rollback transaction, then apply it to Supabase only after merge and before the new runtime UAT. The old application ignores these additive columns.
4. Merge through GitHub and record the exact `main` SHA.
5. In Replit Shell, preserve local files, fetch, switch/reset to the exact merged SHA, install with the lockfile, and restart development. Do not use Replit Agent and do not run `git clean`.
6. Deploy the compatible Revelation Edge worker, then complete development UAT: four-step flow, cat accordion, Petcover controls, whole/split/waitlist room states, waitlist non-blocking behaviour, staff slot action, and responsive layout.
7. Publish that exact SHA.
8. Production UAT on `https://delorainecattery.catstays.app/`, including a real physical-phone push receipt with notifications enabled and owner email receipt before declaring alerts complete.

Do not create or submit a synthetic production booking, customer email, or phone push without action-time confirmation. The first subsequent nightly Revelation completion is a separate proof that its waitlist refresh hook ran.
