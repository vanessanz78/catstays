# Changelog

## 2026-07-02

- Updated onboarding import mapping so the cattery setup Location field uses the imported full address, and manual/Google address edits keep the stored address in sync.
- Improved website import coverage so CatStays captures more source-site pages, images, Q&A content, and extra owner-site sections before generating preview templates.
- Added importer rules to keep logos/wordmarks out of hero, gallery, suite, room, and service photography, with safe image fallbacks for unusable or broken source images.
- Added imported source sections and FAQ output to generated one-page previews so pages such as grooming, health care, HBOT, PEMF, collaborations, and Q&A have a place in the preview and builder data.
- Centered short preview card rows for care, facility, and suite sections when there are only one, two, or three cards.
- Added imported demo slug routes such as `/demo/fancyfelines`, `/demo/fancyfelines/dashboard`, and `/demo/fancyfelines/client` while preserving legacy Deloraine routes.
- Added Website Builder hero eyebrow editing, CTA link `None` options, template-rendered primary/secondary hero buttons, and hover X/Y/Zoom controls for hero image positioning.
- Preserved owner-edited builder copy, image choices, CTA choices, and hero image crop settings across template switches and Supabase `website_settings` save/load.
- Added a repository-backed `/api/website/copy-image` route and `catstays-media` Supabase Storage bucket definition so pasted image URLs can be copied to CatStays-owned storage instead of being treated as durable hot-links.
- Split Website Builder controls for the top Why Choose story, Purpose-built accommodation/facilities, and Care Approach card row, with imported navigation-menu boilerplate stripped from generated copy.
- Hardened the Publish handler so duplicate-account conflicts stay on the Publish step with the inline error instead of resetting to step 1.

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
