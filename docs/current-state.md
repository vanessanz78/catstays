# Current State Audit

Last reviewed: 2026-06-12

## Audit Scope

This audit inspected the local GitHub checkout, existing documentation, Replit configuration, Supabase migrations, frontend routes, onboarding code, booking code, dashboard code, API server routes, and integration configuration.

Live Supabase console state, live Replit deployment health, and any public production domain were not fully verified from their external dashboards during this pass. The audit therefore treats checked-in migrations and configuration as the source of evidence for database and deployment status.

## Current State

CatStays currently includes:

- Marketing website for a cats-only cattery booking SaaS.
- Multi-step cattery onboarding flow.
- Website import and preview entry points.
- Public cattery website routes and tenant-aware routing helpers.
- Public booking request flow.
- Staff dashboard routes for bookings, calendar, customers, rooms, accounting, messages, promotions, social media, cat updates, insights, settings, payment, website editing, marketing, and subscriptions.
- Platform owner admin route at `/admin`.
- Customer portal and customer booking/profile routes.
- Supabase authentication and core cattery, room, customer, cat, booking, payment, and expense tables.
- Express API server for email, cattery provisioning, website scraping, booking requests, and billing.
- Replit deployment configuration.
- Stripe and Resend integration points.

The app is not yet production-complete. Several routes are polished prototypes or demo-first screens, and some dashboard/customer portal areas still use mock or localStorage data.

## Product Vision

CatStays is a white-label cattery management platform for cat boarding businesses only.

The product promise is:

- A polished public booking website.
- A mobile-friendly owner dashboard.
- A customer portal.
- Booking, room, customer, cat, payment, and communication workflows.
- Photo updates that let owners keep in touch while cats board.
- A fast setup path using either website import or guided setup.

CatStays should feel calm, premium, practical, and easy to operate from a phone. It should not become a generic pet, dog kennel, or grooming platform during the MVP.

## Platform Architecture

The frontend is a React/Vite app under `artifacts/catstays`. It contains marketing, onboarding, tenant site, staff dashboard, customer portal, and platform admin routes.

The API server is an Express app under `artifacts/api-server`. It exposes routes for:

- `/api/website/scrape`
- `/api/cattery/provision`
- `/api/cattery/verify-domain`
- `/api/bookings/request`
- `/api/email/*`
- `/api/billing/*`
- `/api/health`

Supabase provides authentication, database, RLS, and future storage. Replit provides development and deployment. GitHub is the source of truth.

## Customer Journey

The intended customer journey is:

1. Customer visits a cattery's public CatStays site.
2. Customer views rooms, pricing, availability, and cattery information.
3. Customer submits a booking request.
4. Cattery owner receives the request in the dashboard.
5. Customer receives confirmation and payment instructions.
6. Customer can use a portal to view bookings, cat profiles, invoices, and photo updates.

Current status:

- Public booking request flow exists.
- Booking request email/API route exists.
- Customer portal routes exist.
- Customer portal data and authentication are not fully production-wired.
- Customer profile and bookings screens still include demo behavior.

## Cattery Journey

The intended cattery journey is:

1. Cattery owner lands on CatStays.
2. They enter an existing website URL or start from scratch.
3. CatStays creates a preview website and setup draft.
4. The owner chooses a template, edits content, configures rooms and booking rules, and selects a plan.
5. Publishing provisions the tenant cattery and starts a 14-day trial.
6. The cattery receives a public website and staff dashboard.
7. The owner manages bookings, rooms, availability, customers, payments, photo updates, and communications.

Current status:

- Onboarding flow exists and is feature-rich.
- The flow is currently 9 steps, while older project notes mention a 7-step onboarding area to review.
- Publish-time provisioning exists for new catteries.
- Template previews need a premium rebuild.
- Data import exists as a prototype and needs deeper validation.

## Booking Workflow

Current booking flow:

- Public booking flow captures dates, room, customer details, cat details, and special requirements.
- Estimated totals, GST, discounts, and deposit values are calculated in the UI.
- Booking requests post to `/api/bookings/request`.
- The API attempts to create a pending booking and send owner/customer emails.
- Staff dashboard booking pages can read and create bookings through Supabase hooks.
- Booking status and payment status update hooks exist.

