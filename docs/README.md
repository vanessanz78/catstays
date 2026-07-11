# CatStays Documentation Hub

CatStays is a specialised SaaS platform for cat boarding businesses. It is built for catteries only: public booking websites, cattery owner dashboards, customer portals, booking management, boarding operations, payments, and customer communication.

GitHub is the single source of truth for CatStays. Product decisions, workflow notes, architecture, deployment status, business rules, and implementation decisions should be documented here before they are treated as durable project knowledge.

Every new Codex session should begin by reading `START_HERE.md` from the central `vanessanz78/codex-operating-system` repository, then the local [repository startup guide](../START_HERE.md), this hub, and the [Project Operating System](./project-operating-system.md). If GitHub documentation and chat history conflict, GitHub documentation wins.

## Current Status

Last reviewed: 2026-07-11

CatStays has a working React/Vite frontend, Supabase-backed authentication and core cattery tables, an Express API server, onboarding flows, public booking request flows, staff dashboard routes, customer portal routes, Stripe and Resend integration points, and Replit deployment configuration.

The Open Home Content Platform architecture is now approved, validated, and frozen. Phase 1 and Phase 1.5 are complete. Future implementation must follow [ROADMAP.md](../ROADMAP.md) and must not redesign ADR-001.

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

See [ADR-001 Open Home Content Platform](./adr/ADR-001-open-home-content-platform.md), [Platform Architecture](./platform-architecture.md), and [Database Architecture](./database-architecture.md).

## Documentation Index

| Document | Purpose |
| --- | --- |
| [Current State Audit](./current-state.md) | What exists now, what works, what is incomplete, and recommended next actions. |
| [Open Home Implementation Roadmap](../ROADMAP.md) | Canonical phase tracker for implementing the frozen Open Home Content Platform architecture. |
| [Platform Architecture](./platform-architecture.md) | Frontend, backend, authentication, routing, and data flow. |
| [ADR-001 Open Home Content Platform](./adr/ADR-001-open-home-content-platform.md) | Frozen Website Generation Platform architecture for content sources, media, content library, assignments, drafts, previews, publishing, lineage, and audit history. |
| [Onboarding Flow](./onboarding-flow.md) | Cattery signup, website import, setup, plan selection, publishing, and data import. |
| [Booking Workflow](./booking-workflow.md) | Public booking requests, dashboard management, payment status, and booking states. |
| [Boarding Workflow](./boarding-workflow.md) | Arrival, stay management, updates, checkout, and operational gaps. |
| [Cattery Management](./kennel-management.md) | Rooms, capacity, availability, owner dashboard, staff workflows, and cattery operations. |
| [Customer Journey](./customer-journey.md) | Customer-facing website, booking, portal, profile, payments, and updates. |
| [Database Architecture](./database-architecture.md) | Supabase schema, relationships, RLS, migrations, and data risks. |
| [Integrations](./integrations.md) | Supabase, Replit, Stripe, Resend, website scraping, Cloudflare, and future services. |
| [Product Roadmap](./roadmap.md) | Broader CatStays product roadmap. The Open Home implementation tracker now lives at root `ROADMAP.md`. |
| [Deployment Status](./deployment-status.md) | GitHub, Replit, Supabase, production status, and Replit pull instructions. |
| [UAT Test Plan](./uat-test-plan.md) | Manual user acceptance testing checklist for published Replit builds. |
| [Changelog](./changelog.md) | Durable project change log. |
| [Business Rules](./business-rules.md) | Product rules, pricing, trial logic, tenant rules, and scope boundaries. |
| [Project Operating System](./project-operating-system.md) | Documentation-first workflow and source-of-truth rules for all project work. |
| [Product Foundation](./CATSTAYS_PRODUCT_FOUNDATION.md) | Earlier product foundation and implementation notes. |
| [Replit Secrets](./CATSTAYS_REPLIT_SECRETS.md) | Replit environment variable checklist. |

## Active Priorities

1. Follow [ROADMAP.md](../ROADMAP.md) for Open Home Content Platform implementation.
2. Keep only one Open Home implementation phase active at a time.
3. Do not begin a new phase until the previous phase has passed UAT, merged to `main`, been tagged, and had its branch deleted.
4. Preserve the approved lifecycle: Content Sources -> Media Library -> Content Library -> Assignment Engine -> Draft -> Preview -> Verification -> Published Version -> Audit History.
5. Run the [UAT Test Plan](./uat-test-plan.md) and any phase-specific checks before treating a phase as complete.

## Documentation Rules

- Read the central Operating System, local [START_HERE.md](../START_HERE.md), and this hub before performing project work.
- Follow the [Project Operating System](./project-operating-system.md) for documentation-first workflow.
- Follow [ROADMAP.md](../ROADMAP.md) for Open Home implementation phases.
- Update this hub when new docs are added or renamed.
- Update [Current State Audit](./current-state.md) after meaningful workflow or architecture changes.
- Update [Changelog](./changelog.md) for significant commits.
- Store product decisions in `/docs`; do not leave durable decisions only in chat history.
- Do not commit private secrets. Public client keys may appear in configuration only when intended for browser use.
