# Dashboard responsive shell and Room Planner checkpoint

## Issue

At laptop width, `/staff-dashboard/bookings` used the standalone Bookings page instead of the responsive staff workspace shell. The page therefore showed the mobile hamburger control on the right and omitted the persistent left dashboard navigation. The same shell inconsistency affected the new-booking view and phone-notification settings.

The staff Room Planner displayed live occupancy data, but its `Manage rooms & pricing` action linked to Booking Setup rather than providing room management. Staff could not add a room or change a room's name, type, capacity, daily rate, description, or active status from the Room Planner.

## Evidence and root cause

- GitHub `main` before this branch: `3c50e79fe543917ccbd6f47715e1d19b4f7feba0`.
- Live laptop evidence supplied by the customer showed Bookings with a right-aligned hamburger and no left sidebar.
- `StaffDashboard` already used the intended `lg:flex` shell with `RightMenu mode="sidebar"`, but `AdminBookings` had two standalone page roots that rendered only `RightMenu` button mode.
- The mobile menu button had no internal desktop visibility guard, allowing standalone pages to expose it at laptop width.
- `RoomPlannerSection` rendered real rooms and bookings from `useRooms`/`useBookings`, but did not receive or call the room mutation functions already present in `useRooms`.

## Change

- Added the persistent staff sidebar to both Bookings modes: booking list and full-screen new booking.
- Added the persistent staff sidebar to phone-notification settings.
- Kept the mobile hamburger and left drawer below the laptop breakpoint, and hid the trigger/drawer defensively at laptop widths.
- Removed the closed mobile drawer from the page accessibility tree so hidden links cannot receive focus.
- Added Room Planner controls for:
  - Add room.
  - Edit room name, type, optional description, cat capacity, and daily rate per cat.
  - Activate or deactivate a room.
  - Prevent deactivation while the room is occupied.
- Scoped room updates and deletions by both room ID and the signed-in cattery ID.
- Kept the existing calendar behaviour unchanged. Detailed drag-and-drop calendar rules are intentionally deferred until the customer's follow-up.

## Verification

- `pnpm --filter @workspace/catstays typecheck` — passed.
- `pnpm --filter @workspace/catstays build` — passed.
- `tsx --test artifacts/catstays/src/app/lib/*.test.ts` — 43 tests passed.
- Browser UAT at 1440 × 900:
  - Bookings list shows the left sidebar.
  - New Booking shows the left sidebar.
  - Phone notifications shows the left sidebar.
  - Mobile menu trigger is hidden.
  - Document width equals viewport width (1440px; no horizontal overflow).
- Browser UAT at 390 × 844:
  - Desktop sidebar is hidden.
  - Mobile menu trigger is visible.
  - Menu opens, shows `View Website`, and closes using its close button.
  - Document width equals viewport width (390px; no horizontal overflow).

## Customer UAT

1. On a laptop, open Deloraine Cattery → Staff Dashboard → Bookings. Confirm the left dashboard menu is visible and there is no hamburger menu at the upper right.
2. Select `New Booking`. Confirm the new-booking steps remain full width beside the left dashboard menu and all existing booking actions still work.
3. Open Settings → Phone notification settings. Confirm the same left dashboard menu remains visible.
4. Resize to a phone width or open the installed PWA. Confirm the left sidebar disappears and the hamburger opens a left-side menu with `View Website` first.
5. Open Room Planner. Confirm the live room cards and occupancy states load.
6. Select `Edit room` on one room, change a harmless field, save, refresh, and confirm the change persists.
7. Select `Add room`, enter its room name, room type, cat capacity, and daily rate, then save and confirm the new room appears.
8. Activate/deactivate an unoccupied test room and confirm its availability status changes. Confirm an occupied room's Deactivate control is disabled.
9. Open Calendar and confirm its existing month navigation and booking links still work. Drag-and-drop behaviour is outside this checkpoint and awaits the next calendar specification.

## Release workflow

1. Feature branch: `fix/dashboard-responsive-room-planner-20260830`.
2. Run type checking, production build, unit tests, and responsive browser UAT on the branch.
3. Push the branch and open a reviewed GitHub pull request.
4. Merge the reviewed pull request into GitHub `main`.
5. Pull the exact merged `main` commit into the CatStays Replit shell.
6. Republish CatStays.
7. Verify the deployed assets and repeat the laptop/phone customer UAT above.

## Rollback

Revert the merge commit for this pull request, pull the resulting GitHub `main` commit into Replit, and republish. Room records are not migrated by this change; rooms saved during UAT remain ordinary tenant-owned records and can be deactivated from Room Planner.
