# Current Sprint

Last updated: 2026-07-05

## Goal

Stabilise the CatStays onboarding publish flow and give future Codex chats a root-level sprint entry point.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Working ref: `codex/stable-pre-fancyfelines-main-20260705`
- App restore commit: `49fefa8b65c17f8d9dad25d9656afc98e3d4ffad`
- Restore source: GitHub `main` before the FancyFelines import/preview conversation began
- Review environment: Replit
- Deployment environment: Replit / CatStays app environment
- Operating system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Restore Point Note

This branch was created on 2026-07-05 to recover the last known GitHub `main` state before the FancyFelines-specific import/preview changes. The app code is intentionally based on commit `49fefa8`; this branch only adds durable handoff notes so future chats know the exact working ref.

Every future GitHub note and Replit handoff must include the exact working ref. Required wording: `Working ref: <main | branch name | commit SHA>`.

## Current State

- CatStays uses GitHub as the durable source of truth.
- Project startup docs live in `docs/README.md` and `docs/project-operating-system.md`.
- On 2026-07-01, the duplicate-email publish loop was fixed in `artifacts/api-server/src/routes/cattery.ts`.
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- Duplicate email detection comes from Supabase Auth users (`auth.users` / Authentication > Users), not OAuth Apps and not the public `customers` table.
- Replit's database module may exist in the workspace, but the publish/provisioning route uses Supabase Auth and Supabase tables, not the Replit Postgres database.
- `.replit` now sets `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so confirmation URLs prefer the live app URL instead of a Replit development preview origin.
- `docs/changelog.md`, `docs/onboarding-flow.md`, and `docs/CATSTAYS_REPLIT_SECRETS.md` were updated for the publish-loop and app URL work.
- No root-level Architect Update exists yet.

## Next Actions

1. Pull `codex/stable-pre-fancyfelines-main-20260705` into Replit and republish/restart so this restore branch can be tested.
2. In Supabase Authentication > Users, delete or use a different email than any existing Auth user before testing a fresh publish path.
3. UAT the Publish step with an already-registered email and confirm it stays on Publish with an inline error.
4. UAT a fresh email publish path to confirm normal provisioning still reaches Success.
5. Confirm the email confirmation redirect URL now points to the live CatStays URL. If links still open a development/auth URL, verify Supabase Auth URL Configuration and additional redirect URLs in Supabase.
6. If this restore branch is confirmed stable, use it as the clean base for rebuilding later import/preview work.

## Decisions This Sprint

- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Treat Supabase Authentication > Users as the source of truth for signup email uniqueness.
- Pin Replit public app URL values to `https://catstays.app` for confirmation email redirects.
- Use `codex/stable-pre-fancyfelines-main-20260705` as the restore branch for the pre-FancyFelines `main` state.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the original restore commit.
- Replit UAT is still required before considering this restore point stable.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.

## Local Cleanup Notes

- No local clone, dependency install, build output, cache, or dev server was created for this document update.
- This branch was created through GitHub from commit `49fefa8`.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. `docs/README.md`.
3. `docs/project-operating-system.md`.
4. `CURRENT_SPRINT.md`.
5. `DECISION_LOG.md`.

Then continue from the UAT items above and preserve the exact working ref in any new GitHub note.
