# Decision Log

Last updated: 2026-07-02

## 2026-07-02 - Reviews, FAQs, And Footer Are Editable Content

Decision: Reviews, FAQs, footer quick links, and footer hours are editable builder content derived from imported source data and saved owner edits.

Reason: FancyFelines UAT showed only one review, repeated FAQ/navigation copy, footer links without add/select controls, and stale footer hours even after Contact / Location hours were edited.

Impact:

- Import should collect all usable reviews/testimonials, not replace them with a single generic testimonial.
- Each review can be shown or hidden on the website without deleting it from builder data; future dashboard review approvals should feed this same visibility path.
- Q&A, FAQ, frequently asked questions, and questions pages should map to the FAQ editor, website FAQ section, footer quick links, and chatbot knowledge.
- FAQ answers must reject repeated navigation/menu text and duplicated boilerplate.
- Footer quick links should be generated from real page sections, then editable with add/delete controls and an anchor selector.
- Footer hours should mirror Contact / Location hours so owners do not need to edit the same hours in two places.
- UAT should confirm the footer FAQ link, chatbot FAQ answers, show/hide review toggles, and edited hours all survive template switches.

## 2026-07-02 - Care Services Use Real Service Copy

Decision: Care Services cards should be generated from real imported service, rates, grooming, health-care, or related source-page content, with editable eyebrow, heading, icon, title, description, price, and order.

Reason: FancyFelines UAT showed service cards in the correct visual location, but their descriptions repeated navigation text such as `top of page Home About...` instead of meaningful service content.

Impact:

- Navigation/menu boilerplate must be stripped or rejected before service descriptions are saved.
- Service prices should remain separate from descriptions so the Website Builder amount field controls the preview amount cleanly.
- Service icons must be editable in the Website Builder and reflected in the live preview.
- Service cards should be reorderable from the builder so owners can prioritize services without deleting/recreating cards.
- If a real service has no usable description, the preview may show its title/price without invented filler copy.
- UAT should confirm the Care Services row remains horizontally scrollable while showing clean imported service content.

## 2026-07-02 - Owner Story Must Be Owner Specific

Decision: The owner story section should only render owner/team/story content that was extracted from the source site or entered by the owner.

Reason: FancyFelines UAT showed the owner section displaying the general business/About description even though the Website Builder owner story field was empty. That made the page look filled in while the editable source of truth was missing.

Impact:

- Owner extraction should prefer About/Owner/Team-style pages and sentences that mention owner, team, founder, family, host, experience, qualification, or known owner names.
- The owner section must not fall back to the general About/business description.
- The owner section must not use stock/filler image fallbacks.
- If no owner-specific text or image is available, the generated preview should hide the owner section until the owner enters real content.
- UAT should confirm the left editor and right preview stay aligned if the owner section is shown near the bottom of the page.

## 2026-07-02 - Galleries Use Real Imported Photos Only

Decision: Generated galleries should use captured owner-site photos, including photos already used elsewhere on the page, and should not be padded with stock/filler images.

Reason: FancyFelines UAT showed the gallery using stock photos and hiding some real captured photos because the generic no-repeat image rule removed images that were already used in other sections. For galleries, reuse is acceptable and better than fake imagery.

Impact:

- The no-repeat image rule applies to separate page sections, not gallery coverage.
- Gallery images should come from imported/stored owner-site media or owner-edited builder media.
- Broken gallery images should fail neutral rather than swapping in stock photos.
- The scrape import should attempt to copy captured image URLs into the CatStays Supabase `catstays-media` bucket before the preview data is saved.
- UAT should confirm reimported FancyFelines gallery images use CatStays/Supabase-owned URLs where storage is configured.

## 2026-07-02 - Builder Sections Must Match Visual Page Sections

Decision: The top Why Choose story, Purpose-built accommodation/facilities section, and lower Care Approach card row must be stored and edited as separate builder sections.

Reason: FancyFelines UAT showed one shared `whyChoose`/feature data source appearing in multiple visual areas. Editing the card row could look like it belonged under Purpose-built accommodation, and imported navigation text could become body copy.

Impact:

- The builder exposes editable eyebrow, heading, and body copy fields for the top Why Choose story.
- The Purpose-built accommodation section has its own editable eyebrow, heading, body, and image.
- The Care Approach card row has its own editable eyebrow, heading, body, and cards.
- Purpose-built accommodation should render as an image/text section, not a second card grid.
- Generated previews should not fall back from empty facility features to general care cards, and the builder should not show duplicate card controls under Purpose-built.
- Imported navigation boilerplate such as `top of page Home About...` should be stripped before it reaches section/card copy.
- UAT should verify the left editor order matches the page scroll order and that changing one section does not unexpectedly alter another.

## 2026-07-02 - Boarding Options Own Suite Details

Decision: Suite names, prices, descriptions, images, and bullet points belong in the Boarding Options editor section, and that editor section should appear where Boarding Options appears in the live preview.

Reason: FancyFelines UAT showed the page preview reaching Boarding Options before the left editor reached Suites, and suite bullet points such as daily care, comfort checks, photo updates, and enrichment time were visible on the page but not editable.

Impact:

