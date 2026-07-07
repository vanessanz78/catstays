# Current Sprint

Last updated: 2026-07-07

## Goal

Recover the CatStays source-of-truth builder, imported preview, image handling, and publish flow onto one explicit GitHub branch that Replit can pull for UAT.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Base branch: `main`
- Working recovery branch: `codex/catstays-source-of-truth-recovery-20260706`
- Primary recovery baseline: PR #5 / `codex/recover-import-preview-low-compute`
- Image/media recovery reference only: PR #6 / `codex/import-preview-image-recovery-20260705`
- Artifact-only reference: PR #3 / `codex/import-preview-rendering-20260703`
- Review environment: Replit
- Deployment environment: Replit / CatStays app environment
- Operating system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Branch / Ref Handoff Rule

Every GitHub note, PR, Replit handoff, and future chat handoff must name the working ref. If work is not on `main`, say the branch name every time so future chats and Replit pulls do not silently drift.

## Current State

- CatStays uses GitHub as the durable source of truth.
- The expected recovery branch `codex/catstays-source-of-truth-recovery-20260706` was not found locally or on GitHub, so it was recreated cleanly from current `main`.
- PR #5 is the primary source-of-truth recovery baseline for the current branch.
- PR #6 was reviewed as the image/media recovery reference. The compatible compact browser storage patch has been applied on this branch; the larger PR #6 rich media catalogue was not wholesale-merged because it conflicts heavily with the recovered PR #5 baseline and would reintroduce mixed branch state.
- PR #3 is treated as artifact-only context and should not be merged as a runtime baseline.
- Deloraine remains the first UAT import target. FancyFelines is a regression example for varied source websites and must not overwrite or degrade the Deloraine baseline.
- Project startup docs live in `docs/README.md` and `docs/project-operating-system.md`.
- On 2026-07-01, the duplicate-email publish loop was fixed in `artifacts/api-server/src/routes/cattery.ts`.
- On 2026-07-02, the client Publish handler was also hardened so a 409 account conflict no longer forces step 1 before the Publish-step error display can show the message.
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- On 2026-07-02 UAT with `kiaora@vanessa.nz` showed the fresh-email publish path still created a Supabase Auth user and sent the confirmation email, but returned the owner to the Account step. The latest local fix treats published-but-unconfirmed users as a Success-step checkpoint and prevents Account-step autosave from overwriting that checkpoint.
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
- Reviews now expose editable eyebrow and heading fields, keep all imported reviews instead of collapsing to one fallback testimonial, and support per-review show/hide state for website display.
- FAQ/Q&A imports now merge explicit FAQ pages, Q&A/question pages, and extracted source FAQ content; navigation boilerplate and repeated answers are rejected before FAQs are shown in the builder, website, footer, or chatbot knowledge.
- Footer quick links are editable builder data with add/delete controls and section anchor selection. Generated footer links include FAQs when FAQ content exists and render from the saved link list instead of hardcoded labels.
- Footer hours now mirror the Contact / Location hours saved in builder data, so edited operating hours can appear in both the contact section and the footer.
- On 2026-07-03, preview rendering was hardened so failed image URLs render neutral placeholders instead of browser broken-image icons, logo/wordmark candidates are rejected for hero imagery, short card rows center by default, and Care/Services/Reviews switch to horizontal rails when they have more than three cards.
- The scrape image copy pass now accepts AVIF owner-site images and attempts to copy up to 48 bounded source images into the CatStays Supabase `catstays-media` bucket before returning preview data.
- User-facing imported copy now runs through the navigation-boilerplate cleaner for hero text, headings, suites, reviews, FAQs, footer summaries, and source-site custom sections so menu text such as `top of page Home About...` is rejected before display.
- On 2026-07-04, a likely preview flicker cause was identified: freshly scraped media can render briefly, then older saved `website_settings` / preview-record data can rehydrate over it. This is a saved-state precedence issue, not evidence of two separate codebases.
- Imported source content now produces a `siteContentIndex` for searchable recall. The index is carried through the scraper result, preview import record, onboarding state, and saved Supabase `website_settings` so future templates can map captured content instead of reusing shallow homepage copy.
- The importer now stores `logoImage` separately from hero imagery and rejects a saved/restored hero image when it matches the known logo/wordmark asset. Logo files can be retained as logos, but top/header imagery must be actual photos.
- Image filtering now targets logos, wordmarks, favicons, placeholders, and known brand assets without rejecting every wide landscape photo, so legitimate cattery photos remain available for hero, suite, service, gallery, and section placement.
- On 2026-07-07, preview import record storage was compacted before browser persistence. The saved table keeps the latest 8 preview records, caps stored image/gallery arrays at 48, source-content blocks at 40, and long text at 1800 chars, falling back to compact storage when full session/local storage exceeds browser quota.
- No root-level Architect Update exists yet.

## Next Actions

