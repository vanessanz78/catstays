# CatStays UAT Feedback

Last updated: 2026-06-12 12:43 NZST

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
