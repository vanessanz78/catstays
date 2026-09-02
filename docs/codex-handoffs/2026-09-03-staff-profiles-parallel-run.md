# Staff profiles and Revelation parallel run — release checkpoint

## Owner decision
Vanessa approved staff profiles with roles and phone numbers, PWA push setup, and Revelation Pets remaining the main booking system. CatStays website bookings must remain test-only until an explicit switchover. Replit Shell only; never use Replit Agent.

## Implemented on feature branch
- Settings > Staff profiles: owner can add names, email, phone, manager/staff role and active/disabled access; staff can edit only their own name and phone.
- Existing staff_memberships reused; phone stored in metadata. No separate identity store.
- Staff sign-in/registration route without a cattery trial. Exact owner-added email is linked only after verified authentication; unverified, unrelated and disabled memberships cannot claim access.
- Owner ownership cannot be reassigned through the profile RPC. Linked email changes require a separate profile.
- Settings link to per-device PWA enable/test flow. Copy distinguishes phone contact, SMS, provider acceptance and actual device receipt.
- Deloraine-only bookingMode=test_only + primaryBookingSystem=revelation_pets configuration migration.
- Public booking requests blocked in test-only mode. Authorized staff may explicitly test using their own verified email. Test customers do not overwrite matching customer records; booking and email subjects are labelled TEST.
- Other tenants retain existing booking mode.

