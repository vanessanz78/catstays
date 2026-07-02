# CatStays Import Builder Recovery Note

Date: 2026-07-02
Branch: `codex/catstays-import-builder-section-split-20260702`

Normal `git push` from the local Codex sparse checkout is blocked because the local machine has no usable GitHub credential in shell/git. The completed implementation is present locally as four clean commits on `main`, ahead of `origin/main`, and a compressed patch artifact remains under the local Codex outputs folder.

## Local Commits

- `437b7d4 Improve imported cattery preview coverage`
- `8e710c7 Use imported address for onboarding location`
- `cd45a79 Persist website builder hero edits`
- `8bb2e0d Separate imported builder sections`

## Exact Local Patch Artifact

Local path:

```text
/Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch
```

Compressed/base64 copy:

```text
/Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch.gz.b64
```

Patch size: 208,804 bytes. Compressed/base64 size: 63,721 bytes.

## What Was Implemented

### Import Preview Coverage

- Imported demo slugs now derive from the imported business/domain, so Fancy Felines should become `/demo/fancyfelines` rather than reusing `/demo/deloraine`.
- Website import crawls more of the source site and captures multi-page content such as grooming, FAQs/Q&A, gallery, contact and miscellaneous source sections.
- Logos are filtered away from hero/top imagery so a logo is not used as a large header image.
- Short card rows are centered and responsive instead of looking left-heavy when there are two or three cards.
- Broken image fallback logic was tightened.

### Onboarding Address

- The first onboarding location field uses the imported full address when available, not the business name.
- Manual/Google-style address edits update the cattery address fields rather than drifting separately.

### Builder Persistence and Images

- Hero builder edits persist across template changes and navigation.
- Hero eyebrow/strapline, primary and secondary button text/link choices, hero image and image crop data are included in save/load.
- A new copy-image route copies remote image URLs into Supabase Storage via the existing API, so the site does not rely on hotlinking from the business being replaced.
- A Supabase migration creates the `catstays-media` storage bucket/policies.

### Visual Section Split

- The top story block `Why choose FancyFelines.nz` is now separate from the lower Care Approach card row.
- The builder has editable fields for the top story eyebrow, heading and copy.
- The Purpose-built / Facilities section has its own editable eyebrow, heading, copy, image and true facility feature list.
- The Care Approach row has its own editable eyebrow, heading, copy and card editor.
- Facility features no longer fall back to general care cards, preventing duplicate or misleading cards under Purpose-built Accommodation.
- Imported navigation/menu boilerplate such as `top of page Home About Accomodation...` is stripped before it reaches preview cards or section copy.
- The Website Builder panel order now matches the visual page order: Hero, About, Why Choose story, Facilities, Care Approach, Owner/People, Gallery, Suites, Services, Testimonials, Contact, Custom sections, Social, Footer, FAQ.

## Main Files Changed Locally

- `CURRENT_SPRINT.md`
- `DECISION_LOG.md`
- `docs/changelog.md`
- `docs/onboarding-flow.md`
- `artifacts/api-server/src/lib/catteryWebsiteScraper.ts`
- `artifacts/api-server/src/routes/cattery.ts`
- `artifacts/catstays/src/app/components/WebsiteEditorPanelEnhanced.tsx`
- `artifacts/catstays/src/app/lib/deloraineDemo.ts`
- `artifacts/catstays/src/app/lib/previewTemplates.ts`
- `artifacts/catstays/src/app/pages/onboarding/CatstaysTemplateSite.tsx`
- `artifacts/catstays/src/app/pages/onboarding/OnboardingWizard.tsx`

## Verification Completed Locally

- `git diff --check` passed.
- Targeted source searches found no remaining source usage of `content.whyChoose.items`.
- Targeted source searches found no remaining fallback from facility features to generic imported highlights.
- Targeted source searches found no source hits for the imported `top of page` boilerplate, only documentation notes.
- No local typecheck/lint/build was run because this is a sparse checkout with no `package.json`, and dependencies were not installed to respect Vanessa's resource-constrained MacBook Air requirement.

## Recovery / Apply Command

From the sparse checkout, this applies the exact local patch to a branch based on current `origin/main`:

```sh
git fetch origin main && git checkout -B catstays-recovery origin/main && git apply /Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch
```

From Replit, the patch file must first be supplied or copied into the Replit workspace because the normal GitHub source push was blocked locally.

## Follow-Up Needed

- Once GitHub shell credentials are restored, push the four local commits or apply the patch in Replit and commit/push from there.
- After the source code is on GitHub, open/refresh the PR and run UAT against Replit/live preview.
