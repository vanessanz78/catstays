# Changelog

## 2026-07-08

- Added diagnostic-only image import observability on working ref `codex/image-import-observability`.
- Added temporary development endpoint `/api/debug/image-import` to report discovery, validation, upload, builder URL, and preview URL stages.
- Confirmed the Deloraine import path carries external owner-site URLs into builder/preview data and does not attempt Supabase Storage upload.

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
