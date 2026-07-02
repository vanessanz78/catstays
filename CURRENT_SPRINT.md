# Current Sprint

Last updated: 2026-07-02

## Goal

Stabilise CatStays onboarding publish and imported website preview quality, with FancyFelines as the current UAT example.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Branch: `main`
- Review environment: Replit
- Deployment environment: Replit / CatStays app environment
- Operating system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Current State

- CatStays uses GitHub as the durable source of truth.
- Project startup docs live in `docs/README.md` and `docs/project-operating-system.md`.
- On 2026-07-01, the duplicate-email publish loop was fixed in `artifacts/api-server/src/routes/cattery.ts`.
- On 2026-07-02, the client Publish handler was also hardened so a 409 account conflict no longer forces step 1 before the Publish-step error display can show the message.
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- Duplicate email detection comes from Supabase Auth users (`auth.users` / Authentication > Users), not OAuth Apps and not the public `customers` table.
- Replit's database module may exist in the workspace, but the publish/provisioning route uses Supabase Auth and Supabase tables, not the Replit Postgres database.
- `.replit` now sets `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so confirmation URLs prefer the live app URL instead of a Replit development preview origin.
- `docs/changelog.md`, `docs/onboarding-flow.md`, and `docs/CATSTAYS_REPLIT_SECRETS.md` were updated for the publish-loop and app URL work.
- On 2026-07-02, FancyFelines UAT showed the imported preview still using the legacy `/demo/deloraine` route, using a logo-style wordmark as hero/header imagery, showing broken image boxes, left-weighted card grids for three/two-card sections, and missing owner-site content such as grooming, Q&A, collaborations, health care, HBOT, and PEMF pages.
- The website scraper now crawls more same-origin source pages, reads sitemap links, captures supplemental page content/images, extracts Q&A page content into FAQs, and stores extra owner-site pages as source content blocks for one-page preview sections.
- Imported preview templates now filter likely logos/wordmarks out of hero, gallery, room, and service imagery. Logos can still be stored as logos, but they must not be selected as top/header photography.
- Imported preview templates now show source-page sections, include FAQs in navigation/footer/chatbot knowledge, avoid stock/filler image fallbacks, and center short card rows such as three care cards or two suite cards.
- Demo routes now support imported slugs such as `/demo/fancyfelines`, `/demo/fancyfelines/dashboard`, and `/demo/fancyfelines/client` while preserving the legacy Deloraine routes.
- The onboarding cattery setup Location field now prefers the imported full address over a city/business slug, and manual/Google address edits update the stored address as well as the visible location.
- Website builder hero edits now include the editable eyebrow text, primary/secondary CTA text and anchor links with a `None` option, and saved hero image position/zoom controls.
- Linked image URLs should be copied into CatStays-owned Supabase Storage through `/api/website/copy-image` and the `catstays-media` bucket, rather than relying on the original owner website URL long term.
- Builder edits should persist automatically through local onboarding autosave, Supabase `website_settings`, and template switches; switching templates must not overwrite owner-edited copy, images, CTA choices, or crop settings with the original import defaults.
- Website builder section controls now separate the top Why Choose story, Purpose-built accommodation/facilities, and lower Care Approach card row so those sections no longer reuse the same copy/cards.
- Purpose-built accommodation now renders as its own image/text section only. The duplicated facility/card row was removed from both the preview and builder, so `Five-star private suites`, `No communal living`, and similar cards are edited only through the Care Approach card controls.
- Website builder sections now place Suites / Boarding Options directly after the care/facilities content so the left editor follows the generated website's top-to-bottom scroll order.
- Boarding Options suite cards now stay centered for short rows and switch to a horizontal scroll rail when more than three suite cards are present.
- Suite cards now expose editable bullet points in the Website Builder, and pasted suite image URLs use the shared image copy flow before the stored URL is saved.
- Website scrape imports now attempt to copy captured owner-site image URLs into the CatStays Supabase `catstays-media` bucket before returning preview data, so gallery and section images can be stored as CatStays-owned URLs instead of long-term hotlinks.
- Gallery generation now uses real imported/stored owner-site photos only, can reuse photos that already appear elsewhere on the page, and no longer pads the gallery with stock/filler cat images.
- Owner story generation now only shows owner/team/story content when it was actually extracted or edited. It no longer falls back to the general About/business description or a stock image.
- Imported navigation menu text such as `top of page Home About...` should be stripped before it is used as section or card copy.
- Care Services now expose the `Additional Services` eyebrow, service heading, service icon, name, description, and price as editable builder fields. Service cards can be reordered from the collapsed card list, and generated previews no longer invent fallback service descriptions.
- Imported service cards should be built from real service/rates/grooming/health-care source pages. Navigation-only excerpts must be rejected rather than saved as repeated card copy.
- No root-level Architect Update exists yet.

## Next Actions

1. Pull `main` into Replit and republish/restart so the latest import and app URL changes are active.
2. UAT importing `https://fancyfelines.nz` and confirm the demo URL updates to `/demo/fancyfelines`.
3. Confirm the first cattery setup page fills Location with the imported address, for example the FancyFelines Whareora Road address, not `fancyfelines` or the business name.
4. Confirm generated previews do not use the FancyFelines logo/wordmark as hero/header photography and do not show broken image boxes.
5. Confirm the Care Approach and Boarding Options card rows are centered and responsive when there are only three or two cards, and confirm Boarding Options becomes a horizontal scroll rail when more than three suites exist.
6. Confirm Professional Cat Grooming, Q&A/FAQs, collaborations, health care, HBOT, PEMF, and other source-site pages appear as appropriate one-page sections or FAQs, and that FAQs are available to the chatbot/footer.
7. Re-run publish UAT with both existing and fresh Auth emails: existing emails should stay on Publish with an inline error; fresh emails should complete provisioning.
8. Confirm email confirmation redirect URLs still point to the live CatStays URL. If links open a development/auth URL, verify Supabase Auth URL Configuration and additional redirect URLs.
9. UAT Website Builder hero edits: edit `A home away from home`, hide one CTA using `None`, change CTA anchors, hover the hero preview image to adjust X/Y/Zoom, switch templates, and confirm the text/buttons/crop persist.
10. UAT linked image import: paste a remote image URL, confirm it is copied to a CatStays/Supabase Storage URL, and confirm publishing does not depend on the original website image URL.
11. UAT section editor order and copy: confirm Why Choose story, Purpose-built accommodation, Care Approach cards, and Boarding Options appear in the same order as the preview; Purpose-built should no longer show duplicate care-card controls; Boarding Options should expose editable bullet points.
12. UAT owner story and gallery: reimport `https://fancyfelines.nz`, confirm the owner section is either real owner/story content or hidden, and confirm the gallery uses only captured CatStays/Supabase-owned source photos with no stock/filler images.
13. UAT Care Services: confirm `Additional Services` eyebrow is editable, service icons are editable and reflected in preview, service cards can be drag-reordered, prices remain separate from descriptions, and no service description contains navigation text such as `top of page Home About...`.