- Suites / Boarding Options is ordered after the care/facilities content in the builder.
- Each suite exposes editable bullet points as well as name, description, price, and image.
- Short suite rows should center; rows with more than three suites should use a horizontal scroll rail.
- Linked suite images use the same CatStays-owned image copy flow as other builder images.
- UAT should confirm template switching preserves edited suite images and bullet points.

## 2026-07-02 - Builder Images And Hero Edits Persist

Decision: Website builder image URLs, hero eyebrow text, CTA choices, and hero image crop settings are autosaved builder state and must persist across template/design changes.

Reason: FancyFelines UAT showed that owners need to change images and copy while comparing templates, and those edits should not disappear because there is no explicit Save button. Owner-site image links are also fragile because CatStays may replace the original website.

Impact:

- Linked image URLs should be copied into CatStays-owned Supabase Storage before they are treated as durable website assets.
- The hero eyebrow (`A home away from home`) is editable in Home / Hero.
- Primary and secondary hero CTAs have editable text plus anchor dropdowns with `None` to hide either button.
- Hero image X/Y/Zoom settings are saved and reused by generated templates.
- Template switching should preserve owner edits and only change template styling/layout.
- UAT should verify the `/api/website/copy-image` route can write to the `catstays-media` Supabase bucket in Replit.

## 2026-07-02 - Onboarding Location Uses Full Address

Decision: The cattery setup Location field should use the imported full address when one is available, and manual or Google-complete address edits should update the stored address value too.

Reason: FancyFelines UAT showed the Location field falling back to `fancyfelines`, which is a business/host-style value, even though the source site has a real Whareora Road address. Location should support Google-style complete addresses for downstream maps, contact details, and builder data.

Impact:

- Import normalization prefers the scraped address before city, host, or business-name fallbacks.
- Preview import records carry the contact address back into the onboarding Location field.
- Manual Location edits write through to the stored address so autocomplete selections do not leave stale contact data behind.
- UAT should verify imported sites with road addresses, including macrons such as `Whangārei`, populate the setup address cleanly.

## 2026-07-02 - Import Source Site Before Preview Generation

Decision: Treat website import as a source-site capture step before template generation.

Reason: FancyFelines UAT showed that generating a preview from only shallow homepage content drops important owner-site pages such as grooming, Q&A, collaborations, health care, HBOT, PEMF, and pricing/rates. CatStays should first crawl and store relevant source pages/images, then map the indexed content into the one-page preview.

Impact:

- The scraper should crawl same-origin links and sitemap pages within a bounded budget before building the preview.
- Extra owner-site pages should become source content blocks, FAQs, service cards, or editable custom sections instead of being discarded.
- One-page preview navigation, footer links, and chatbot knowledge should include the imported FAQ/source-section content where practical.
- Replit UAT should include sites beyond Deloraine so the importer learns from varied cattery site structures.

## 2026-07-02 - Logos Are Not Header Photos

Decision: Do not use owner logos, wordmarks, favicons, brand-only graphics, or stock/filler photography as hero/header/gallery photography in generated previews.

Reason: FancyFelines UAT showed a logo-style wordmark and stock-looking photos being selected as visual content, which made the preview look broken and unlike the real cattery website. Logos may be stored as logos, but hero/header/gallery imagery should be actual captured or owner-provided photography.

Impact:

- Import logic filters likely logos/wordmarks out of hero, gallery, suite, room, and service image selection.
- Broken or unusable image URLs should fail neutral instead of rendering broken boxes or stock/filler photos.
- UAT should check that generated previews use real cattery/site imagery where available and never rely on a logo or stock image as the top visual.

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

Reason: Returning an API error containing the phrase `account` caused the onboarding client to send the user back to step 1. Rewording duplicate-email provisioning errors and removing the Publish handler's `setStep(1)` conflict branch lets the existing Publish-step error display handle the issue inline.

Impact:

- Users should stay on the Publish step when publishing with an already-registered email.
- Setup context is preserved.
- Replit UAT should confirm both duplicate-email and fresh-email publish paths.

## 2026-07-02 - Published But Unconfirmed Accounts Stay On Success

Decision: Treat a successful publish/provision response as the durable onboarding checkpoint even when Supabase email confirmation is still pending.

Reason: Fresh-email UAT showed Supabase Authentication created the user and sent a confirmation email, but the owner was sent back to the Account step. That state is not an OAuth duplicate. It is a valid Supabase Auth user waiting for confirmation, so the setup must restore the Success step and preserve the completed cattery data instead of restarting the wizard.

Impact:

- The Publish handler no longer sends owners back to step 1 when account details are missing at publish time; it stays on Publish with an inline message.
- A saved published checkpoint cannot be overwritten by the account-ready screen.
- The Account-ready continue action returns published owners to Success when a cattery id, published checkpoint, or confirmation-pending account is already stored.
- Frontend-generated confirmation URLs ignore localhost/dev origins and fall back to `https://catstays.app/confirm-email`.
- Supabase Auth URL Configuration still needs to keep Site URL and additional redirects pointed at the live CatStays confirmation route.

## Open Decisions

- Whether to add a formal root-level Architect Update file for CatStays.
