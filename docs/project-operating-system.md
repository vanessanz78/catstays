# Project Operating System

Last reviewed: 2026-07-11

CatStays follows a documentation-first workflow.

GitHub is the permanent memory of the project. Codex conversations are temporary working memory only.

## Core Rule

Never allow important project knowledge to exist only inside a Codex conversation.

If GitHub documentation and chat history conflict, GitHub documentation wins.

## Required Workflow

1. Read the central Codex Operating System.
2. Read the local startup guide and roadmap.
3. Confirm the active phase.
4. Research and analysis.
5. Implement only the active phase.
6. Validate changes.
7. Complete UAT.
8. Update documentation.
9. Merge to `main`.
10. Tag the phase.
11. Delete the implementation branch.

## Operating Flow

```text
Chat
->
GitHub Docs
->
Roadmap Phase
->
Implementation
->
Validation
->
UAT
->
Merge
->
Tag
->
Next Phase
```

## Documentation Rules

- Architecture decisions must be documented before implementation.
- ADR-001 Open Home Content Platform is approved and frozen.
- Do not evolve ADR-001 during implementation.
- If implementation reveals a genuine structural deficiency, create ADR-003.
- Significant implementation changes must update documentation.
- Roadmap changes must update documentation.
- Product decisions must update documentation.
- Database changes must update documentation.
- Deployment changes must update documentation.
- Onboarding changes must update documentation.
- Documentation is part of the deliverable.
- If documentation is not updated, the task is not complete.

## Session Startup Rule

Any new Codex session should begin by reading:

- `START_HERE.md` from the central `vanessanz78/codex-operating-system` repository
- [Local Startup Guide](../START_HERE.md)
- [Open Home Implementation Roadmap](../ROADMAP.md)
- [Master Documentation Hub](./README.md)
- This project operating system document
- [ADR-001 Open Home Content Platform](./adr/ADR-001-open-home-content-platform.md)

The master hub is the primary source of truth for current status, documentation structure, active priorities, architecture, roadmap, and project rules.

## Open Home Implementation Governance

The project is now in implementation mode for the approved Open Home Content Platform.

Implementation must follow [ROADMAP.md](../ROADMAP.md). Only one phase may be active at a time.

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

No implementation branch may merge until:

- typecheck passes
- build passes
- UAT passes
- regression checks pass
- visual approval is complete, where applicable

Each completed phase must create a tag such as `open-home-platform-phase-2-complete`.

Implementation must preserve:

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
