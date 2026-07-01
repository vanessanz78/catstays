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
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- Duplicate email detection comes from Supabase Auth users (`auth.users` / Authentication > Users), not OAuth Apps and not the public `customers` table.
- Replit's database module may exist in the workspace, but the publish/provisioning route uses Supabase Auth and Supabase tables, not the Replit Postgres database.
- `.replit` now sets `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so confirmation URLs prefer the live app URL instead of a Replit development preview origin.
- `docs/changelog.md`, `docs/onboarding-flow.md`, and `docs/CATSTAYS_REPLIT_SECRETS.md` were updated for the publish-loop and app URL work.
- On 2026-07-02, FancyFelines UAT showed the imported preview still using the legacy `/demo/deloraine` route, using a logo-style wordmark as hero/header imagery, showing broken image boxes, left-weighted card grids for three/two-card sections, and missing owner-site content such as grooming, Q&A, collaborations, health care, HBOT, and PEMF pages.
- The website scraper now crawls more same-origin source pages, reads sitemap links, captures supplemental page content/images, extracts Q&A page content into FAQs, and stores extra owner-site pages as source content blocks for one-page preview sections.
- Imported preview templates now filter likely logos/wordmarks out of hero, gallery, room, and service imagery. Logos can still be stored as logos, but they must not be selected as top/header photography.
- Imported preview templates now show source-page sections, include FAQs in navigation/footer/chatbot knowledge, use fallback imagery for broken source images, and center short card rows such as three care cards or two suite cards.
- Demo routes now support imported slugs such as `/demo/fancyfelines`, `/demo/fancyfelines/dashboard`, and `/demo/fancyfelines/client` while preserving the legacy Deloraine routes.
- The onboarding cattery setup Location field now prefers the imported full address over a city/business slug, and manual/Google address edits update the stored address as well as the visible location.
- No root-level Architect Update exists yet.

## Next Actions

1. Pull `main` into Replit and republish/restart so the latest import and app URL changes are active.
2. UAT importing `https://fancyfelines.nz` and confirm the demo URL updates to `/demo/fancyfelines`.
3. Confirm the first cattery setup page fills Location with the imported address, for example the FancyFelines Whareora Road address, not `fancyfelines` or the business name.
4. Confirm generated previews do not use the FancyFelines logo/wordmark as hero/header photography and do not show broken image boxes.
5. Confirm the Care Approach and Boarding Options card rows are centered and responsive when there are only three or two cards.
6. Confirm Professional Cat Grooming, Q&A/FAQs, collaborations, health care, HBOT, PEMF, and other source-site pages appear as appropriate one-page sections or FAQs, and that FAQs are available to the chatbot/footer.
7. Re-run publish UAT with both existing and fresh Auth emails: existing emails should stay on Publish with an inline error; fresh emails should complete provisioning.
8. Confirm email confirmation redirect URLs still point to the live CatStays URL. If links open a development/auth URL, verify Supabase Auth URL Configuration and additional redirect URLs.

## Decisions This Sprint

- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Treat Supabase Authentication > Users as the source of truth for signup email uniqueness.
- Pin Replit public app URL values to `https://catstays.app` for confirmation email redirects.
- Treat the owner website import as a source-site capture step before template generation: crawl/capture relevant pages and images, then map that indexed content into the one-page preview.
- Do not use owner logos, wordmarks, favicons, or brand-only graphics as hero/header/gallery photos in generated previews.
- When source content exceeds the default template sections, add editable one-page sections instead of dropping the content.
- Treat the imported full address as the onboarding Location value when available; do not fall back to a business name, slug, or host-derived value if an address was extracted.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop and imported-preview fixes fully verified.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.
- Some third-party websites may block images or hide content behind client-side rendering; CatStays should fail soft with captured source sections and safe image fallbacks rather than showing broken preview boxes.

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
