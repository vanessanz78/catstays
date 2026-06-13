# WebPort Adaptive Preview Engine Transfer Pack

Created from the CatStays adaptive preview work on 2026-06-13.

## Purpose

This pack gives WebPort a portable architecture for:

- scraping an existing website,
- storing all scraped content in a canonical content model,
- rendering that content into multiple preview styles,
- preventing templates from dropping source content,
- allowing a selected preview to become the live website.

It does not include screenshots, raw scraped websites, or heavy assets.

## Core Principle

WebPort is not a template system.

WebPort should be:

`Scraped content -> Canonical content schema -> Adaptive layout engine -> Renderer -> AI Studio -> Published website`

Templates should influence:

- visual style,
- typography,
- spacing,
- colour,
- section rhythm,
- section ordering.

Templates should not decide:

- how many rooms/offers exist,
- how many images are allowed,
- how many reviews are shown,
- how many features are rendered,
- whether FAQs, contact details, maps, or virtual tours are discarded.

## Files

- `manifest.json` - machine-readable index of this export.
- `content-coverage-audit.md` - audit structure for checking source content against rendered/prepared content.
- `canonical-content-schema.json` - reusable JSON schema for scraped website content.
- `scraped-content-to-template-mapping-rules.md` - mapping rules from scrape to canonical content to template sections.
- `adaptive-layout-rules.json` - machine-readable layout rules for grids, carousels, image galleries, testimonials, rooms, services, and device previews.
- `preview-to-live-publishing-model.md` - model for preview sessions, selected templates, and publishing.
- `content-drop-prevention-tests.json` - test cases WebPort should add to prevent scraped content being lost.
- `lessons-learned.md` - practical lessons from CatStays/cattery and boarding-site preview work.

## How WebPort Should Use This

1. Add the canonical schema as the data contract between scraper and templates.
2. Add the content coverage audit before template rendering.
3. Replace fixed template item counts with adaptive layout rules.
4. Add the content-drop prevention tests before expanding to more templates.
5. Keep original scrape, generated previews, selected preview, and live website as separate states.

## Definition Of Done

A WebPort preview is only ready when:

- every scraped content category has a destination,
- no item is silently discarded,
- excess content becomes a carousel, gallery, modal, collapsed section, or chatbot knowledge,
- sparse content is visually rebalanced,
- mobile, tablet, and desktop previews render as actual responsive layouts,
- the selected preview can be promoted to live without regenerating or losing content.
