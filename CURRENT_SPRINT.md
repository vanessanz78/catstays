# Current Sprint

Last updated: 2026-08-31

## Goal

Release physical-room inventory for the Deloraine staff calendar and booking paths.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Working ref: `fix/deloraine-physical-room-inventory`
- Base `main`: `e075a3378a2bd8dae8af0e43817d1e0374c9fb59`
- Review and deployment environment: CatStays Replit
- Database project: Supabase `iwyoezwqorddkmqnjbif`
- Operating-system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Current State

- Public accommodation types remain grouped choices for customers.
- Staff operations now expand each type into numbered physical-room rows.
- Deloraine's verified inventory is Private Rooms 1–17 at three cats per room, Indoor Rooms 1–8 at two cats per room, then Communal Rooms 1–25 at one cat per room.
- Existing room assignments are deterministically backfilled to physical room 1, which keeps the Charlie, Cat, Dog private-suite booking visible in Private Room 1.
- Staff-created shared and separate-room bookings persist both the accommodation type and the physical room number.
- New public booking requests validate capacity and dates on the API server and choose the first available physical room.
- Calendar clicks carry the exact room number into New Booking; drag/drop conflict checks and moves are room-number aware.
- The Room Planner edits the number of physical rooms separately from cats-per-room capacity and reports occupancy across physical rooms.
- This sprint does not change Stripe, payment rules, the frozen Open Home ADR, or the paused Open Home phase progression.

## Verification Required Before Completion

1. Apply `supabase/migrations/20260831081500_physical_room_inventory.sql` to the CatStays Supabase project.
2. Pass focused inventory/timeline tests, CatStays and API type checks, and both production builds.
3. Review and merge the branch into GitHub `main`.
4. Pull the exact merged `main` SHA into CatStays Replit, restart, and republish.
5. Complete signed-in Runtime UAT on the Deloraine staff calendar, Room Planner, staff New Booking, and public booking request.

## Risks And Guardrails

- Do not publish code that reads the new columns before the migration is applied.
- A type row is not one physical room; `rooms.room_count` is inventory quantity and `rooms.capacity` is cats per physical room.
- Conflicts are evaluated per accommodation type plus physical room number and inclusive stay dates.
- Multi-room bookings must preserve per-cat physical room assignments.
- Runtime UAT, not a successful build or merge, is the release truth.

## Handoff

Read the standard project sequence from root `START_HERE.md`, then read this file, `DECISION_LOG.md`, and `docs/codex-handoffs/2026-08-31-physical-room-inventory.md` before continuing this sprint.
