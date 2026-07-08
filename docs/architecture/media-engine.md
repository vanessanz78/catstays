# Media Engine Architecture

Last reviewed: 2026-07-08

## Purpose

CatStays separates image decisions from page rendering.

The Media Engine decides what images should be used. The Renderer decides how those images are displayed.

This boundary exists so future image discovery, classification, upload, or fallback changes cannot accidentally alter template layout, spacing, typography, cards, or footer styling.

## Layer 1: Media Engine

Runtime owner:

- `artifacts/catstays/src/app/lib/mediaEngine.ts`

The Media Engine is content-only. It may:

- Normalize imported media catalogue items.
- Select display URLs using `supabaseStorageUrl || originalUrl`.
- Classify and prioritize images by category.
- Pick hero, about, facilities, suites, services, gallery, reviews, owner, contact, and logo images.
- Enforce image uniqueness for section assignments.
- Use imported images before generic placeholder images.
- Use Open Graph images only as a last resort.
- Return final image URLs and metadata.

The Media Engine must never:

- Render React.
- Import template components.
- Apply CSS.
- Know visual layout.
- Know padding, spacing, cards, typography, or footer styling.
- Make assumptions about how a section is displayed.

## Layer 2: Renderer

Runtime owners:

- `artifacts/catstays/src/app/lib/previewTemplates.ts`
- `artifacts/catstays/src/app/pages/onboarding/CatstaysTemplateSite.tsx`

The Renderer is presentation-only. It may:

- Receive final image URLs from the Media Engine.
- Place those URLs into the template content shape.
- Render sections, cards, typography, spacing, responsive behavior, and footer styling.
- Preserve the approved Deloraine visual baseline.

The Renderer must never:

- Classify images.
- Inspect image filenames.
- Guess categories.
- Search image arrays for a better image.
- Upload images.
- Scrape websites.
- Choose generic fallback images.

Renderer code should not contain selection helpers such as:

- `pickUniqueImage()`
- `chooseBestImage()`
- `fallbackImage()`
- `galleryImages[0]`
- `images[0]`

## Data Contract

The Media Engine returns a renderer-ready object:

```ts
interface MediaEngineImages {
  hero: string;
  about: string;
  facilities: string;
  suites: string[];
  services: string[];
  gallery: string[];
  reviews: string[];
  owner: string;
  contact: string;
  logo: string;
  catalogue: ImportedMediaCatalogueItem[];
  metadata: {
    confidence: Record<string, number | undefined>;
    source: Record<string, string | undefined>;
    pool: string[];
  };
}
```

The renderer consumes this as plain data:

```ts
content.hero.image = media.hero;
content.about.image = media.about;
content.facilities.image = media.facilities;
content.suites[index].image = media.suites[index];
content.services[index].image = media.services[index];
content.gallery = media.gallery;
```

## Example Flow

1. Scraper discovers images and creates media catalogue entries.
2. Import normalization calls `buildMediaEngineImages()`.
3. The Media Engine returns section-specific image URLs.
4. Preview data stores both `mediaCatalogue` and `mediaAssignments`.
5. Template content generation reads the assignments.
6. React components render the provided URLs using existing layout and styling.

## UAT Rule

Changing Media Engine code must not change:

- Layout
- Spacing
- Typography
- Footer styling
- Card structure
- Responsive behavior

Changing Renderer code must not change:

- Image classification
- Image confidence
- Image categories
- Image selection
- Supabase upload behavior

## Relationship To Media Catalogue

The media catalogue remains the source of image meaning.

The Media Engine is the source of image assignment.

The Renderer is the source of visual presentation.

Do not duplicate the central Codex Operating System in this repository. This document records only the project-specific CatStays media boundary.
