# Decision Log

Last updated: 2026-07-11

## 2026-07-11 - Open Home Architecture Frozen

Decision: Freeze ADR-001 Open Home Content Platform as the approved architecture for website generation.

Reason: ADR-001 and ADR-002 were merged into one canonical architecture, then Phase 1 schema and Phase 1.5 security hardening were validated against the CatStays development Supabase project.

Impact:

- Future implementation must follow ADR-001.
- ADR-001 must not be silently evolved.
- If implementation reveals a genuine structural deficiency, create ADR-003.
- Phase 2 is implementation, not further architecture design.

## 2026-07-11 - Open Home Roadmap Is Canonical Implementation Tracker

Decision: Use root `ROADMAP.md` as the canonical implementation tracker for Open Home Content Platform work.

Reason: The project has moved from architecture into implementation. Future Codex sessions need a durable, phase-based tracker that prevents overlapping work and keeps implementation aligned with the approved lifecycle.

Impact:

- Only one implementation phase may be active at a time.
- Each implementation branch must cover one roadmap phase only.
- A phase is not complete until it passes UAT, merges to `main`, is tagged, and has its branch deleted.
- Future completed phase tags should follow `open-home-platform-phase-<number>-complete`.

## 2026-07-01 - Root Sprint Docs

Decision: Create root-level `CURRENT_SPRINT.md` and `DECISION_LOG.md` for future Codex chats.

Reason: The Codex Operating System expects future sprints to read project-level sprint and decision files after the operating-system startup docs. CatStays had project docs under `docs/`, but no root sprint or decision log.

Impact:

- Future chats have a stable root-level handoff path.
- Durable sprint state is stored in GitHub rather than conversation history.
- Replit handoffs and UAT reminders can be recovered without searching old chats.

## 2026-07-01 - Supabase Auth User Is Duplicate-Email Source

Decision: Treat Supabase Authentication > Users, not OAuth Apps, public customer tables, or Replit Database, as the source of truth for signup email uniqueness.

Reason: CatStays signup/publish calls Supabase Auth. Email/password identities are stored in the Supabase Auth schema and surfaced in Authentication > Users. OAuth Apps only controls whether the project acts as an OAuth provider for third-party apps; an empty OAuth Apps list does not mean email signup users have been deleted. Empty public tables such as `customers` also do not remove Auth users.

Impact:

- UAT that needs a truly fresh signup email must delete the email from Authentication > Users or use a new email alias.
- If an Auth user still exists, the corrected publish flow should show an inline duplicate-email error on the Publish step rather than returning to step 1.
- The Replit Database panel is not the source of this duplicate-email state for the publish/provisioning path.
- If confirmation links point to a development URL, verify Supabase Auth URL Configuration and Replit environment values such as `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL`.

## 2026-07-01 - Replit App URL For Auth Redirects

Decision: Set `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` in `.replit` and document them in `docs/CATSTAYS_REPLIT_SECRETS.md`.

Reason: Supabase confirmation links can inherit a development preview origin when the public app URL is not explicitly configured. The publish route already prefers `CATSTAYS_APP_URL`, and the frontend uses `VITE_PUBLIC_APP_URL` for public app links.

Impact:

- Replit must pull `main` and republish/restart for the new public app URL values to take effect.
- Supabase Auth URL Configuration must allow the live CatStays confirmation URL.
- Future Replit setup notes now include the public URL values alongside existing Supabase and payment settings.

## 2026-07-01 - Publish-Step Duplicate Email Handling

Decision: Treat duplicate signup/provisioning email errors as Publish-step errors instead of account-step resets.

Reason: Returning an API error containing the phrase `account` caused the onboarding client to send the user back to step 1. Rewording duplicate-email provisioning errors lets the existing Publish-step error display handle the issue inline.

Impact:

- Users should stay on the Publish step when publishing with an already-registered email.
- Setup context is preserved.
- Replit UAT should confirm both duplicate-email and fresh-email publish paths.

## 2026-07-05 - Branch / Ref Must Be Explicit In GitHub Notes

Decision: Every GitHub note, sprint note, decision note, PR note, and Replit handoff must explicitly state the working ref.

Reason: Screenshots from the CatStays v2 conversation showed the last known handoff before the FancyFelines work was on GitHub `main`, not a feature branch. Later recovery branches and save branches made the history harder to follow. Future chats need the exact ref in the durable notes instead of inferring it from conversation history or branch names.

Impact:

- Future notes must include `Working ref: <main | branch name | commit SHA>`.
- If work is on a branch, the branch name must be written in the note and used in the Replit command.
- If testing an older commit by SHA, the note must say it is a detached SHA test and not a durable branch.
- Replit handoff commands must match the documented ref.

## Open Decisions

- Whether the client-side publish handler should also be hardened so no future account/provisioning error can force a step-1 reset.