1. Push `codex/catstays-source-of-truth-recovery-20260706` to GitHub and open a PR to `main` before claiming the recovery exists.
2. Pull `codex/catstays-source-of-truth-recovery-20260706` into Replit for UAT, not `main`, until the recovery PR is merged.
3. UAT Deloraine import and preview first to confirm the stable baseline is restored.
4. UAT importing `https://fancyfelines.nz` only after Deloraine is stable, then confirm the demo URL updates to `/demo/fancyfelines`.
5. Confirm the first cattery setup page fills Location with the imported address, for example the FancyFelines Whareora Road address, not `fancyfelines` or the business name.
6. Confirm generated previews do not use the FancyFelines logo/wordmark as hero/header photography, do not flash back to older saved logo imagery after loading, and do not show broken image boxes.
7. Confirm the Care Approach and Boarding Options card rows are centered and responsive when there are only three or two cards, and confirm Boarding Options becomes a horizontal scroll rail when more than three suites exist.
8. Confirm Professional Cat Grooming, Q&A/FAQs, collaborations, health care, HBOT, PEMF, and other source-site pages appear as appropriate one-page sections or FAQs, and that FAQs are available to the chatbot/footer.
9. Re-run publish UAT with both existing and fresh Auth emails: existing emails should stay on Publish with an inline error; fresh emails should complete provisioning and land on Success, not Account.
10. Confirm email confirmation redirect URLs point to `https://catstays.app/confirm-email`, not `http://localhost:3000`. If links open a development/auth URL, verify Supabase Auth URL Configuration and additional redirect URLs.
11. UAT Website Builder hero edits: edit `A home away from home`, hide one CTA using `None`, change CTA anchors, hover the hero preview image to adjust X/Y/Zoom, switch templates, and confirm the text/buttons/crop persist.
12. UAT linked image import: paste a remote image URL, confirm it is copied to a CatStays/Supabase Storage URL, and confirm publishing does not depend on the original website image URL.
13. UAT section editor order and copy: confirm Why Choose story, Purpose-built accommodation, Care Approach cards, and Boarding Options appear in the same order as the preview; Purpose-built should no longer show duplicate care-card controls; Boarding Options should expose editable bullet points.
14. UAT owner story and gallery: reimport `https://fancyfelines.nz`, confirm the owner section is either real owner/story content or hidden, and confirm the gallery uses only captured CatStays/Supabase-owned source photos with no stock/filler images.
15. UAT Care Services: confirm `Additional Services` eyebrow is editable, service icons are editable and reflected in preview, service cards can be drag-reordered, prices remain separate from descriptions, and no service description contains navigation text such as `top of page Home About...`.
16. UAT Reviews: confirm all imported source reviews appear in Website Builder, the `Reviews` eyebrow and `Trusted cat care` heading are editable, and hiding a review removes it from the website carousel without deleting it from builder data.
17. UAT FAQs: confirm Q&A/FAQ/question source pages populate the FAQ editor, footer quick links include FAQs, visible FAQs are available to the chatbot, and repeated navigation-style answers are not shown.
18. UAT Footer: add and delete a quick link, select a real page section from the dropdown, confirm the footer link anchors correctly, and confirm footer hours match the Contact / Location hours after editing.

## Decisions This Sprint

- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Record the working Git ref in every GitHub and Replit handoff, especially when using a recovery branch instead of `main`.
- Recreate the source-of-truth recovery branch from current `main`, then apply PR #5 as the primary baseline and PR #6 only for image/media recovery pieces.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Do not call `setStep(1)` from the Publish handler for duplicate-account provisioning conflicts; keep the owner on Publish with the inline error.
- Treat successful publish as the durable onboarding checkpoint even while Supabase email confirmation is pending; do not let the Account step overwrite a published Success state.
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
- Treat reviews and FAQs as editable imported content lists, not single template placeholders. Dashboard-approved reviews should eventually feed the same show/hide website display path.
- Treat footer links and footer hours as generated defaults that become saved builder state once edited; links must point to real sections and hours must mirror Contact / Location data.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop and imported-preview fixes fully verified.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.
- Some third-party websites may block images or hide content behind client-side rendering; CatStays should fail soft with captured source sections and neutral empty image areas rather than showing broken preview boxes or stock/filler photos.
- The existing Supabase Edge Function used by `ImageUpload` is not present in this repo snapshot. Replit UAT should confirm the new repository-backed `/api/website/copy-image` route is reachable in the deployed environment and that the `SUPABASE_SERVICE_ROLE_KEY` secret is available to the API server.
- If the remote image copy route is unavailable, pasted image URLs are rejected with a message to try another URL or upload a file; the builder should not silently save fragile hot-linked images.

## Local Cleanup Notes

- A temporary lightweight checkout was created at `/tmp/catstays-source-of-truth-recovery-20260706` for this recovery branch.
- No dependency install, local build output, cache, or dev server was created.
- Remove the temporary checkout after the GitHub branch is pushed and the PR exists.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. `docs/README.md`.
3. `docs/project-operating-system.md`.
4. `CURRENT_SPRINT.md`.
5. `DECISION_LOG.md`.

Then continue from the UAT items above and preserve the exact working ref in every handoff.
