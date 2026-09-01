# CatStays checkpoint: dashboard priorities and compact Today overview

Date: 2026-09-01

Working ref: `refine/dashboard-priority-today-overview-20260901`

Base `main`: `6a0f3bba7b2040770a03dc55f6f9283d7d856fe6`

## Issue And Evidence

Founder phone UAT showed that the staff dashboard's first screen was dominated by separate large Today, Arrivals, Departures, and Occupied cards. The sidebar also led with View Website and placed daily operational actions among setup and administration tools.

The required daily priority is:

1. Today
2. Bookings
3. Calendar
4. Customers
5. Messages
6. Cat Updates

Room Planner and Edit Website should remain available but sit at the bottom, with Edit Website last. View Website should be a small icon beside the Dashboard and cattery identity rather than a navigation row.

## Implemented Refinement

- Reordered the shared desktop and mobile dashboard navigation into primary, secondary, and bottom groups.
- Removed View Website from the menu rows and retained its `/` tenant-domain destination in an accessible header icon.
- Put Room Planner and Edit Website in the separated bottom group.
- Shortened the Today date presentation and combined it with the three live operational metrics in one panel.
- Kept Arrivals, Departures, and Occupied in a three-column phone layout with smaller spacing and type.
- Kept New Booking prominent and preserved all existing data sources, calculations, and destinations.
- Added focused navigation-order assertions.

## Verification

- Focused dashboard navigation tests: 2 passed.
- CatStays type check: passed.
- CatStays production build: passed. Existing source-map and large-chunk warnings remain non-blocking.
- Existing physical-room inventory and staff timeline tests: 11 passed.
- Phone and laptop browser checks were attempted locally but the in-app browser's administrator-enforced security check was unavailable. Responsive visual and overflow verification remains required in Replit and founder UAT.
- `git diff --check`: passed.

## Release Workflow

1. Complete the branch verification above.
2. Push the branch and open a reviewed GitHub pull request.
3. Merge reviewed work into GitHub `main`.
4. Record and verify the exact merged `main` SHA.
5. Pull that exact SHA into CatStays Replit without overwriting unrelated runtime state.
6. Restart the configured runtime, confirm `/api/healthz`, and republish.
7. Complete signed-in founder UAT on the published Deloraine tenant dashboard.

## Founder UAT

### Phone

1. Open the Deloraine staff dashboard at phone width.
2. Confirm the header shows the cattery name with a small View Website icon and the icon opens the Deloraine public homepage.
3. Open the menu and confirm the first six actions are Today, Bookings, Calendar, Customers, Messages, and Cat Updates.
4. Confirm Room Planner is near the bottom and Edit Website is last.
5. Confirm New Booking remains prominent.
6. Confirm Today/date and the three live figures share one compact panel.
7. Confirm Arrivals, Departures, and Occupied are side by side and the Arrivals Today list begins substantially higher than in the supplied screenshot.
8. Confirm there is no horizontal scrolling.

### Laptop

1. Confirm the persistent left sidebar uses the same ordered groups.
2. Confirm the View Website icon appears beside Dashboard/cattery identity and opens the current tenant homepage.
3. Collapse and expand the sidebar and confirm navigation remains usable.
4. Confirm the Today metrics and detailed operational lists retain their live values and destinations.
5. Confirm there is no horizontal scrolling.

## Rollback Boundary

Revert the dashboard refinement merge commit, pull the resulting known-good `main` SHA into Replit, and republish. This sprint has no database migration or data mutation, so rollback is limited to the frontend and documentation commit.
