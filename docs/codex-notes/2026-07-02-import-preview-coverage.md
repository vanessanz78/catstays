# CatStays Import Preview Coverage Note

Date: 2026-07-02

This note records local Codex work that could not be pushed directly from the session because HTTPS Git credentials were unavailable and `gh` was not installed.

## Local source state

Local sparse checkout path:

`/Users/vanessa/Documents/Codex/2026-07-01/git-2/work/catstays-sparse`

Remote base observed before the work was still:

`aec94b0d606c433f379831c0f7aceecff2967264`

Local commits ahead of `origin/main`:

- `437b7d4 Improve imported cattery preview coverage`
- `8e710c7 Use imported address for onboarding location`
- `cd45a79 Persist website builder hero edits`
- `8bb2e0d Separate imported builder sections`
- `10233c9 Keep duplicate publish errors on publish step`
- `5c52e58 Align builder suites and remove duplicate facility cards`
- `a4ac72f Use imported owner and gallery assets`

## Patch backup

Patch files were created locally under:

`/Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs`

Key artifact:

`2026-07-02-catstays-import-preview-coverage.patch.gz.b64`

Approx sizes:

- Patch: 245,851 bytes
- Gzip patch: 52,660 bytes
- Base64 gzip: 70,217 bytes

The patch can be reconstructed locally with:

```bash
base64 -d /Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch.gz.b64 | gunzip > /Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch
```

Then applied from a clean repo checkout with:

```bash
git apply /Users/vanessa/Documents/Codex/2026-07-01/git-2/outputs/2026-07-02-catstays-import-preview-coverage.patch
```

## What the local patch covers

- Publish duplicate-email errors stay on the publish step instead of looping back to step 1.
- Imported cattery images are copied into Supabase/CatStays storage during website scrape when service credentials are configured.
- Pasted remote image URLs use the same server-side copy route before being saved in the website builder.
- Stock/filler image fallbacks were removed from generated templates and previews.
- Broken or missing image slots render as neutral empty areas rather than stock cats.
- Gallery images use real imported/site photos only and may reuse photos already used elsewhere on the page.
- Owner story no longer falls back to generic About/business copy; it only renders real owner/team/story content or user-entered content.
- Website builder ordering and fields were aligned more closely with top-to-bottom preview order, including suite bullets and owner/gallery fields.
- Short suite/card collections are centered; larger sets use a horizontal rail.
- Sprint and decision docs were updated with the no-logo/no-stock image rules and owner/gallery UAT guidance.

## UAT to run after source patch is saved to main

1. Reimport `https://fancyfelines.nz` and confirm the demo URL uses the imported slug, such as `/demo/fancyfelines`, not `/demo/deloraine`.
2. Confirm hero/header images are real site photos, not logos or stock photos.
3. Confirm no broken image icons appear; missing images should show a quiet empty area or hide the section.
4. Confirm gallery uses only real imported photos and can reuse a photo from another section.
5. Confirm owner story is hidden when no owner/team/story content exists, then appears when entered in the builder.
6. Confirm pasted image URLs are copied into CatStays/Supabase storage and the stored URL is used afterward.
7. Confirm suite bullet points are editable in the builder and reflected in preview.
8. Confirm duplicate publish email conflict stays on the Publish step with a clear inline error.
