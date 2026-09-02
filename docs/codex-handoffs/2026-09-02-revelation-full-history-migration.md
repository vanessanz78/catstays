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
