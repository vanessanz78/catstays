# Current Sprint

Last updated: 2026-07-05

## Goal

Stabilise the CatStays onboarding publish flow and give future Codex chats a root-level sprint entry point.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Active recovery branch: `codex/import-preview-image-recovery-20260705`
- Recovery base branch: `codex/import-preview-rendering-20260703`
- Previous stable reference: `codex/media-library-preview-images`
- Review environment: Replit
- Deployment environment: Replit / CatStays app environment
- Operating system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Current State

- CatStays uses GitHub as the durable source of truth.
- On 2026-07-05, preview image recovery moved onto branch `codex/import-preview-image-recovery-20260705` from `codex/import-preview-rendering-20260703`.
- The recovery branch restores the media catalogue and preview image selection logic from `codex/media-library-preview-images` without bringing back the later FancyFelines placeholder/regression state.
- The restored importer indexes source-site media assets with category, alt/title/nearby-text context, logo/text-heavy/decorative flags, and section scoring so templates can choose real imported photos more reliably.
- Preview template selection now avoids logo/text-heavy/decorative images, avoids reusing the same source photo across normal sections, and avoids generic placeholder fallbacks for real imported sites when source images are missing.
- Browser preview storage now writes full import payloads to session storage first and falls back to compact local storage records if the browser quota is exceeded, preventing the `catstays_preview_import_table` quota crash seen in Replit.
- No GitHub implementation was found for durable source-site image download, resize, and Supabase storage during this recovery pass; that remains a separate follow-up if required.
- Project startup docs live in `docs/README.md` and `docs/project-operating-system.md`.
- On 2026-07-01, the duplicate-email publish loop was fixed in `artifacts/api-server/src/routes/cattery.ts`.
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- Duplicate email detection comes from Supabase Auth users (`auth.users` / Authentication > Users), not OAuth Apps and not the public `customers` table.
- Replit's database module may exist in the workspace, but the publish/provisioning route uses Supabase Auth and Supabase tables, not the Replit Postgres database.
- `.replit` now sets `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so confirmation URLs prefer the live app URL instead of a Replit development preview origin.
- `docs/changelog.md`, `docs/onboarding-flow.md`, and `docs/CATSTAYS_REPLIT_SECRETS.md` were updated for the publish-loop and app URL work.
- No root-level Architect Update exists yet.

## Next Actions

1. Pull `codex/import-preview-image-recovery-20260705` into Replit and restart the preview.
2. If Replit still shows the old quota error, clear browser site data for the Replit preview once so stale oversized local storage is removed.
3. UAT Generate Preview for Deloraine and confirm real imported source images render instead of generic placeholder photos.
4. Confirm hero images do not use logos or images containing visible words.
5. Confirm normal page sections do not reuse the same source photo twice, while gallery behavior can be adjusted separately if the product wants repeats there.
6. Confirm the Publish step still stays on Publish with an inline error for already-registered Supabase Auth emails and reaches Success for a fresh email.

## Decisions This Sprint

- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Treat Supabase Authentication > Users as the source of truth for signup email uniqueness.
- Pin Replit public app URL values to `https://catstays.app` for confirmation email redirects.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop fix fully verified.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.

## Local Cleanup Notes

- No local clone, dependency install, build output, cache, or dev server was created for this document update.
- Previous temporary sparse checkout work for the publish-loop fix was removed before this sprint document was created.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. `docs/README.md`.
3. `docs/project-operating-system.md`.
4. `CURRENT_SPRINT.md`.
5. `DECISION_LOG.md`.

Then continue from the UAT items above.
