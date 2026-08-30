# Database Architecture

Last reviewed: 2026-08-31

## Canonical Architecture

[ADR-001 Open Home Content Platform](./adr/ADR-001-open-home-content-platform.md) is the frozen architecture for the Website Generation Platform. Future work should implement that ADR rather than continuing to evolve preview persistence through browser storage or `catteries.website_settings`.

## Current Supabase Tables

Checked-in migrations define:

- `catteries`
- `rooms`
- `customers`
- `cats`
- `bookings`
- `booking_cats`
- `payments`
- `expenses`

## Important Relationships

- A cattery belongs to an owner user.
- Rooms belong to a cattery.
- Customers belong to a cattery and can optionally link to an auth user.
- Cats belong to customers and catteries.
- Bookings belong to a cattery and can link to a customer and room.
- `booking_cats` links bookings to cats.
- A `rooms` row is an accommodation type. `room_count` is the number of individually bookable physical rooms represented by that type, while `capacity` is cats per physical room.
- `bookings.room_unit_number` identifies the physical room for a shared-room booking. `booking_cat_rooms.room_unit_number` preserves the exact room for each cat when a booking uses separate rooms.
- Payments and expenses belong to a cattery.

## Existing Enhancements

Later migrations add:

- Automatic cattery creation after Supabase auth signup.
- Custom domain fields.
- Stripe customer and subscription fields.
- Public booking request fields.
- Room capacity and amenities.
- Physical-room inventory and numbered booking assignments.
- Open Home Content Platform schema foundation for content sources, media library, content library, drafts, assignments, previews, published versions, and website events.

## RLS Status

RLS is enabled on the core tables. Owner access policies exist for cattery-owned data.

Areas to review before production:

- Public cattery and room read policies.
- Public booking availability reads.
- Anonymous booking inserts.
- Customer portal access by customer auth user.
- Staff access and future role permissions.

## Physical Room Invariants

- Physical room numbers are one-based and must be between 1 and the accommodation type's `room_count`.
- Operational availability is keyed by `(room_id, room_unit_number)` and inclusive date overlap.
- Public pages may group inventory by accommodation type; staff calendars and booking allocation must use physical rooms.
- Deloraine's configured inventory is 17 Private Rooms × 3 cats, 8 Indoor Rooms × 2 cats, and 25 Communal Rooms × 1 cat.

## Data Model Gaps

The product likely needs future tables for:

- Staff users and roles.
- Boarding stays.
- Check-in and checkout events.
- Care tasks.
- Feeding and medication logs.
- Photo updates.
- Customer messages.
- Domain requests.
- Audit logs.
- Subscription entitlements.

The Open Home Content Platform tables are now represented in migration `006_open_home_content_platform_schema.sql`; later phases still need RLS policies, service APIs, migration from browser storage, and event-writing behavior.

## Type Drift Risk

Frontend Supabase types should be regenerated after migrations. Current code appears to reference schema fields that may not be fully represented in checked-in TypeScript database types.
