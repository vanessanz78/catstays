# Current Sprint

Last updated: 2026-07-08

## Goal

Align CatStays startup and governance documentation with the latest central Codex Operating System before any further feature work.

Previous product goal still pending UAT: stabilise the CatStays onboarding publish flow and give future Codex chats a root-level sprint entry point.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Branch: `codex/align-operating-system-docs`
- Base branch: `main`
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
- Working ref: `codex/align-operating-system-docs`.
- Central Codex Operating System governs all future CatStays Codex sessions.
- Every future Codex session must read central `START_HERE.md` before doing anything else, then follow the central Operating System for reading order, branch governance, engineering standards, architecture principles, milestone workflow, build verification, UAT requirements, cleanup procedures, and handoff requirements.
- CatStays project startup context lives in root `README.md`, `docs/README.md`, `docs/project-operating-system.md`, this sprint file, and `DECISION_LOG.md`.
- CatStays docs should preserve project-specific context and should not duplicate the central Operating System.
- On 2026-07-01, the duplicate-email publish loop was fixed in `artifacts/api-server/src/routes/cattery.ts`.
- The fix changes duplicate signup/provisioning email errors so the Publish step can show an inline error instead of sending the user back to step 1.
- Duplicate email detection comes from Supabase Auth users (`auth.users` / Authentication > Users), not OAuth Apps and not the public `customers` table.
- Replit's database module may exist in the workspace, but the publish/provisioning route uses Supabase Auth and Supabase tables, not the Replit Postgres database.
- `.replit` now sets `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so confirmation URLs prefer the live app URL instead of a Replit development preview origin.
- `docs/changelog.md`, `docs/onboarding-flow.md`, and `docs/CATSTAYS_REPLIT_SECRETS.md` were updated for the publish-loop and app URL work.
- No root-level Architect Update exists yet.

## Next Actions

1. Review and merge the governance-only documentation branch if the central Operating System alignment is accepted.
2. After merge, all future feature branches should begin with the central Operating System startup sequence.
3. Pull `main` into Replit and republish/restart so the Replit public app URL values are active.
4. In Supabase Authentication > Users, delete or use a different email than any existing Auth user before testing a fresh publish path.
5. UAT the Publish step with an already-registered email and confirm it stays on Publish with an inline error.
6. UAT a fresh email publish path to confirm normal provisioning still reaches Success.
7. Confirm the email confirmation redirect URL now points to the live CatStays URL. If links still open a development/auth URL, verify Supabase Auth URL Configuration and additional redirect URLs in Supabase.
8. If any other publish/provisioning error still sends users to step 1, inspect `OnboardingWizard.tsx` next.

## Decisions This Sprint

- Govern CatStays Codex sessions through the central Codex Operating System instead of maintaining duplicated local workflow instructions.
- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.
- Treat Supabase Authentication > Users as the source of truth for signup email uniqueness.
- Pin Replit public app URL values to `https://catstays.app` for confirmation email redirects.
- Record the working Git ref in every future GitHub note and Replit handoff.

## Risks Or Blockers

- This branch is documentation and repository governance only. It does not change runtime behaviour.
- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop fix fully verified.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.

## Local Cleanup Notes

- No dependency install, build output, cache, or dev server is required for this documentation-only governance update.
- Local work for this branch is limited to the existing CatStays checkout.
- Previous temporary sparse checkout work for the publish-loop fix was removed before this sprint document was created.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. The remaining central Operating System files required by `START_HERE.md`.
3. `CURRENT_SPRINT.md`.
4. The latest root-level Architect Update, if one exists.
5. `DECISION_LOG.md`.
6. Any files explicitly referenced by the sprint or decision documents, including `docs/README.md` and `docs/project-operating-system.md` when project documentation context is needed.

Then continue from the UAT items above and preserve the exact working ref in any new GitHub note.
