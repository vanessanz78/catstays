# Current Sprint

Last updated: 2026-08-03

## Goal

Implement Phase 2 Content Sources for the Open Home Content Platform without starting Phase 3 or redesigning ADR-001.

## Source Of Truth

- Repository: `vanessanz78/catstays`
- Branch: `phase2/content-sources-20260803`
- Working ref: `phase2/content-sources-20260803`
- Review environment: Replit
- Deployment environment: Replit / CatStays app environment
- Operating system entrypoint: `START_HERE.md` in `vanessanz78/codex-operating-system`
- Local startup entrypoint: `START_HERE.md`
- Canonical implementation tracker: `ROADMAP.md`
- Platform implementation charter: `PLATFORM_PRINCIPLES.md`

## Branch / Ref Handoff Rule

- Current sprint note ref: `phase2/content-sources-20260803`.
- Correction from 2026-07-05 review: the last known handoff before the FancyFelines work was from GitHub `main`, not a feature branch. Replit was instructed to pull `main`.
- Every future GitHub note, sprint note, decision note, PR note, and Replit handoff must include the exact working ref.
- Required wording for future notes: `Working ref: <main | branch name | commit SHA>`.
- If work is on a branch, the branch name must be visible in the note and in the Replit command.
- If work is being tested by commit SHA, the note must say it is a detached SHA test and not a durable branch.

## Current State

- CatStays uses GitHub as the durable source of truth.
- Project startup docs live in root `START_HERE.md`, root `ROADMAP.md`, `docs/README.md`, and `docs/project-operating-system.md`.
- ADR-001 Open Home Content Platform is approved and frozen.
- Phase 1 Platform Schema is complete.
- Phase 1.5 Security And Validation is complete.
- The schema and security model were validated against the CatStays development Supabase project.
- Phase 2 Content Sources implementation has started on `phase2/content-sources-20260803`.
- Implemented server-side Content Source creation, retrieval, source hashing/import versioning, status transitions, and audit event writing.
- Authenticated website scrapes with a known cattery can persist a Content Source immediately.
- Onboarding publish/provision persists the imported website source after the cattery row exists.
- Provisional onboarding draft progress now persists imported website content into `content_sources` before the Website Builder opens, so the builder hydrates from saved imported text, images, gallery, rooms, FAQs, and normalized website sections rather than a preview-only in-memory payload.
- Existing browser storage remains lightweight for onboarding resume state; full preview import records are not written to Local Storage as the source of truth.
- Replit onboarding resume now merges lightweight saved state over full defaults so the first post-signup screen does not crash on sparse browser state.
- Full `/signup` now provisions the real Supabase Auth user and cattery record through the server before entering onboarding, then carries the known business/account details into step 2.
- Onboarding draft progress can save back to the provisioned cattery before email confirmation by using a one-time draft token stored server-side as a hash.
- Restored the live Auth-to-cattery trigger and backfilled Auth users that were missing cattery rows; the migration is recorded as `008_restore_auth_cattery_trigger.sql`.
- Replit signup provisioning now reports the exact missing Supabase secret and accepts common Supabase URL/key aliases, while keeping `SUPABASE_SERVICE_ROLE_KEY` as the canonical secret.
- Removed private-secret placeholder entries from checked-in `.replit`; direct Replit Secrets must supply service-role, Resend, Stripe API, and webhook values.
- The permanent Open Home implementation tracker is `ROADMAP.md`.
- The permanent Open Home engineering philosophy is `PLATFORM_PRINCIPLES.md`.
- Future implementation must follow one branch -> one phase -> UAT -> merge -> tag -> delete branch.
- Do not begin Phase 3 until Phase 2 passes UAT, merges to `main`, is tagged, and has its branch deleted.

## Next Actions

1. Pull and test `phase2/content-sources-20260803` in Replit.
2. Complete Phase 2 UAT: website import/publish creates a durable `content_sources` row and `website_events` audit row.
3. If UAT passes, merge to `main`, delete the branch, and tag `open-home-platform-phase-2-complete`.
4. Do not begin Phase 3 or later until Phase 2 has passed UAT, merged, been tagged, and had its branch deleted.

## Decisions This Sprint

- ADR-001 is frozen and must not be silently evolved.
- If implementation reveals a genuine structural deficiency, create ADR-003.
- `ROADMAP.md` is the canonical Open Home implementation tracker.
- `PLATFORM_PRINCIPLES.md` is the canonical Open Home implementation charter.
- One implementation phase may be active at a time.
- Phase 2 uses `content_sources` as the durable source identity for website imports; existing preview rendering remains unchanged.
- Unauthenticated website scraping remains preview-only. Durable Content Source writes require authenticated owner access or backend provisioning/draft-progress validation with the service role.
- Every completed Open Home phase must be tagged.

## Risks Or Blockers

- Replit Runtime UAT is still required before merge.
- Supabase advisors still report broader baseline warnings from earlier schema/auth/GraphQL exposure and performance policies; this branch did not apply database DDL.
- Future implementation work must not bypass the approved lifecycle or begin Phase 3 early.

## Local Cleanup Notes

- Local working copy created at `/Users/vanessa/Documents/Codex/2026-08-03/catstays-phase2-content-sources`.
- `pnpm run typecheck`, the focused API-server test, and `pnpm run build` were run locally.
- `node_modules` and generated build artifacts were removed after validation to keep the MacBook Air footprint small.
- Replit first UAT attempt showed the API server needs a `PORT`; the API dev script now defaults to `8080` when Replit does not provide one.
- Replit onboarding UAT then exposed a sparse saved-state crash after the first signup screen; the restore path now keeps defaults and the location autocomplete tolerates empty values.
- Replit signup UAT showed the `/signup` page duplicated account/cattery questions and depended on a missing live Supabase trigger. The live trigger was restored and verified; the app now enters onboarding from a provisioned cattery draft.
- Replit follow-up showed `Supabase is not configured for provisioning`; ensure Replit Secrets include `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and canonical `SUPABASE_SERVICE_ROLE_KEY`.
- Replit import UAT showed imported website content rendered in the original preview but disappeared in the editable website builder. The root cause was a preview-only "Original" handoff plus a draft save list that did not preserve all normalized builder content/images. The import continue action now opens an editable generated template seeded from the scrape, and draft saves keep the normalized builder fields.
- The visible Replit Secrets were present, but checked-in `.replit` still set `SUPABASE_SERVICE_ROLE_KEY = "$SUPABASE_SERVICE_ROLE_KEY"`, which shadowed the real secret with placeholder text. That placeholder entry was removed.

## Handoff

Future chats should read:

1. `START_HERE.md` from `vanessanz78/codex-operating-system`.
2. Local `START_HERE.md`.
3. `ROADMAP.md`.
4. `PLATFORM_PRINCIPLES.md`.
5. `docs/README.md`.
6. `docs/project-operating-system.md`.
7. `docs/adr/ADR-001-open-home-content-platform.md`.
8. `CURRENT_SPRINT.md`.
9. `DECISION_LOG.md`.

Then preserve the exact working ref in any new GitHub note and follow Phase 2 only until it is merged, tagged, and closed.
