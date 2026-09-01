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
- Modern Customers report for desktop and phone with customer/contact/cats/joined/last booking/outstanding/account-credit fields and live search by customer, ID, contact detail, or cat.
- Existing Add Customer plus a direct Import / export route to Smart Import.
- Guided customer merging with live dual-customer search, Customer 1 defaults, field-by-field side-by-side choices, portal-login selection, final confirmation, and an all-done state.
- Atomic customer merging for cats, bookings, payments, customer credit, payment requests, messages, documents, and cat updates, with earliest join date and immutable audit snapshots retained.

Appointments, Xero, print controls, and unrelated payment methods are not placed in the default daily path.

## Verification Completed

- `pnpm run test:staff-booking-operations`: 35 passed, 0 failed.
- `pnpm run test:physical-room-inventory`: 13 passed, 0 failed.
- Complete workspace TypeScript check: passed.
- Complete workspace production build: passed.
- `git diff --check`: passed.
- Existing Vite source-map and large-chunk warnings remain non-blocking.
- Signed-in browser review remains pending: localhost reaches the real CatStays confirmation/sign-in gate, so the protected customer workspace was not bypassed or populated with fake authentication.

## Release-Coupled Migration

Migrations, in required order:

1. `supabase/migrations/20260901093000_staff_booking_operations.sql`
2. `supabase/migrations/20260901094500_customer_directory_merge.sql`

The new application queries expect the new tables and relations. After review, apply both migrations in order before starting the new application SHA. Do not apply them during branch review and do not publish application code without its schema.

## Remaining Release Workflow

1. Review draft PR #49, including the migration and founder workflow.
2. Complete phone and laptop review of the booking workflow and customer directory/merge flow with `document.documentElement.scrollWidth <= window.innerWidth`; the room timeline itself must remain horizontally scrollable.
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

### Customers

- Confirm the phone cards and laptop report show customer, email, phone, cats, joined date, last booking, outstanding booking money, and customer-credit balance.
- Search while typing by full/partial customer name, UUID/customer ID, email, phone, and cat name.
- Open Add customer and the Import / export route.
- Select two customers for merging, confirm Customer 1 is the default for every profile field, then keep at least one different Customer 2 field.
- Review the final summary, confirm the merge, and verify cats, bookings, payments, credit, messages, documents, and updates remain attached to the combined customer.
- Confirm the second profile is gone, the earliest joined date remains, the selected portal login remains linked, and the merge event is present in the private audit table.

## Rollback Boundary

The database migrations only add nullable/defaulted booking-operation fields, new ledger/event/segment/merge-audit tables, policies, and staff-only functions. Application rollback is the reviewed merge revert plus republishing the resulting known-good `main` SHA. Do not drop operational ledger/history/merge-audit tables after live use; leave them intact and disable the new UI if a code rollback is required.
