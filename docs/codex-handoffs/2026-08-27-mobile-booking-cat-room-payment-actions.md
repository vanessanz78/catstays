# CatStays checkpoint: mobile booking cats, rooms, and payment actions

Date: 2026-08-27

Branch: `fix/mobile-booking-cats-rooms-payments`

Base `main`: `f4234e1647c876a21e65c1be35e0919cd40799de`

Supabase project: `iwyoezwqorddkmqnjbif`

## Reported issue and evidence

Founder mobile UAT found four connected booking problems:

1. The check-in and check-out cards were nested inside another padded card, causing their weekday and date labels to wrap on a phone. The pre-populated date cards also looked like controls while the actual **Edit dates** action did not look prominent.
2. The staff flow copied every cat from the selected customer directly into the booking. There was no explicit cat-selection step and only one `bookings.room_id`, so staff could not choose which cats were staying or assign separate rooms.
3. The booking-details bottom sheet used a constrained width and height. On the installed mobile app it exposed a condensed page beneath it instead of behaving like a full-screen mobile details view.
4. The booking action area had no complete accept-and-request-payment workflow. Deloraine's saved booking rules specify a fixed `$50` deposit, but its cattery record has no customer-payment Stripe account configured. The existing payment settings screen accepts raw cattery secret keys in browser-managed settings; that pattern must not be extended.

## Implemented on this branch

- Expanded the staff flow from four steps to five: customer, dates and times, cats, accommodation, review.
- Kept check-in and check-out side by side while using the available mobile width and preventing the weekday/date label from wrapping.
- Made **Select booking dates / Edit booking dates** a full-width, high-contrast button. The displayed date cards are now summaries rather than competing controls.
- Added a settings-derived opening-hours explanation and separate bullet-style check-in/check-out summaries.
- Added explicit multi-select cat choice before accommodation.
- Added **Cats share a room** and **Own room each** choices. Shared rooms enforce cat capacity; separate rooms require one different available room per cat.
- Excluded rooms occupied by overlapping, non-cancelled bookings. Inclusive arrival and departure days are both treated as occupied care days.
- Added durable `booking_cat_rooms` rows plus `bookings.room_arrangement`, RLS, staff/customer policies, explicit grants, and per-cat room reads.
- Updated totals for either a shared rate per cat or separately priced rooms.
- Made booking details a full mobile viewport panel with internal scrolling, a sticky action area, per-cat room assignments, and a working **Confirm Booking** action.
- Removed the manual paid/pending selector from new staff bookings. Staff-created bookings start unpaid.

## Stripe decision and implementation

The founder confirmed that each cattery connects its own Stripe API keys so customer booking payments use that cattery's Stripe account rather than the CatStays subscription account.

The previous browser-to-`catteries.payment_settings` secret-key write has been removed. The replacement flow validates the supplied key pair server-side, creates a cattery-specific Stripe webhook endpoint, and stores the Stripe secret key and webhook signing secret encrypted in Supabase Vault. Browser-facing status responses contain only masked, non-secret account information. A payment request may offer:

- Deposit only, using the cattery's saved fixed or percentage deposit rule.
- Full balance only.
- Both deposit and full-balance links so the customer can choose.

- Stripe Checkout Sessions are created with the cattery's decrypted server-only credential.
- A fixed or percentage deposit is calculated from that cattery's saved booking rules. Deloraine's current rule is `$50` fixed.
- The payment email can contain deposit only, full payment only, or both choices.
- A verified cattery-specific Stripe webhook records the payment, updates the booking, closes the unused alternative link, and sends staff/customer notifications.

## Branch verification

- Focused booking, deposit-rule, and payment-email tests: 17 passed.
- Full workspace type check: passed.
- CatStays production build: passed.
- `git diff --check`: passed.

Build output retains the repository's existing source-map and large-chunk warnings; there were no build errors.

## Release workflow

1. Review this branch and its migration.
2. Push the completed branch and open a pull request.
3. Merge the reviewed branch into GitHub `main`.
4. Apply the reviewed migration to Supabase project `iwyoezwqorddkmqnjbif`.
5. Pull the exact merged `main` SHA into the CatStays Replit.
6. Restart the web and API processes, republish, and verify the deployed SHA.
7. Connect Deloraine's Stripe test keys in Payment Setup and complete the payment UAT below before using live keys.

## Mobile UAT

1. Open the installed Deloraine CatStays PWA as the cattery owner and choose **New Booking**.
2. Search for a customer. Confirm no suggestions appear before typing and matches still work by customer name, cat name, email, or phone.
3. Choose dates. Confirm check-in and check-out remain side by side on one line, **Edit booking dates** is clearly clickable, the saved opening hours appear, and the summary uses separate check-in/check-out lines.
4. Choose two or more cats explicitly. Go back and forward and confirm the selection remains saved.
5. Choose **Cats share a room**. Confirm occupied or undersized rooms cannot be selected and the total is `inclusive days x cats x daily rate`.
6. Go back and choose **Own room each**. Assign a different room to every cat. Confirm the same room cannot be assigned twice and the review shows each cat beside its room.
7. Confirm the booking. Open it from Latest Bookings and verify the full-screen details panel, dates, cats, room assignments, total, unpaid payment status, and confirmed state.
8. After the Stripe slice is complete, repeat with **Request payment** for deposit only, full balance only, and both choices. Confirm the customer receives the correct links, `$50` is used for Deloraine's deposit, successful test payments update the booking from verified webhook events, and customer/cattery notifications are delivered.

This release is not complete from a build or branch commit alone. Completion requires reviewed `main`, the exact merged SHA running in Replit, a republish, and successful signed-in mobile UAT.
