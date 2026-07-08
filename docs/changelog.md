# Changelog

## 2026-07-08

- Aligned CatStays startup and governance documentation with the central Codex Operating System.
- Updated future Codex session instructions to read central `START_HERE.md` before project-specific docs.
- Converted the local project operating system into a CatStays-specific overlay instead of duplicated Operating System guidance.
- Added `CONTRIBUTING.md` as a short contributor signpost to the central Operating System and CatStays sprint files.
- Recorded that future CatStays sessions follow the central Operating System for reading order, branch governance, engineering standards, architecture principles, milestone workflow, build verification, UAT, cleanup, and handoff requirements.

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
