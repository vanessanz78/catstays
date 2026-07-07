# Current Sprint

Last updated: 2026-07-08

## Goal

Stabilise the CatStays onboarding publish flow and give future Codex chats a root-level sprint entry point.

Current diagnostic branch goal: add image import observability only so the Deloraine image pipeline failure point can be identified before any behavior change.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Branch: `codex/image-import-observability`
- Base ref: latest `main` at `759dd27d0070044a0bc2a7ccdf98968ca76a0ad3`
- Review environment: Replit
- Deployment environment: Replit / CatStays app environment
- Operating system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`

## Branch / Ref Handoff Rule

- Current sprint note ref: `main`.
- Correction from 2026-07-05 review: the last known handoff before the FancyFelines work was from GitHub `main`, not a feature branch. Replit was instructed to pull `main`.
- Every future GitHub note, sprint note, decision note, PR note, and Replit handoff must include the exact working ref.
- Required wording for future notes: `Working ref: <main | branch name | commit SHA>`.
- If work is on a branch, the branch name must be visible in the note and in the Replit command.
- If work is being tested by commit SHA, the note must say it is a detached SHA test and not a durable branch.

## Current State

- CatStays uses GitHub as the durable source of truth.
- Working ref: `codex/image-import-observability`.
- The current branch is diagnostic only and must not change layout, templates, builder behavior, onboarding behavior, publish flow, FAQ logic, or image storage behavior.
- The Deloraine diagnostic run found 1 current image candidate, accepted it by current scraper URL rules, attempted no Supabase upload, created no Supabase Storage URL, and carried external URLs into builder and preview data.
- The first observed pipeline failure is Stage 3 - Upload: no Supabase Storage copy/upload stage is wired between scrape and builder data.
- Detailed handoff: `docs/codex-handoffs/2026-07-08-image-import-observability.md`.
- Project startup docs live in `docs/README.md` and `docs/project-operating-system.md`.
- On 2026-07-01, the duplicate-email publish loop was fixed in `artifacts/api-server/src/routes/cattery.ts`.
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- Duplicate email detection comes from Supabase Auth users (`auth.users` / Authentication > Users), not OAuth Apps and not the public `customers` table.
- Replit's database module may exist in the workspace, but the publish/provisioning route uses Supabase Auth and Supabase tables, not the Replit Postgres database.
- `.replit` now sets `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so confirmation URLs prefer the live app URL instead of a Replit development preview origin.
- `docs/changelog.md`, `docs/onboarding-flow.md`, and `docs/CATSTAYS_REPLIT_SECRETS.md` were updated for the publish-loop and app URL work.
- No root-level Architect Update exists yet.

## Next Actions

Diagnostic branch:

1. Review the diagnostic report in `docs/codex-handoffs/2026-07-08-image-import-observability.md`.
2. Do not implement a fix on this branch.
3. Create the smallest follow-up branch for the actual storage replacement work: `codex/image-storage-pipeline-fix`.

Previous publish-flow handoff:

1. Pull `main` into Replit and republish/restart so the Replit public app URL values are active.
2. In Supabase Authentication > Users, delete or use a different email than any existing Auth user before testing a fresh publish path.
3. UAT the Publish step with an already-registered email and confirm it stays on Publish with an inline error.
4. UAT a fresh email publish path to confirm normal provisioning still reaches Success.
5. Confirm the email confirmation redirect URL now points to the live CatStays URL. If links still open a development/auth URL, verify Supabase Auth URL Configuration and additional redirect URLs in Supabase.
6. If any other publish/provisioning error still sends users to step 1, inspect `OnboardingWizard.tsx` next.

## Decisions This Sprint

- Working ref `codex/image-import-observability` is observability-only.
- The actual image storage fix should be a separate follow-up branch after the flight recorder has been reviewed.
- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Treat Supabase Authentication > Users as the source of truth for signup email uniqueness.
- Pin Replit public app URL values to `https://catstays.app` for confirmation email redirects.
- Record the working Git ref in every future GitHub note and Replit handoff.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop fix fully verified.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.

## Local Cleanup Notes

- This diagnostic sprint used a shallow local checkout in `work/catstays`.
- Dependencies were installed temporarily with `pnpm install --frozen-lockfile --ignore-scripts` so targeted typechecks and the debug endpoint could run.
- Ignored local dependency/build artifacts should be removed before final handoff: `node_modules`, workspace package `node_modules`, `dist`, and `tsconfig.tsbuildinfo`.
- Previous 2026-07-05 document update note: no local clone, dependency install, build output, cache, or dev server was created for that document-only update.
- Previous temporary sparse checkout work for the publish-loop fix was removed before the 2026-07-05 sprint document was created.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. `docs/README.md`.
3. `docs/project-operating-system.md`.
4. `CURRENT_SPRINT.md`.
5. `DECISION_LOG.md`.

Then continue from the UAT items above and preserve the exact working ref in any new GitHub note.
