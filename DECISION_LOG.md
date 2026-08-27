# Decision Log

Last updated: 2026-08-27

## 2026-08-27 - Public Bookings Use Inclusive Per-Cat Days

Working ref: `fix/booking-flow-days-pricing-20260827`.

Decision: Price the public booking request by calendar days in care, including both arrival and departure, and multiply the configured daily rate by the number of cats.

Reason: Deloraine Cattery charges by days rather than accommodation nights, and the prior estimate did not change with the selected cat count.

Impact:

- The public estimate is `daily rate × cats × inclusive days`, followed by the existing long-stay discount and GST.
- Public form, review, success, and booking-request email copy use **day/days**, not **night/nights**.
- Public requests remain pending until the cattery confirms availability; automatic confirmation and real payment options require separate server-side availability, payment, and customer-auth work.

## 2026-08-27 - Public Website Is The First Staff Dashboard Action

Working ref: `fix/dashboard-view-website-20260827`.

Decision: Put **View Website** first in the shared staff dashboard menu and route it to `/` on the current cattery subdomain.

Reason: The cattery owner needs the quickest possible path from the dashboard to the customer-facing website. The existing menu exposed **Edit Website** but no direct public-site action.

Impact:

- Desktop and mobile dashboard navigation both present **View Website** first.
- The public homepage opens on the current tenant domain without changing authentication, Supabase, or website-editor behavior.
- **Today**, **Edit Website**, and the remaining staff actions keep their existing relative order.

## 2026-08-03 - Phase 2 Content Sources Started

Decision: Start Phase 2 Content Sources on `phase2/content-sources-20260803`.

Reason: Vanessa explicitly instructed Codex to start Phase 2 after the Open Home architecture, schema, and security foundation were already complete and frozen.

Impact:

- Phase 2 is limited to durable Content Source creation, retrieval, source hashing/versioning, status transitions, and audit events.
- ADR-001 remains frozen and unchanged.
- Phase 3 Media Library must not begin until Phase 2 passes UAT, merges to `main`, is tagged, and the branch is deleted.
- Unauthenticated website scraping remains preview-only; durable source writes require authenticated owner access or backend provisioning.
- Onboarding publish/provision now persists the captured website import into `content_sources` after the cattery row exists.

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

## 2026-07-11 - Open Home Platform Principles

Decision: Create `PLATFORM_PRINCIPLES.md` as the permanent engineering philosophy and implementation charter for Open Home.

Reason: Architecture is complete and implementation now needs guardrails that protect the approved platform instead of continuing to redesign it.

Impact:

- The browser is not a source of truth.
- Generated data is immutable.
- Derived data is disposable and regeneratable.
- Media and Content are first-class platform entities.
- The Assignment Engine decides and the Renderer renders.
- Products consume platform capabilities instead of redefining them.
- Structural changes require ADR-003 or a later ADR.
- `main` must remain releasable.

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

## 2026-08-09 - Content Source Archive Metrics Added

Decision: Add a source archive summary to imported website Content Sources during Phase 2.

Reason: The Guided Healing vertical proof showed that reliable website rebuilding depends on preserving provenance, page-level text/image evidence, capture metrics, and unsupported capture notes, not only the generated preview payload.

Impact:

- Website scrape raw data now includes a `sourceArchive` object with page evidence, image/script asset lists, metrics, and unsupported notes.
- Normalized Content Source data exposes the archive summary so future Media Library, Content Library, verification, and preview phases can use durable capture evidence.
- This remains within Phase 2 Content Sources and does not begin Phase 3 Media Library or preview rendering work.

## 2026-08-09 - Stage 1 Original Website Rebuild Saved

Working ref: `phase2/content-sources-20260803`.

Decision: Treat Stage 1 website import as a saved original-site rebuild, not only a source evidence archive.

Reason: Some catteries may want the original website preserved as their first CatStays website view before choosing a modernized template. The imported original preview must therefore be replayed from saved scrape data rather than a live iframe/proxy, and source images must remain eligible for later generated-template selection.

Impact:

- `sourceArchive.rebuild.html` now stores a replayable original preview document in `content_sources.raw_data`.
- Rebuilt original previews inline captured assets as data URLs where possible and record embedded, failed, byte-count, and truncation metrics.
- The Original preview iframe remains only as a browser isolation shell; it is fed saved rebuilt HTML when available.
- Wix-style image `srcset` URLs with comma-based transform segments are parsed as whole URLs so Fancy Felines source images are not replaced by stock/generic fallbacks.

## Open Decisions

- Whether the client-side publish handler should also be hardened so no future account/provisioning error can force a step-1 reset.

## 2026-08-09 - Website Builder V2 Content Intelligence Scaffold Started

Working ref: `phase2/website-builder-v2-content-intelligence`.

Decision: Start a V2 content-intelligence scaffold that formalizes the interpretation layer between saved imported source content and CatStays preview templates.

Reason: The imported website data can persist correctly while preview templates still behave like generic template fills if they do not receive source-order, source-grouping, image-context, template-slot, completeness, and provenance signals. The new scaffold creates that contract without changing the frozen ADR-001 platform schema.

Impact:

- Saved imported source data can now be transformed into a `ContentIntelligencePlan`.
- The plan groups source sections into ordered clusters, maps clusters to template slots, and records completeness/unsupported metrics.
- Existing preview templates can carry the intelligence plan while continuing to render through the current CatStays template components.
- This is not a database migration, not Phase 3 Media Library, and not the final Assignment Engine. It is a scoped bridge so the current preview layer can stop relying on loose fallback fields while the platform lifecycle remains intact.

## 2026-08-09 - Platform-Aware Website Import Evidence Added

Working ref: `phase2/website-builder-v2-content-intelligence`.

Decision: Add platform detection, extraction route evidence, and source-quality scoring to imported website source archives.

Reason: Harris Hillton exposed a generic importer gap: WordPress/Elementor pages can present thin/noisy HTML while the real page text and media are available through WordPress content feeds. Imported previews need to know which platform route succeeded and whether the captured evidence is strong enough before generated templates are trusted.

Impact:

- Website imports now record detected platform family, builder signals, extraction route statuses, and content-quality confidence in the saved source archive.
- WordPress imports use the WordPress page content feed as an enrichment route rather than relying only on rendered/fetched HTML.
- Generated-template source understanding reads the saved platform confidence and flags weak imports so they do not silently masquerade as complete generic template previews.
- The change remains Phase 2-safe because it enriches existing `content_sources` JSON payloads and does not add a database migration or start Phase 3 Media Library.
