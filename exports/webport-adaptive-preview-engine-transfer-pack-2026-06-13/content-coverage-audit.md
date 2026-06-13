# Content Coverage Audit Structure

## Goal

The content coverage audit prevents WebPort from dropping scraped content when switching templates.

The audit compares:

`source content count` vs `prepared/renderable content count`

It should run after scraping and content normalization, before rendering preview templates.

## Audit Statuses

- `covered` - source content exists and has an equal or greater prepared/renderable count.
- `partial` - source content exists, but some items are not prepared/renderable.
- `missing` - source content exists, but no destination exists.
- `not-found` - the source did not contain this category.

## Required Categories

Every WebPort project should audit at least these categories:

- business identity
- logo and brand assets
- hero content
- primary navigation labels
- CTAs
- about/business story
- features/benefits
- services/offers/products/rooms
- pricing
- image gallery
- video/virtual tour embeds
- testimonials/reviews
- FAQs
- contact details
- contact form
- location/map/directions
- opening hours
- social links
- policies/legal details
- booking/enquiry flow
- chatbot knowledge source

Domain-specific categories can extend this list. For example:

- accommodation: rooms, rates, amenities, host story, booking rules, check-in rules.
- cattery/boarding: room types, daily care, vaccination rules, medication, opening hours, pickup/drop-off.
- professional services: packages, case studies, credentials, intake form.
- ecommerce: products, variants, stock state, delivery/returns.

## Audit Item Shape

```json
{
  "category": "gallery",
  "label": "Gallery images",
  "sourceCount": 23,
  "preparedCount": 23,
  "status": "covered",
  "destinations": ["Gallery carousel", "Image thumbnails", "AI Studio media library"],
  "notes": ["Display threshold exceeded; renderer should use carousel plus thumbnails."]
}
```

## Audit Summary Shape

```json
{
  "businessName": "Example Business",
  "sourceUrl": "https://example.com",
  "selectedTemplateId": "editorial",
  "summary": {
    "totalCategories": 19,
    "coveredCategories": 17,
    "partialCategories": 1,
    "missingCategories": 1,
    "sourceItems": 91,
    "preparedItems": 89
  },
  "recommendations": [
    "Gallery images: route all source images into an adaptive carousel before publishing.",
    "Virtual tour: add a destination section or chatbot reference before publishing."
  ]
}
```

## Pass/Fail Gate

Preview generation can pass with `not-found` categories.

Preview generation should fail or warn strongly when:

- any category is `missing`,
- any required category is `partial`,
- source item counts exceed rendered/prepared item counts,
- template output contains empty placeholder slots,
- template output contains blank cards,
- template output contains duplicated fallback content while source content exists.

Publishing to live should not be allowed when required categories are `missing`.

## Practical CatStays Finding

The most common content loss happened where visual templates assumed fixed counts:

- feature cards capped at 4,
- facility items capped at 6,
- gallery images capped at 12 or 16,
- reviews capped at 10,
- FAQs previewed as only 8 footer links,
- room feature bullets capped at 4 or 6.

Those caps are acceptable as display thresholds only if the extra content is still accessible through carousel pages, modals, accordions, chatbot knowledge, or a media library.
