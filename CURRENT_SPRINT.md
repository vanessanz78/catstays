# Current Sprint

Last updated: 2026-09-01

## Goal

Deliver the founder-described, phone-first cattery operations workflow: scan today, create a multi-cat booking quickly, send the ready-made confirmation, record payments/credits/adjustments, and manage room availability—including split stays—without unnecessary controls.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Working ref: `refine/dashboard-priority-today-overview-20260901`
- Base `main`: `6a0f3bba7b2040770a03dc55f6f9283d7d856fe6`
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
- The database migration for operational events, adjustments, credit ledger, payment metadata, customer-visible notes, and split-room segments is committed but must not be applied outside the reviewed release workflow.
- The frozen Open Home architecture is unchanged.

## Verification Required Before Completion

1. Keep the 32-test staff booking operations suite green.
2. Pass the complete workspace type check and production build.
3. Review the Supabase migration before applying it to the CatStays project.
4. Verify Today, New Booking, booking detail, payments, and the calendar at phone and laptop widths, including `scrollWidth <= viewport width` for the page and intentional horizontal scrolling only inside the room timeline.
5. Review and merge the draft pull request into GitHub `main`.
6. Record the exact merged `main` SHA, apply the reviewed migration, pull that exact SHA into CatStays Replit, restart, republish, and confirm runtime health.
7. Complete signed-in founder UAT on the published Deloraine tenant before calling the release complete.

## Risks And Guardrails

- Existing booking totals are treated as GST-inclusive stored totals; adjustments are entered before GST and recompute the tax component.
- Split-stay replacement is server-validated for staff access, physical room existence, capacity, continuous day coverage, and overlapping bookings.
- The migration and application code are release-coupled: deploy the schema before starting the new application SHA.
- Do not apply the migration, merge, publish, or send a real customer email during code review.
- Runtime UAT, not a successful build or merge, is the release truth.

## Handoff

Read the standard project sequence from root `START_HERE.md`, then read this file, `DECISION_LOG.md`, and `docs/codex-handoffs/2026-09-01-phone-first-booking-operations.md` before continuing this sprint.
