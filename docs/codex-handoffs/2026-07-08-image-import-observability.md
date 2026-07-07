# CatStays Image Import Observability Handoff

Date: 2026-07-08

Working ref: `codex/image-import-observability`

## Scope

This branch is diagnostic only.

It does not change layout, templates, builder behavior, onboarding behavior, publish flow, FAQ logic, image selection behavior, or storage behavior.

It does not merge PR #7 and does not restore old commits.

## What Changed

- Added a passive image import flight recorder for discovery, validation, upload, upload result, builder URL, and preview URL stages.
- Added temporary development-only endpoint `GET /api/debug/image-import`.
- Added browser console diagnostics where imported image URLs are written into builder data and where preview image fields are computed.
- Kept existing import output unchanged.

## Debug Endpoint

Development endpoint:

```text
/api/debug/image-import?url=https%3A%2F%2Fwww.delorainecattery.com
```

Production guard:

- Disabled when `NODE_ENV=production`.
- Can only be enabled in production-like local testing with `CATSTAYS_ENABLE_DEBUG_ENDPOINT=true`.
- Remove this endpoint after the image pipeline fix is verified.

## Deloraine Diagnostic Run

Source URL:

```text
https://www.delorainecattery.com
```

Result:

- Images found: 1
- Accepted by current scraper URL rules: 1
- Rejected by current scraper URL rules: 0
- Upload attempted: no
- Upload succeeded: no
- Supabase Storage URLs created: no
- Matching Supabase Storage objects found for Deloraine/cattery/og-image: none

Current discovered image:

```text
https://delorainecattery.com/og-image-v1.jpg
```

Current response headers for that image:

```text
content-type: image/jpeg
content-length: 219542
```

The older Deloraine asset URL pattern still responds as HTML, not image bytes:

```text
https://www.delorainecattery.com/assets/Deloraine%20Cattery%20Building-CX1rWDRb.png
content-type: text/html; charset=UTF-8
```

## Builder URLs

All builder URLs in the diagnostic run remained external owner-site URLs:

```text
Hero image: https://delorainecattery.com/og-image-v1.jpg
Builder media image 1: https://delorainecattery.com/og-image-v1.jpg
Builder gallery image 1: https://delorainecattery.com/og-image-v1.jpg
Builder service image 1: https://delorainecattery.com/og-image-v1.jpg
Builder service image 2: https://delorainecattery.com/og-image-v1.jpg
```

No builder URL was a Supabase Storage URL.

## Preview URLs

Preview attempted these image URLs in the diagnostic mirror:

```text
Preview hero image: https://delorainecattery.com/og-image-v1.jpg
Preview about image: https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop
Preview facilities image: https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop
Preview owner image: https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=900&fit=crop
Preview suite image 1: https://delorainecattery.com/og-image-v1.jpg
Preview suite image 2: https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop
Preview suite image 3: https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop
Preview service image 1: https://delorainecattery.com/og-image-v1.jpg
Preview service image 2: https://delorainecattery.com/og-image-v1.jpg
```

No preview URL was a Supabase Storage URL.

## First Failure Point

The first failure point is Stage 3 - Upload.

The current import path discovers and accepts an external image URL, then carries that same external URL into builder/preview data. There is no Supabase Storage copy/upload stage wired between scrape and builder storage.

## Recommended Follow-Up Branch

Recommended branch:

```text
codex/image-storage-pipeline-fix
```

Smallest safe change for that branch:

- Add a server-side image copy step after discovery/validation and before returning scrape data to the frontend.
- Download only accepted image URLs.
- Validate actual response content type and size before upload.
- Upload accepted image bytes into a CatStays-owned Supabase Storage bucket.
- Replace every accepted original URL in scrape output with the resulting Supabase Storage URL before builder data is created.
- Leave layout, templates, onboarding step order, publish flow, and FAQ logic unchanged.
- Remove `/api/debug/image-import` after UAT proves the storage URLs reach builder, preview, and published site.
