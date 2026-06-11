# Booking Workflow

Last reviewed: 2026-06-12

## Public Booking Request

The current public booking flow captures:

- Check-in and check-out dates.
- Room choice.
- Customer details.
- Cat details.
- Special requirements.
- Estimated total, GST, discounts, and deposit.

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
- Stripe deposit/payment flow needs full test-mode verification.
- Owner notification and approval actions need a consistent dashboard experience.
