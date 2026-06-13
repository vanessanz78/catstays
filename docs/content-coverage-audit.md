# CatStays Content Coverage Audit

## Purpose

CatStays should never lose content when a scraped cattery website is converted into a preview template.

The content pipeline should work like this:

1. Scrape the owner site.
2. Categorize the content into a shared content library.
3. Prepare every category for rendering.
4. Let the adaptive layout engine decide the best visual treatment.

Templates are visual references only. They should not decide how many rooms, reviews, images, services, FAQs, or feature cards are allowed to exist.

## Audit Utility

The first guardrail is `createContentCoverageAudit` in:

`artifacts/catstays/src/app/lib/contentCoverageAudit.ts`

It compares scraped/source content against prepared preview content for:

- Business identity
- Hero content
- Why choose / feature cards
- Facility and care details
- Rooms / suites
- Additional services
- Gallery images
- Reviews and testimonials
- FAQs
- Owner story
- Commitment / trust points
- Location and directions
- Virtual tour
- Contact details and enquiry form

Each category reports:

- `sourceCount`
- `preparedCount`
- `status`
- preview destinations
- recommendations when content is missing or partially prepared

## Current Product Rule

If source content exists, it must either be:

- rendered visibly,
- available through an adaptive carousel/gallery/modal,
- available in a collapsed section,
- or available to the chatbot/assistant as structured site knowledge.

It should not be silently discarded.

## Next Implementation Step

Use this audit output to drive the adaptive layout engine:

- Feature cards rebalance by count.
- Reviews become a carousel when there are more than the visual reference expects.
- Galleries become a carousel, slider, or masonry layout based on image count.
- Rooms extend into extra rows while keeping the same visual style.
- FAQs move to footer/chatbot access unless a dedicated FAQ section is selected.

This keeps the scraped content as the source of truth while letting each template remain visually polished.
