# Lessons Learned From CatStays And Boarding-Site Previews

## 1. The Original Site Must Be A Real Rebuild, Not A Shortcut

Users expect "Original" to look like the old site, but still be owned by the new system.

That means:

- scrape the site,
- rebuild the content,
- preserve the look as closely as possible,
- render it with the same responsive preview rules as every other template.

Avoid simply iframing the source site.

## 2. Fixed Template Counts Break Real Websites

Real websites rarely have exactly:

- 3 features,
- 4 rooms,
- 6 services,
- 8 images,
- 1 review,
- 5 FAQs.

The renderer must adapt to content count. Otherwise previews look broken, sparse, repetitive, or incomplete.

## 3. Missing Content Feels Like A Broken Scraper

When source websites contain rooms, services, FAQs, reviews, opening hours, directions, maps, virtual tours, and owner stories, those items need destinations in every preview.

If a template does not have a native slot, the renderer should add a same-style section extension.

## 4. Image Reuse Makes Previews Feel Fake

Do not reuse the same three images in every major section if more source images exist.

Recommended image allocation:

1. Hero image.
2. About/owner image.
3. Offer or room images.
4. Services images.
5. Gallery images.
6. Background/testimonial images.

If the source lacks enough suitable images, mark images as `aiSuggested` rather than silently duplicating.

## 5. Captions Are Often File Names

Scraped image captions are frequently useless file names or alt text fragments.

Default behaviour:

- do not show captions on gallery thumbnails,
- keep alt text for accessibility,
- allow caption editing in AI Studio/manual editor.

## 6. Reviews Should Be A Carousel

Source websites may contain many reviews.

Do not pull only one review.

Use:

- single quote banner for one review,
- card row for two or three,
- carousel for four or more.

## 7. FAQs Should Not Dominate The Main Page

FAQs are often long.

Recommended treatment:

- footer FAQ link,
- collapsible FAQ section when the template supports it,
- chatbot knowledge source,
- optional dedicated FAQ page.

## 8. Booking And Contact CTAs Must Do Something

Every button needs a destination:

- anchor to section,
- open booking modal,
- open enquiry modal,
- submit live form,
- show preview-mode message.

Buttons that go nowhere make previews feel unfinished.

## 9. Location, Directions, And Virtual Tours Matter

For accommodation, boarding, and local-service businesses, location information is often key conversion content.

If source contains:

- address,
- directions,
- landmark instructions,
- map,
- virtual tour,

then preview templates need to show or expose them.

## 10. Device Preview Must Render At The Target Width

Do not shrink a desktop website into a phone frame.

The preview frame should set the viewport width and allow the site CSS to respond naturally.

Device mode should persist when switching templates.

## 11. AI Studio Should Transform Content Without Losing Structure

Prompt-based editing is powerful, but it must not break the source model.

AI changes should:

- rewrite copy,
- adjust tone,
- suggest imagery,
- adjust section order,
- preserve counts,
- preserve IDs,
- preserve prices/contact details unless explicitly asked.

## 12. The Content Coverage Audit Should Run Before Publishing

Publishing should be blocked or warned when:

- source content exists with no destination,
- template output contains empty placeholder cards,
- scraped content count is greater than prepared content count,
- preview-only features are still connected to live actions incorrectly.

The audit is the practical guardrail that keeps WebPort from becoming a fragile template picker.
