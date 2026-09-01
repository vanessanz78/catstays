# CatStays checkpoint: phone-first booking operations

Date: 2026-09-01

Working ref: `refine/dashboard-priority-today-overview-20260901`

Base `main`: `6a0f3bba7b2040770a03dc55f6f9283d7d856fe6`

Draft pull request: `#49`

## Founder Workflow Captured

The supplied Revelation Pets walkthrough established the daily operating path:

1. Scan today’s arrivals, departures, occupancy, pending bookings, and near-term availability.
2. Start a booking and search by either customer or cat.
3. Pick an inclusive date range, keep the normal 9:30 arrival and 4:30 collection defaults, and choose an available physical room.
4. Add another cat from the same customer without repeating dates/times; choose shared or separate rooms and review the full cost.
5. Save, send the prepared confirmation with a default $50 deposit request, and later record bank transfer, cash, Stripe, or customer-credit payments.
6. Add internal/customer-visible notes, inspect booking changes, apply fixed/percentage charges or discounts, and move or split stays on the room calendar.

## Implemented On This Branch

- Date-controlled Today view with arrivals, departures, in-house cats, pending bookings, optional waiting list, and seven-day occupancy.
- Combined customer/cat search and immediate range picker.
- Configurable default arrival/collection times, appointments visibility, confirmation message/payment request, enabled payment methods, deposit, shared occupancy rates, and GST.
- Availability-first physical-room selection with shared and separate multi-cat assignments.
- Booking detail note editor, customer-visible confirmation note, audit history, calendar link, cost/payment ledger, adjustments, manual payments, mark-total-paid, and customer credit.
- Confirmation email content for payment request, custom message, terms, and visible booking note.
- Horizontal room timeline with sticky labels, desktop drag/drop, phone move controls, and continuous split stays across two or three rooms.
- Staff-only database records and policies for booking events, adjustments, customer credit, payment metadata, customer-visible notes, and room segments.
- Server validation for split-stay access, active rooms, room counts, capacity, full continuous coverage, and date collisions.

Appointments, Xero, print controls, and unrelated payment methods are not placed in the default daily path.

## Verification Completed

- `pnpm run test:staff-booking-operations`: 32 passed, 0 failed.
- `pnpm run test:physical-room-inventory`: 13 passed, 0 failed.
- Complete workspace TypeScript check: passed.
- Complete workspace production build: passed.
- `git diff --check`: passed.
- Existing Vite source-map and large-chunk warnings remain non-blocking.
- A phone browser check was attempted at 390px, but the in-app browser could not open localhost because its administrator-enforced security check was unavailable. No protection was bypassed.

## Release-Coupled Migration

Migration: `supabase/migrations/20260901093000_staff_booking_operations.sql`

The new application query expects the new tables and relations. After review, apply the migration before starting the new application SHA. Do not apply it during branch review and do not publish application code without its schema.

## Remaining Release Workflow

1. Review draft PR #49, including the migration and founder workflow.
2. Complete phone and laptop review with `document.documentElement.scrollWidth <= window.innerWidth`; the room timeline itself must remain horizontally scrollable.
3. Merge only after approval and record the exact merged `main` SHA.
4. Apply the reviewed migration to the CatStays Supabase project.
5. Pull the exact merged SHA into CatStays Replit without overwriting unrelated runtime state.
6. Restart the configured runtime, verify `/api/healthz`, and republish.
7. Complete signed-in founder UAT on the published Deloraine tenant.

## Founder UAT

### Today

- Move to the day before and after; open arrival, departure, and in-house cards.
- Confirm pending bookings and seven-day occupancy use live data.
- Confirm appointments are absent when disabled.

### New Booking

- Search once by customer name and once by cat name.
- Confirm the range picker opens after selecting a suggestion.
- Pick arrival/departure dates and confirm 9:30/4:30 defaults when available.
- Confirm unavailable physical rooms do not appear.
- Add a second cat and verify dates/times are preserved.
- Compare shared and separate-room pricing, saved occupancy rate, subtotal, GST, and total.
- Save and confirm the new booking opens in detail.

### Booking Detail

- Save an internal note, then a customer-visible note.
- Send the prepared confirmation and verify the correct customer, cats, dates, times, total, deposit request, terms, and visible note.
- Add and remove fixed and percentage adjustments.
- Record deposit/payment by bank transfer, cash, Stripe, and customer credit; confirm Mark total paid only activates for Payment.
- Add a post-payment discount and confirm the GST-adjusted overpayment appears as credit.
- Check Booking changes contains the actions.

### Calendar

- Scroll horizontally by touch and confirm room labels stay visible.
- Open a booking and use the phone Move stay flow.
- On laptop, drag a whole stay to an available room and confirm conflicts are blocked.
- Split a continuous stay across two rooms, then three rooms, and confirm every date appears exactly once.

## Rollback Boundary

The database migration only adds nullable/defaulted booking-operation fields, new ledger/event/segment tables, policies, and one replacement function. Application rollback is the reviewed merge revert plus republishing the resulting known-good `main` SHA. Do not drop operational ledger/history tables after live use; leave them intact and disable the new UI if a code rollback is required.
