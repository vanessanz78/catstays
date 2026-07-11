# CatStays Startup Guide

Last reviewed: 2026-07-11

Every Codex session for this repository must begin by reading `START_HERE.md` from the central `vanessanz78/codex-operating-system` repository before doing any project work.

After the central Operating System has been read, continue with this repository's local startup order:

1. `ROADMAP.md`
2. `docs/README.md`
3. `docs/project-operating-system.md`
4. `docs/adr/ADR-001-open-home-content-platform.md`
5. `CURRENT_SPRINT.md`

## Current Platform Mode

CatStays is now in Open Home Content Platform implementation mode.

ADR-001 Open Home Content Platform is approved and frozen. Do not evolve ADR-001 during implementation. If implementation reveals a genuine structural deficiency, create ADR-003 and keep ADR-001 unchanged.

## Implementation Rule

Future implementation must follow `ROADMAP.md`.

Only one implementation phase may be active at a time. Do not begin a new phase until the previous phase has:

- passed UAT
- been merged into `main`
- been tagged
- had its implementation branch deleted

## Phase Flow

```text
Architecture
->
Validation
->
Merge
->
Tag
->
Next Phase
```

Every implementation branch must follow:

```text
One branch
->
One phase
->
UAT
->
Merge to main
->
Delete branch
->
Tag milestone
```

No long-lived implementation branches. No overlapping phases. No implementation branch should span multiple roadmap phases.

## Merge Rule

No implementation branch may be merged until:

- typecheck passes
- build passes
- UAT passes
- regression checks pass
- visual approval is complete, where applicable

## Open Home Lifecycle

Implementation must preserve this lifecycle:

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

Do not bypass this lifecycle during implementation.
