# Integrations

Last reviewed: 2026-06-12

## Supabase

Supabase provides authentication, database, RLS, and future storage. The repo includes migrations and auth email templates.

Open items:

- Verify live Supabase schema matches migrations.
- Apply branded auth email templates in the Supabase dashboard or automation process.
- Regenerate frontend database types.
- Tighten RLS before real customer data is trusted.

## Replit

Replit is the development and deployment surface. The repo includes `.replit` configuration for modules, deployment, post-merge setup, and environment variables.

Replit should pull from GitHub:

```bash
git pull --ff-only origin main
pnpm install
```

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

Imported images should be saved as a structured media catalogue before preview data is built. Each catalogue item records the original URL, future Supabase Storage URL, category, confidence, source page, nearby text context, logo/text flags, approximate dimensions when known, and whether it must be excluded from hero selection.

Template generation should select images by catalogue category and confidence. Hero selection prioritises real imported hero/background images, then high-confidence hero or facilities images, with Open Graph and placeholder/demo images only used as last resort.

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
