# Current Sprint

Last updated: 2026-09-03

## Focused Follow-up: Confirmation Payment Links

### Manual Revelation sync follow-up

- 3 September UX correction: icon starts sync directly, with one app-level toast instead of a modal. Only completed jobs return audit-derived added/updated totals; metadata-only writes and repeated updates to one record do not inflate counts. Today refreshes on completion. Failed/pending work is never labelled completed.
- Owner requested dismissal of historical review notices visible at 17:29:56 NZ time. Mark only those tenant-scoped existing notices ignored with a retained reason/history, not repaired. No booking or payment values are changed by dismissal. New warnings remain auditable in data tools, not in the icon toast.
- Full-history worker latency remains a separate unresolved issue; this UI/summary change does not make manual sync instantaneous.

- Requested: header sync action beside the public-website icon. Preserve Revelation as primary and all CatStays-only test bookings; no outgoing customer messages.
- Current production status observed 3 September: completed API job at 04:48 NZ time, 8,957 booking details checked; 5,201 open reconciliation notices. Completion is not full reconciliation or every-field coverage.
- Add authorized server request plus an audited manual job; preserve daily job history, serialize with the nightly worker, reuse an active job, and rate-limit fresh requests. Existing worker/import conflict rules stay unchanged.
- Migration generated through CLI, then ordered after pre-existing future-dated durable-sync migrations. Rehearse with rollback-only database tests before applying, and verify scheduler continuation before signing off the button.
- Live payment testing remains paused by Vanessa. Booking creation/availability changes are not part of this follow-up.

- Deposit/full-balance booking confirmations now reuse the cattery Stripe checkout handler; confirmation-only emails remain unchanged.
- Server-side booking ownership, saved recipient, completed payment ledger, tax-inclusive adjustments, and deposit settings determine the request. Client-supplied amounts cannot set the charge.
- Failed balance reads or email sends must not report success. Failed email sends expire their checkout sessions. Existing payment status is preserved when requesting money.
- Automated coverage includes deposit/full links, paid/part-paid balances, tax/adjustments/refunds, unauthorized/cancelled/disconnected requests, ledger failures, missing checkout URLs, and email failures. Tests mock all external services: no real charge or customer email.
- No schema or Stripe credential changes. Release and authenticated UI verification are separate gates; actual customer receipt and a completed Stripe payment remain unverified until explicitly exercised.
- Availability-first creation and split-room workflow review are deferred to the next task per Vanessa.

## Goal

Deliver the founder-described, phone-first cattery operations workflow and complete its customer loop: customers can manage their safe contact and cat-care details, see bookings and private cat updates, and hold a tracked two-way amendment conversation with the cattery.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Working ref: `main`
- Feature merge on `main`: `510c83f9fc3063a6f81964b93766619cb95244de`
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
- A fresh founder walkthrough of the two core Revelation Pets workflows confirmed that CatStays should keep Today as the operating cockpit rather than rebuild the legacy product screen for screen. Today now adds live customer/cat lookup, direct start-booking shortcuts, one-tap check-in/check-out, the five most recently received bookings, explicit arrival/collection times on operational cards, and a seven-day In / Out / Day end summary.
- The universal Today lookup routes a selected match to the filtered customer directory or opens New Booking with that customer already selected, preserving the existing availability-first CatStays booking flow and modern visual language.
- The daily-workflow refinement is merged through PR #55 at `510c83f9fc3063a6f81964b93766619cb95244de`; production publication remains gated by the customer-portal migration and combined live UAT.
- The database migration for operational events, adjustments, credit ledger, payment metadata, customer-visible notes, and split-room segments is committed but must not be applied outside the reviewed release workflow.
- The customer-directory migration for merge history and the atomic merge function is also committed but must not be applied outside the reviewed release workflow.
- The unapplied customer-portal migration now revokes PostgreSQL's default `PUBLIC`/anonymous function execution before granting the two deliberately identity-scoped customer RPCs to `authenticated`, and uses an empty function search path to reduce object-resolution risk.
- The frozen Open Home architecture is unchanged.

## Verification Required Before Completion

1. Keep the 49-test staff booking operations suite green.
2. Pass the complete workspace type check and production build.
3. Review the customer-portal Supabase migration before applying it to the CatStays project.
4. Verify Today, New Booking, booking detail, payments, calendar, customer report, live search, and all customer-merge steps at phone and laptop widths, including `scrollWidth <= viewport width` for the page and intentional horizontal scrolling only inside the room timeline.
5. Review the exact merged `main` SHA, apply the reviewed migration, pull that exact SHA into CatStays Replit, restart, republish, and confirm runtime health.
6. Complete signed-in founder UAT on the published Deloraine tenant, including the refined Today workflow, customer profile/cat edits, a customer amendment request, staff reply, a private cat update, customer email receipt, and portal visibility before calling the release complete.

## Risks And Guardrails

- Existing booking totals are treated as GST-inclusive stored totals; adjustments are entered before GST and recompute the tax component.
- Split-stay replacement is server-validated for staff access, physical room existence, capacity, continuous day coverage, and overlapping bookings.
- Both migrations and the application code are release-coupled: deploy the schemas in timestamp order before starting the new application SHA.
- Customer portal RPCs are intentionally `SECURITY DEFINER` because they write only the calling user's linked customer/cat records; they must retain explicit `auth.uid()` ownership checks, bounded inputs, an empty search path, and no `PUBLIC` or anonymous execute grant.
- Customer merging is deliberately database-atomic and audited; do not replace it with a sequence of client-side updates.
- Do not apply either migration, merge, publish, send a real customer email, or merge real customer accounts during code review.
- Runtime UAT, not a successful build or merge, is the release truth.
- Do not use the owner/staff login to simulate a customer. Create a separate test customer identity linked by the exact booking email, and remove only the synthetic records after explicit cleanup approval.

## Handoff

Read the standard project sequence from root `START_HERE.md`, then read this file, `DECISION_LOG.md`, and `docs/codex-handoffs/2026-09-02-revelation-workflow-refinement.md` before continuing this sprint.
