# Public booking days and pricing release checkpoint

Date: 2026-08-27

Working ref: `fix/booking-flow-days-pricing-20260827`

Base ref: GitHub `main` at `858a46c1d4eb7e36494c82dd3e42272642554a84`

## Issue

The Deloraine Cattery public booking journey mixed enquiry language with a booking action, priced a stay by exclusive nights, did not multiply the estimate by the number of cats, and exposed default promises and internal workflow language that are not appropriate for customers.

## Evidence

- Founder screenshots and live-path feedback from `https://delorainecattery.catstays.app/` and `/booking-flow` on 2026-08-27.
- The public booking strip showed **Book / Enquire**.
- A 28–29 August stay displayed **1 night**, and changing the cat count did not change the total.
- The price card promised **Daily photo updates** and **All meals & fresh water included**.
- The progress pills were visual only; navigation depended on Back and Continue.
- The submitted state told customers that their request was in the cattery dashboard as pending.
- The public endpoint currently inserts `status: pending` and `payment_status: unpaid`; it does not perform an authoritative availability check or create a real customer payment session.

## Change

- Normalised the generated public-site booking CTA to **Book Now** and replaced generic enquiry prompts with booking language.
- Counts every calendar day in care, including both arrival and departure.
- Treats the configured room rate as a per-cat, per-day rate for this public flow.
- Calculates the pre-discount estimate as `daily rate × cats × inclusive days`, then applies the existing long-stay discount and GST.
- Updates the visible estimate immediately when the selected cat count or dates change.
- Uses **day/days** throughout the form, review, success screen, and request emails, with the explanatory note **includes day of arrival and day of departure**.
- Makes every progress step clickable while retaining the in-memory form entries between steps. Final submission remains disabled until all required booking data is present.
- Removes example placeholders from customer name, email, and phone fields.
- Removes the fixed deposit estimate, **Daily photo updates**, and **All meals & fresh water included** from the estimate card; the care statement is now **Twice daily feeding**.
- Replaces internal dashboard/pending copy with customer-facing request and confirmation language.
- Routes **Back to Site** to the correct public homepage for subdomain, `/site`, and dynamic-tenant routes.

## Pricing examples

- Arrival 28 August and departure 29 August = 2 chargeable days.
- Arrival 28 August and departure 3 September = 7 chargeable days.
- At $20 per cat, per day, four cats for seven days = $560 before GST, $84 GST, $644 estimated total.

## Deliberate boundary for the next product slice

This release keeps the current request-and-confirm lifecycle. It does not falsely mark a booking confirmed or display invented bank/payment information.

Automatic confirmation, customer login, and deposit/full-payment collection require a separate reviewed slice covering:

- server-side room availability and capacity enforcement, including how four cats are allocated when a room has lower capacity;
- the cattery's approved deposit rule and bank-account details;
- a real Stripe card-payment session owned by the cattery, with deposit-versus-full-payment choices;
- the approved cash wording and when payment must be cleared;
- authenticated customer ownership, tenant isolation, and access to bookings/cat profiles.

## Branch validation

- `pnpm --filter @workspace/api-server exec tsx --test ../catstays/src/app/lib/bookingPricing.test.ts` — passed (4 tests).
- `pnpm --filter @workspace/api-server exec tsx --test src/lib/bookingRequestEmails.test.ts` — passed.
- `pnpm --filter @workspace/catstays typecheck` — passed.
- `pnpm --filter @workspace/api-server typecheck` — passed.
- `pnpm --filter @workspace/catstays build` — passed. Existing Vite source-map and large-chunk warnings remain non-blocking.
- Local browser UAT — passed for 7-day inclusive display, 1-to-4-cat price recalculation, clickable step navigation, retained entered name, removed customer-detail examples, corrected care wording, and customer-facing review copy. CTA and submitted-state copy are additionally covered by branch review because local UAT did not send a real request.
- `git diff --check` — passed.

## Review and release workflow

1. Review the branch diff and GitHub checks.
2. Merge the reviewed branch into GitHub `main`.
3. Record and verify the resulting GitHub `main` commit SHA.
4. Pull that exact `main` commit into CatStays Replit.
5. Stop stale CatStays runtime processes, restart using the repository configuration, and republish.
6. Complete the customer UAT below on the published Deloraine Cattery site.

## Customer UAT

1. Open `https://delorainecattery.catstays.app/` and confirm the booking-strip button says **Book Now**, with no **Book / Enquire** label.
2. Choose arrival 28 August 2026, departure 3 September 2026, and one cat. Open the booking flow and confirm it shows **7 days — includes day of arrival and day of departure**.
3. Note the estimate, then choose two, three, and four cats. Confirm every change updates both the formula and estimated total.
4. Change the departure date and confirm the day count, subtotal, GST, and estimated total update immediately.
5. Confirm room prices and the estimate use **per cat, per day**, with no **night/nights** wording in this booking flow.
6. Confirm the care list says **Twice daily feeding** and does not promise daily photos or meals.
7. Select **Your Details** at the top. Confirm name, email, and phone are empty and contain no example people or contact details.
8. Enter a name, switch directly to **Your Cats**, then back to **Your Details** using the top steps. Confirm the entered name remains. Repeat across all four steps.
9. Complete the required details and cat names. Confirm **Review & Submit** uses days and customer-facing request language.
10. Submit one agreed live UAT request. Confirm the success screen says **Booking Request Received**, contains no internal dashboard wording, and the dashboard receives one pending request with the matching dates, cat count, and total.
11. Confirm the owner and customer emails show the same inclusive day count and estimated total.
12. Select **Back to Site** and confirm it returns to `https://delorainecattery.catstays.app/`.

## Acceptance boundary

The release is not complete merely because the branch builds or the pull request merges. Completion requires CatStays Replit to run the exact merged `main` SHA, a republish, and successful customer UAT on the live Deloraine Cattery domain.
