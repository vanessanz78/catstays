# Booking Workflow

Last reviewed: 2026-08-27

## Public Booking Request

The current public booking flow captures:

- Check-in and check-out dates.
- Room choice.
- Customer details.
- Cat details.
- Special requirements.
- An estimate based on the configured per-cat daily rate, inclusive care days, GST, and long-stay discounts.

The public flow counts both the arrival date and departure date as chargeable days. Its base estimate is `daily rate × number of cats × inclusive days` before discounts and GST.

Submitting the form posts to the API booking request endpoint. The intended result is a pending booking in Supabase plus owner and customer emails.

## Dashboard Booking Management

The staff dashboard can show bookings, customers, rooms, and booking details. Hooks exist for creating bookings and updating booking or payment status.

## Booking States

The product should use a clear booking lifecycle:

- Draft
- Pending request
- Accepted
- Deposit requested
- Deposit paid
- Confirmed
- Checked in
- Checked out
- Cancelled

The current database has booking status and payment status fields, but the UI needs a clearer approval and lifecycle workflow.

## Gaps

- Availability should be enforced server-side.
- Public booking reads should not expose sensitive booking data.
- Customer self-service edits, cancellations, and repeat bookings are not complete.
- Automatic confirmation requires authoritative server-side room availability and capacity enforcement.
- Customer login requires authenticated customer ownership and tenant-isolated booking/cat access.
- Stripe deposit/full-payment and bank-transfer flows need approved cattery payment rules and full test-mode verification before public release.
- Owner notification and approval actions need a consistent dashboard experience.
