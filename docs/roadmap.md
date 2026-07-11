# Roadmap

Last reviewed: 2026-06-12

This is the broader CatStays product roadmap. The canonical Open Home Content Platform implementation tracker now lives at root [ROADMAP.md](../ROADMAP.md).

## Phase 1: Documentation And Source Of Truth

- Create documentation hub.
- Keep current-state audit updated.
- Document deployment, business rules, and architecture.
- Commit project decisions to GitHub.

## Phase 2: Onboarding Polish

- Rebuild website template cards as premium cattery previews.
- Improve website builder layout and preview sizing.
- Clarify 14-day full-access trial.
- Move email confirmation to a less disruptive moment.
- Validate website import with Deloraine Cattery as the main demo.

## Phase 3: Tenant And Data Hardening

- Clean route boundaries between platform admin, staff dashboard, and customer portal.
- Replace dashboard mock data with tenant-scoped Supabase data.
- Regenerate database types.
- Tighten RLS policies.
- Add staff roles and customer portal access rules.

## Phase 4: Booking And Boarding Operations

- Complete booking approval workflow.
- Add server-side availability enforcement.
- Build boarding stay workflow.
- Add check-in, stay notes, care tasks, photo updates, and checkout.
- Improve mobile operations for daily cattery use.

## Phase 5: Payments, Plans, And Domains

- Verify Stripe test mode.
- Implement plan entitlements.
- Add premium custom-domain request workflow.
- Add admin action tasks for CatStays owner.
- Add payment/deposit workflows for cattery customers.

## Phase 6: Premium Product Experience

- Desktop/tablet dashboard layout.
- Customer portal polish.
- Marketing material generation.
- Reporting, accounting, and insights.
- AI-assisted owner-approved postcards and social captions.
