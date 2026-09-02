# CatStays checkpoint: Revelation workflow refinement

Date: 2026-09-02

Working ref: `refine/revelation-workflow-gaps-20260902`

Base `main`: `01c828f2e692a2e6b898a3f8f73d652fbae52597`

## Evidence Reviewed

- Vanessa's narrated booking workflow recording.
- Vanessa's narrated daily-operations workflow recording.
- Read-only signed-in review of Revelation Pets Today and booking operations.
- CatStays live Deloraine staff dashboard, booking detail, and New Booking flow at phone width.

The reference product was used for behavioural research only. No Revelation Pets source code, visual assets, branding, or distinctive copy was used.

## Workflow Finding

CatStays already had the hard booking and financial mechanics: customer/cat search, inclusive dates, saved times, physical-room availability, multi-cat shared/separate assignment, pricing, payments, notes, confirmation, cancellation, credit, reports, alerts, and phone booking review. The remaining daily-speed gap was the first screen.

## Implemented

- Added a Today search that matches customer name, customer ID, email, phone, or cat name while typing.
- Added separate match actions to open the filtered customer directory or start New Booking with the customer already selected.
- Added one-tap check-in and check-out on arrival and departure cards, using the existing booking status update path and visible error feedback.
- Added arrival and collection times to every Today booking card.
- Added Latest bookings, limited to the five most recently received non-cancelled records.
- Added a seven-day In / Out / Day end movement table below physical-room occupancy.
- Corrected current occupancy so already checked-out stays do not remain counted as in-house.
- Added focused automated coverage for current occupancy, latest bookings, daily movement counts, and completed check-in/check-out labels.

## Verification Completed

- `pnpm run test:staff-booking-operations`: 49 passed, 0 failed.
- `pnpm run test:physical-room-inventory`: 13 passed, 0 failed.
- Complete workspace TypeScript check: passed.
- Complete workspace production build: passed.
- `git diff --check`: passed before documentation closeout.
- Existing Vite source-map and large-chunk warnings remain non-blocking.

## Release Boundary

This refinement adds no schema. However, its base `main` already includes the unreleased customer-portal collaboration code and `supabase/migrations/20260902162000_customer_portal_collaboration.sql`. Do not publish the combined application SHA until that migration has been reviewed and applied to the CatStays Supabase project in the approved release sequence.

Use Replit Shell only. Never use Replit Agent.

## Remaining Release Workflow

1. Complete authenticated local or development Runtime phone UAT for Today search, direct booking start, one-tap arrival/departure, Latest bookings, and the movement summary.
2. Review and merge the refinement pull request into GitHub `main` and record the exact SHA.
3. Review and apply the release-coupled customer-portal migration.
4. Pull the exact merged SHA in CatStays Replit using Shell only, restart the configured Runtime, verify health, and publish.
5. Complete live signed-in phone UAT without confirming, checking in, checking out, emailing, or otherwise changing any real booking unless it is an explicitly identified synthetic record.

## Rollback Boundary

Before production publish, rollback is branch deletion or PR closure. After publish, revert the refinement merge and republish the resulting known-good `main` SHA; do not remove customer-portal data created after its migration is live.
