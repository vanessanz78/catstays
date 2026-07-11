# Open Home Content Platform

Last reviewed: 2026-07-11

This is the canonical implementation tracker for the Open Home Content Platform inside CatStays.

ADR-001 Open Home Content Platform is approved and frozen. Future work must implement the approved architecture. Do not redesign ADR-001. If implementation reveals a genuine architectural deficiency, create ADR-003.

`PLATFORM_PRINCIPLES.md` is the permanent engineering philosophy and implementation charter for this roadmap.

## Governance

Only one phase may be active at a time.

Each phase must follow:

```text
One branch
->
One roadmap phase
->
Implementation
->
Validation
->
Visual UAT, where applicable
->
Merge to main
->
Delete branch
->
Tag milestone
```

No long-lived implementation branches. No overlapping phases. No implementation branch should span multiple roadmap phases.

Every implementation phase should belong to the GitHub milestone `Open Home Platform v1`.

## Merge Criteria

No implementation branch may merge until:

- typecheck passes
- build passes
- database migration passes, where applicable
- UAT passes
- regression checks pass
- visual approval is complete, where applicable
- documentation and changelog updates are complete

## Tagging Strategy

Every completed phase must create a Git tag:

- `open-home-platform-phase-2-complete`
- `open-home-platform-phase-3-complete`
- `open-home-platform-phase-4-complete`

Phase 1 has already been tagged:

- `open-home-platform-phase-1-complete`

## Implementation Lifecycle

Implementation must preserve the approved lifecycle:

```text
Content Sources
->
Media Library
->
Content Library
->
Assignment Engine
->
Draft
->
Preview
->
Verification
->
Published Version
->
Audit History
```

Do not bypass this lifecycle.

## Platform Freeze

Architecture work is complete.

Implementation may improve code, performance, maintainability, tests, and operational safety.

Implementation may not redesign the architecture.

Any genuine structural change requires ADR-003 or a later ADR. ADR-001 must remain frozen.

## Phase 1: Platform Schema

Status: Complete

Tag: `open-home-platform-phase-1-complete`

Objective:

- Create the foundational Open Home Content Platform schema.

Dependencies:

- Approved ADR-001.

Deliverables:

- `content_sources`
- `media_library`
- `content_library`
- `website_drafts`
- `assignments`
- `website_previews`
- `website_published_versions`
- `website_events`
- cattery current pointer columns

UAT:

- Migration applied to CatStays development Supabase project.
- Tables, relationships, defaults, timestamps, constraints, and RLS status verified.

Merge Criteria:

- Schema migration committed.
- Schema validated against live development Supabase.
- Architecture documentation updated.
- Tag created.

## Phase 1.5: Security And Validation

Status: Complete

Tag: `open-home-platform-phase-1-complete`

Objective:

- Harden the Phase 1 database foundation before implementation begins.

Dependencies:

- Phase 1 schema.
- Live Supabase validation.

Deliverables:

- RLS policies for Open Home tables.
- Explicit grant model.
- Lifecycle enums.
- Operational indexes.
- Security validation report.

UAT:

- Migration applied to CatStays development Supabase project.
- Open Home tables confirmed to have RLS policies.
- Anonymous access removed from non-public platform tables.
- Anonymous read retained only for current published website snapshots.

Merge Criteria:

- Security model validated.
- Performance indexes added.
- Advisor output reviewed.
- Merged to `main`.
- Feature branch deleted.

## Phase 2: Content Sources

Status: Not started

Objective:

- Implement persistent Content Source creation and retrieval for imported and future manually supplied source data.

Dependencies:

- Phase 1 and Phase 1.5 complete.
- No browser Local Storage source-of-truth dependency for newly implemented source records.

Deliverables:

- Server-side Content Source service.
- Import source persistence into `content_sources`.
- Source hash/version handling.
- Source status transitions.
- Audit event writing for source lifecycle actions.
- Tests for source creation, lookup, and status transitions.

UAT:

- Importing a website creates a durable Content Source record.
- Existing catteries are unaffected.
- No preview payload is written to browser Local Storage as a source of truth.

Merge Criteria:

- API typecheck passes.
- Relevant tests pass.
- Development Supabase smoke check passes.
- UAT passes.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-2-complete` created.

## Phase 3: Media Library

Status: Not started

Objective:

- Persist reusable media assets from Content Sources into the Media Library.

Dependencies:

- Phase 2 Content Sources complete.

Deliverables:

- Media Library service.
- Image/media metadata persistence.
- Supabase Storage URL persistence when uploads are available.
- Media lineage from source to stored asset.
- Media audit events.

UAT:

- Imported media creates durable Media Library rows.
- Media rows preserve source lineage.
- No renderer or layout change occurs.

Merge Criteria:

- API typecheck passes.
- Relevant tests pass.
- Supabase smoke check passes.
- UAT passes.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-3-complete` created.

