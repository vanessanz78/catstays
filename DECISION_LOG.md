# Decision Log

Last updated: 2026-07-05

## 2026-07-01 - Root Sprint Docs

Decision: Create root-level `CURRENT_SPRINT.md` and `DECISION_LOG.md` for future Codex chats.

Reason: The Codex Operating System expects future sprints to read project-level sprint and decision files after the operating-system startup docs. CatStays had project docs under `docs/`, but no root sprint or decision log.

Impact:

- Future chats have a stable root-level handoff path.
- Durable sprint state is stored in GitHub rather than conversation history.
- Replit handoffs and UAT reminders can be recovered without searching old chats.

## 2026-07-01 - Supabase Auth User Is Duplicate-Email Source

Decision: Treat Supabase Authentication > Users, not OAuth Apps, public customer tables, or Replit Database, as the source of truth for signup email uniqueness.

Reason: CatStays signup/publish calls Supabase Auth. Email/password identities are stored in the Supabase Auth schema and surfaced in Authentication > Users. OAuth Apps only controls whether the project acts as an OAuth provider for third-party applications; an empty OAuth Apps list does not mean email signup users have been deleted. Empty public tables such as `customers` also do not remove Auth users.

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

## 2026-07-05 - Pre-FancyFelines Restore Branch

Decision: Create `codex/stable-pre-fancyfelines-main-20260705` from commit `49fefa8b65c17f8d9dad25d9656afc98e3d4ffad`.

Reason: The `eea5a0a` rollback target was still after the FancyFelines import/preview work had started. Screenshots from the CatStays v2 conversation showed the last known handoff before FancyFelines was GitHub `main`, and the relevant final pre-FancyFelines GitHub commit was `49fefa8`.

Impact:

- Replit should test `codex/stable-pre-fancyfelines-main-20260705`, not `eea5a0a`, when trying to restore the pre-FancyFelines state.
- This branch keeps the app code based on the pre-FancyFelines `main` state, with only a targeted preview-cache recovery guard added after the restore point.
- Future GitHub notes and Replit handoffs must include `Working ref: <main | branch name | commit SHA>`.

## 2026-07-05 - Preview Import Cache Recovery

Decision: Add a targeted guard for browser storage key `catstays_preview_import_table`.

Reason: Generate Preview could fail before rendering when an earlier import-preview branch stored too much preview-import data in browser storage. The browser then raised a storage quota error and sent the user to the app fail screen.

Impact:

- The restore branch can recover from the specific `catstays_preview_import_table` quota failure shown in Replit preview.
- The guard clears only oversized/stuck preview-import cache and prevents quota write failures for that cache key from crashing the app.
- The guard does not delete onboarding data, source files, Supabase data, or imported project state.
- If Generate Preview still fails after pulling this branch and hard-refreshing, continue from the pre-FancyFelines restore branch rather than moving to later FancyFelines commits.

## Open Decisions

- Whether to add a formal root-level Architect Update file for CatStays.
- Whether the client-side publish handler should also be hardened so no future account/provisioning error can force a step-1 reset.
