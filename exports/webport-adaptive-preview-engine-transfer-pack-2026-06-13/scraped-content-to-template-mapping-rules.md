# Scraped Content To Template Mapping Rules

## Rule 1: Scrape Once, Render Many

The scrape result should be normalized into a canonical content object once.

Every template should consume the same canonical object.

Do not rescrape or regenerate content just because a user switches from one preview style to another.

## Rule 2: Preserve Source Evidence

Every meaningful extracted item should keep a source reference:

- source URL,
- source page,
- selector or extraction method,
- original text or image URL,
- confidence score.

This lets WebPort explain where content came from, rerun partial extraction, and avoid overwriting owner-approved edits.

## Rule 3: Templates Are Style Adapters

Each template should declare:

- preferred section order,
- typography style,
- colour palette,
- spacing scale,
- image treatment,
- CTA treatment,
- optional section variants.

Each template should not declare hard maximums for source content.

Bad:

```json
{ "features": { "maxItems": 4 } }
```

Better:

```json
{
  "features": {
    "preferredTreatment": "cards",
    "overflowTreatment": "responsive-grid-or-carousel"
  }
}
```

## Rule 4: Map By Meaning, Not Position

Do not map scraped content into template slots by index alone.

Bad:

- first image -> hero
- second image -> about
- third image -> gallery

Better:

- hero image -> largest image near title or open graph image,
- owner image -> image near owner/about text,
- room image -> image near room/rate copy,
- service image -> image near service copy,
- gallery image -> image that is content-rich but not already assigned.

## Rule 5: Never Discard Content

If the canonical object has more content than a template reference expects:

- add rows,
- add carousel slides,
- add a modal,
- add an accordion,
- add a detail drawer,
- add footer/chatbot access,
- or add a same-style section extension.

The content should remain accessible.

## Rule 6: Handle Sparse Content Gracefully

If the canonical object has less content than a template reference expects:

- rebalance columns,
- centre the content,
- remove empty placeholders,
- reduce section height,
- avoid fake filler unless explicitly marked as AI suggested draft content.

## Rule 7: Navigation Must Match Real Sections

Top navigation links should only appear when the destination section exists.

Every nav item must anchor to an element on the rendered page.

For previews:

- buttons that normally submit bookings/enquiries should show a preview-mode message,
- anchors should scroll within the preview page,
- selected device mode should persist across template switches.

## Rule 8: Original Is Not An Iframe Shortcut

The "Original" version should be a recompiled rendering of the scraped source, not a live iframe of the old site.

Original should:

- preserve colour, font, layout, content order, and copy as closely as possible,
- use the same canonical content object where practical,
- keep all source content available,
- be rendered within the same responsive device preview constraints as other templates.

## Rule 9: AI Rewrites Must Preserve Structure

Prompt-based rewrites should update fields inside the canonical object.

They should not delete IDs, source evidence, room counts, review counts, image counts, FAQ counts, or booking rules.

Example:

Input prompt:

> Make this site sound more premium.

Expected behaviour:

- rewrite headings and body copy,
- preserve rooms,
- preserve services,
- preserve prices unless explicitly asked,
- preserve contact details,
- preserve all images,
- update change history.

## Rule 10: Template Selection Should Be Data-Driven

When a user selects a template:

1. Use the canonical content object.
2. Apply template style hints.
3. Run adaptive layout rules.
4. Run content coverage audit.
5. Render preview.

Publishing should promote the selected template and current canonical content snapshot to live.
