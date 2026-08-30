# Cat Updates recovery — 30 August 2026

## Issue

The staff navigation advertised Cat Updates but marked it as `Soon`. The tenant route was captured by the generic staff dashboard and showed a coming-soon panel. Separate legacy Cat Update and Photo Update screens were demonstrations: they hard-coded cats, owners, rooms and contact details; invented “luxury”, meals and care claims; simulated email, SMS and social posting; and created fake `catstays.com` links. The client portal did not read real updates.

This contradicted the cattery's operating requirement: staff share photos only when they choose, write the factual update themselves, and send it privately to the customer connected to the booked cat.

## Evidence before the fix

- `RightMenu.tsx` added a `Soon` badge to Cat Updates.
- `/staff-dashboard/cat-update-generator` was included in both generic `StaffDashboard` route arrays.
- `CatUpdateGenerator.tsx`, `PhotoUpdates.tsx` and `UpdatePage.tsx` used demonstration names, contact details, photos, captions and success messages.
- The application had a branded `customerPhotoUpdateHtml` template and customer notification service, but no route used them.
- There was no tenant-scoped cat-update record or private photo bucket for staff/customer history.

## Recovery

- Added `cat_updates`, scoped by cattery, booking, customer and cat, with factual caption, private storage reference, delivery status, email audit fields and timestamps.
- Added a private `cat-update-photos` bucket limited to JPG, PNG and WebP images up to 8 MB.
- Added staff-only upload/read/delete storage policies and customer read access only when the stored object belongs to their own update.
- Added tenant row-level security: cattery staff manage updates; authenticated customers read only their own updates; anonymous users have no access.
- Replaced the staff demonstration with a responsive workflow using real bookings, linked cats, customers and assigned rooms.
- Added image validation, private upload, server-side booking/customer/cat validation, durable update history, branded email delivery and the existing native/in-app customer notification service.
- Added real photo updates to the signed-in client portal with fresh private signed image URLs.
- Routed both `/staff-dashboard/cat-update-generator` and legacy admin photo-update destinations to the real workspace, and routed the old public update demonstration to the secure client portal.
- Removed the Cat Updates `Soon` badge and all generated/demo claims from the active workflow. CatStays does not promise daily photos or pretend to auto-post updates to social media.

## Security and failure behaviour

- A staff bearer session and cattery-management permission are required before a delivery is accepted.
- The API verifies the booking, customer and cat relationship, rejects cancelled bookings, verifies the uploaded object, and caps captions at 2,000 characters.
- Photos are never public. Email image links expire, while the customer portal requests a fresh signed link after authentication.
- If email delivery fails after the record is saved, the update remains visible in the client portal and history is marked `failed`; the staff member receives a truthful partial-delivery message instead of a false success.
- If validation fails before the update is saved, the app removes the just-uploaded object.

## Release workflow

1. Branch from the exact Promotions/Social GitHub `main` SHA.
2. Add implementation, migration, tests and this durable checkpoint.
3. Run focused tests, API and app typechecks, API and app builds, and phone-width browser UAT.
4. Push the branch and open a reviewed pull request.
5. Merge the reviewed branch into GitHub `main`.
6. Apply the committed idempotent migration to the CatStays Supabase project.
7. Pull the exact merged `main` SHA into CatStays Replit, rerun verification, republish and UAT the live Deloraine tenant.

## Automated and local UAT evidence

- Six focused tests pass for caption cleanup, safe filenames, supported files, 8 MB limits, real booking-cat selection/ordering, cancelled/unlinked exclusion, and escaped branded photo email output.
- API server TypeScript check and production build pass.
- CatStays TypeScript check and production build pass; only the repository's existing sourcemap and large-chunk warnings remain.
- At a 390px viewport, Cat Updates renders the full staff workflow without an error and `innerWidth`, document client width, document scroll width and body scroll width all equal `390px`.
- At the same 390px viewport, the client portal sign-in renders without an error and all four width measurements equal `390px`.
- No live photo, email, notification or customer record was created during branch UAT.

## Customer UAT after publish

1. Sign in to the Deloraine staff dashboard and open **Cat Updates**. Confirm there is no `Soon` badge or coming-soon page.
2. Confirm the cat selector uses the real cat, owner, stay dates and assigned room from Bookings. Cancelled bookings must not appear.
3. Choose a non-sensitive UAT photo smaller than 8 MB and type a factual test update. Confirm the photo preview and character count, then send it only when it is safe to notify the selected customer.
4. Confirm the success message says whether email was sent and that the update appears once in **Update history** with the correct cat, customer, photo, caption, time and delivery status.
5. Sign in as that cat owner at **Client portal**. Confirm the same private photo and caption appear under **Photo updates**, and no other customer's updates are visible.
6. If phone alerts are enabled for the client account, close the PWA before the staff send and confirm the notification opens the client portal.
7. On a phone, confirm the selector, photo control, message and Send button remain full width, readable and free of sideways scrolling.

## Rollback boundary

The application feature can be rolled back by reverting its release commit. The new table and private bucket are additive and tenant-scoped; leaving them preserves already-sent customer history. Removing either would destroy update records or photos and requires a separate reviewed destructive migration.
