# Current Sprint

Last updated: 2026-09-01

## Goal

Make the CatStays staff dashboard faster to scan by prioritising daily operational navigation and compressing the phone Today overview.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Working ref: `refine/dashboard-priority-today-overview-20260901`
- Base `main`: `6a0f3bba7b2040770a03dc55f6f9283d7d856fe6`
- Review and deployment environment: CatStays Replit
- Operating-system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Current State

- The physical-room inventory work from PR #48 is merged into the base `main` commit and remains unchanged by this sprint.
- The primary dashboard navigation order is Today, Bookings, Calendar, Customers, Messages, then Cat Updates.
- View Website is no longer a sidebar row. It is a compact, accessible external-link action beside the Dashboard/cattery identity.
- Room Planner and Edit Website are separated into the lowest-priority bottom navigation group, with Edit Website last.
- The phone Today overview keeps New Booking prominent but combines the date, arrivals, departures, and occupancy into one compact panel.
- Arrivals, Departures, and Occupied remain visible side by side at phone width so the operational lists begin higher on the first page.
- This sprint does not change tenant data, authentication, booking logic, calendar logic, room inventory, Supabase, payments, or the frozen Open Home architecture.

## Verification Required Before Completion

1. Pass the focused navigation-order tests.
2. Pass the CatStays type check and production build.
3. Pass relevant existing staff-dashboard and room-inventory tests.
4. Verify the dashboard at phone and laptop widths, including no horizontal overflow.
5. Review and merge the branch into GitHub `main`.
6. Pull the exact merged `main` SHA into CatStays Replit, restart, republish, and confirm runtime health before signed-in UAT.
7. Complete founder UAT on the Deloraine staff dashboard navigation, View Website action, and Today overview.

## Risks And Guardrails

- Keep all existing dashboard destinations available; this sprint changes priority and presentation only.
- The View Website icon must still open `/` on the current tenant domain.
- The compact Today metrics must preserve their existing live calculations and Room Planner destination.
- Runtime UAT, not a successful build or merge, is the release truth.

## Handoff

Read the standard project sequence from root `START_HERE.md`, then read this file, `DECISION_LOG.md`, and `docs/codex-handoffs/2026-09-01-dashboard-priority-today-overview.md` before continuing this sprint.
