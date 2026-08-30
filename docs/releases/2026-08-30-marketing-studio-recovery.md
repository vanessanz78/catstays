# Marketing Studio recovery checkpoint — 30 August 2026

## Issue

The Marketing Studio route rendered and could download a graphic, but its tenant identity was not trustworthy. The page read a generic `localStorage.catteryData` object and otherwise fell back to a fabricated Purrfect Haven cattery. The campaign selector always offered three invented promotions, and the photo collector scanned unrelated onboarding/demo browser keys. A user could therefore create a graphic with another preview's identity or a promotion that did not exist in the signed-in cattery.

## Evidence and tenant boundary

- The live Deloraine page looked correct only because that browser still held Deloraine onboarding data; the component itself did not read `useAuth`.
- Real brand copy, colours, hero, and gallery values live in the signed-in cattery's `website_settings`.
- Real room names and capacities live in tenant-scoped `rooms` records.
- Real offers live in tenant-scoped `cattery_promotions` records and are managed from the recovered Promotions menu.
- The recovered page no longer reads `catteryData`, onboarding preview, or demo preview browser keys.
- One-off uploaded images remain local by design, but their key now includes the cattery ID so they cannot appear in another tenant's Studio on the same browser.

## Implemented workflow

1. Build all Marketing Studio identity and brand inputs from the signed-in cattery.
2. Load that cattery's active promotion records instead of hard-coded campaign names and codes.
3. Use the cattery website hero/gallery photos plus the cattery-scoped one-off upload list.
4. Pass the actual room names and capacities into the Studio data model.
5. Keep editable headlines, captions, CTA, layouts, colours, template switching, PNG export, caption copy, and device share support.
6. Replace the legacy narrow header with the same responsive staff sidebar/header pattern as the recovered dashboard modules.
7. Clearly state that one-off uploads remain in this browser while website photos and promotions come from the current account.

## Branch verification

- CatStays TypeScript check passes.
- CatStays production build passes (existing sourcemap and bundle-size warnings only).
- Git diff whitespace validation passes.
- Live UAT after publish must verify real Deloraine identity/photos, only real active promotions, editable preview controls, successful PNG generation, and 390 px no-horizontal-overflow proof.

## Release workflow

- Feature branch: `feat/marketing-studio-recovery-20260830`
- Baseline main: `d5983ab666a7c6c359da0a224f35ff84348f96f9`
- Review, merged main SHA, exact Replit sync, empty publish wrapper, and live UAT are recorded in the pull request release comment.

## Customer UAT

1. Open **Dashboard → Marketing Studio** and confirm the cattery name, location, website address, brand colours, and photos belong to the signed-in cattery.
2. Confirm the campaign dropdown contains only active offers created under **Promotions**; if there are none, it says no active promotions are saved.
3. Switch between Instagram Post, Instagram Story, Facebook Post, Review Card, Print Flyer, and Email Banner.
4. Edit the headline, subheadline, CTA, layout style, and colours and confirm the preview updates immediately.
5. Select website photos with Previous/Next and confirm an uploaded one-off photo stays associated with this cattery on this browser.
6. Copy the caption and confirm it contains this cattery's name and public CatStays URL.
7. Download a PNG and confirm its dimensions/template name match the selected format.
8. At phone width, confirm the controls and preview stack vertically without sideways page scrolling.

## Live PNG export follow-up

Live UAT found that **Download PNG** could remain busy indefinitely when a remote website image did not finish loading. The export now gives remote images a bounded five-second load window, falls back to the branded background when an image is unavailable, gives the PNG encoder a bounded timeout, attaches the download link to the page before activating it, and shows clear preparing, success, or failure status to staff.

1. Click **Download PNG** and confirm the button changes to **Preparing PNG...** only while the file is generated.
2. Confirm a PNG downloads even if the selected remote image cannot be loaded.
3. Confirm the page reports **PNG downloaded.** after success and allows another export.
