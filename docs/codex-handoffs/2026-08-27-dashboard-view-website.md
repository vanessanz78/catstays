# Staff dashboard View Website release checkpoint

Date: 2026-08-27

Working ref: `fix/dashboard-view-website-20260827`

Base ref: GitHub `main` at `6c7f455cd5b66bfd4043e0c128a6d5a81a162ed1`

## Issue

The Deloraine Cattery staff dashboard sidebar began with **Today** and **Edit Website**. It did not provide an immediate way for the cattery owner to leave the dashboard and open the public website.

## Evidence

- Founder screenshot and UAT feedback from `https://delorainecattery.catstays.app/staff-dashboard` on 2026-08-27.
- The shared dashboard menu in `artifacts/catstays/src/app/components/RightMenu.tsx` had no public-site entry.
- The same menu array renders the desktop sidebar and the mobile slide-out menu, so one ordered menu change covers both layouts.

## Change

- Added **View Website** as the first dashboard menu action.
- The action targets `/`, which opens the public homepage on the current cattery subdomain.
- Used a distinct external-link icon and the description **Open public website**.
- Kept **Today**, **Edit Website**, and all other dashboard actions in their existing relative order.
- No authentication, Supabase, API, routing-table, or database change is included.

## Branch validation

- `pnpm install --frozen-lockfile` — passed.
- `pnpm run typecheck` — passed across the workspace.
- `pnpm run build` — passed across the workspace. Existing Vite source-map and large-chunk warnings remain non-blocking.
- Focused menu-order assertion — passed: **View Website** is the first menu action and targets `/`.
- `git diff --check` — passed.

## Review and release workflow

1. Review the branch diff and GitHub checks.
2. Merge the reviewed branch into GitHub `main`.
3. Record and verify the resulting GitHub `main` commit SHA.
4. Pull that exact `main` commit into CatStays Replit.
5. Stop stale CatStays runtime processes, restart using the repository configuration, and republish.
6. Complete the customer UAT below on the published Deloraine Cattery site.

## Customer UAT

1. Sign in and open `https://delorainecattery.catstays.app/staff-dashboard` on desktop.
2. Confirm **View Website** is the first action beneath the **Dashboard / Deloraine Cattery** heading.
3. Confirm **Today** follows it and the rest of the existing dashboard menu is still present.
4. Select **View Website** and confirm the public Deloraine Cattery homepage opens at `https://delorainecattery.catstays.app/`.
5. Use the browser Back button and confirm the staff dashboard still opens normally.
6. On a phone-sized screen, open the dashboard menu and confirm **View Website** is also the first action and opens the public homepage.

## Acceptance boundary

The release is not complete merely because the branch builds or the pull request merges. Completion requires CatStays Replit to run the exact merged `main` SHA, a republish, and successful customer UAT on the live Deloraine Cattery domain.
