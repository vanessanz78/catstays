# Media Catalogue Architecture

Last reviewed: 2026-07-08

## Purpose

Website import should not treat images as an ordered list of URLs. Imported images must be classified into a structured media catalogue before preview templates, builder data, or future publish flows select images.

The media catalogue is the authority for imported image meaning.

## Scope

This architecture applies to all imported websites, not only Deloraine.

The catalogue is created during website scraping and saved with the imported website preview data. Existing compatibility fields such as `heroImage`, `images`, and `galleryImages` may still exist, but they should be derived from or checked against the catalogue rather than treated as the source of truth.

## Catalogue Item Shape

Each discovered image should be represented with:

- Original URL
- Supabase Storage URL, once upload is restored
- Category
- Confidence score
- Source page
- Alt text
- Nearby heading
- Nearby paragraph
- Logo flag
- Visible-text flag
- Width and height when known
- Hero-selection exclusion flag

## Categories

Supported categories:

- Hero
- About
- Facilities
- Suites / Rooms
- Services
- Gallery
- Reviews
- Owner
- Contact
- Social / Open Graph
- Logo
- Decorative
- Background
- Unknown

## Selection Rules

Templates should select images by category and confidence, not by array position.

Hero selection priority:

1. Actual hero/banner image from the website.
2. Main homepage banner/background.
3. Highest-confidence Hero image.
4. Highest-confidence Facilities image if no Hero exists.
5. Open Graph image only as a last resort.
6. Placeholder only if no usable imported image exists.

When a valid imported hero exists, templates must not use:

- Logo images
- Open Graph images
- Banner graphics with visible text
- AI-generated seeded demo artwork
- Decorative images

## Storage

The catalogue includes `supabaseStorageUrl` so the storage pipeline can later replace original owner-site URLs with CatStays-owned URLs without changing template-selection logic.

Until upload is restored, selectors should use `supabaseStorageUrl || originalUrl`.

## Current Runtime Owners

- Scraper catalogue creation: `artifacts/api-server/src/lib/catteryWebsiteScraper.ts`
- Imported preview normalization: `artifacts/catstays/src/app/lib/deloraineDemo.ts`
- Media assignment engine: `artifacts/catstays/src/app/lib/mediaEngine.ts`
- Template rendering: `artifacts/catstays/src/app/pages/onboarding/CatstaysTemplateSite.tsx`

See also: `docs/architecture/media-engine.md`

## Non-Goals

This architecture does not change layout, templates, onboarding flow, publish flow, FAQ logic, typography, or spacing.

This architecture does not restore Supabase image upload by itself. Upload restoration should be handled in a follow-up storage-pipeline branch.

## Verification Example

For Deloraine import, the expected preview selections are:

- Hero: real homepage hero/background image.
- Facilities: real cattery building or facilities image.
- Suites / Rooms: real room images.
- Services: real service-related images where available.
- Open Graph: retained in catalogue but only used as last resort.
- Seeded demo banner: not used when valid imported images exist.
