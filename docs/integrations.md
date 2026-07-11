# Integrations

Last reviewed: 2026-07-12

## Supabase

Supabase provides authentication, database, RLS, and future storage. The repo includes migrations and auth email templates.

Open items:

- Verify live Supabase schema matches migrations.
- Apply branded auth email templates in the Supabase dashboard or automation process.
- Regenerate frontend database types.
- Tighten RLS before real customer data is trusted.

## Replit

Replit is the development and deployment surface. The repo includes `.replit` configuration for modules, deployment, post-merge setup, and environment variables.

Replit should pull from GitHub and restart the running frontend process. Replace `main` with the active branch when testing a feature branch:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main

pkill -f "vite|tsx|node" || true
pnpm --filter @workspace/catstays run dev
```

Every future Replit pull command in handoffs should include the stop/start block so UAT is not run against stale Vite, TSX, or Node processes.

If Replit reports diverged branches, stop before resetting or merging.

## Stripe

Stripe integration points exist for checkout, subscription verification, billing portal, and webhooks.

Open items:

- Verify test-mode flow end to end.
- Confirm frontend publishable key naming works in Vite.
- Define subscription entitlements for Starter, Professional, and Premium.
- Separate CatStays subscription billing from future cattery customer payments.

## Resend

Resend is used for transactional emails from the API server.

Open items:

- Verify booking request emails.
- Verify contact enquiry emails.
- Add branded templates for customer-facing messages.

## Website Scraping

Website import exists through the API server. The product goal is to turn an existing cattery website into a previewable CatStays site and setup draft.

Open items:

- Improve preview sizing and scroll behavior.
- Use real screenshots or rendered previews where possible.
- Rebuild template cards with premium above-fold cattery previews.

## Cloudflare And Custom Domains

Premium custom domains are planned. The intended workflow is:

1. Cattery requests a custom domain.
2. CatStays platform admin receives an action task.
3. Owner configures Replit and Cloudflare requirements.
4. Customer receives DNS instructions.

This workflow is not yet fully automated.
