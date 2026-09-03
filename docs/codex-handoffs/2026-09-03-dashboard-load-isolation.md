# Dashboard load isolation

## Scope
- Opening a booking deep link no longer upgrades Current & future to an all-history background fetch. The independent direct-record read still handles older bookings.
- Today and room planner read stays with checkout on/after the selected date, including ongoing stays. Calendar and customer financial history retain complete history.
- Today arrival/departure/occupancy loading is independent of the customer directory. Customer search explicitly shows loading while customer data is pending.
- Customer identity/contact search does not wait for booking history. Last-booking and outstanding fields show loading until complete history is available, including on fetch failure.
- Customer financial calculations run for the displayed 100-row page, not every matching customer.
- Unrelated dashboard settings/insights/subscription no longer start an unused booking-history query.

## Verification
- Typecheck passed.
- Staff booking operations suite: 50 passed.
- Pagination/read-scope suite: 21 passed, including 8,957-row completeness and fail-closed checks.
- Production build and signed-in runtime checks recorded in PR follow-up.
- No schema, financial records, imports, or source archives changed by this code patch.

## Cleanup boundary
User requested removal of synthetic UAT PHONE data. Exact inspected booking: 11aca68b-7da0-4c2e-8059-136ee579ee81, UAT PHONE 20260902022028, UAT Cat 022028, 6-7 September 2026, paid $0. Permanent cleanup awaits action-time confirmation. Do not delete Vanessa Wilson or imported records.

## Remaining boundary
All-history and calendar still use complete detail snapshots; this patch removes unnecessary waits, not a complete server-side pagination redesign. Physical-device push notifications are not covered by these checks.
