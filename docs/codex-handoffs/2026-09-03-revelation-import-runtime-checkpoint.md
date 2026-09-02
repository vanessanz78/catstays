# Deloraine Revelation migration — 3 September 2026

## Scope and release status
Revelation Pets remains primary. CatStays runs alongside it; public website bookings must remain test-only until an explicit switchover. User authorized migration, API secret storage, synchronization and publication. Use Replit Shell/Secrets/Publish only; NEVER Replit Agent. Source Revelation data is read-only; imports must not email customers or create notifications.

PR #61 remains draft and unmerged. PR #60 contains the separate staff/PWA profile and parallel-run website guard. Neither is a completed published release. Main was a7866e312e9fb7905a51350d72671021afcb1666 at verification.

## Actual imported baseline
Supabase project iwyoezwqorddkmqnjbif; tenant 7f6d029f-b727-4645-83be-db6ec56d1b46. Import run 92620838-4b09-4ef3-9d2f-4dc2f37f8570 is IMPORTED.

| Record | Revelation imported | Existing native preserved |
| --- | ---: | ---: |
| Customers | 3,568 | 4 |
| Cats | 4,770 | 3 |
| Bookings | 8,938 | 4 |
| Payments | 10,040 | 0 |

100,088 original source rows are archived across 19 protected baseline files. The private local original archive remains at `/Users/vanessa/Documents/CatStays Migration Archive - Revelation Pets - 2026-09-02`; it must not be deleted. No private payloads or keys are in GitHub.

10,028 non-deleted payment records total 1,549,688.39, exactly matching the baseline payment export. Twelve deleted source payments remain marked deleted. Net opening customer credit is 6,048.45, matching the baseline. Ninety snapshot-current/future non-cancelled bookings (checkout >= 2026-09-02) have owner/room links. Do not present these snapshot checks as proof of today's complete API refresh.

Known exceptions: four invalid/dateless bookings remain raw-only (5354, 9209, 5183, 5048); 16 API-only bookings still require the first complete detail sweep. Normalized sales differ from source by 103.50 sales/50.00 received because excluded/invalid records are not fabricated. Shared invoices, attachment coverage, source-only fields and historical financial edge cases require further reconciliation. This is NOT an every-field migration sign-off.

## Schema and worker
Applied migrations: full_history_archive, sync_fidelity, durable_sync and history_query_indexes (20260903233000). Indexes repaired slow nested booking/payment queries after the historical load.

Revelation API key is retained in Replit Secrets and copied server-to-server into Supabase Edge Secrets. Dedicated trigger token is stored in Edge Secrets and Supabase Vault `catstays_revelation_sync_trigger`, not in cron text/client code. Temporary mode-600 credential file was removed after configuration.

Edge function `revelation-sync` deployed. Unauthenticated trigger returns 403. Authorized source reads and checkpointed database imports work. Worker source as of cedd1ca5ea2e250a8c64b7a64f441a51c1ac5ab5 passed 22/22 Node tests, including unnamed source records, ambiguity, local edits, payment idempotency and missing/deleted money protection.

First actual API job: d5890f76-b2c1-4de7-9631-534685fd58e9, local day 2026-09-03. Latest checkpoint at this document creation: RUNNING, phase bookings, 16 source pages, four date ranges remaining, no current error. Customer phase flagged 73 source records without usable names; original payloads preserved, no invented profiles or inferred deletions. Bookings detail phase has not yet been signed off.

Nightly cron is NOT activated at this checkpoint. `supabase/operations/activate_revelation_sync.sql` and `scripts/configure_revelation_sync.mjs` implement the separate activation gate. Do not activate before real detail-batch verification. API supports only its documented subset; export-only credits/files/fields are not continuously synchronized by this worker. No claim of complete synchronization is justified until reconciliation and coverage gaps are resolved.

## Tests and browser proof
- Baseline rollback-only database suite: 20/20 passed.
- Durable-job rollback-only database suite: 7/7 passed. Do not rerun against the now-active real job without adapting isolation.
- Worker tests: 22/22 passed in Replit.
- Complete-pagination tests: 4/4 passed earlier.
- Frontend typecheck previously passed at 4acd09ef; rerunning latest a0d94d6f changes. Latest production build is still pending at document creation.
- Signed-in published Today now displays imported occupied-room bookings after database index repair.
- Signed-in published imported booking for Mishka displays Private Room 4, 2–7 September, 16:30/17:45, total/paid 138.00, owing 0.00. Read-only inspection; no live booking changed.
- Existing published frontend still caps bookings at 1,000. Complete pagination, accurate full-history exports, sync-status panel and visible load-error handling are on PR #61, not yet published.
- Development preview is not signed in. User has been asked to sign in. Never copy a production authentication token into another origin or bypass login. Authenticated preview UAT and final production UAT remain blocked.
- Physical phone PWA push remains unverified; do not imply otherwise.

## Exact resume
1. Use existing signed-in in-app browser tabs, not Chrome bindings or Replit Agent.
2. Replit isolated checkout: `/tmp/catstays-revelation-migration`, branch `migration/revelation-full-history-20260902`; dependencies symlink to `/home/runner/workspace`. Root checkout remains detached at 57fab76adee546ffd583bdbcc27920484d829076 with backup branch preserved. Do not overwrite it blindly.
3. Observe the current Shell before sending any command. A validation build or bounded tick loop may still be running. Shell commands: `node scripts/configure_revelation_sync.mjs status`, `tick`, `verify`; `activate` is a separate gate, not yet approved by test evidence.
4. Finish actual customer/booking/detail job and reconcile fresh records against source. Preserve all archive/before-after audits. Review exceptions instead of guessing names, dates, ownership, room assignments or money.
5. Complete latest typecheck/build, preview sign-in, and mobile UAT of Today, all bookings, old booking search, customers, balances, report exports, sync status, booking details and no-overflow navigation.
6. Review PRs #60/#61 and merge verified work to main; sync root Replit checkout to exact merged SHA using Shell only; restart canonical runtime, perform development UAT, publish with standard Publish control, perform production authenticated UAT. Do not collapse these gates.
7. Record nightly activation, complete-job proof, published deployment and remaining coverage/device exceptions separately.

Temporary source/build files are retained solely to resume unfinished migration/UAT. The archived original business data and protected migration evidence must remain recoverable.

## Later checkpoint — repaired first scheduled run

Frontend typecheck and production build PASSED at a0d94d6fffa4cbd4fb0e9f89c2f2112163546779; existing sourcemap/chunk-size warnings remain. Worker tests now 23/23 at 0b9e02cd022e3f68c0c6c558f8f71e7e8ed0dc5f. The first detail batch exposed a numeric confidence contract mismatch for API-only metadata; automatic retries were paused, the field was corrected from a text label to numeric 1, and two subsequent real batches completed successfully. Latest observed checkpoint: 47 of 8,957 source booking details processed, 8,910 remaining, 80 warnings, last_error null. Baseline imported booking/payment counts remained 8,938/10,040. Source records requiring review are not silently deleted.

Nightly activation has now been requested again after the verified repair, for 00:01 Pacific/Auckland, with minute-by-minute bounded continuation while a daily job is active. Confirm cron active plus a newer successful checkpoint/HTTP response before claiming autonomous operation verified. The first full sweep is still NOT complete; do not imply all source fields or historical reconciliation are finished.

Authenticated development UAT remains blocked: preview is at /login, not signed in. No front-end main merge or Replit publication was performed. Root Replit checkout and original protected archives remain preserved. Updated migration evidence is in PR #61.
