# Staff live Calendar recovery — 2026-08-30

## Issue and evidence

The staff menu promised a Calendar month view, but the live route rendered only a duplicate list of today's arrivals and departures. Existing standalone calendar prototypes were not suitable for recovery because they contained hard-coded sample cats, customers, rooms, dates, and payment amounts.

## Recovery

- Rebuilt the staff Calendar inside the tenant-authenticated dashboard using only `useBookings()` records for the current cattery.
- Added previous month, next month, and Today navigation.
- Added a seven-column Monday-to-Sunday desktop month grid with live booking links.
- Added a phone-first monthly agenda so dates and cat names remain readable instead of being squeezed into narrow calendar cells.
- Labelled every live booking day as Arrival, Staying, or Departure and stated that arrival and departure days are both included.
- Excluded cancelled bookings and limited the view to bookings overlapping the selected month.
- Kept every booking tile linked to the existing real booking detail workflow.

## Workflow and UAT

1. Run the CatStays type check and production build locally and on the exact feature commit in Replit.
2. Review and merge to GitHub main.
3. Pull the exact reviewed main commit into Replit, rebuild, and republish.
4. Verify Deloraine's current booking appears across every included day and opens the correct booking detail.
5. Verify previous, next, and Today month controls.
6. At 390 px, confirm the agenda is readable and the document has no horizontal overflow.
7. Check the live browser console for warnings and errors.

Automated UAT is read-only and must not create, edit, move, confirm, or cancel a booking.
