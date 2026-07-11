# Deployment Status

Last reviewed: 2026-07-12

## GitHub

Repository: `github.com/vanessanz78/catstays`

GitHub is the source of truth. Replit should pull from GitHub rather than acting as the permanent source of project knowledge.

## Replit

Replit configuration exists in `.replit`.

Use this in the Replit shell to pull the latest GitHub version and restart the visible CatStays frontend. Replace `main` with the active branch when testing a feature branch:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main

pkill -f "vite|tsx|node" || true
pnpm --filter @workspace/catstays run dev
```

Every future Replit pull handoff should include both the pull commands and the stop/start block. This prevents Replit from continuing to serve old frontend code after a branch switch or pull.

If Replit says branches have diverged, stop and decide whether to preserve Replit-only changes before resetting or merging.

## Supabase

Supabase is configured through environment variables and migrations in the repository.

Live Supabase health was not independently verified in this audit. The next verification should confirm:

- Migrations are applied.
- Auth email templates are configured.
- RLS policies match production expectations.
- Storage buckets exist if photo uploads are enabled.

## Production

A production public URL was not confirmed during this audit.

Before declaring production ready:

- Verify deployed Replit URL.
- Verify public booking submission.
- Verify owner dashboard login.
- Verify customer portal login.
- Verify Stripe test mode.
- Verify email delivery.
- Verify tenant routing and custom-domain behavior.
