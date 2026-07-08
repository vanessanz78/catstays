# Codex Handoff: CatStays Preview Polish

Date: 2026-06-13
Status: handoff checkpoint before local restart

## Working Principle

Use GitHub as the single source of truth. Keep local Mac usage light. Do not load or store large screenshots/raw scraped pages unless absolutely needed.

Legacy note: this handoff predates the latest central Codex Operating System. Future sessions must read `START_HERE.md` from `vanessanz78/codex-operating-system` before using this handoff.

## Current Repo State At Handoff

- Branch: `main`
- Local tree was clean before this handoff note.
- No preview-code changes were applied in this checkpoint.
- This note exists only to preserve the next work package safely in GitHub before restart.

## Latest User Feedback To Continue

Focus on polishing the adaptive cattery preview renderer:

1. Virtual tour
   - The current virtual tour section is incorrectly showing the whole website inside a small frame.
   - It should embed only the actual third-party virtual tour iframe from the scraped source.
   - Do not fall back to the source website or an internal `#virtual-tour` page.

2. Reviews
   - Only one review is currently shown.
   - Scrape or preserve multiple reviews where available.
   - If the source uses a third-party review widget, use a structured fallback based on the visible review content until CatStays has its own live review feed.
   - Review carousel arrows should have real additional cards to move through.

3. Owner/about images
   - The "About Paul and Vanessa Wilson" image is too tall.
   - Crop around the people and constrain height so it does not span multiple scrolls.
   - Keep image corner style consistent across the template.
   - Do not reuse the owner photo for "About Deloraine Cattery"; use a facility/cattery image there.

4. Content order
   - Put "About Deloraine Cattery" near the top, before or close to "Why choose Deloraine Cattery".
   - The order should answer visitor questions naturally: what this business is, why choose it, rooms/pricing, extra care, gallery, reviews, location, contact.

5. Booking strip
   - Make the booking strip full-width within the page.
   - "Book your cat's stay" should be the stronger heading.
   - Include calendar icons, actual date inputs, and a cats dropdown.
   - In preview mode, interaction should show a preview notice explaining that sign-up enables live bookings and dashboard capture.

6. Anchors
   - Top nav links and hero buttons such as "Discover our suites" and "Our care approach" must scroll inside the rendered preview content, not just change the outer browser hash or the top preview selector.

7. Contact/inquiries
   - Contact form should indicate enquiries go to the dashboard/inbox/email once live.
   - In preview mode, show an explanatory notice rather than silently doing nothing.

8. Footer
   - Remove FAQ dropdowns from the visible footer.
   - Remove virtual tour footer link if it does not point to the actual tour.
   - Add Host Login.
   - Use real social icons and scraped business social links.
   - Scrape and display full opening hours, not just "By appointment only".

9. Chatbot
   - Do not tell visitors to check the FAQ section.
   - The chat should answer from scraped/known site knowledge: hours, rooms, prices, services, location, contact details, hidden FAQ knowledge.
   - The chatbot should work in preview mode with the imported knowledge.

10. Adaptive layout
   - Keep the improvements already liked: centered rooms, gallery carousel, extra care carousel, locations.
   - Ensure mobile/tablet previews render as actual responsive mobile/tablet layouts rather than shrinking a desktop page into a small frame.

## Likely Files To Edit Next

- `artifacts/catstays/src/app/pages/onboarding/CatstaysTemplateSite.tsx`
- `artifacts/catstays/src/app/components/ChatWidget.tsx`
- `artifacts/catstays/src/app/lib/previewTemplates.ts`
- `artifacts/api-server/src/lib/catteryWebsiteScraper.ts`
- `artifacts/catstays/src/app/lib/deloraineDemo.ts`

## Suggested First Implementation Step

Start with a scoped pass:

1. Fix internal anchor scrolling in `CatstaysTemplateSite.tsx`.
2. Add preview-aware booking/contact interactions.
3. Pass structured imported knowledge into `ChatWidget`.
4. Prevent virtual tour fallback to the whole website.
5. Add multiple Deloraine review fallbacks if the third-party review widget cannot be scraped directly.
6. Run typechecks.
7. Commit and push to GitHub.
8. Give Vanessa the Replit pull shell prompt.

## Checks To Run

```bash
pnpm --filter @workspace/catstays run typecheck
pnpm --filter @workspace/api-server run typecheck
```

## New Chat Starter

Paste this at the top of the next Codex chat:

> Continue CatStays from GitHub as the source of truth. First read `START_HERE.md` from `vanessanz78/codex-operating-system` and follow the central Operating System. If this legacy handoff is still relevant after startup, read `docs/codex-handoffs/2026-06-13-preview-polish-handoff.md`, then continue the adaptive preview polish. Keep local Mac usage minimal, avoid large screenshots/raw scraped pages, commit/push to GitHub when done, and give me the Replit shell prompt to pull the latest version.
