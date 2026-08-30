# Staff live Room Planner recovery — 2026-08-30

## Issue and evidence

The live Room Planner displayed room names, capacity, and price, but offered no route to manage the room setup and did not show which cats occupied a room. Occupancy was calculated by subtracting active bookings from active rooms, which becomes incorrect when a booking assigns cats to separate rooms or multiple records point at the same room. The empty-state copy also claimed the board was blank while Deloraine's live rooms were visible.

## Recovery

- Calculate occupied rooms from unique live room assignments, including `booking_cat_rooms` used by separate-room bookings and the booking's primary room.
- Calculate available room count from unique occupied active rooms rather than booking count.
- Show Active, Occupied, Available, and Inactive room states honestly.
- Show each occupied room's assigned cats and customer with a link to the real booking detail.
- Keep room type, capacity, and per-cat daily rate readable in every card.
- Add direct actions to the live Calendar and Booking Setup room/pricing controls.
- Replace the contradictory blank-board copy with live-status guidance.

## Workflow and UAT

1. Run CatStays type check and production build locally and on the exact feature commit in Replit.
2. Review and merge to GitHub main.
3. Pull the exact reviewed main commit into the visible Replit Shell, rebuild, and republish.
4. Verify Deloraine shows one uniquely occupied active room and two available rooms for the current Charlie/Cat/Dog stay.
5. Verify the occupied Private Suite names the assigned cats and opens the correct booking.
6. Verify View calendar and Manage rooms & pricing reach their real workspaces.
7. At 390 px, confirm cards and actions stack without document overflow.
8. Check live browser warnings and errors.

Automated UAT is read-only and must not edit a room, rate, booking, or room assignment.
