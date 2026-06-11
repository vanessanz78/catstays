# Platform Architecture

Last reviewed: 2026-06-12

## System Roles

- GitHub: source of truth for code, documentation, decisions, and deployment notes.
- Replit: development and deployment runtime.
- Supabase: authentication, database, RLS, storage, and backend services.
- Codex: implementation and planning assistant.
- Stripe: CatStays subscriptions and future payment processing.
- Resend: transactional email delivery.

## Frontend

The CatStays frontend lives in `artifacts/catstays` and is built with React, Vite, TypeScript, Tailwind-style utilities, and local app hooks.

Main route groups:

- Marketing: `/`, `/features`, `/pricing`, `/demo`, `/signup`, `/login`
- Onboarding: `/onboarding`, `/confirm-email`, `/publish-success`
- Platform owner admin: `/admin`
- Cattery staff dashboard: `/staff-dashboard/*`
- Tenant public site: `/site/*` and `/tenant/:tenantId/*`
- Customer portal: `/client-portal/*` and `/customer/*`
- Demo/reference routes: `/demo/*`

## Backend

The API server lives in `artifacts/api-server` and provides:

- Website scraping and preview creation.
- Cattery provisioning.
- Domain verification.
- Booking request handling.
- Transactional email.
- Stripe checkout, subscription verification, billing portal, and webhooks.

## Data Flow

Typical cattery setup flow:

1. Owner starts onboarding in the frontend.
2. Draft setup data is held locally until publish.
3. Publish calls the API server.
4. API server uses Supabase service role access to provision tenant data.
5. Owner is routed to the staff dashboard.

Typical public booking flow:

1. Customer opens a public tenant site.
2. Customer submits a booking request.
3. Frontend posts to the API server.
4. API server stores a pending booking and sends emails.
5. Owner manages the request in the staff dashboard.

## Tenant Boundaries

CatStays needs three clearly separated surfaces:

- CatStays platform owner: `/admin`
- Cattery owner/staff: `/staff-dashboard`
- Cattery customers: `/client-portal`

Legacy `/admin/*` cattery dashboard routes still exist and should be cleaned up to avoid role confusion.
