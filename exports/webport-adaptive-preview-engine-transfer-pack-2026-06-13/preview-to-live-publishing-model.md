# Preview To Live Publishing Model

## States

WebPort should keep preview work separate from the live website.

Recommended states:

- `scraped` - raw source has been fetched and parsed.
- `normalized` - source content has been converted into canonical content.
- `preview` - one or more templates are rendering from canonical content.
- `selected` - user has selected one preview style as preferred.
- `ready` - coverage audit has no required missing content.
- `live` - selected preview and canonical content snapshot have been published.
- `archived` - old live snapshot kept for rollback.

## Core Records

### Source Scrape Record

Stores:

- source URL,
- source host,
- scrape timestamp,
- raw extraction references,
- extraction confidence,
- source evidence refs.

This can be large internally, but it should not be bundled into transfer packs unless needed.

### Canonical Content Record

Stores:

- business identity,
- sections,
- assets,
- offers/rooms/services,
- reviews,
- FAQs,
- locations,
- contact details,
- booking details,
- AI Studio edit history.

This is the source of truth for all templates.

### Preview Session Record

Stores:

- canonical content ID,
- available template IDs,
- selected template ID,
- selected device mode,
- per-template style settings,
- coverage audit result,
- preview timestamps.

### Live Site Record

Stores:

- canonical content snapshot ID,
- live template ID,
- published domain/subdomain,
- published asset manifest,
- published routes,
- rollback snapshot ID.

## Publishing Flow

1. User enters source URL.
2. WebPort scrapes source.
3. WebPort normalizes scrape into canonical content.
4. WebPort creates preview session.
5. User switches between templates.
6. Each template renders from the same canonical content.
7. User applies AI Studio edits or manual edits.
8. WebPort reruns the coverage audit.
9. User selects preview and clicks publish/get started.
10. WebPort creates an immutable live snapshot.
11. Live site points to selected template plus snapshot.
12. Dashboard and "View Website" read from live snapshot.

## Important Rules

- Template switching should not delete content.
- Publishing should not rescrape unless the user requests a refresh.
- Live publishing should be idempotent.
- The selected template should be saved as metadata, not copied into every content field.
- If a user changes template from the dashboard later, the same canonical content should repaint into the new template.
- AI Studio edits should update the canonical content, not just one template's rendered HTML.
- Old live snapshots should remain available for rollback.

## Preview Mode Behaviour

In preview mode:

- booking forms do not submit live bookings,
- contact forms do not send real enquiries unless explicitly configured,
- CTA buttons show a preview-mode message when they cannot complete,
- nav items still anchor inside the preview,
- mobile/tablet/desktop device choice persists between template switches.

Suggested preview message:

> This is a preview. Publish your site to start taking bookings and enquiries from this form.

## Live Mode Behaviour

In live mode:

- booking widgets connect to the booking engine or dashboard,
- contact forms route to the configured inbox/CRM,
- chatbot answers from the canonical content knowledge source,
- all assets are served from WebPort-managed storage/CDN,
- selected template and content snapshot are versioned.