## Decisions This Sprint

- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Do not call `setStep(1)` from the Publish handler for duplicate-account provisioning conflicts; keep the owner on Publish with the inline error.
- Treat Supabase Authentication > Users as the source of truth for signup email uniqueness.
- Pin Replit public app URL values to `https://catstays.app` for confirmation email redirects.
- Treat the owner website import as a source-site capture step before template generation: crawl/capture relevant pages and images, then map that indexed content into the one-page preview.
- Do not use owner logos, wordmarks, favicons, or brand-only graphics as hero/header/gallery photos in generated previews.
- When source content exceeds the default template sections, add editable one-page sections instead of dropping the content.
- Treat the imported full address as the onboarding Location value when available; do not fall back to a business name, slug, or host-derived value if an address was extracted.
- Treat linked owner-site images as temporary source URLs only. Before publish, CatStays should copy them to owned Supabase Storage and store the owned URL in builder data.
- Treat website builder fields as autosaved state. There should not be a separate Save button requirement for ordinary copy, image, CTA, or template/color edits.
- Treat visually separate page sections as separate builder data, even when they start with similar imported copy, so editing one section does not silently change another.
- Treat Purpose-built accommodation as an image/text section, not a second card grid. Card-style selling points belong under Care Approach, and suite bullet points belong under Boarding Options.
- Treat owner story content as owner-specific. Do not fill the owner section with generic About copy.
- Treat galleries as a place where previously used real photos may be reused; the no-repeat image rule is for distinct page sections, not gallery coverage.
- Do not use stock/filler photography as a fallback in generated previews. Missing or blocked images should fail neutral until real imported/uploaded images are available.
- Treat Care Services as real imported service content only. Service cards may show title/price without invented copy, but must not be filled with navigation boilerplate or generic placeholder descriptions.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop and imported-preview fixes fully verified.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.
- Some third-party websites may block images or hide content behind client-side rendering; CatStays should fail soft with captured source sections and neutral empty image areas rather than showing broken preview boxes or stock/filler photos.
- The existing Supabase Edge Function used by `ImageUpload` is not present in this repo snapshot. Replit UAT should confirm the new repository-backed `/api/website/copy-image` route is reachable in the deployed environment and that the `SUPABASE_SERVICE_ROLE_KEY` secret is available to the API server.
- If the remote image copy route is unavailable, pasted image URLs are rejected with a message to try another URL or upload a file; the builder should not silently save fragile hot-linked images.

## Local Cleanup Notes

- A temporary sparse checkout was created under the local `work/` folder for the FancyFelines import fixes.
- No dependency install, local build output, cache, or dev server was created.
- Remove the temporary sparse checkout after the GitHub commit is pushed.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. `docs/README.md`.
3. `docs/project-operating-system.md`.
4. `CURRENT_SPRINT.md`.
5. `DECISION_LOG.md`.

Then continue from the UAT items above.
