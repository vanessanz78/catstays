# CatStays checkpoint: phone-first booking operations

Date: 2026-09-01

Working ref: `refine/dashboard-priority-today-overview-20260901`

Base `main`: `6a0f3bba7b2040770a03dc55f6f9283d7d856fe6`

Draft pull request: `#49`

## Founder Workflow Captured

The supplied Revelation Pets walkthrough established the daily operating path:

1. See the pending-booking count on the top bell, open a request directly for approval, then scan today’s arrivals, departures, occupancy, and near-term availability.
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
- Dedicated modern Reports area with 15 operational, financial, customer, and care report choices.
- Live arrival, departure, booking, occupancy, appointment, deposit, outstanding-payment, sales, payment, feeding/medical, waiting-list, and tips views built from tenant-owned records.
- Click-again ascending/descending column sorting, live report search, date-range filtering, report-specific status filtering, phone cards, and desktop tables.
- Print, browser Save as PDF, and Excel-compatible export for the complete visible filtered report.
- Honest empty states for training, birthdays, and vaccine-expiry reports until structured source fields are added; no report fabricates records.
- A true top-of-screen booking alert bell that queries live pending bookings, shows the customer, cats, and stay dates, and opens the exact booking directly for approval.
- Pending alerts update by live database subscription with a 30-second recovery poll; duplicate push/in-app booking-request alerts are not double-counted.
- New server-generated booking notifications now carry the exact booking link, while older notifications recover that link from their saved booking metadata.
- Settings remain in the existing left navigation and the header stays focused on the booking bell and primary work; help and power controls were not added.

Appointments, Xero, and unrelated payment methods are not placed in the default daily path.

## Verification Completed

- `pnpm run test:staff-booking-operations`: 41 passed, 0 failed.
- `pnpm run test:physical-room-inventory`: 13 passed, 0 failed.
- Complete workspace TypeScript check: passed.
- Complete workspace production build: passed.
- `git diff --check`: passed.
- Existing Vite source-map and large-chunk warnings remain non-blocking.
- Local Reports shell browser review passed at 390px and 1440px: the document width equalled the viewport at both sizes, all 15 reports appeared, the deposit status menu exposed the five required filters, and no console errors were emitted.
- Local booking-alert browser review passed at 390px: the bell and panel were keyboard-labelled, the document width equalled the 390px viewport, and the panel stayed within the viewport at 366px wide.
- Signed-in live-data browser review remains pending; the protected customer workspace was not bypassed or populated with fake authentication.

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

### Booking Alerts

- Create a public booking request and confirm the bell badge increases without a page refresh.
- Open the bell and confirm the pending card shows the right customer, cats, arrival, and departure dates.
- Tap Review and confirm the exact booking opens with the sticky Confirm Booking action visible.
- Confirm the booking and verify it disappears from pending alerts and the badge count updates.
- Repeat on a phone while moving between Today, Bookings, Customers, and Reports; confirm the bell stays available and no help or power controls clutter the header.

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

### Reports

- Open Reports from the staff navigation and check the 15 report choices on phone and laptop.
- Open Deposit payments and verify Outstanding, Paid, Refunded, Booking cancelled, and Booking not cancelled filters against live records.
- Set a date range, combine it with a status and search term, and confirm the visible rows update together.
- Click the same column heading twice and confirm ascending then descending order; repeat with a date, money, and text column.
- Print one report, use Save PDF through the browser print window, and open the Excel export to confirm it contains the complete visible filtered report.
- Confirm phone reports use cards without document-level horizontal scrolling and laptop reports use the sortable table.

## Rollback Boundary

The database migrations only add nullable/defaulted booking-operation fields, new ledger/event/segment/merge-audit tables, policies, and staff-only functions. Application rollback is the reviewed merge revert plus republishing the resulting known-good `main` SHA. Do not drop operational ledger/history/merge-audit tables after live use; leave them intact and disable the new UI if a code rollback is required.
