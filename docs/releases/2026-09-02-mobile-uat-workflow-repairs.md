# Mobile UAT workflow repairs — 2 September 2026

## Scope

This release closes the five failures found while exercising the signed-in Deloraine staff workflows at phone width:

1. A phone room move changed the room but could ignore the selected arrival date.
2. A saved or removed booking adjustment did not immediately refresh the visible totals.
3. Report date fields could show a new date without updating the filtered rows.
4. Phone report cards had no usable ascending/descending sort control.
5. A customer and linked cats created by mistake could not be removed safely after UAT.

## Changes

- Date controls for moving and splitting stays now use the input event emitted by mobile date pickers. The same correction is applied to report From and To fields.
- Booking adjustments return their saved database row and update the local ledger immediately before the authoritative refresh, so total, paid, owing, and credit values stay in sync.
- Mobile report cards now include an accessible column selector and ascending/descending control. Desktop sortable headers remain unchanged.
- Customers now expose a deliberately secondary **Delete mistaken record** action.
- `catstays_delete_empty_customer` performs the deletion atomically and refuses any customer with a portal login, booking, payment, credit, payment request, message, document, cat update, or cat-stay history.
- The customer and cat snapshots, staff identity, reason, and timestamp are retained in `customer_deletion_events` before the empty customer and cats are removed.

## Verification before release

- Staff booking operations: 47 passed, 0 failed.
- Physical room inventory: 13 passed, 0 failed.
- Complete workspace TypeScript check: passed.
- Complete production build: passed; existing Vite source-map and large-chunk warnings only.
- `git diff --check`: passed.

## Release order

1. Review and merge the branch into GitHub `main`.
2. Apply `supabase/migrations/20260902024921_safe_empty_customer_delete.sql` to Supabase project `iwyoezwqorddkmqnjbif`.
3. Use CatStays Replit Shell only to fetch and check out the exact merged `main` SHA.
4. Repeat focused tests, type-check, and production build against that exact SHA.
5. Restart the configured runtime, confirm `/api/healthz`, publish, and verify the public Deloraine tenant.
6. Repeat the signed-in phone workflows at 390 × 844 and confirm `document.documentElement.scrollWidth <= window.innerWidth`.
7. After explicit action-time confirmation, use the new guarded workflow to remove only the synthetic customer `UAT PHONE 20260902022028` and linked cat `UAT Cat 022028`.

No Replit Agent is permitted in this release.

## Rollback

Revert the application merge, sync the resulting known-good `main` SHA through Replit Shell, rebuild, and republish. The additive audit table and guarded function may remain; dropping the audit table could destroy staff deletion history and requires a separate reviewed destructive migration.
