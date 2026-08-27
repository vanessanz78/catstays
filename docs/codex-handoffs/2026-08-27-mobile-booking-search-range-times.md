# CatStays checkpoint: mobile booking search, date range, and visit times

## Issue

The signed-in mobile New Booking flow showed every customer before staff entered a search term. Customer matching covered only owner name and email. Booking dates were selected in two unrelated native date inputs, and bookings did not record arrival or collection times.

## Evidence

- `AdminBookings` filtered the complete customer list with an empty string, which matched every customer.
- The customer filter did not consider mobile numbers or cat names.
- Check-in and check-out used separate `type="date"` inputs with no inclusive range selection.
- The cattery already stored morning, afternoon, and interval settings, but New Booking did not read them.
- `public.bookings` had date columns but no check-in or check-out time columns.
- The confirmed CatStays Supabase project is `iwyoezwqorddkmqnjbif`.

## Implemented workflow

- Customer results remain hidden until staff type a non-blank query.
- Matching now covers customer name, cat name, email address, and mobile number.
- The Add New Customer action remains available when the search is empty or has no match.
- Either date field opens one mobile range calendar. Staff select the first and last day, see the inclusive range highlighted, then select **Done**.
- Check-in and check-out time dropdowns are generated from the cattery's saved morning/afternoon windows, selected weekdays, and booking interval.
- Booking Setup now stores opening-window days and times in the cattery's central settings, while retaining local recovery storage.
- Booking records, review details, list cards, detail sheets, and confirmation-email dates include the selected visit times.

## Database

Migration `20260827074602_add_booking_visit_times.sql`:

- adds nullable `check_in_time` and `check_out_time` columns to existing bookings;
- preserves existing booking rows;
- records Deloraine's configured morning days as Monday-Saturday and afternoon days as Monday-Sunday without overwriting already-saved day arrays.

Live verification confirmed Deloraine uses:

- morning: 09:00-10:30, Monday-Saturday;
- afternoon: 16:30-18:00, Monday-Sunday;
- 15-minute intervals.

## Branch verification

- booking schedule and search tests;
- existing inclusive-day pricing tests;
- CatStays TypeScript check;
- CatStays production build;
- `git diff --check`.

## Customer UAT

1. Open **Bookings → New Booking**. Confirm no customer card appears before typing.
2. Search separately by part of an owner name, cat name, email, and mobile number. Confirm the expected customer appears.
3. Clear the search. Confirm results disappear and **Add New Customer** remains available.
4. Choose a customer and tap **Select dates**. Pick a start and finish day and confirm all dates in between are highlighted.
5. Tap **Done**. Confirm both dates appear together and both time fields become available.
6. On a Monday-Saturday date, confirm the dropdown contains 09:00 through 10:30 and 16:30 through 18:00 in 15-minute steps.
7. On a Sunday, confirm only 16:30 through 18:00 appears.
8. Select both times, continue forward, then use **Back** to edit them. Confirm selections remain saved in the form.
9. Review the booking and confirm inclusive days, check-in time, check-out time, room, and total are correct before creating a controlled test booking.

## Release state

Branch, PR, reviewed merge, exact Replit main SHA, production republish, and signed-in mobile UAT must be recorded as distinct release states.
