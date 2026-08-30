# Public enquiry and client login recovery — 2026-08-30

## Issue and evidence

The published Deloraine website footer offered only **Host Login**, even though cat owners have a live CatStays client portal. The visible contact form still displayed preview-only wording and its **Send enquiry** button had no live submit path. As a result, a visitor could complete the form but the cattery would receive nothing and no inbox or staff alert record would be created.

The public booking strip and booking flow were separately verified as working: all booking calls to action say **Book Now**, cat-count and date changes recalculate the GST-inclusive price, the stay counts both arrival and departure days, configured appointment times are date-aware, and top-step navigation preserves the unsent form state.

## Recovery

- Add the published cattery ID to the website template data so public enquiries are tenant-scoped.
- Wire the live contact form to the existing `/api/email/contact-enquiry` pipeline.
- Email the cattery, preserve the visitor's email as the reply address, save the enquiry in `customer_messages`, and trigger the existing staff notification path.
- Include optional phone and preferred check-in/check-out details in the enquiry.
- Replace live preview-only copy with accurate delivery guidance and show explicit sending, success, and error states.
- Keep embedded website previews non-sending and continue to show their preview notice.
- Add a clear **Client Login** link beside **Host Login** in every published template footer.
- Remove example personal details from the live enquiry fields.

## Workflow and UAT

1. Run CatStays type check and production build locally and on the exact feature commit in Replit.
2. Review and merge the branch to GitHub main.
3. Pull the exact reviewed main commit into the visible Replit Shell, rebuild, and republish.
4. Verify the live Deloraine footer opens `/client-portal` without affecting Host Login.
5. Verify the live enquiry fields are empty, required fields are labelled, optional dates and phone remain optional, and the preview-only warning is absent.
6. Do not send a live enquiry during automated UAT. Verify the submit button is wired to the form and the public API route is present; Vanessa can complete a manual delivery UAT afterward.
7. Verify embedded builder previews do not send enquiries.
8. At 390 px, confirm the contact form and both login actions fit without document overflow.
9. Check live browser warnings and errors.

Automated UAT is read-only and must not send an email, create an inbox record, or trigger a staff notification.
