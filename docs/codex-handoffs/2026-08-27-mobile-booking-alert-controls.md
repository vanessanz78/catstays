# Mobile booking and alert controls

## Issue

On the installed mobile CatStays staff app, `/staff-dashboard/bookings` rendered a decorative booking placeholder instead of the existing interactive four-step booking workspace. The visible search area was plain text, “Add new customer” had no handler, and latest-booking “Open” controls did not open a booking. The notification panel could also render above the mobile viewport and offered no per-notification dismissal.

## Evidence

- Live mobile-width browser reproduction on `delorainecattery.catstays.app` exposed `Search customers...` as text rather than a textbox.
- Clicking `Add new customer` left the page and DOM unchanged.
- Latest booking rows exposed an inert `Open` button.
- Opening the notification bell placed the panel above the visible mobile content.
- Route inspection showed `/staff-dashboard/bookings` mapped to `StaffDashboard` even though `AdminBookings` already contains the real booking flow and booking-details sheet.

## Fix

- Route the production staff bookings path to the interactive `AdminBookings` screen.
- Keep New Booking inside the staff route and restore a real searchable customer input.
- Add an inline Add Customer dialog with customer and optional cat creation, then continue the booking at step 2.
- Link selected cats when staff create a booking.
- Use inclusive day pricing and wording in the staff booking flow.
- Keep the notification sheet below the phone safe area with a visible close button.
- Add per-alert dismissal by cross or horizontal swipe, persisted with `dismissed_at` under the recipient-owned notification RLS policy.

## Workflow

1. Feature branch: `fix/mobile-booking-alert-controls`.
2. Validate CatStays and API types/builds plus focused mobile browser UAT.
3. Review and merge the branch to GitHub `main`.
4. Pull the exact merged `main` SHA into CatStays Replit and republish.

## UAT

1. Open the installed CatStays app and choose **Bookings → New booking**.
2. Tap **Search customers**, type part of a real customer name, and select the result.
3. Reopen step 1, tap **Add new customer**, add a controlled customer and optional cat, and confirm the booking continues at step 2.
4. Return to the booking list, tap a booking card or **View details**, and verify the bottom details sheet opens and closes.
5. Tap the dashboard bell and verify the notification sheet begins below the phone header and its close cross remains visible.
6. With a controlled notification present, dismiss it using its cross; repeat with a horizontal swipe and verify both remain dismissed after refresh.
