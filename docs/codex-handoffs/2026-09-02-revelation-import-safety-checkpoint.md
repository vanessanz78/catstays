# Revelation import safety checkpoint — 2026-09-02

## Status: incomplete; not merged, imported, synchronized, or published

Vanessa requested completion of migration, one-way synchronization and publication for side-by-side use. Revelation Pets remains primary. Never use Replit Agent. Keep CatStays website bookings test-only until switchover.

## Verified this run

- Target Supabase project: `iwyoezwqorddkmqnjbif`.
- Deloraine cattery: `7f6d029f-b727-4645-83be-db6ec56d1b46`.
- Before and after transaction-local tests: 4 customers, 3 cats, 4 bookings; 0 payments before tests.
- `public.legacy_import_runs` is still absent after rollback. No production import migration was applied and no private source rows were uploaded.
- Full draft migration plus `supabase/tests/revelation_legacy_import_rollback.sql` executed in Supabase SQL Editor inside one BEGIN/ROLLBACK transaction.
- 15/15 checks passed: repeat-safe staging, repeat-safe operational import, signed credits, cross-tenant denial, invalid/null/duplicate/wrong-source IDs, customer without email, source-only propagation, local edit preservation/conflict reporting, conflict retry, source balance reset to zero, native nonzero credit constraint, missing cat ID, missing payment amount, deleted payment status, context cleanup, anonymous denial. The combined identity-validation item covers several invalid inputs.
- Source and test commit at verification: `235d33f10783234ec5c33eb735012d5d77a2d931`.
- API integration page in signed-in Revelation Pets exposes an existing read-only API. Key was not copied to code, logs, server configuration or this checkpoint.
- Read-only API access is not a complete-history guarantee (attachments, correspondence and several legacy details remain outside the API).
- Replit workspace remains detached at staff code `57fab76adee546ffd583bdbcc27920484d829076`, with an API health check passing on port 8080. No workspace checkout or publication occurred in this run.
- PR #60 staff work remains draft/unmerged. Latest staff branch includes documentation commit `012a92ad46d8cb03f6dab4fd4396560a64bf68fb`.

## Hardened draft import

- Validate whole batches before writing: array/object shape, required string IDs/names, normalized duplicate IDs, identifier length and Revelation source.
- Empty customer emails remain empty (not silently skipped and not replaced with invented deliverable addresses).
- Three-way field merge stores the last imported source values in private legacy metadata. Source-only changes apply; local edits survive; simultaneous conflicting changes create review issues.
- Import context clears before returning so ordinary staff edits are not treated as incoming source values.
- An explicit source zero balance replaces its prior nonzero imported balance, while native zero-credit entries still fail.
- Missing payment amounts fail; source-deleted payments are retained with status `deleted`, not `completed`.
- IMPORTANT: all payment/report consumers still need review for filters before release. Merely assigning status deleted is not proof that every screen excludes those rows.

## Source archive and room audit

Private archive is intact at:
`/Users/vanessa/Documents/CatStays Migration Archive - Revelation Pets - 2026-09-02`

Do not commit customer payloads. Existing manifest, rollback snapshots and original source bytes remain unchanged.

Current Deloraine room groups:
- Private Suite: 17 physical units.
- Indoor Suite: 8 physical units.
- Communal Room: 25 physical units.

Archived API stay lines also reference historical Communal units 26–45 and Holding Room 9. Preserve those original labels; do not silently map them onto current rooms or expand current capacity.
A local read-only scan of the saved API detail snapshot found 101 non-cancelled bookings ending on/after 2026-09-02, with no unknown room labels for their overnight lines. This is an older snapshot, NOT proof of current source completeness or successful import.

## Awaiting user input

Two concise questions were sent:
1. Sign into **Deloraine** in the development tab (it was Fancy Felines / Sarah Casey; do not mutate that tenant for Deloraine testing).
2. Confirm storing the existing Revelation read-only API key in protected CatStays server secrets and scheduling a 12:01 a.m. Pacific/Auckland one-way sync.

No affirmative answer received as of this checkpoint. Do not infer completion or enable unattended access before the requested confirmation.

## Required work remaining

1. Refresh current source snapshots after secure API access approval. Reconcile the previously identified $50 payment snapshot difference.
2. Finish canonical customer/cat preparation using exact crosswalks and supplemental forms; preserve unresolved/missing source rows as review evidence.
3. Implement exact booking-to-cat links plus physical room and room-segment mappings. Current importer still does not populate these.
4. Ensure invalid-date/unmatched records and API-only bookings remain visible in migration review without corrupting operating totals.
5. Add durable before/after audit and scoped rollback for future update runs; current initial rollback snapshots alone are not sufficient for arbitrary later sync rollback.
6. Implement persistent server-side one-way sync with tenant scoping, protected secrets, locking, checkpoints, retries, timezone/DST behavior, complete pagination, status/error visibility and no import-generated customer messages.
7. Test changed source versus local edits across cats/bookings/payments and relationship changes, not only the customer-field regression.
8. Present action-time exact import scope, files/counts/totals/review exceptions, non-destructive merge strategy and rollback boundary before private upload. No blanket database wipe.
9. Run actual import, reconcile complete counts/totals/links, and perform signed-in Deloraine UI UAT at phone width.
10. Review and merge verified branches, sync exact SHA with Replit Shell, development UAT, publish, then production UAT.
11. Do not mark physical-phone PWA notification receipt verified without an actual phone test.
