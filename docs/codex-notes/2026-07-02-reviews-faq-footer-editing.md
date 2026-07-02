# 2026-07-02 Reviews, FAQs, And Footer Editing

Context: FancyFelines UAT on CatStays onboarding/Website Builder showed that reviews, FAQs, footer links, and footer hours needed to behave as editable imported content rather than static template placeholders.

Local source checkpoint:

- Local branch: `main`
- Local commit: `eea5a0a` (`Refine imported reviews faqs and footer controls`)
- Shell push status: blocked by missing HTTPS GitHub credentials: `fatal: could not read Password for 'https://vanessanz78@github.com': Device not configured`
- Recovery patch bundle is stored locally under `/Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch*` once refreshed by this run.

Implemented in the local commit:

- Reviews now expose editable eyebrow and heading fields in the Website Builder.
- Imported review lists are preserved and normalized instead of replaced by one placeholder testimonial.
- Reviews have a `showOnWebsite` flag so a review can be hidden without deleting builder data.
- FAQ/Q&A imports merge explicit FAQ pages, Q&A/question pages, and extracted source FAQ content.
- FAQ answers reject repeated navigation/menu-style boilerplate before they feed the builder, website FAQ section, footer, or chatbot knowledge.
- FAQs now expose editable eyebrow and heading fields plus per-FAQ website/chatbot visibility.
- Footer quick links are generated from real page sections, include FAQs when present, and become editable builder data with add/delete controls and section anchor selection.
- Footer hours now mirror the Contact / Location hours saved in builder data.
- `CURRENT_SPRINT.md`, `DECISION_LOG.md`, and `docs/changelog.md` were updated with the new UAT and product decisions.

Files changed locally:

- `CURRENT_SPRINT.md`
- `DECISION_LOG.md`
- `docs/changelog.md`
- `artifacts/api-server/src/lib/catteryWebsiteScraper.ts`
- `artifacts/api-server/src/routes/cattery.ts`
- `artifacts/catstays/src/app/components/WebsiteEditorPanelEnhanced.tsx`
- `artifacts/catstays/src/app/lib/previewTemplates.ts`
- `artifacts/catstays/src/app/pages/onboarding/CatstaysTemplateSite.tsx`
- `artifacts/catstays/src/app/pages/onboarding/OnboardingWizard.tsx`

Verification completed locally:

- `git diff --check` passed.
- No package file was present in this sparse checkout, so no local dependency install, typecheck, or build was run.

UAT still needed:

- Reimport `https://fancyfelines.nz` and confirm all source reviews appear in the builder.
- Edit the `Reviews` eyebrow and `Trusted cat care` heading and confirm the preview updates.
- Hide one review and confirm it disappears from the website carousel without being deleted from builder data.
- Confirm Q&A/FAQ/question pages populate the FAQ editor and the visible FAQs are available to the chatbot.
- Confirm footer quick links include FAQs, allow add/delete/select, and anchor to real sections.
- Edit Contact / Location hours and confirm footer hours update to match.
