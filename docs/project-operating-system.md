# Project Operating System

Last reviewed: 2026-06-12

CatStays follows a documentation-first workflow.

GitHub is the permanent memory of the project. Codex conversations are temporary working memory only.

## Core Rule

Never allow important project knowledge to exist only inside a Codex conversation.

If GitHub documentation and chat history conflict, GitHub documentation wins.

## Required Workflow

1. Research and analysis.
2. Update GitHub documentation.
3. Commit documentation.
4. Plan implementation.
5. Implement changes.
6. Validate changes.
7. Update documentation.
8. Commit documentation updates.

## Operating Flow

```text
Chat
↓
GitHub Docs
↓
Commit
↓
Implementation
↓
Validation
↓
GitHub Docs Updated
↓
Commit
```

## Documentation Rules

- Architecture decisions must be documented before implementation.
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

- [Master Documentation Hub](./README.md)
- This project operating system document

The master hub is the primary source of truth for current status, documentation structure, active priorities, architecture, roadmap, and project rules.
