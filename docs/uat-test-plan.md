# UAT Test Plan

Last reviewed: 2026-06-12

## Purpose

Use this checklist after publishing CatStays from Replit. The goal is to find broken journeys, confusing wording, dead ends, missing data, mobile layout issues, and anything that does not feel intuitive for a cattery owner or customer.

## Before Testing

- Confirm Replit is aligned with GitHub.
- Publish the latest Replit build.
- Open the published URL in a normal browser tab.
- Test once on desktop or laptop.
- Test once on a phone-sized viewport or real phone.
- Note the exact page, button, and what happened for every issue.

## Pass 1: Public Marketing Site

Test:

- Homepage loads without blank sections or visible errors.
- Navigation links work.
- Primary call to action is clear.
- Website URL input is obvious and usable.
- "No website" path is easy to find.
- Pricing shows Starter $49, Professional $79, Premium $99.
- No "book demo" or sales-call wording appears.
- Images feel relevant to premium cat boarding.
- Buttons have readable contrast.
- The page feels cats-only, not generic SaaS or dog/pet software.

Pass condition:

- A new cattery owner understands what CatStays is within 10 seconds.

## Pass 2: Website Import Preview

Test:

- Enter `delorainecattery.com`.
- Generate preview.
- Preview renders in the available area.
- Preview is not oversized or cut off.
- Preview is scrollable if needed.
- There is a clear next step after preview.
- No broken images or placeholder blocks appear.

Pass condition:

- The owner can see a believable preview and knows how to continue.

## Pass 3: Start From Scratch Onboarding

Test:

- Start without a website URL.
- Create account details.
- Confirm the trial wording is clear.
- Continue through cattery setup.
- Address lookup works.
- Contact details carry forward where expected.
- Template cards look premium and are easy to choose.
- Website builder is readable and usable.
- Booking setup is understandable.
- Plan selection uses correct pricing and feature differences.
- Publish step is clear.
- Success page has an obvious next action.
- Data import step has a continue or skip path.

Pass condition:

- A non-technical cattery owner can complete setup without getting stuck.

## Pass 4: Staff Dashboard

Test:

- Staff dashboard opens after setup.
- Menu opens and closes.
- Dashboard is readable on laptop.
- Dashboard is readable on phone.
- Bookings page loads.
- Customers page loads.
- Calendar page loads.
- Room planner loads.
- Payment setup loads.
- Website editor loads.
- Subscription page loads.
- No menu item leads to a blank or confusing dead end.
- Scroll works on every dashboard section.
- Colours stay within the CatStays palette.

Pass condition:

- A cattery owner can find bookings, customers, rooms, payments, and website settings without confusion.

## Pass 5: Public Booking Flow

Test:

- Open the public cattery website.
- Start a booking.
- Choose dates.
- Choose a room.
- Enter customer details.
- Enter cat details.
- Review booking summary.
- Submit booking request.
- Confirmation message appears.
- Owner dashboard shows or can receive the request.
- Customer and owner email behaviour is noted.

Pass condition:

- A customer can submit a booking request and the cattery owner can act on it.

## Pass 6: Customer Portal

Test:

- Customer portal opens.
- Booking list is understandable.
- Customer profile page is understandable.
- Cat profile area is easy to find.
- Photo/update area is clear if present.
- No customer sees another cattery's data.
- No obvious demo names remain in production-facing areas unless intentionally seeded.

Pass condition:

- A customer understands where to manage bookings, cats, invoices, and updates.

## Pass 7: Mobile Usability

Test on phone-sized screen:

- Homepage CTA is visible without awkward scrolling.
- Onboarding fields are easy to type into.
- Template cards are readable.
- Website preview is not crushed.
- Staff dashboard works as a mobile dashboard.
- Navigation does not cover content.
- Buttons are easy to tap.
- No text is cut off or overlapping.

Pass condition:

- The cattery owner can run core tasks from a phone.

## Pass 8: Error And Edge Cases

Test:

- Empty website URL.
- Invalid website URL.
- Missing required onboarding fields.
- Duplicate or awkward cattery slug.
- Refresh during onboarding.
- Browser back button during onboarding.
- Booking form missing required fields.
- Network/API failure messages are understandable.

Pass condition:

- Errors are calm, clear, and recoverable.

## Record Issues Like This

For each issue, record:

- Page:
- Device:
- What you clicked:
- What you expected:
- What happened:
- Screenshot if useful:
- Severity: blocker, high, medium, low

## UAT Priority

Fix blockers first:

1. Cannot publish or open site.
2. Cannot complete onboarding.
3. Cannot submit booking.
4. Dashboard cannot open.
5. Customer data appears unsafe or crossed between tenants.
6. Mobile dashboard is unusable.

Then fix high-friction issues:

1. Confusing wording.
2. Bad contrast.
3. Oversized previews.
4. Awkward scroll.
5. Broken or placeholder imagery.
6. Demo data in the wrong place.
