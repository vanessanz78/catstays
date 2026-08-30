# CatStays checkpoint: Deloraine physical-room inventory

Date: 2026-08-31

Working ref: `fix/deloraine-physical-room-inventory`

Base `main`: `e075a3378a2bd8dae8af0e43817d1e0374c9fb59`

Supabase project: `iwyoezwqorddkmqnjbif`

## Issue And Evidence

The live Deloraine calendar treated each accommodation type as one row. The Room Planner described Communal as capacity 25, Indoor as capacity 2, and Private as capacity 3, but the business meaning is:

- Private: 17 physical rooms, up to 3 cats in each room.
- Indoor: 8 physical rooms, up to 2 cats in each room.
- Communal: 25 physical rooms, 1 cat in each room.

Vanessa's Revelation Pets reference showed the required interaction: one visible row per real room, click an empty cell to book, click a booking to view details, and drag a stay between rooms/dates. The CatStays live popup showed Charlie, Cat, Dog in the undifferentiated **Private Suite** type; that booking must appear in **Private Room 1** after migration.

## Implemented Workflow

- Added `rooms.room_count`, `bookings.room_unit_number`, and `booking_cat_rooms.room_unit_number` with positive-range validation.
- Added the Deloraine inventory migration and deterministic legacy backfill to physical room 1.
- Expanded active accommodation types into exact physical rows, sorted Private 1–17, Indoor 1–8, Communal 1–25.
- Made calendar cells, popups, drag/drop, and booking moves carry the exact physical room number.
- Updated staff New Booking so shared-room and own-room-each choices select available physical rooms, persist those numbers, and display them in review and confirmation copy.
- Updated Room Planner so staff manage physical room quantity separately from cats-per-room capacity and see physical occupancy totals.
- Updated public booking submission so the API validates per-room capacity, checks overlapping primary and per-cat assignments, and stores the first available physical room number.
- Kept customer-facing accommodation selection grouped by type; no customer must choose from a 50-row staff inventory list.

## Branch Verification

- Focused physical-inventory and timeline tests: 11 passed.
- CatStays TypeScript check: passed.
- API TypeScript check after shared type build: passed.
- CatStays production build: passed.
- API production build: passed.
- `git diff --check`: passed.
- Existing source-map and large JavaScript chunk warnings remain; no build error was introduced.

## Release Workflow

1. Review and merge this branch into GitHub `main`.
2. Apply `supabase/migrations/20260831081500_physical_room_inventory.sql` to Supabase project `iwyoezwqorddkmqnjbif` before publishing code that reads the new columns.
3. Pull the exact merged `main` SHA into CatStays Replit without overwriting unrelated Replit state.
4. Restart the configured runtime, republish, and confirm the deployed runtime is serving that exact SHA.
5. Complete the signed-in Runtime UAT below.

## Founder UAT

### Calendar inventory

1. Open `https://delorainecattery.catstays.app/staff-dashboard/calendar` on a laptop.
2. Confirm the left dashboard navigation remains visible and the calendar scrolls inside the content area.
3. Confirm rows are ordered and named exactly Private Room 1–17, Indoor Room 1–8, then Communal Room 1–25.
4. Confirm Private rows say up to 3 cats, Indoor up to 2, and Communal 1 cat.
5. Find Charlie, Cat, Dog and confirm the booking bar is in Private Room 1.
6. Click the booking and confirm the popup says Private Room 1 and **View full booking** opens the correct booking.
7. Click an empty cell and confirm New Booking opens with that exact date and physical room preselected.
8. Drag a single-room booking to a free room/date and confirm it moves. Try an occupied room/date and confirm CatStays blocks the conflict.

### Room Planner and staff booking

1. Open **Room Planner & Pricing** and confirm totals are based on 50 physical rooms, not three accommodation types.
2. Edit each Deloraine type and confirm the separate fields show 17/3, 8/2, and 25/1 for rooms/cats per room.
3. Start New Booking, select a customer, cats, dates, and times.
4. With cats sharing, confirm the type card identifies the first available numbered room and the review shows that exact room.
5. With **Own room each**, assign a different numbered room to every cat and confirm duplicate physical-room selection is blocked.
6. Save one deliberate test booking and confirm its exact numbered room appears in Calendar and booking details.

### Public booking regression

1. Open the Deloraine public website and start **Book Now**.
2. Confirm customers still choose an accommodation type rather than one of 50 numbered staff rooms.
3. Choose dates and a valid cat count, complete the request, and confirm the pending booking appears in the first available physical room in the staff calendar.
4. Confirm a 2-cat Indoor request is allowed, a 3-cat Indoor request is rejected or unavailable, and a Communal request only accepts one cat per room.
5. Confirm inclusive-day pricing, emails, notifications, and pending status remain unchanged.

## Rollback Boundary

Revert the release commit and republish the preceding known-good `main` SHA. The migration adds nullable assignment columns and a defaulted inventory count, so existing booking records remain intact. Do not drop the columns during an urgent application rollback; schedule schema cleanup only after verifying no released code depends on them.
