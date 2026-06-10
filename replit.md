# CatStays — SaaS Platform for Cattery Owners

## Overview

pnpm workspace monorepo. CatStays is a full SaaS product for boutique cattery owners: website builder, bookings, customers, payments, analytics. Figma-exported React code is the source of truth for UI.

## Supabase Project

- URL: `https://iwyoezwqorddkmqnjbif.supabase.co`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (shared)
- Schema: `supabase/migrations/001_initial_schema.sql` (run in Supabase SQL Editor)
- Auth trigger: `supabase/migrations/002_auth_trigger.sql` (auto-creates cattery on signup)
- Email confirmation: DISABLED (dev mode) — Email provider: ENABLED

## Live Supabase Integrations

- **Auth**: Signup/login/logout with real Supabase Auth sessions
- **Dashboard**: Real stats from `bookings`, `customers` tables
- **Customers page**: Real CRUD — list, search, add customer (with cats)
- **Bookings page**: Real data — lists from Supabase, create booking saves to DB; room selector uses real rooms from `rooms` table
- **Room Management**: Real CRUD — list, add, edit, delete, toggle active via `useRooms.ts` hook
- **Onboarding Wizard**: Saves cattery details + all website_settings to Supabase on each step; creates rooms from booking setup on publish; pre-populates from existing cattery record
- **Analytics (Insights)**: `useAnalytics.ts` queries bookings/rooms for weekly stats, next-week occupancy, outstanding payments, monthly summary — all real Supabase data
- **Payment Integration**: Stripe keys read from env vars (`STRIPE_PUBLIC_KEY`, `STRIPE_API_KEY`); shows Connected/Live Mode status; links to Stripe Dashboard. NEW: "Accept Payments from Clients" section — cattery owner enters their own Stripe pk/sk keys, saved to `payment_settings` JSONB in Supabase (protected by RLS)
- **Email (Resend)**: `RESEND_API_KEY` env var; Express API routes at `/api/email/booking-confirmation`, `/api/email/contact-enquiry`, `/api/email/test`; booking confirmation fires automatically when a booking is created; Vite proxy forwards `/api/*` to API server; "Send test email" button on Payment Integration page
- **Auth trigger**: Auto-creates `catteries` record on user signup (SECURITY DEFINER)

## Subdomain + Custom Domain Routing

- **Subdomain detection**: `src/contexts/SubdomainContext.tsx` detects `slug.catstays.app` or custom domain from `window.location.hostname`
- **Subdomain router**: `src/app/subdomainRouter.tsx` — React Router for `/`, `/rooms`, `/about`, `/contact`, `/booking-flow` (no admin routes)
- **App.tsx**: If on a subdomain/custom domain, renders `SubdomainProvider` + subdomain router instead of the normal admin app
- **`useTenantCattery` hook**: Checks `SubdomainContext` first — if cattery was fetched by subdomain/domain, returns it directly; otherwise falls back to normal auth/ID flow
- **Domain Settings admin page**: `/admin/domain-settings` — shows `slug.catstays.app` URL (copy+open), custom domain input + CNAME step-by-step instructions + DNS verify button
- **API route**: `GET /api/cattery/verify-domain?domain=...` — Node.js DNS CNAME check; returns `{ verified, message, resolvedTo }`
- **DB migration** (must run in Supabase SQL Editor): `supabase/migrations/003_domains_and_stripe.sql` — adds `custom_domain TEXT UNIQUE` and `payment_settings JSONB DEFAULT '{}'` to the `catteries` table
- **Root domain**: `catstays.app` — wildcard CNAME `* → catstays.app` must be set in Cloudflare pointing to the deployed Replit URL

## Public Tenant Website (Customer-Facing)

All pages live in `artifacts/catstays/src/app/pages/tenant/`. The same components handle both:
- `/site/*` — cattery owner preview (uses auth context cattery)
- `/tenant/:tenantId/*` — public customer-facing site (fetches by ID)

### Pages
- `Home.tsx` — Full site with hero, rooms preview, about, inline contact form — all data live from Supabase
- `Rooms.tsx` — All active rooms with pricing, amenities, capacity
- `About.tsx` — Cattery story, features from `website_settings`, stats, location
- `Contact.tsx` — Contact form → `/api/email/contact-enquiry`
- `BookingFlow.tsx` — 4-step booking request: dates + room picker (real rooms from DB), customer details, cat info, review & submit → `/api/bookings/request`

### Booking Request Flow
Public bookings are email-based requests (no Supabase insert, avoids RLS). When customer submits:
1. POST `/api/bookings/request` → sends two emails via Resend:
   - Owner notification with all details
   - Customer acknowledgement with receipt/estimate
2. Customer sees success screen with booking summary
3. Owner confirms in admin dashboard and creates official booking

### Email API Routes (Express)
- `POST /api/email/booking-confirmation` — sends customer a confirmed booking receipt (with GST line items)
- `POST /api/email/contact-enquiry` — forwards enquiry to cattery owner
- `POST /api/bookings/request` — dual send: owner notification + customer acknowledgement
- `POST /api/email/test` — test email

### Hook
- `useTenantCattery(catteryId?)` — fetches cattery + active rooms from Supabase. If catteryId provided: public fetch. If not: uses auth cattery.

## Admin Hooks

- `useBookings.ts` — bookings CRUD
- `useCustomers.ts` — customers + cats CRUD
- `useRooms.ts` — rooms CRUD (fetch/create/update/delete/toggleActive)
- `useAnalytics.ts` — computed analytics from bookings/rooms/customers

## Design System

- Background: Soft Cream `#F7F4EF` / `#F6F4EF`
- Primary (Terracotta): `#C46A3A`
- Secondary (Navy): `#1F2A44`
- Sage green: `#7DAF7B` / `#2d3e2f`
- Font: Playfair Display (serif headings) + Inter (body)
- CSS: `src/styles/` → `index.css` imports `fonts.css + tailwind.css + theme.css`

## Key Files

- `artifacts/catstays/src/utils/supabase/client.ts` — typed Supabase client
- `artifacts/catstays/src/contexts/AuthContext.tsx` — full auth provider
- `artifacts/catstays/src/hooks/useBookings.ts` — bookings CRUD
- `artifacts/catstays/src/hooks/useCustomers.ts` — customers + cats CRUD
- `artifacts/catstays/src/app/routes.tsx` — 40+ routes (react-router v7)

## Workspace

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
