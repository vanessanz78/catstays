# Published source website Book Now checkpoint

## Issue

After PR #14 was merged, pulled into Replit at `aa7de1001c67630f8bf4a3f35f374748d3b670a6`, and republished, the live booking flow used inclusive-day pricing correctly but the Deloraine homepage still displayed legacy booking copy from its stored source-rebuild HTML:

- `Book / Enquire`
- `Book or enquire about your cat's stay.`

The current template generator already emitted `Book Now`; the mismatch was limited to previously stored published source HTML rendered through `PublishedOriginalWebsite`.

## Evidence

- Live public URL: `https://delorainecattery.catstays.app/`
- Live booking URL: `https://delorainecattery.catstays.app/booking-flow?checkIn=2026-08-28&checkOut=2026-09-03&cats=4`
- The booking flow showed 7 inclusive days and `$644.00` including GST for 4 cats at `$20` per cat per day.
- The homepage still exposed the legacy two phrases above after the first production promotion completed.

## Fix

- Normalize the two legacy booking phrases when stored source-rebuild HTML is selected for public rendering.
- Preserve all unrelated imported website content unchanged.
- Add regression coverage for stored source HTML, direct normalization, and unrelated content.

## Release workflow

1. Create `fix/published-source-book-now` from GitHub `main`.
2. Commit this fix and checkpoint.
3. Run the focused regression test, CatStays typecheck, and CatStays production build.
4. Push and merge the reviewed branch into GitHub `main`.
5. Pull the exact resulting `main` commit into CatStays Replit.
6. Republish and verify the public homepage and booking flow.

## Customer UAT

1. Open `https://delorainecattery.catstays.app/` in a private/incognito window.
2. Confirm the booking panel says `Book Now`, not `Book / Enquire`.
3. Confirm the supporting line says `Book your cat's stay.` and contains no enquiry wording.
4. Enter dates spanning 28 August through 3 September and select 4 cats.
5. Confirm the booking flow shows 7 days, explains that arrival and departure are included, and estimates `$644.00` including GST.
