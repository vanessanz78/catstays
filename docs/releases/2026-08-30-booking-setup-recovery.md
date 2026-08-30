# Booking Setup recovery checkpoint — 30 August 2026

## Issue

`/staff-dashboard/booking-setup` was still routed to the generic staff placeholder and the menu labelled it `Soon`, even though a separate onboarding-era form existed. That older form was unsafe for production use because it:

- merged a browser-wide `localStorage.bookingRules` value into every cattery;
- displayed fabricated Standard/Family Suite inventory rather than the cattery's real rooms;
- carried stale 2024–2025 blackout examples and generic discount examples;
- saved the whole demo-shaped object into `catteries.website_settings`;
- used nested scrolling and alert dialogs that produced a poor mobile experience;
- did not connect the public booking visit times to saved opening hours; and
- did not persist public check-in/check-out times into the booking record.

## Evidence and tenant boundary

- The staff booking workflow already consumes opening hours from the signed-in cattery's `website_settings` through `bookingSchedule.ts`.
- Payment requests already consume `depositType` and `depositAmount` from that same cattery record through `catteryPaymentRules.ts`.
- Real room name, capacity, active status, and daily price live in the tenant-scoped `rooms` table.
- The existing tenant-scoped `availability_rules` table and RLS policy are used for blackout records.
- Public blackout dates are also copied into the same cattery's public booking settings so the public form can disable affected stays without exposing the private availability table.
- No shared browser storage is read or written by the recovered Booking Setup or staff booking workflow.

## Implemented workflow

1. Route Booking Setup directly in both the main and subdomain routers and remove the `Soon` badge.
2. Load and save morning/afternoon days, appointment windows, and 15/30/45/60-minute spacing for the current cattery only.
3. Show a customer-readable hours summary using the same scheduling helper as staff bookings.
4. Configure fixed or percentage deposits used by the existing Stripe payment-request workflow; a zero amount means no upfront deposit.
5. Keep pricing explicitly per calendar day, including arrival and departure, while linking room price editing to Room Planner.
6. Display actual room inventory rather than a second fake room list.
7. Create, update, and remove real tenant-scoped blackout records with validation.
8. Make the public booking form offer the configured arrival/departure slots, prevent progress through blackout dates, and store selected visit times in the booking record.
9. Preserve all unrelated `website_settings` keys when saving.

## Branch verification

- 10 focused scheduling and Booking Setup tests pass, including the Deloraine 15-minute schedule, deposit validation, and inclusive blackout overlap.
- CatStays TypeScript check passes.
- API TypeScript check passes.
- CatStays production build passes (existing sourcemap and bundle-size warnings only).
- API production build passes.
- Local browser UAT confirms the recovered page renders its real controls, contains no Booking Setup `Soon` badge, and public time selection enables Continue only after both visit times are selected.
- Responsive proof at a 390 px viewport: `innerWidth`, root/client width, root scroll width, and body scroll width are all exactly 390 px on Booking Setup and the public booking form.

## Release and UAT workflow

- Feature branch: `feat/booking-setup-recovery-20260830`
- Baseline main: `27ecb0af1b818bd04a78252f66ad024a772bf0a8`
- Review, merge SHA, exact Replit sync, republish evidence, and live Deloraine read-only UAT are recorded in the pull request and release handoff.
- Live UAT must not save changed hours, add blackout dates, submit a booking, or create a payment request unless the test explicitly requires a real record.

## Customer UAT

1. Open **Dashboard → Booking Setup** and confirm it opens directly without `Coming soon`.
2. Confirm the displayed rooms and daily prices match **Room Planner**.
3. Confirm Deloraine shows mornings Monday–Saturday, 9:00–10:30 am; afternoons Monday–Sunday, 4:30–6:00 pm; and 15-minute spacing.
4. Change one harmless value, save, refresh, and confirm it persists for Deloraine only; then restore the original value and save again.
5. Add a future test blackout period, save, and confirm the public booking form blocks a stay overlapping it; then remove the test blackout and save.
6. Open the public booking form and confirm check-in/check-out times follow the saved weekday schedule.
7. Confirm the duration and price use calendar days including arrival and departure.
8. At phone width, confirm cards, day buttons, time fields, rooms, and blackout rows fit without sideways scrolling.
9. Set a deposit rule and confirm a staff payment request uses that configured fixed amount or percentage; do not complete a real Stripe charge during UAT.

## Live schema follow-up

The first live Deloraine read-only UAT discovered that production still had the older `availability_rules` shape (`starts_on`, `ends_on`, and `is_active`) while the repository's foundational migration and recovered page used `starts_at`, `ends_at`, and `status`. No Deloraine data had been changed. A follow-up compatibility migration adds the current columns without dropping the legacy fields, backfills any existing values, constrains status, and adds an active-range index. This makes the migration safe for both older production databases and fresh databases where the current columns already exist.
