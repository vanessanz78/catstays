# CatStays Documentation Hub

CatStays is a specialised SaaS platform for cat boarding businesses. It is built for catteries only: public booking websites, cattery owner dashboards, customer portals, booking management, boarding operations, payments, and customer communication.

GitHub is the single source of truth for CatStays. Product decisions, workflow notes, architecture, deployment status, business rules, and implementation decisions should be documented here before they are treated as durable project knowledge.

Every new Codex session should begin by reading this hub and the [Project Operating System](./project-operating-system.md). If GitHub documentation and chat history conflict, GitHub documentation wins.

## Current Status

Last reviewed: 2026-06-12

CatStays has a working React/Vite frontend, Supabase-backed authentication and core cattery tables, an Express API server, onboarding flows, public booking request flows, staff dashboard routes, customer portal routes, Stripe and Resend integration points, and Replit deployment configuration.

The platform is still in active build mode. The strongest current areas are marketing/onboarding prototypes, public booking requests, tenant provisioning, and mobile-first dashboard concepts. The biggest gaps are live tenant isolation across every dashboard page, production-ready customer portal auth, complete boarding stay workflows, tightened RLS policies, desktop dashboard polish, premium website templates, and verified production deployment health.

The full audit is here: [Current State Audit](./current-state.md).

## Architecture Snapshot

- GitHub: authoritative source of code and documentation.
- Replit: development and deployment environment.
- Supabase: database, authentication, storage, and backend services.
- Express API server: email, website scraping, cattery provisioning, billing, and booking request endpoints.
- React/Vite app: marketing site, onboarding, public cattery sites, owner dashboard, customer portal, and platform admin.
- Stripe: subscription billing and future cattery payment workflows.
- Resend: transactional email delivery.

See [Platform Architecture](./platform-architecture.md) and [Database Architecture](./database-architecture.md).

## Documentation Index

| Document | Purpose |
| --- | --- |
| [Current State Audit](./current-state.md) | What exists now, what works, what is incomplete, and recommended next actions. |
| [Platform Architecture](./platform-architecture.md) | Frontend, backend, authentication, routing, and data flow. |
| [Onboarding Flow](./onboarding-flow.md) | Cattery signup, website import, setup, plan selection, publishing, and data import. |
| [Booking Workflow](./booking-workflow.md) | Public booking requests, dashboard management, payment status, and booking states. |
| [Boarding Workflow](./boarding-workflow.md) | Arrival, stay management, updates, checkout, and operational gaps. |
| [Cattery Management](./kennel-management.md) | Rooms, capacity, availability, owner dashboard, staff workflows, and cattery operations. |
| [Customer Journey](./customer-journey.md) | Customer-facing website, booking, portal, profile, payments, and updates. |
| [Database Architecture](./database-architecture.md) | Supabase schema, relationships, RLS, migrations, and data risks. |
| [Integrations](./integrations.md) | Supabase, Replit, Stripe, Resend, website scraping, Cloudflare, and future services. |
| [Roadmap](./roadmap.md) | Prioritised build plan. |
| [Deployment Status](./deployment-status.md) | GitHub, Replit, Supabase, production status, and Replit pull instructions. |
| [Changelog](./changelog.md) | Durable project change log. |
| [Business Rules](./business-rules.md) | Product rules, pricing, trial logic, tenant rules, and scope boundaries. |
| [Project Operating System](./project-operating-system.md) | Documentation-first workflow and source-of-truth rules for all project work. |
| [Product Foundation](./CATSTAYS_PRODUCT_FOUNDATION.md) | Earlier product foundation and implementation notes. |
| [Replit Secrets](./CATSTAYS_REPLIT_SECRETS.md) | Replit environment variable checklist. |

## Active Priorities

1. Stabilise the source-of-truth workflow: GitHub first, Replit pulls from GitHub, docs updated with meaningful decisions.
2. Finish the cattery onboarding experience: premium template cards, publish-time tenant setup, and clean trial messaging.
3. Separate platform admin, cattery staff dashboard, and customer portal routes clearly.
4. Replace demo/mock dashboard data with tenant-scoped Supabase data.
5. Tighten Supabase RLS and customer portal access before production customer use.
6. Build the full boarding workflow: arrivals, check-in, stay notes, photo updates, checkout, and operational tasks.
7. Verify Stripe in test mode before live billing or cattery payment processing.
8. Verify Replit deployment and production routing after each significant release.

## Documentation Rules

- Read this hub before performing project work.
- Follow the [Project Operating System](./project-operating-system.md) for documentation-first workflow.
- Update this hub when new docs are added or renamed.
- Update [Current State Audit](./current-state.md) after meaningful workflow or architecture changes.
- Update [Changelog](./changelog.md) for significant commits.
- Store product decisions in `/docs`; do not leave durable decisions only in chat history.
- Do not commit private secrets. Public client keys may appear in configuration only when intended for browser use.
