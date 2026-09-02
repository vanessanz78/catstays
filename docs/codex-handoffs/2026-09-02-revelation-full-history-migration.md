# CatStays checkpoint: Revelation Pets full-history migration

## Objective

Retain Deloraine Cattery's complete Revelation Pets history in CatStays before
the source subscription is cancelled. The migration must preserve original
source rows, normalise records that can be mapped safely, reconcile money and
row counts, and leave unresolved records visible for review rather than linking
them to the wrong customer.

## Private source archive

The working archive is stored outside Git and contains the original customer,
cat, booking, payment, and report exports plus checksummed prepared records.
Never commit source exports, API responses, customer details, or API keys.

The read-only Revelation API archiver reads its key from a temporary file. It
recursively splits date ranges when an endpoint reaches the documented
1,000-record limit and refuses a single-day result that may still be truncated.

## Database design

`20260902210000_revelation_full_history_archive.sql` adds:

- import runs, source files, lossless source rows, normalised links, and
  reconciliation issues;
- external identifiers and legacy financial/report fields for bookings and
  payments;
- idempotent customer, cat, booking, payment, and opening-balance imports;
- tenant-scoped policies and permission checks on every import operation.

Raw records are intentionally kept even when dates or customer links cannot be
normalised. Imported records use partial unique indexes so a retry updates the
same source record instead of duplicating it.

## Release gates

1. Complete all available Revelation report exports and, if the plan exposes
   an API key, archive customers, bookings, booking lines, and payments through
   the read-only API.
2. Verify checksums, source row counts, booking/payment totals, date coverage,
   deleted-payment comparison, and ambiguous/unmatched customer counts.
3. Validate the migration against the signed-in Supabase project without
   changing production data.
4. Create an exact rollback snapshot of the current CatStays tenant data.
5. Show the target project, tenant, files, counts, financial totals, unresolved
   records, replacement scope, and rollback path to Vanessa immediately before
   upload/deletion. Do not proceed without that confirmation.
6. Stage raw rows, mark the run ready, then import customers, cats, bookings,
   payments, and account balances in restartable batches.
7. Reconcile CatStays to the source archive before publishing.
8. Merge verified work to GitHub `main`, sync the exact SHA in Replit Shell,
   run development Runtime UAT, publish, and run signed-in production phone UAT.
   Never use Replit Agent.

## Verification completed at this checkpoint

- Archive/preparation unit tests pass, including ambiguous-customer handling,
  generic report preservation, deleted-payment comparison, and API truncation
  protection.
- CatStays TypeScript type-check passes.
- The production build completes.
- The staff booking/report test suite passes 50 tests.
- The migration parses as PostgreSQL and its normalised insert column/value
  counts match.

The migration is not yet applied and no private source rows have been uploaded
to Supabase at this checkpoint.

## Signed-in rehearsal and exact-source checkpoint — 2 September 2026

Chrome Supabase access is restored. Actual public schema metadata and an exact
Deloraine operational snapshot were saved privately before any rehearsal.
The snapshot contains four synthetic customers, three cats, four bookings, and
the related operational rows. Website/settings/rooms/auth are not cleanup targets.

The complete migration plus synthetic import functions were executed inside
an explicit transaction and rolled back. Four runtime regression checks passed:

1. Source-file and source-row staging repeated without duplicates.
2. Customer/cat/booking/payment imports repeated without duplicates and retained
   a negative opening balance correctly.
3. Cross-tenant access was denied.
4. Anonymous import execution was denied.

Two runtime ambiguities were found and fixed in commit
`f7a31839cf26955cff3bcec4dab758976f108869`: the source-file conflict target
now uses a named constraint, and the reconciliation parameter is function-qualified.
The rollback-only synthetic test is preserved at
`supabase/tests/revelation_legacy_import_rollback.sql`.
A complete comparison verified that every original operational row remained
unchanged after rollback, and no permanent legacy tables were left installed.

### Recovered source coverage

- Dated API archive: 3,561 customers, 8,957 booking summaries, 10,000 generic
  payment rows; all original responses remain preserved.
- The 8,957 detailed bookings are complete and checksummed. They contain 9,277
  overnight lines and 10,028 payment lines.
- A separately recovered report-only dateless booking brings the unique detailed
  booking archive to 8,958 IDs. Its payment evidence must not be blindly added to
  normalised finance totals.
- All 179 booking-report pages are archived: 8,942 unique references and 11,257
  direct cat links. These IDs supersede name-only matching.
- Four older customer profiles were recovered directly. Exact source IDs now
  resolve 8,941 report rows; one refers to a missing customer ID and stays unlinked.
- The API contains 16 references absent from the booking report. Preserve them
  as source evidence, but verify their source status before adding them to totals.
- The customer XLS uses synthetic owner/position cat aliases, not actual pet IDs.
  A private crosswalk safely matches 4,735 rows. All 22 ambiguous same-name API
  cats have complete ID-bound profile forms saved separately, so their canonical
  fields need not be guessed from export row order.
- Fourteen historical cat IDs absent from the API have saved care sheets; thirteen
  detailed forms were also recovered. One source form remains unavailable.
- The three source-only customer rows and three source-only cat rows remain
  preserved. Neither export nor API may silently replace the other.

### Payment reconciliation and changing source state

With API invoice 0 treated as the same missing-reference representation as an
empty XLS invoice cell, all 10,028 active-export transactions match the original
detailed archive by invoice/date/amount. Both total $1,549,688.39.

The original full export has 10,040 transactions / $1,550,794.14, including
12 deleted transactions / $1,105.75. A later 101-page UI capture has 10,039
transactions / $1,550,744.14. The difference is exactly one absent $50 deposit;
there are no unexpected later rows after display-format normalisation.
Both snapshots are retained. Refresh/reconcile the cutover baseline rather than
silently importing the older row as active.

### Next gates — do not treat the archive as a completed migration

The private archive includes `MIGRATION_REVIEW.md` with the exact destination,
synthetic record IDs, scope, totals, outstanding checks and rollback files.
Obtain the scoped action-time confirmation before private upload/replacement.

Then:
- Build canonical payloads using proven external IDs and the recovered forms.
  Preserve unavailable relationships as review items; do not guess, use row order,
  or deduplicate financial evidence by amount alone.
- Keep dateless/API-only source evidence accessible without distorting normal
  booking and sales totals. Preserve actual historical room names; do not assume
  they map to today's physical room inventory.
- Import booking-to-cat relationships. The current generic import function does
  not yet normalise the full relationship archive.
- Verify null/missing import identifiers fail safely and check opening-balance
  refresh-to-zero behaviour before supporting later re-import snapshots. The
  existing repeat-same-payload test is not proof of a changed-balance refresh.
- Stage raw files/rows, normalise safely, reconcile every count and financial
  definition, and provide historical-report/reconciliation visibility.
- Remove only the approved synthetic rows after an unchanged-state check.
- Follow the release and Runtime UAT gates above; do not use Replit Agent.

No historical rows have been uploaded, no existing operational data has been
deleted, and no code from this migration branch has been merged or republished.
The source archive is not proof that all attachments, agreements, correspondence,
photos or stored payment credentials have been transferred. Keep Revelation Pets
until those limitations and end-to-end CatStays access are resolved.
