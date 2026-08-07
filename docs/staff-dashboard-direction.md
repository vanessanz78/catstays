# Staff Dashboard Direction

CatStays has two intentionally separate staff dashboard surfaces.

## Demo dashboard

The demo dashboard remains a sales and product preview for visitors who want to see what CatStays looks like before signing up.

- Route: `/demo/deloraine-dashboard`
- May use sample bookings, sample customers, sample occupancy, and demo revenue
- Must not be treated as tenant data
- Must not write to tenant-owned tables

## Production tenant dashboard

The signed-up cattery dashboard uses the newer responsive dashboard shell, but it must be backed only by that tenant's own data.

- Route: `/staff-dashboard` on the tenant host, for example `https://delorainecattery.catstays.app/staff-dashboard`
- All `/staff-dashboard/*` tenant workspace routes, except `/staff-dashboard/website-editor`, render through the production `StaffDashboard` shell. Legacy admin components stay on `/admin/*` only.
- Uses the authenticated cattery context and tenant-scoped hooks
- Starts blank when the tenant has no bookings, customers, rooms, or occupancy data
- Must not contain demo names, sample revenue, sample bookings, or shared mock occupancy
- Must not read from another cattery's slug, website, bookings, rooms, or customers

## Retired direction

The earlier sparse dashboard landing page with the setup card stack is retired as the main production staff dashboard direction. Keep it in Git history only. New dashboard work should use the responsive staff workspace direction that matches the demo shell while keeping real tenant data blank/live.

## Imported media rule

Scraped website images must be persisted into CatStays-owned storage and rendered from those saved assets. Do not rely on remote source-site image URLs for long-term tenant websites because those source sites may be removed after migration.
