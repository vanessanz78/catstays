# ADR-003: Full Website Import Pipeline

Status: Accepted
Date: 2026-08-09
Working ref: import/full-site-source-truth-20260809

## Context

CatStays website import was treating a submitted URL as a homepage scrape and then letting downstream template fallback fill gaps with generic content and imagery. Founder UAT with Fancy Felines showed this breaks the Open Home principle that the supplied website is source evidence, not inspiration.

ADR-001 remains frozen. This ADR extends the Phase 2 Content Sources implementation with a crawl-first import pipeline while preserving the approved lifecycle:

Content Sources -> Media Library -> Content Library -> Assignment Engine -> Draft -> Preview -> Verification -> Published Version -> Audit History.

## Decision

CatStays imports a website by crawling same-domain public pages first, then extracting structured page content and image evidence before generating the one-page CatStays preview.

The importer must:

- normalize the submitted URL and canonical domain
- follow same-domain internal links, including navigation, body, footer, and sitemap links
- ignore external, admin/private, non-HTTP, tracking, fragment-only, and obvious duplicate URLs
- store page-level crawl evidence inside the Content Source payload
- persist extracted content blocks into `content_library`
- persist imported source images into `media_library`
- store imported image files in Supabase Storage
- report pages scanned, images found/imported, content blocks, and page failures back to the UI
- use existing CatStays template sections and omit unsupported/missing sections rather than inventing filler

## Alternatives Considered

Creating new `website_import_*` tables was rejected for this phase because ADR-001 already defines `content_sources`, `content_library`, `media_library`, and `website_events` as the durable owners of source evidence and lineage.

Hard-coding Fancy Felines page paths was rejected because Fancy Felines is the acceptance case, not a product-specific rule.

Keeping generic fallback rooms, services, testimonials, and stock-like images for imported sites was rejected because it hides extraction failure and produces fabricated business claims.

## Consequences

The first implementation remains bounded by sensible crawl limits and synchronous request/response import status. A future background job can improve live progress updates without changing the source-of-truth model.

Runtime UAT must prove the Fancy Felines import scans more than the homepage, persists source evidence in Supabase, imports real images, and generates a one-page CatStays site without unrelated filler.
