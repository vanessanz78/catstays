# Deloraine live booking and changes-only sync — 5 September 2026

Working ref: `fix/deloraine-live-changes-only-sync-20260905`.

## Founder acceptance criteria

- Accept real booking requests from the Deloraine public website.
- Keep staff-created phone bookings available in New Booking.
- Keep Petcover intake available for public and staff-created bookings.
- Run Revelation synchronization nightly and whenever authorized staff press the sync button.
- Apply only new or changed source records. Do not resume, repair, or otherwise revisit an unchanged historical or previously warned record.

## Implementation boundary

- After the safe application SHA is published, the separate reviewed operation changes `bookingMode` to `live` only for the cattery with slug `delorainecattery`. It must not run while the previous public-booking API is still serving production.
- Both sync entry points create or claim only jobs whose checkpoint scope is `changes_only`.
- The documented Revelation customer endpoint is filtered by last-updated date, with a one-day overlap to avoid a day-boundary miss.
- Booking discovery starts on the current Pacific/Auckland day and looks forward. Full booking details are still read because the provider list does not expose every mutable field; a persisted observed checksum prevents any unchanged response from being imported, archived as a detail, or sent through reconciliation again.
- Earlier historical and `operational` jobs remain preserved with `paused` status.
- Public booking requests never treat knowledge of an email address as proof of customer identity and never overwrite an existing cat profile. Only an exact signed-in customer link can be reused; other public requests create a separate reviewable customer record.

## Verification and release

- Run `pnpm test:live-booking-sync`, the full workspace typecheck/build, database rollback rehearsal, and Supabase advisors.
- Merge reviewed work to GitHub `main`, verify its exact SHA, and deploy the coupled changes-only migration and Revelation Edge Function from that SHA. Keep `bookingMode=test_only` during this schema-first step.
- In Replit Shell, update to that exact `main` SHA and restart the canonical development process. Do not use Replit Agent.
- Development UAT: public booking, staff New Booking, optional Petcover intake, manual sync summary, and confirmation that no prior queue resumed.
- Publish the safe application SHA, run `supabase/operations/enable_deloraine_live_bookings.sql`, then repeat the public and authenticated production UAT. The first completed post-release nightly `changes_only` job remains a separate proof gate.
