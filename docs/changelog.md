# Changelog

## 2026-09-02

- Refined Today from the founder's narrated daily workflow: live customer/cat lookup, direct preselected booking start, one-tap check-in/check-out, recent bookings, and clear arrival/collection times.
- Added a compact seven-day In / Out / Day end movement summary alongside physical-room occupancy.
- Kept CatStays' independent modern visual language and availability-first booking model while adopting the proven operational shortcuts from the reference workflow.

## 2026-09-01

- Reordered the staff dashboard around daily operational work: Today, Bookings, Calendar, Customers, Messages, and Cat Updates.
- Replaced the View Website sidebar row with a compact accessible website action beside the Dashboard/cattery identity.
- Moved Room Planner and Edit Website into the bottom navigation group, with Edit Website last.
- Compressed the phone Today overview into one at-a-glance panel with Arrivals, Departures, and Occupied side by side.

## 2026-08-31

- Expanded accommodation types into numbered physical-room inventory for staff operations while keeping the public room choice grouped and simple.
- Configured Deloraine for 17 Private Rooms, 8 Indoor Rooms, and 25 Communal Rooms, with capacity interpreted per physical room.
- Made staff New Booking, separate cat-room assignments, calendar click-through, booking details, drag/drop, conflict checks, Room Planner counts, and occupancy analytics physical-room aware.
- Added server-side physical-room capacity and availability selection for public booking requests plus a Supabase migration and focused inventory tests.

## 2026-08-27

- Corrected the public booking journey to use inclusive per-cat daily pricing, live date/cat recalculation, clickable retained steps, truthful customer-facing request copy, and accurate care inclusions.
- Changed the generated public booking CTA to **Book Now** and removed generic enquiry wording from the booking prompts.
- Added **View Website** as the first action in the staff dashboard menu so cattery owners can open their public website directly from both desktop and mobile dashboard navigation.

## 2026-08-17

- Fixed the staff website editor so the right-hand editing panel scrolls inside the viewport and added Edit mode support for clicking directly on page text and images, while preserving the detailed side-panel controls.
- Updated generated imported-site templates so saved editor overrides for hero/business text, section headings, booking copy, and key images are reflected when the source-faithful template re-renders.
- Fixed generated cattery websites so Book / Enquire opens the real booking flow, saves online requests as pending dashboard bookings, and shows public guest/cat details in staff booking screens.

## 2026-08-03

- Started Phase 2 Content Sources on `phase2/content-sources-20260803`.
- Added platform-aware website import evidence on `phase2/website-builder-v2-content-intelligence`, including WordPress content-feed enrichment, extraction route status, source-quality confidence, and a guard against treating weak imports as complete generic previews.
- Added the server-side Content Source service for durable source creation, retrieval, deterministic source hashing/import versioning, status transitions, and `website_events` audit entries.
- Added authenticated Content Source API routes and wired website scrape persistence for authenticated imports with a known cattery.
- Wired onboarding publish/provision to persist captured website imports into `content_sources` after the cattery record exists.
- Added focused API-server tests for source hashing, creation, lookup, and status transition behaviour.
- Defaulted the API server dev script to port `8080` when Replit does not provide `PORT`.
- Fixed the Replit onboarding resume crash after the first signup screen by preserving full default form state around the lightweight saved progress payload.
- Reworked `/signup` to provision the Supabase Auth user and cattery before onboarding, carry the signup details into step 2, and save unconfirmed onboarding progress through a server-side draft token.
- Restored the Auth-to-cattery trigger in Supabase and backfilled users that were missing cattery records.
- Fixed the imported website handoff so "Continue to Website Builder" opens an editable CatStays template seeded from the imported content instead of landing on the preview-only Original reference.
- Expanded onboarding draft persistence to keep normalized imported content, gallery images, services, rooms, FAQs, owner/location data, and template fields through reloads and back/forward navigation.
- Fixed Phase 2 UAT import persistence so provisional onboarding draft saves create a durable `content_sources` row before the Website Builder opens, preserving imported text, images, hero media, galleries, rooms, FAQs, and normalized builder state.
- Updated Supabase Auth email templates to a shared CatStays-branded layout with cream header, logo/wordmark, friendlier copy, terracotta calls to action, and navy support footer.
- Adjusted signup confirmation redirect resolution so localhost remains valid for development while production uses the configured CatStays public app URL.

## 2026-07-12

- Added a durable Replit handoff rule: every future Replit pull command should include a stop/start block so testing does not continue against stale Vite, TSX, or Node processes.
- Updated Replit pull examples to fetch, checkout, pull, stop old runtime processes, and restart the CatStays frontend with the repository-specific command.

## 2026-07-11

- Added Open Home platform principles and implementation charter to formalise the transition from architecture to implementation.
- Added the permanent Open Home Content Platform implementation roadmap and startup governance for phase-based implementation.
- Froze ADR-001 as the canonical Open Home Content Platform architecture.
- Added the Phase 1 schema foundation for content sources, media library, content library, drafts, assignments, previews, published versions, and website events.
- Added Phase 1.5 database hardening for the Open Home Content Platform, including RLS policies, explicit grants, lifecycle enums, and operational indexes.

## 2026-07-05

- Clarified that the last known pre-FancyFelines CatStays handoff was on GitHub `main`, not a feature branch.
- Added a durable rule that every future GitHub note and Replit handoff must include the exact working ref: `main`, branch name, or commit SHA.

## 2026-07-01

- Set Replit public app URL values `CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` to `https://catstays.app` so Supabase confirmation links prefer the live app URL.
- Documented that duplicate signup email state comes from Supabase Authentication > Users, not OAuth Apps, public customer tables, or Replit Database.
- Added root-level `CURRENT_SPRINT.md` and `DECISION_LOG.md` so future Codex chats have a stable sprint handoff entry point.
- Fixed the onboarding publish flow for duplicate signup emails so the Publish step shows an inline error instead of looping users back to step 1.

## 2026-06-12

- Added a UAT test plan for published Replit builds.
- Added the project operating system documenting the documentation-first workflow and GitHub source-of-truth rules.
- Added the CatStays Master Documentation Hub.
- Added current-state audit covering platform status, product vision, architecture, journeys, booking, boarding, database, mobile, technical debt, deployment, and next actions.
- Added documentation files for architecture, onboarding, booking, boarding, cattery management, customer journey, database, integrations, roadmap, deployment status, and business rules.

## Earlier Context

Recent repository history before this documentation pass includes UX dead-end fixes, homepage preview refinements, Replit secrets documentation, Supabase email template scripts, and publish-time tenant provisioning.
