# CatStays UAT Feedback

Last updated: 2026-06-12 14:28 NZST

## Working Agreement

- GitHub is the source of truth for project notes and changes.
- Use Replit for published previews when an existing Replit deployment URL is confirmed.
- Use the lightest practical local preview only when no cloud preview URL is available.
- Commit UAT notes and fixes intermittently so the latest project state is recoverable from GitHub.

## Current Preview Setup

- Repository: `vanessanz78/catstays`
- Branch: `main`
- App artifact: `artifacts/catstays`
- Preview command: `pnpm --filter @workspace/catstays run dev`
- Preview URL for this Codex session: `http://localhost:21524/`
- Public production URL: not confirmed in `docs/deployment-status.md` as of 2026-06-12.

## Feedback Queue

Record UAT findings below using this format:

```text
- Page:
- Device:
- What you clicked:
- What you expected:
- What happened:
- Severity: blocker, high, medium, low
- Notes or screenshot link:
```

## Findings

### 2026-06-12 12:43 NZST - Deloraine Demo Preview Chrome

- Page: `/demo/deloraine`, `/demo/deloraine-dashboard`, `/demo/deloraine-client`
- Device: desktop preview, plus mobile and tablet frame checks
- What you clicked: customer website, staff demo, client portal, mobile, tablet, desktop preview controls
- What you expected: the demo page should not expose source/import details to customers, should not repeat the same mode controls below the hero, and should devote the lower page area to the actual product render.
- What happened: the source URL/status card, Source button, Refresh button, repeated lower mode controls, explanatory lower paragraph, and bottom active-state card were taking space and showing internal information.
- Severity: medium
- Resolution: fixed in commit `c844a57` by moving demo status and CTA into a thin navy banner, keeping mode/device controls in a compact navy strip, adding hover descriptions for mode tabs, and rendering only the actual device/product preview below.

### 2026-06-12 13:17 NZST - Home Page Preview, Banner, Icons, And Demo Device State

- Page: `/`, `/demo/deloraine`, `/demo/deloraine-dashboard`, `/demo/deloraine-client`
- Device: desktop preview, plus tablet persistence check
- What you clicked: home page URL form, demo tabs, tablet device control, staff demo, client portal
- What you expected: the home page should not show the embedded preview mockup after the URL form; the Vanessa testimonial should use the supplied full banner image; CatStays logo should be used for favicon/install icons; the demo header should only say Demo in the middle; desktop preview should use full width and page scroll; the chosen device should persist between demo tabs.
- What happened: the home page showed a large browser preview, the testimonial was still the old card-style image, demo header included extra Pricing/import copy, and desktop preview was constrained in its own scroll frame.
- Severity: medium
- Resolution: fixed in commit `ddc6888` by removing the home page mockup preview, adding the Vanessa banner image, adding favicon/apple/install icons and manifest metadata, simplifying the demo header, making desktop preview full-width with page scroll, and saving the selected device mode across demo route changes.

### 2026-06-12 13:50 NZST - Client Portal Mobile Preview Card Wrapping

- Page: `/demo/deloraine-client`
- Device: mobile preview frame
- What you clicked: client portal, mobile device control, dashboard shortcut cards, pets, profile, and bookings views
- What you expected: words should not escape or be squeezed into unreadable columns inside the simulated mobile device. Where needed, controls and cards should stack vertically or use legible sizing.
- What happened: the dashboard shortcut cards for My Bookings, My Pets, and My Profile were still using desktop column logic inside the phone frame, which made labels wrap awkwardly.
- Severity: high
- Resolution: fixed in commit `1700b0d` by passing the selected preview device into the customer portal screens, stacking mobile shortcut cards and key nested layouts, widening mobile action buttons, and restoring demo pets/bookings data so UAT views show realistic content. Verified with type check and browser layout measurements showing no overflow on dashboard cards, pets, profile fields, or booking rows.

### 2026-06-12 14:10 NZST - Website Scraper Source URL Hardwired To Deloraine

- Page: `/`, `/demo/deloraine`, `/demo/deloraine-client`
- Device: desktop preview
- What you clicked: entered `https://harrishillton.co.nz/` into the home page website URL form, generated a preview, then opened the client portal tab.
- What you expected: the generated preview should scrape and render the entered website instead of Deloraine Cattery.
- What happened: the home form saved the typed URL, but the demo route always called the scraper with `https://www.delorainecattery.com/`, so every generated preview was effectively hardwired to Deloraine.
- Severity: high
- Resolution: fixed in commit `78c784b` by passing the requested URL into the demo route, preserving the imported source across demo tabs, using cached preview data only when it matches the requested source, and preventing generic `Home` headings from replacing the real scraped title. Verified with `https://harrishillton.co.nz/`: the hero and client portal render `Harris Hillton`, use Harris Hillton imagery, and no longer contain Deloraine Cattery text.

### 2026-06-12 14:28 NZST - Exact Website Import And Publish Failure

- Page: `/demo/deloraine?source=https%3A%2F%2Fharrishillton.co.nz%2F`, `/onboarding`
- Device: desktop and mobile preview frames
- What you clicked: generated a Harris Hillton preview, switched device views, then attempted to publish during onboarding step 7.
- What you expected: the imported website preview should preserve the original site's colours, fonts, and layout, and publish should create the cattery without blaming the selected template.
- What happened: the preview was still transforming scraped content into a CatStays template. Publish failed with a generic cattery provisioning error; local verification showed the frontend preview was running without the publishing API service on port 8080, so the selected template is not the likely cause.
- Severity: blocker
- Resolution: updated the website preview to render the original source site directly when an imported source URL exists, preserved that source URL through onboarding/demo state, and improved publish errors so a missing publishing service is reported clearly. Verified with `https://harrishillton.co.nz/`: the Website view iframe source is `https://harrishillton.co.nz/` at both desktop and mobile widths, and type check passes.
