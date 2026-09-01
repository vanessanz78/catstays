# Phone booking review checkpoint — 1 September 2026

## Issue

The staff booking sheet was a long sequence of cards on a phone. Its Close and Confirm Booking controls were fixed to the bottom of the viewport, covering the booking content while staff scrolled. Customer contact details, cats, dates, times, and accommodation were also separated into several cards, making a quick phone review slower than the existing operational workflow.

## Implemented workflow

1. Put the customer name at the top of the booking and keep email and phone collapsed until requested.
2. Make the saved email and phone direct tap targets using the device email and phone actions.
3. Itemize every cat in the booking with its From date, To date, check-in and check-out times, accommodation, and explicit Sharing Yes/No state.
4. Show **Time not recorded** for an older booking that has no saved visit time instead of silently omitting it.
5. Keep Total, Paid, and Owing or Credit visible with the essential stay details.
6. Put Close and Confirm booking inside a normal **Review this booking** card in the scrollable content and remove the fixed bottom action bar.
7. Collapse notes, confirmation email, payments, adjustments, and cancellation tools under **More booking tools and payments** so they remain available without making the initial review unnecessarily long.
8. Derive room sharing safely for current shared/separate bookings and older bookings with only room assignments or a primary room.

## Branch verification

- Feature branch: `refine/phone-booking-review-20260901`.
- Baseline GitHub `main`: `678e4ae7dfe09907aaec457f25150e6c5c733369`.
- Staff booking operations tests: 47/47 passed.
- Physical room inventory tests: 13/13 passed.
- CatStays TypeScript check: passed.
- Production build: passed; existing source-map and bundle-size warnings only.
- No database migration is included.

## Runtime UAT

1. At a 390 px phone viewport, open a pending Deloraine booking.
2. Confirm the page itself has no horizontal overflow and the booking sheet scrolls normally.
3. Confirm the customer name is immediately visible and email/phone are initially collapsed.
4. Expand the customer section and confirm the email link uses `mailto:` and the phone link uses `tel:`.
5. Confirm every cat is itemized with From, To, visit times, room, and Sharing Yes/No.
6. Confirm an older booking without saved times says **Time not recorded**.
7. Confirm Close and Confirm booking are part of the booking content and do not stay fixed while the sheet scrolls.
8. Confirm **More booking tools and payments** is collapsed initially and expands to the existing operational tools.
9. Repeat the read-only layout checks at a laptop viewport and inspect browser errors.

Do not press Confirm booking, send a confirmation, record a payment, cancel, delete, or otherwise change a live Deloraine booking during automated UAT.

## Release workflow

1. Push and review the feature branch, then merge it through GitHub.
2. In the visible CatStays Replit Shell, fetch the exact merged GitHub `main` SHA and check it out with a clean working tree.
3. Run the focused tests and production build against that exact SHA.
4. Publish from Replit without using any Replit Agent.
5. Verify the published asset and repeat the signed-in Deloraine phone and laptop UAT above.

## Rollback

Revert the merge commit, bring the resulting exact GitHub `main` SHA into the Replit Shell, rebuild, and republish. No data rollback is required because this release contains no schema or booking-record migration.