Main gaps:

- Availability rules need stronger server-side enforcement.
- Approval workflow needs clearer UI and state transitions.
- Deposits and Stripe payment capture are not yet fully verified end to end.
- Customer self-service booking changes are not production-ready.

## Boarding Workflow

Current boarding support is partial.

The dashboard shows arrivals, departures, occupied counts, bookings, room planning, and operational views. However, there is no complete durable boarding workflow yet for:

- Check-in.
- Stay notes.
- Feeding and medication tasks.
- Photo update schedule.
- Incident notes.
- Room changes during stay.
- Checkout.
- Post-stay follow-up.

Boarding should become a first-class workflow rather than only a booking status.

## Database Audit

Checked-in migrations define:

- `catteries`
- `rooms`
- `customers`
- `cats`
- `bookings`
- `booking_cats`
- `payments`
- `expenses`

Later migrations add:

- Auth-triggered cattery creation.
- Custom domain and payment settings fields.
- Stripe customer/subscription IDs.
- Public booking request fields.
- Room capacity and amenities.

Potential issues:

- Frontend TypeScript Supabase types appear behind the latest migrations.
- Public RLS policies are broad in places, especially public cattery reads, active room reads, and booking reads for availability.
- Customer portal access policies are not yet clearly separated from cattery owner access.
- Boarding/stay operational tables are missing.
- Some dashboard features still rely on localStorage or mock data.

## Mobile Audit

CatStays is intentionally mobile-first, and the staff dashboard has a strong mobile dashboard concept. The marketing site and many routes use responsive layout patterns.

Known mobile risks:

- Website builder preview can become cramped.
- Some setup/template screens need more premium and readable card layouts.
- Desktop dashboard needs a richer laptop/tablet layout instead of stretching mobile concepts.
- All dashboard subpages need a consistent scroll model.
- Route-level mobile smoke tests should be repeated after each UI pass.

## Technical Debt

Highest-impact technical debt:

- Legacy `/admin/*` cattery dashboard routes coexist with `/admin` as platform owner admin.
- Customer portal screens include demo data and browser alert behavior.
- Some dashboard sections are placeholders or "coming soon" panels.
- Room planner and some preview/editing flows still use localStorage.
- Supabase generated types need updating to match migrations.
- RLS policies need hardening before real customer data is trusted.
- Stripe frontend environment naming should be verified, because browser-exposed Vite variables normally need a `VITE_` prefix.
- Website templates need real premium cattery previews rather than abstract placeholder cards.
- Supabase email templates exist in repo, but live Supabase template application must be verified.

## Deployment Audit

GitHub:

- `main` is the current source-of-truth branch.
- Recent commits show ongoing UX, onboarding, provisioning, Replit secrets, and Supabase email template work.

Replit:

- `.replit` config is present.
- Replit is configured for Node, PostgreSQL, autoscale deployment, post-merge script, and environment variables.
- Replit should pull from GitHub with `git pull --ff-only origin main` followed by `pnpm install`.

Supabase:

- Project configuration is present through environment variables.
- Migrations exist and should define the expected schema.
- Live database status was not independently verified in this pass.

Production:

- A production public URL was not confirmed in this audit.
- Custom domains are planned, with premium/manual domain handling still requiring owner/admin workflow.

## Recommended Next Actions

1. Rebuild onboarding website template cards as premium, real above-fold cattery site previews.
2. Tighten onboarding copy and trial messaging so all users understand the 14-day full-access trial.
3. Update Supabase generated TypeScript types and compare them against migrations.
4. Harden RLS policies for public booking, customer portal, and cattery owner access.
5. Replace customer portal demo data with tenant/customer scoped Supabase data.
6. Build the boarding workflow as a dedicated operational flow: arrival, stay, updates, tasks, checkout.
7. Clean route boundaries: `/admin` for CatStays owner, `/staff-dashboard` for cattery operators, `/client-portal` for customers.
8. Verify Stripe in test mode end to end.
9. Verify live Replit deployment after every major merge.
10. Keep this audit and the documentation hub updated as decisions are made.
