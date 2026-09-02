# CatStays checkpoint: parallel operation and one-way Revelation sync

Date: 2026-09-02
Working ref: `migration/revelation-full-history-20260902`
Base checkpoint: `64121acd4a6ac3fa427412480a79876564d50c09`

## New founder request

Keep Revelation Pets and Deloraine CatStays usable together until cutover, retain all historical/current records, and keep changes from Revelation flowing into CatStays. The founder suggested an API bridge or a daily 00:01 sweep. This does not authorize two-way writes or the deletion of new native CatStays work.

## Verified now

Read-only signed-in Supabase queries confirm that Deloraine still has four customers, three cats, and four bookings. No permanent legacy import tables are installed. The detailed source archive described in the full-history handoff is NOT yet a completed database import.

The existing synthetic public website request is present as a pending booking. Its saved staff notification has type `booking_request` and points to the same booking. Creation occurred on 2026-09-02 at approximately 03:29 UTC.

Gmail confirms actual receipt of the corresponding cattery booking-request email, first delivered to the cattery mailbox and forwarded into the founder inbox at approximately 03:29 UTC. This is receipt evidence, not merely an outbound provider response. It does not prove receipt of a customer confirmation email.

There are zero push subscriptions, including zero active subscriptions, for all current Deloraine notification recipients (owner and active staff). Physical-phone push delivery is not verified and must not be reported as passed. The reviewed implementation uses Web Push for the installed web app; it is not evidence of a separate native APNs/FCM delivery path.

No new customer booking, outbound message, database mutation, import, deletion, deployment, or scheduled sync was performed during these checks.

## External API boundary

The official Revelation API guide was checked live:
https://support.revelationpets.com/hc/en-us/articles/360056544532-Application-Programming-Interface-API-Guide

All documented endpoints are read-only. Booking and payment lists are capped at 1,000 records. Customer date filters refer to last update, while booking filters describe stay dates. No documented webhook or write-back endpoint was established.

Therefore CatStays can pull data from Revelation, but CatStays-created bookings cannot automatically reserve rooms in Revelation through this API. Do not promise that accepting real bookings in both products is safe.

## Proposed design, not yet active

1. Keep Revelation as the source of truth for imported records during the parallel run, subject to founder confirmation. Retain native CatStays records separately.
2. Use a cloud-side one-way API pull for current and future stays. A proposed starting interval is 15 minutes, subject to measured volume and provider limits; this is not real-time.
3. Start a more comprehensive reconciliation at 00:01 Pacific/Auckland, including daylight-saving changes, using a persistent job/run ledger. Do not schedule by a fixed UTC offset. Expose last successful sync, incomplete runs, errors, conflicts and record freshness to staff.
4. Preserve original source snapshots, stable external IDs and source revisions. Upsert only source-owned records. Compare last imported baseline, new source and locally edited values; hold conflicts for review instead of silently overwriting CatStays changes.
5. Keep imports notification-silent. Historical records and repeated syncs must not send customer messages or duplicate staff new-booking alerts.
6. Handle payments, refunds, cancelled/deleted source entries and opening credit refreshes with auditable reconciliation. Absence from one incomplete or bounded API response is not proof of deletion. Do not duplicate shared invoice payment evidence.
7. Use bounded batches, truncation checks, locks, idempotent retries and success-only watermarks. Old amendments require periodic full reconciliation; a recent-stay window is insufficient.
8. Store keys only server-side. Scope every job and write to the intended tenant. Do not put source payloads, access keys or customer information in GitHub or public logs.
9. Run this independently of Vanessa's laptop. Supabase Cron/Edge Functions are an available candidate, with resumable batches rather than one long historical-import function. Scheduling documentation was reviewed; no job has been created.
10. Maintain a field/attachment coverage checklist. The current archive does not prove all correspondence, photos, agreements, attachments or stored payment credentials are transferable.

## Approval boundary and next actions

The user was asked whether Revelation should remain the main live booking system and CatStays website submissions should be test-only until cutover. Await that operational decision before enabling automatic synchronization or changing public booking behaviour.

The earlier action-time upload/replacement gate remains outstanding. The new parallel-run goal favours a non-destructive import that preserves native CatStays records; do not reuse a blanket test-data deletion plan without a fresh scope check.

Next implement the outstanding canonical relationship mappings and changed-record safeguards from the full-history handoff, rehearse them against the backup, present the exact non-destructive import scope, then import/reconcile. Only activate the bridge after a successful initial import and repeat/change/cancellation/conflict/timezone tests.

For physical-phone UAT, the founder must enable notifications in the installed CatStays app, then a fresh synthetic public booking must show the saved booking and bell alert, actual cattery email receipt, phone notification with the app backgrounded, and a working notification tap target. Device receipt needs the founder or a supported physical-device observation.

Replit Shell only; never use Replit Agent. No code from the migration branch is live.
