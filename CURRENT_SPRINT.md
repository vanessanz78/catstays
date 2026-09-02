# Current Sprint

Last updated: 2026-09-02

## Goal

Deliver the founder-described, phone-first cattery operations workflow and complete its customer loop: customers can manage their safe contact and cat-care details, see bookings and private cat updates, and hold a tracked two-way amendment conversation with the cattery.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Working ref: `codex/customer-portal-collaboration`
- Base `main`: `a121201f32a31e84a7a042f4f3e996d6cee1d23a`
- Review and deployment environment: CatStays Replit
- Operating-system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Current State

- The physical-room inventory work from PR #48 remains the base for exact room numbers and capacity-safe booking.
- Today supports previous/next day, date selection, arrivals, departures, current occupancy, pending bookings, a waiting list when used, and a seven-day physical-room occupancy view.
- New Booking searches customers and cats together, opens the inclusive range picker immediately, applies configured 9:30 arrival and 4:30 collection defaults, shows only available physical rooms, and supports shared or separate room assignments.
- Adding another cat selects another cat from the same customer and keeps the stay dates, times, and shared-room choice; the review uses saved multi-cat occupancy rates and configured GST.
- Booking detail supports customer-visible or internal notes, booking-change history, calendar navigation, default confirmation email/payment wording, fixed or percentage charges/discounts, manual payments, mark-total-paid, and customer credit.
- Manual payment methods are intentionally limited to bank transfer, cash, Stripe, and customer credit; appointments remain off unless enabled in Booking Setup.
- The room calendar keeps horizontal phone scrolling and sticky room labels, retains desktop drag-and-drop, adds a phone-safe move flow, and supports continuous split stays across two or three rooms.
- Customers is now a modern responsive report with live search by customer name, ID, email, phone, or cat; joined and last-booking dates; unpaid booking money; customer-credit balance; add customer; and a direct import/export route.
- Customer merging is a guided choose → compare → confirm → complete workflow. It defaults every profile field to Customer 1, allows field-by-field choices from Customer 2, combines all tenant-owned related records, preserves the earliest join date, and writes a private audit snapshot before removing the second profile.
- The 2 September mobile UAT repairs make move/split and report date inputs reliable, refresh adjustment totals immediately, add phone report sorting, and add an audited history-free customer cleanup path that refuses any real operational or financial history.
- The customer portal release candidate replaces the read-only portal shell with live booking, cat, profile, photo-update, and conversation workspaces. Customer writes use narrowly scoped authenticated database functions, while customer amendment messages are saved in the shared staff conversation, create a staff alert, and send a cattery email alert.
- The database migration for operational events, adjustments, credit ledger, payment metadata, customer-visible notes, and split-room segments is committed but must not be applied outside the reviewed release workflow.
- The customer-directory migration for merge history and the atomic merge function is also committed but must not be applied outside the reviewed release workflow.
- The frozen Open Home architecture is unchanged.

## Verification Required Before Completion

1. Keep the 47-test staff booking operations suite green.
2. Pass the complete workspace type check and production build.
3. Review the customer-portal Supabase migration before applying it to the CatStays project.
4. Verify Today, New Booking, booking detail, payments, calendar, customer report, live search, and all customer-merge steps at phone and laptop widths, including `scrollWidth <= viewport width` for the page and intentional horizontal scrolling only inside the room timeline.
5. Review and merge the draft pull request into GitHub `main`.
6. Record the exact merged `main` SHA, apply the reviewed migration, pull that exact SHA into CatStays Replit, restart, republish, and confirm runtime health.
7. Complete signed-in founder UAT on the published Deloraine tenant, including customer profile/cat edits, a customer amendment request, staff reply, a private cat update, customer email receipt, and portal visibility before calling the release complete.

## Risks And Guardrails

- Existing booking totals are treated as GST-inclusive stored totals; adjustments are entered before GST and recompute the tax component.
- Split-stay replacement is server-validated for staff access, physical room existence, capacity, continuous day coverage, and overlapping bookings.
- Both migrations and the application code are release-coupled: deploy the schemas in timestamp order before starting the new application SHA.
- Customer merging is deliberately database-atomic and audited; do not replace it with a sequence of client-side updates.
- Do not apply either migration, merge, publish, send a real customer email, or merge real customer accounts during code review.
- Runtime UAT, not a successful build or merge, is the release truth.
- Do not use the owner/staff login to simulate a customer. Create a separate test customer identity linked by the exact booking email, and remove only the synthetic records after explicit cleanup approval.

## Handoff

Read the standard project sequence from root `START_HERE.md`, then read this file, `DECISION_LOG.md`, and `docs/codex-handoffs/2026-09-01-phone-first-booking-operations.md` before continuing this sprint.