## Phase 4: Assignment Engine

Status: Not started

Objective:

- Implement assignment generation from Content Library and Media Library into reusable assignment rows.

Dependencies:

- Phase 2 Content Sources complete.
- Phase 3 Media Library complete.
- Content Library data available for assignment inputs.

Deliverables:

- Assignment Engine service.
- Row-based assignments for content and media.
- Assignment confidence and reason tracking.
- Assignment versioning.
- Assignment audit events.

UAT:

- Assignments are generated without renderer-side image or content selection.
- Assignments can be inspected by section and role.
- Existing visual rendering remains unchanged unless explicitly in scope.

Merge Criteria:

- Typecheck passes.
- Relevant tests pass.
- UAT passes.
- Regression checks pass.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-4-complete` created.

## Phase 5: Website Drafts

Status: Not started

Objective:

- Implement editable website drafts as arrangements of content, media, assignments, template, and overrides.

Dependencies:

- Phase 4 Assignment Engine complete.

Deliverables:

- Draft service.
- Draft creation from assignments.
- Draft update/status handling.
- Draft audit events.
- No large draft payloads stored in browser Local Storage.

UAT:

- A draft can be created and reloaded from Supabase.
- Draft state survives browser refresh.
- Draft data remains scoped to the owning cattery.

Merge Criteria:

- Typecheck passes.
- Relevant tests pass.
- UAT passes.
- Regression checks pass.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-5-complete` created.

## Phase 6: Preview Engine

Status: Not started

Objective:

- Generate immutable preview snapshots from drafts.

Dependencies:

- Phase 5 Website Drafts complete.

Deliverables:

- Preview generation service.
- Immutable `website_previews` snapshots.
- Preview status transitions.
- Preview hash/version handling.
- Preview rendering loads by `previewId`, not browser-stored payloads.

UAT:

- Generate Preview creates and returns a `previewId`.
- Browser renders preview data loaded from Supabase.
- Browser does not store preview JSON as source of truth.

Merge Criteria:

- Typecheck passes.
- Build passes.
- Preview UAT passes.
- Regression checks pass.
- Visual approval complete.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-6-complete` created.

## Phase 7: Verification

Status: Not started

Objective:

- Run automated verification against generated preview snapshots.

Dependencies:

- Phase 6 Preview Engine complete.

Deliverables:

- Verification service.
- Verification result JSON persisted to preview records.
- Checks for images, assignments, missing sections, maps, tours, stock/demo misuse, and required platform invariants.
- Audit events for verification results.

UAT:

- Preview verification runs automatically.
- Verification results are visible to the service layer.
- Failed checks do not silently publish.

Merge Criteria:

- Typecheck passes.
- Relevant tests pass.
- UAT passes.
- Regression checks pass.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-7-complete` created.

## Phase 8: Publishing

Status: Not started

Objective:

- Publish approved preview snapshots as immutable published website versions.

Dependencies:

- Phase 7 Verification complete.

Deliverables:

- Publishing service.
- Approval gate.
- Immutable published version creation.
- Current published pointer updates.
- Published-version audit events.

UAT:

- Only approved previews can publish.
- Published version is immutable.
- Current published website can be resolved from Supabase.

Merge Criteria:

- Typecheck passes.
- Build passes.
- Publish UAT passes.
- Regression checks pass.
- Visual approval complete.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-8-complete` created.

## Phase 9: Migration From Local Storage

Status: Not started

Objective:

- Migrate existing browser-stored preview/import data into the Open Home Content Platform tables.

Dependencies:

- Phase 8 Publishing complete, unless explicitly narrowed by a later approved implementation plan.

Deliverables:

- Migration strategy for existing preview import records.
- Server-side migration path.
- Data preservation checks.
- Browser compatibility handling.
- Audit events for migrated data.

UAT:

- Existing users do not lose preview/import state.
- Migrated records become Supabase-backed platform records.
- No manual browser storage clearing is required.

Merge Criteria:

- Typecheck passes.
- Migration tests pass.
- UAT passes with old cached browser data.
- Regression checks pass.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-9-complete` created.

## Phase 10: Browser Storage Removal

Status: Not started

Objective:

- Remove large preview/import payloads from browser storage and keep only lightweight UI state.

Dependencies:

- Phase 9 Migration From Local Storage complete.

Deliverables:

- Removal of large preview/import Local Storage writes.
- Lightweight UI preference storage only.
- Cleanup of obsolete hydration paths.
- Regression tests for refresh and branch-switch behaviour.

UAT:

- Browser storage no longer stores preview JSON.
- Preview and draft reload from Supabase.
- Existing lightweight UI preferences still work.

Merge Criteria:

- Typecheck passes.
- Build passes.
- UAT passes.
- Regression checks pass.
- Changelog and documentation updated.
- Tag `open-home-platform-phase-10-complete` created.
