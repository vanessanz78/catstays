# Bookings mobile menu position

## Outcome

- The mobile dashboard menu remains at the far left of the Bookings header.
- The booking-alert bell remains at the far right.
- The same order is used by the Bookings list and New Booking flow.

## Verification

- `pnpm --filter @workspace/catstays typecheck`
- `pnpm run test:staff-booking-operations` (47 passing)
- `pnpm run build`
- Phone viewport: 390 x 844, with the menu at the left edge, the alert bell at the right edge, and no horizontal overflow.
