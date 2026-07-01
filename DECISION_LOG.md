# Decision Log

Last updated: 2026-07-02

## 2026-07-02 - Import Source Site Before Preview Generation

Decision: Treat website import as a source-site capture step before template generation.

Reason: FancyFelines UAT showed that generating a preview from only shallow homepage content drops important owner-site pages such as grooming, Q&A, collaborations, health care, HBOT, PEMF, and pricing/rates. CatStays should first crawl and store relevant source pages/images, then map the indexed content into the one-page preview.

Impact:

- The scraper should crawl same-origin links and sitemap pages within a bounded budget before building the preview.
- Extra owner-site pages should become source content blocks, FAQs, service cards, or editable custom sections instead of being discarded.
- One-page preview navigation, footer links, and chatbot knowledge should include the imported FAQ/source-section content where practical.
- Replit UAT should include sites beyond Deloraine so the importer learns from varied cattery site structures.

## 2026-07-02 - Logos Are Not Header Photos

Decision: Do not use owner logos, wordmarks, favicons, or brand-only graphics as hero/header/gallery photography in generated previews.

Reason: FancyFelines UAT showed a logo-style wordmark being selected as the main visual, which made the preview look broken and unlike a real cattery website. Logos may be stored as logos, but hero/header imagery should be actual photography or safe fallback imagery.

Impact:

- Import logic filters likely logos/wordmarks out of hero, gallery, suite, room, and service image selection.
- Broken or unusable image URLs should fail soft to a safe fallback instead of rendering empty boxes.
- UAT should check that generated previews use real cattery/site imagery where available and never rely on a logo as the top visual.

## 2026-07-02 - Short Preview Card Rows Should Center

Decision: Generated preview card rows should center and fill available width when the source site only provides two or three cards.

Reason: Left-weighted rows make the generated site feel unfinished when a section has fewer than the maximum number of cards.

Impact:

- Care, facility, and suite card grids should use responsive centered widths for one, two, or three-card rows.
- Mobile and tablet previews should collapse predictably without horizontal imbalance.
- Replit UAT should check both desktop and mobile preview modes.

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
