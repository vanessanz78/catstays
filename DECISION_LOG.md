# Decision Log

Last updated: 2026-07-01

## 2026-07-01 - Root Sprint Docs

Decision: Create root-level `CURRENT_SPRINT.md` and `DECISION_LOG.md` for future Codex chats.

Reason: The Codex Operating System expects future sprints to read project-level sprint and decision files after the operating-system startup docs. CatStays had project docs under `docs/`, but no root sprint or decision log.

Impact:

- Future chats have a stable root-level handoff path.
- Durable sprint state is stored in GitHub rather than conversation history.
- Replit handoffs and UAT reminders can be recovered without searching old chats.

## 2026-07-01 - Publish-Step Duplicate Email Handling

Decision: Treat duplicate signup/provisioning email errors as Publish-step errors instead of account-step resets.

Reason: Returning an API error containing the phrase `account` caused the onboarding client to send the user back to step 1. Rewording duplicate-email provisioning errors lets the existing Publish-step error display handle the issue inline.

Impact:

- Users should stay on the Publish step when publishing with an already-registered email.
- Setup context is preserved.
- Replit UAT should confirm both duplicate-email and fresh-email publish paths.

## Open Decisions

- Whether to add a formal root-level Architect Update file for CatStays.
- Whether the client-side publish handler should also be hardened so no future account/provisioning error can force a step-1 reset.
