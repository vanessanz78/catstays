# Decision Log

Last updated: 2026-07-05

## 2026-07-05 - Engineering Standard 001 Low Compute Architecture

Decision: Adopt Engineering Standard 001 as a non-functional requirement for CatStays and keep anonymous/public routes free from dashboard, auth, AI, realtime, polling, and import work.

Reason: A deployed app with zero active users should consume close to zero compute. CatStays had no server-side background jobs, but the frontend was eagerly loading private/admin/onboarding code and starting Supabase auth for anonymous visitors.

Impact:

- Public marketing routes must lazy-load only the page being viewed.
- Auth context should be mounted at authenticated route boundaries, not around the whole app.
- Tenant public pages may fetch public tenant data without requiring auth context.
- AI, imports, dashboards, reporting, and admin tools must remain user-triggered and lazy-loaded.
- The detailed audit, diagram, compute reduction report, and future development rules live in `docs/Engineering-Standards/001-Low-Compute-Architecture.md`.

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

## Open Decisions

- Whether to add a formal root-level Architect Update file for CatStays.
- Whether the client-side publish handler should also be hardened so no future account/provisioning error can force a step-1 reset.
