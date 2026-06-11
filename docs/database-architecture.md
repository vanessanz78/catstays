# Database Architecture

Last reviewed: 2026-06-12

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
- Payments and expenses belong to a cattery.

## Existing Enhancements

Later migrations add:

- Automatic cattery creation after Supabase auth signup.
- Custom domain fields.
- Stripe customer and subscription fields.
- Public booking request fields.
- Room capacity and amenities.

## RLS Status

RLS is enabled on the core tables. Owner access policies exist for cattery-owned data.

Areas to review before production:

- Public cattery and room read policies.
- Public booking availability reads.
- Anonymous booking inserts.
- Customer portal access by customer auth user.
- Staff access and future role permissions.

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

## Type Drift Risk

Frontend Supabase types should be regenerated after migrations. Current code appears to reference schema fields that may not be fully represented in checked-in TypeScript database types.
