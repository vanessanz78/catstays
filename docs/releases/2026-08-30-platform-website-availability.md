# CatStays checkpoint: accurate Admin website availability

Date: 2026-08-30

Branch: `fix/platform-website-availability-20260830`

## Issue and evidence

The secured CatStays Admin API was live, the Deloraine owner was correctly allow-listed as the platform owner, and the overview returned the two real catteries. However, it reported zero published websites and labelled Deloraine `Not published` while both tenant subdomains returned HTTP 200.

The mismatch came from using only `current_published_version_id` as the visible website status. Existing tenant sites are also publicly routed by their CatStays slug, including sites created before version tracking was introduced.

## Fix

- Keep the canonical published-version flag in the API for future version auditing.
- Add a separate public website availability flag that recognises a tenant slug, custom domain, or tracked published version.
- Show `Websites` and `Website available` in the Admin Panel so the operational view no longer contradicts the public tenant routes.
- Add focused server tests for subdomains, custom domains, tracked versions, and tenants with no public address.

## Verification and UAT

1. Run the focused platform route test, workspace type checks, production builds, and `git diff --check`.
2. Merge the reviewed branch into GitHub `main`.
3. Pull that exact main commit into CatStays Replit, rebuild, and republish.
4. Confirm unsigned `/api/platform/overview` still returns 401.
5. Sign in at `/platform/admin-login` with the CatStays platform-owner account.
6. Confirm the Admin summary shows two website addresses and both tenant cards show `Website available`.
7. Open each tenant website and confirm the expected subdomain returns successfully.
8. At 390px, confirm the login and Admin Panel do not scroll sideways.

The automated live check is read-only. It must not alter catteries, bookings, customers, rooms, payment settings, or authentication permissions.