## Evidence
- Main source used: a7866e312e9fb7905a51350d72671021afcb1666 (PR #59).
- Replit read-only inspection: main at 84c8c67dea8993b2bb4d228d242a68bde0b61fc9 (Replit Published your App commit), clean worktree; origin/main at a7866e3. Preserve this runtime commit with a backup ref before switching.
- 6/6 parallelRun.test.ts tests pass with tsx.
- 15 available TypeScript/TSX snapshot files pass esbuild syntax transformation. This is NOT a complete repository typecheck/build.
- Staff SQL regression test written; NOT executed. Browser policy verification became unavailable before the SQL editor action; no database update was applied.
- Subsequent Replit Shell fetch attempt also blocked by the browser policy gate. No workaround attempted.
- No Replit Agent, database wipe, new staff account or outbound staff invitation used.

## Release status — NOT LIVE
Feature branch only. Do not merge until all gates below pass. Migration has not been applied, so test-only mode is not yet enforced on the currently published website.

1. Restore browser policy access to signed-in Chrome Supabase and Replit tabs.
2. Verify main has not advanced; inspect live staff schema and reviewed migration.
3. In Supabase project iwyoezwqorddkmqnjbif, run migration + regression transaction ending ROLLBACK. Verify owner create, email verification, idempotency, self phone edit, role escalation denial, tenant isolation, disabled and anonymous denial.
4. Capture pre-change staff memberships and only the two Deloraine website_settings keys; apply reviewed migration and record it in migration history. Tenant 7f6d029f-b727-4645-83be-db6ec56d1b46.
5. Replit Shell: preserve published runtime commit, check out exact feature revision, install with repository pnpm policy, run full typecheck, staff-booking and physical-room tests, parallel-run tests and API/frontend builds. Inspect current artifact run configuration.
6. Development Runtime UAT at 390px: owner profile, staff create/edit/disable, duplicate email, verified/unverified account claim, staff cannot grant privileges; no horizontal overflow; settings navigation and PWA links. Use labelled test identities only and capture exact cleanup IDs.
7. Public UAT: anonymous/cross-tenant/customer requests blocked before any data/email effect; staff own-email test accepted and marked; existing customer unchanged. Ordinary tenants unaffected.
8. Review and merge only after passing; sync Replit to exact main SHA through Shell, restart correct services, verify ports/health, publish via standard UI, then repeat production Runtime UAT.
9. Physical PWA: Vanessa/staff open installed CatStays, enable notifications, send test and confirm actual phone receipt. Not proven by adding a phone number or by HTTP/provider success.

## Historical import / sync remains separate
The full-history archive and migration branch migration/revelation-full-history-20260902 are NOT merged into this feature branch. Its final operational imports, reconciliation, conflict-safe recurring sync and historical reports remain incomplete. This staff feature does not establish that all Revelation data is in CatStays or that nightly sync is running. Do not overwrite native records or publish unfinished legacy-table consumers.

## Rollback boundary
No live mutation performed in this release. Once applied, roll back application to the preserved SHA; do not drop staff_memberships or delete real staff/customer data. Revoke/drop only newly introduced RPCs if appropriate, and restore the two tenant settings keys from the captured values without replacing unrelated settings.

## Resumed verification — 2026-09-02 10:55 UTC

Working branch: `feat/staff-profiles-parallel-run-20260903`; PR #60 remains draft/unmerged. Main remains `a7866e312e9fb7905a51350d72671021afcb1666`.

- Chrome, Supabase Dashboard and Replit Shell access restored. Replit Agent not used.
- Corrected missing SQL dollar-quote terminators in both new function bodies. Tested code SHA: `57fab76adee546ffd583bdbcc27920484d829076`.
- Replit original runtime preserved in local branch `backup/pre-staff-profiles-20260903` at `84c8c67dea8993b2bb4d228d242a68bde0b61fc9`.
- Replit checked out the tested feature SHA detached; clean worktree. Full workspace typecheck and production build passed. Existing large-chunk warning remains.
- 50/50 staff booking operations, 13/13 physical-room inventory and 6/6 parallel-run tests passed.
- Full migration + staff regression transaction passed and ROLLBACK completed. Verified zero remaining synthetic auth users.
- Migration `20260903000100_staff_profiles_parallel_run` then APPLIED to `iwyoezwqorddkmqnjbif` and recorded in `supabase_migrations.schema_migrations`. This supersedes earlier NOT APPLIED statements above.
- Deloraine settings before migration: both bookingMode and primaryBookingSystem keys absent. After: test_only / revelation_pets. Restore only those two keys if rolling back; do not replace website_settings.
- Existing Deloraine staff profile count 1 and full-row ordered aggregate hash `8c962f0285cf19894c49c00590cc736a` unchanged after migration. No real staff/customer records changed.
- Runtime check caught the old non-watching API process despite new checkout. Stopped only inspected API PID 257, restarted in first Replit Shell with `PORT=8080 pnpm --filter @workspace/api-server run dev`. Do not interrupt that Shell while testing; use second Shell for commands.
- Restarted API `/api/healthz` returned 200. Anonymous explicit-test POST to `/api/bookings/request` returned 403 with Revelation-main/test-only wording. No customer with blocked-uat@example.invalid created.
- Development public route `/tenant/delorainecattery/booking-flow` showed Online booking preview and withheld the form from the unrelated Fancy Felines login.
- Staff screen read-only layout at 390 CSS px had scrollWidth 390; only Fancy Felines was signed in on the development origin. No changes made to that tenant. This is a layout smoke check, NOT Deloraine profile-write UAT.
- Published Deloraine dashboard is signed in and accessible; it still runs the OLD published release. Website test-only protection is proven only in development until publication.
- Supabase Security Advisor rerun: 0 errors, 68 warnings, 3 suggestions. Visible warnings include older update_updated_at mutable search_path and GraphQL schema discoverability for existing tables. Do not equate schema discoverability with proven row leakage; broader review remains separate. Connector advisor permission remains unavailable; Dashboard access works.

### Immediate release blocker
The development Chrome origin is signed into Fancy Felines, not Deloraine. Vanessa was asked to sign into Deloraine in the development Staff sign-in tab. Do not extract/copy session tokens or mutate the unrelated cattery. Complete owner add/edit/disable/duplicate and own-email test booking UAT after sign-in, then review/mark-ready/merge, Shell-sync exact main, standard publish and production UAT. Physical PWA receipt remains unverified. No publish happened in this resumed turn.

Development sign-in: https://925e7fc1-87c8-4a74-8546-cfaa9f0e4192-00-2v32276rv9wz5.kirk.replit.dev/staff-login

Historical migration and recurring sync remain unfinished and unmerged. The live dashboard still has the old synthetic booking dataset; do not claim Revelation parity.
