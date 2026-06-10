# CatStays Product Foundation

CatStays is a white-label SaaS platform for cat boarding businesses. It is for catteries only: cats, cat owners, boarding rooms/runs, bookings, payments, and stay updates. Grooming and other appointment services can become future modules, but they are not part of the launch product.

## Product Promise

CatStays gives each cattery three connected products:

- A public cattery website at `{slug}.catstays.app`, with custom domains on premium plans.
- A mobile-first owner dashboard for bookings, rooms, cats, customers, payments, reminders, photos, and marketing.
- A customer portal where cat owners manage bookings, cat profiles, payments, and updates from their cat.

The homepage must immediately answer:

- Is this made specifically for cat boarding?
- Can I set it up quickly, even from an existing website?
- Can I run the cattery from my phone?
- Can customers book, change, cancel, and repeat bookings themselves?
- Can I send owners photo updates without writing every message from scratch?
- Does it include a website, dashboard, customer portal, payments, and a path to a custom domain?
- Does the price make sense for a small or boutique cattery?

## MVP Scope

1. Owner signup and onboarding
2. Existing website import or fresh AI-guided setup
3. Four website style previews using real images and extracted/given business details
4. Cattery slug creation and instant public site
5. Room/run setup, pricing, capacity, blackout dates, and booking rules
6. Public booking request flow connected to the cattery dashboard
7. Owner dashboard for accepting, declining, editing, and moving bookings
8. Customer portal for cat profiles, booking management, invoices, and stay updates
9. Photo update workflow with cat-voice postcard generation and owner approval
10. Social caption generation from approved photos and cattery voice
11. Stripe connection for taking customer deposits and payments
12. Premium custom-domain request workflow with CatStays-owner action tracking

## Not MVP

- Grooming appointment calendar
- Daycare scheduling
- Dogs, kennels, or general pet boarding
- Fully automated custom-domain provisioning without platform-owner oversight
- Fully automated social posting without owner review

## Reuse From StayDirect

The StayDirect codebase should be used as a reference and source for proven patterns, adapted into CatStays language and data:

- Website import/scrape flow
- Google Places-style assisted setup
- Template preview and selection persistence
- Slug and subdomain routing
- Custom-domain lifecycle and DNS instructions
- Stripe payment/subscription patterns
- Protected dashboard routing
- Replit-friendly local preview setup

Do not copy StayDirect accommodation wording, marketplace features, or unrelated travel modules into CatStays.

## Core Data Model Direction

The product needs a clean cat-boarding model:

- Platform owner: manages CatStays tenants, plans, billing, domain requests, and support.
- Cattery owner: owns one or more cattery sites.
- Cattery: business profile, slug, custom domain, website settings, booking rules, payment settings.
- Room/run: capacity, nightly pricing, photos, features, availability, inactive dates.
- Customer: cat owner login, contact details, billing details.
- Cat: belongs to customer, medical/vaccination/diet/behavior notes, photos.
- Booking: requested/confirmed/declined/cancelled/completed, dates, cats, room allocation, payments, notes.
- Stay update: photo(s), generated message, voice mode, approval status, delivery status.
- Domain request: requested domain, status, DNS instructions, internal action checklist.

## AI Workflows

AI should reduce owner work, not remove owner control.

- Website import: extract logo, photos, copy, business details, rooms, prices, and contact details where possible.
- Fresh setup: ask only for information AI cannot infer, then generate a complete preview.
- Cat postcards: default to first-person cat voice, with a toggle for staff voice.
- Social marketing: generate captions and suggested hashtags from photos, cattery tone, location, and recent themes.
- Variation memory: avoid repeating the same theme/message for regular customers.
- Approval gate: owner reviews and can edit before anything is sent or posted.

## Implementation Order

1. Make the current app boot reliably in local preview and Replit.
2. Remove pet/grooming/general kennel positioning from the primary product.
3. Replace placeholder website/demo imagery with real images or real UI previews.
4. Align schema and frontend models for catteries, rooms, cats, customers, and bookings.
5. Connect public booking submission to dashboard bookings.
6. Add owner/customer auth guards and tenant isolation.
7. Port the StayDirect website import/template preview pattern.
8. Port and adapt the custom-domain request/status workflow.
9. Add Stripe tenant/payment setup.
10. Add stay photo updates, AI postcard generation, and customer notifications.
11. Add PWA polish for owner and customer dashboards.
12. Audit, test, and deploy through GitHub as the source of truth.

## Active Follow-Up List

- Branded Supabase auth emails: templates now live in `supabase/auth-email-templates/` for signup confirmation, magic links, password reset, trial reminders, and billing reminders. Next step is pasting the Auth templates into Supabase and wiring the app transactional templates into scheduled billing/trial jobs.
- Email confirmation timing: account details are now saved as an onboarding draft first; the real Supabase user, cattery row, room setup, selected plan, and confirmation email are created when the owner publishes the site.
- Premium website templates: rebuild the six starter templates as real above-the-fold cattery websites with real photography, polished type, booking CTAs, and mobile-safe responsive layouts.
- Tenant dashboard routing: `catstays.app/admin` now points to the CatStays platform admin, `/staff-dashboard` is the cattery owner/staff dashboard entry, and `/client-portal` is the customer portal entry. The subdomain router also exposes `/staff-dashboard` and `/client-portal`.
- Tenant data isolation: publish-time provisioning is now server-side and creates the cattery/rooms from onboarding data instead of relying on browser writes before email confirmation. `/staff-dashboard` now opens a live/empty dashboard shell backed by tenant hooks instead of the demo-filled preview, and `/client-portal` now opens a clean portal entry instead of demo customer data. Next step is moving the remaining legacy admin subpages off mock data.
- Desktop dashboard layout: keep the current mobile-first dashboard, then add a proper laptop/iPad dashboard layout with richer cards, photos where useful, wider notifications, and no stretched mobile view.
- CatStays dashboard palette: dashboard states, badges, charts, tabs, imports, and payment screens should use navy, greys, terracotta, sand, and muted brown only.
- Data import validation: keep CSV detection, then add downloadable sample files for customers, cats, and bookings, plus mapping review before import.
- Stripe test mode: connect platform billing and cattery payment setup in test mode before live payments.
- Custom domain workflow: premium domain requests should create an owner-admin action for CatStays to configure Replit and Cloudflare, then show the cattery owner the DNS instructions they need.
- Marketing access during trial: all marketing materials and social tools are unlocked during the 14-day full-access trial, then locked by plan after the trial ends.
