# Onboarding Flow

Last reviewed: 2026-07-02

## Purpose

The onboarding flow should let a cattery owner create a CatStays site and dashboard quickly, either by importing an existing website or starting from a guided setup.

## Current Flow

The current onboarding flow is implemented as a 9-step wizard:

1. Account
2. Cattery setup
3. Website builder
4. Booking setup
5. Website preview
6. Choose plan
7. Publish
8. Success
9. Data import

Older project notes mention a 7-step onboarding flow. That should be treated as a review item because the current implemented flow is 9 steps.

## Current Strengths

- Website URL import entry point exists.
- Website import now captures more source-site pages before preview generation, including same-origin links and sitemap pages within a bounded crawl budget.
- Imported owner-site pages can become services, FAQs, source content blocks, and editable custom sections in the one-page preview.
- Imported cattery setup data now prefers the full source-site address for Location, and Google/manual address edits update the saved address value.
- Generated previews filter likely logos/wordmarks out of hero/header/gallery photos and fall back safely when a source image is broken or unusable.
- Imported demo URLs can use the imported business slug, such as `/demo/fancyfelines`, instead of always using `/demo/deloraine`.
- Website builder hero controls include editable eyebrow text, primary/secondary CTA controls with a `None` option, and saved hero image X/Y/Zoom settings visible on hover in the generated preview.
- Pasted image URLs are routed through the CatStays API so they can be copied into the `catstays-media` Supabase Storage bucket before publish instead of relying on the source website forever.
- Builder state is autosaved locally and into Supabase website settings, and template changes should preserve owner-edited copy, images, buttons, and crop settings.
- Builder controls now separate visually distinct sections: the top Why Choose story, Purpose-built accommodation/facilities, and the lower Care Approach cards each have their own editable text fields.
- Imported navigation/menu boilerplate is stripped from generated section and card copy so `top of page Home About...` text should not appear in previews.
- Guided setup exists for catteries with no current website.
- Website builder preview exists.
- Room setup and booking rules exist.
- Plan selection exists.
- Publish-time tenant provisioning exists.
- Duplicate signup/provisioning email errors now stay on the Publish step so owners do not lose context by looping back to step 1.
- Data import prototype exists.

## Current Gaps

- Template cards need a premium rebuild with realistic cattery website previews.
- Website builder preview can become cramped.
- Account confirmation timing should avoid interrupting setup flow.
- Trial messaging must make clear that all premium features are available during the 14-day trial.
- Address/contact details should carry forward between setup and website builder.
- Data import needs validated sample files and mapping review.
- Import UAT must keep expanding across varied cattery sites so CatStays handles more than the original Deloraine structure.
- The website builder still needs a fuller editor review for imported custom sections, source-page ordering, and chatbot knowledge controls.
- UAT still needs to verify the new section split across multiple imported cattery sites, especially sites with few cards or extra care/service pages.
- Replit UAT must confirm the deployed API has `SUPABASE_SERVICE_ROLE_KEY` and can copy remote image URLs into Supabase Storage through `/api/website/copy-image`.

## Target Experience

The owner should feel:

- Setup is simple.
- Their current site can be turned into a modern booking site.
- Their existing pages, FAQs, service pages, images, and special-care content are preserved rather than squeezed into a Deloraine-shaped template.
- The dashboard is ready for mobile use.
- They can launch without needing a call, demo, or manual sales process.
- They can start with a CatStays subdomain and upgrade to a custom domain later.
