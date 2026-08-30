# Smart Import recovery

## Issue

The staff menu marked Smart Import as **Soon** and routed tenant subdomains to the generic coming-soon workspace. Three older import screens existed, but they were prototypes: they displayed sample people and simulated processing/success without saving records.

## Evidence

- `RightMenu.tsx` added a `Soon` badge to `/staff-dashboard/smart-import`.
- Both production routers mapped Smart Import to `StaffDashboard` rather than a real import component.
- The legacy `SmartDataImport` generated fixed counts and sample records after timers.
- The onboarding `DataImportFlow` parsed CSV rows but its Import action only changed the success screen.
- The older `SmartImport` used hard-coded sample mappings and preview rows.

## Workflow restored

- Real, tenant-scoped CSV import for customers, cats, rooms, and bookings.
- Downloadable, heading-only CSV templates for every record type.
- Deterministic header aliases, NZ-style date parsing, 12/24-hour time parsing, and list parsing.
- Customer and room matching before cat or booking imports.
- Review screen showing ready, duplicate, and invalid rows before save.
- Existing-record and within-file duplicate detection; duplicate and invalid rows are skipped.
- One batch insert per selected record type through the signed-in Supabase client so existing cattery RLS remains authoritative.
- Real tenant CSV exports for customers, cats, rooms, and bookings.
- Responsive staff layout with the shared dashboard navigation and notification bell.

## Security and data boundaries

- The browser uses the existing publishable/anon client and signed-in session; no service-role key is exposed.
- Every inserted row receives the authenticated cattery id.
- Customers/cats/bookings/rooms are written only through existing RLS-protected tables; this release adds no schema or policy changes.
- File parsing happens in the browser. Nothing is saved until staff choose the final Import button.
- Files larger than 10 MB and non-CSV files are rejected.
- The connected Supabase plugin currently exposes a different project, so no connector mutation was attempted. Replit runtime and signed-in tenant UAT remain the database verification path for project `iwyoezwqorddkmqnjbif`.

## Branch verification

- `git diff --check`
- `pnpm --filter @workspace/api-server exec tsx --test ../catstays/src/app/lib/smartImport.test.ts`
- `pnpm --filter @workspace/catstays typecheck`
- `pnpm --filter @workspace/catstays build`
- Local desktop route review.
- Local 390 px UAT: `innerWidth`, `clientWidth`, and document `scrollWidth` all equal 390.
- CSV fixture UAT: 1 ready row, 1 duplicate skipped, and 1 invalid row blocked.

## Customer UAT

1. Sign in to the cattery staff dashboard and choose **Smart Import**; confirm there is no **Soon** badge.
2. Under Customers, download the template and add one uniquely named test customer with an email address.
3. Choose the saved CSV and confirm the row is marked **Ready** before importing.
4. Add a repeated copy and a row without an email; confirm the duplicate is marked **Skip** and the missing-email row is marked **Fix row**.
5. Import only the ready row and confirm it appears under Customers.
6. Download the Cats template, use that customer's email as `owner_email`, and confirm the cat is matched and saved to that customer.
7. Repeat with Rooms, using daily pricing and capacity, and confirm the room appears in Room Planner.
8. Download the Bookings template, use the exact customer email and room name, and confirm dates/times/cat names are reviewed before the booking is saved.
9. Use each **Export current data** action and confirm the CSV contains only the signed-in cattery's records.
10. Repeat steps 1–4 on a phone and confirm there is no sideways page scrolling.

