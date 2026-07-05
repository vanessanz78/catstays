# Changelog

## 2026-07-05

- Created restore branch `codex/stable-pre-fancyfelines-main-20260705` from commit `49fefa8b65c17f8d9dad25d9656afc98e3d4ffad`, the last known GitHub `main` state before the FancyFelines import/preview conversation.
- Clarified that `eea5a0a` is not a pre-FancyFelines rollback point because it is already inside the later import/preview change stack.
- Added a durable rule that every future GitHub note and Replit handoff must include the exact working ref: `main`, branch name, or commit SHA.
- Added a small startup recovery guard for oversized `catstays_preview_import_table` browser storage so Generate Preview can recover from the storage-quota failure caused by an earlier import-preview branch.

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
