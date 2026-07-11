# Open Home Platform Principles

Last reviewed: 2026-07-11

This document is the permanent engineering philosophy for the Open Home Content Platform.

ADR-001 Open Home Content Platform is approved and frozen. These principles protect that architecture during implementation. They do not replace ADR-001, and they do not authorize redesign.

## Architecture Status

ADR-001 is the canonical platform architecture.

Status:

- Approved
- Frozen

No further structural changes are permitted without a new ADR.

If implementation reveals a genuine architectural deficiency, create ADR-003. Do not silently modify ADR-001.

## Principles

### 1. The Browser Is Never The Source Of Truth

Browser storage may keep lightweight UI preferences only.

The browser must not own imported website data, generated preview data, assignments, draft content, published content, or platform lineage.

### 2. Generated Data Is Immutable

Preview snapshots and published versions are historical records.

If generated output changes, create a new version. Do not mutate old generated records in place.

### 3. Derived Data Is Disposable And Regeneratable

Assignments, previews, verification results, and other derived outputs must be reproducible from durable source records wherever possible.

If derived data is invalid, stale, or outdated, regenerate it from the approved source layers.

### 4. Every Object Preserves Lineage

Every meaningful platform object should be traceable back to its source.

Examples:

- published image -> assignment -> media library -> content source -> original asset
- published heading -> assignment -> content library -> content source -> original website

### 5. One Branch. One Phase. One Merge.

Every implementation branch must map to one roadmap phase.

No long-lived implementation branches. No overlapping phases. No branch should span multiple roadmap phases.

### 6. Every Implementation Phase Requires UAT Before Merge

A phase is not complete until the intended user-visible or service-visible outcome has been validated.

Automated checks are required, but they do not replace UAT.

### 7. Visual Approval Is The Final Acceptance Test

Where a phase affects rendering, preview output, layout, templates, or public websites, visual approval is required before merge.

Screenshots, browser checks, and user approval are part of the acceptance gate.

### 8. Media And Content Are First-Class Platform Entities

Media and structured content are not incidental arrays inside drafts.

They are reusable platform assets with identity, metadata, lineage, and lifecycle.

### 9. The Assignment Engine Decides. The Renderer Renders.

The Assignment Engine selects content and media.

The Renderer displays resolved assignments.

Renderer code must not classify, search, score, or choose fallback content or media when the Assignment Engine should own that decision.

### 10. Platforms Own Capabilities. Products Consume Them.

Open Home owns reusable capabilities:

- Content Sources
- Media Library
- Content Library
- Assignment Engine
- Drafts
- Previews
- Verification
- Publishing
- Audit History

Products consume these capabilities. Products should not redefine the platform lifecycle.

### 11. Architecture Changes Require An ADR

Implementation may improve code, performance, maintainability, tests, and operational safety.

Implementation may not redesign the architecture.

Genuine structural changes require ADR-003 or a later ADR.

### 12. Main Is Always Releasable

`main` should remain the durable, releasable source of truth.

Do not merge incomplete phases, unvalidated migrations, broken builds, or unapproved visual changes into `main`.

## Implementation Charter

Every implementation phase must follow:

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

## Phase Gates

A phase is complete only when:

- typecheck passes
- build passes
- database migration passes, where applicable
- UAT passes
- visual approval passes, where applicable
- merged to `main`
- feature branch deleted
- Git tag created

Only then may the next roadmap phase begin.

## Implementation Rule

Implementation must preserve ADR-001.

Implementation may improve:

- code
- performance
- maintainability
- test coverage
- operational safety

Implementation may not redesign the architecture.

## Platform Capability Boundary

The platform owns:

- Content Sources
- Media Library
- Content Library
- Assignment Engine
- Drafts
- Previews
- Verification
- Publishing
- Audit History

Products should consume these capabilities. Products should not redefine them.
