# Current Sprint

Last updated: 2026-07-01

## Goal

Stabilise the CatStays onboarding publish flow and give future Codex chats a root-level sprint entry point.

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
- `docs/changelog.md` and `docs/onboarding-flow.md` were updated for that fix.
- No root-level Architect Update exists yet.

## Next Actions

1. Pull `main` into Replit.
2. UAT the Publish step with an already-registered email and confirm it stays on Publish with an inline error.
3. UAT a fresh email publish path to confirm normal provisioning still reaches Success.
4. If any other publish/provisioning error still sends users to step 1, inspect `OnboardingWizard.tsx` next.

## Decisions This Sprint

- Add root-level sprint and decision documents so future Codex chats have a stable project entry point.
- Treat duplicate-email publish failures as Publish-step errors rather than account-step resets.

## Risks Or Blockers

- Full local typecheck was not run because the MacBook Air should stay resource-constrained and no dependencies were installed locally.
- No GitHub CI/status checks were attached to the latest commit.
- Replit UAT is still required before considering the publish-loop fix fully verified.

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
