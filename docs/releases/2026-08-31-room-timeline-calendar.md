# Room timeline calendar checkpoint — 31 August 2026

## Issue

The staff Calendar was a conventional month grid. It repeated each stay inside every calendar day and did not show which physical room was occupied, which rooms were free, or where a stay could move. Staff could not start a booking from an empty room/day, open a compact booking summary, or move a stay from the calendar.

The requested operational reference was Revelation Pets' horizontally scrollable room-by-date calendar: fixed room rows, date columns, booking bars, empty-cell booking, quick detail pop-up, and laptop drag-and-drop.

## Evidence and rules

- Baseline GitHub `main`: `b9df19bf93df4f2916d0a313908db2ae0d219135`.
- Signed-in Deloraine production UAT before this branch showed the old **August 2026** month grid with three active bookings and the left menu description **Month view**.
- CatStays charges and reserves inclusive calendar days, so both arrival and departure remain occupied on the timeline.
- Existing new-booking availability treats one overlapping stay as occupying the assigned room; the calendar uses the same rule.
- A multi-room booking is visible on every assigned room row, but calendar drag is deliberately blocked because it requires per-cat room decisions in the full booking editor.
- A drag preserves the stay length, visit times, recorded price, booking state, and payment state. It changes only the start/end dates and room assignment.

## Implemented workflow

1. Replace the month grid with a 21-day horizontally scrollable timeline with a fixed Room column and one row per live room.
2. Show inactive rooms as unavailable and show an Unassigned row when a booking does not yet have a room.
3. Render stays as colour-coded bars and stack any overlapping data into separate lanes instead of obscuring it.
4. Let staff click or tap a stay to open a compact summary with dates, times, room, status, payment, total, notes, and a link to the full booking.
5. Let staff click an empty active room/day to open New Booking with that date and room carried forward.
6. Let laptop users drag a single-room stay to a new available room/start date while retaining the original inclusive duration.
7. Reject inactive-room, capacity, overlapping-room, and multi-room moves in both the interface and the live tenant-scoped persistence path.
8. Recheck availability against Supabase immediately before saving, scope booking mutations to the signed-in cattery, update per-cat assignments, and restore the original booking row if its assignment update fails.

## Branch verification

- CatStays TypeScript check — passed.
- CatStays production build — passed (existing sourcemap and bundle-size warnings only).
- CatStays library test suite — 47/47 passed; the focused booking, scheduling, pricing, and timeline subset passed 16/16.
- New timeline tests cover month boundaries, inclusive duration preservation, unique multi-room assignment detection, clipped/stacked bars, and collision handling.
- Local laptop browser UAT confirmed room rows, date columns, colour-coded booking bars, inactive-room treatment, and the full compact booking pop-up.
- Local phone browser UAT confirmed the room column and timeline remain readable inside a horizontal scroller; viewport width and document scroll width both remained exactly 390 px, with no page-level overflow.
- Empty-cell keyboard UAT opened `/staff-dashboard/bookings` with the expected `checkIn`, `checkOut`, and `room` query values. Native mouse drag remains part of the signed-in customer UAT because automated browser input did not provide reliable HTML drag data.
- Pre-release signed-in production inspection confirmed the Deloraine tenant still showed the old month calendar, establishing the live before-state without changing customer data.

## Customer UAT

1. On a laptop, sign in to Deloraine Cattery and open **Calendar**. Confirm the persistent left dashboard menu remains visible and Calendar says **Room timeline**.
2. Confirm the Room column stays visible while the dates scroll horizontally and **Go to today**, previous/next seven days, and Start date all work.
3. Confirm every active Room Planner room has a row, inactive rooms are labelled inactive, and booking bars show the correct cats, dates, customer, and status colour.
4. Click a booking bar. Confirm the pop-up shows the correct arrival/departure dates and times, room, booking state, payment state, total, notes, and **View full booking** link.
5. Click an empty active room/day. Confirm New Booking opens full width with that date already selected; after selecting the customer and cats, confirm the requested room is selected when it is still available and large enough.
6. On a test booking, drag its bar to an empty room/start date. Confirm its full duration moves, the success message is clear, refresh the page, and confirm the move persists.
7. Try to drop a test booking on an occupied date or a room that is too small. Confirm the move is refused and the original booking remains unchanged.
8. Confirm a multi-room booking appears on each assigned room row, opens from either bar, and asks staff to use the full booking rather than allowing an ambiguous drag.
9. At phone width/PWA, confirm the desktop sidebar is replaced by the mobile menu, the calendar fits the screen without shrinking the whole dashboard, and the timeline can be swiped horizontally. Mobile uses tap for details and empty-cell booking; drag is a laptop interaction.

## Release workflow

1. Feature branch: `feature/room-timeline-calendar-20260831`.
2. Commit the implementation, focused tests, and this checkpoint.
3. Push the branch, review the exact diff, and merge it through GitHub.
4. Pull the exact merged GitHub `main` SHA into the CatStays Replit shell.
5. Restart the CatStays runtime, republish, and verify the live asset contains the new calendar.
6. Repeat signed-in Deloraine read-only UAT on laptop and phone. Creating or dragging a real booking is reserved for the customer UAT steps above because it changes tenant records.

## Rollback

Revert the merge commit, pull the resulting GitHub `main` SHA into Replit, and republish. No schema migration is included. A booking moved during UAT is an ordinary live record change and must be moved back explicitly before or after a code rollback.
