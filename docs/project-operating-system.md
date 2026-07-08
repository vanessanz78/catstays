# Project Operating System

Last reviewed: 2026-07-08

CatStays is governed by the central Codex Operating System in `vanessanz78/codex-operating-system`.

This document is a CatStays-specific overlay. It must not duplicate or replace Operating System documentation.

## Authoritative Operating System

Every Codex session for this repository must begin by reading `START_HERE.md` from the central Codex Operating System repository before doing anything else.

After that, Codex must follow the central Operating System for:

- document reading order
- branch governance
- engineering standards
- architecture principles
- milestone workflow
- build verification
- UAT requirements
- cleanup procedures
- handoff requirements

## CatStays Startup Order

After the central Operating System startup is complete, read the CatStays project documents in this order:

1. `CURRENT_SPRINT.md`
2. The latest root-level Architect Update, if one exists
3. `DECISION_LOG.md`
4. Any project files explicitly referenced by the sprint or decision documents
5. `docs/README.md` as the project documentation hub when deeper CatStays context is needed

If any local document conflicts with the central Operating System, the central Operating System wins for process. If any chat history conflicts with committed GitHub documentation, the committed documentation wins for project state.

## CatStays-Specific Rules

- GitHub is the durable source of truth for CatStays project state.
- Codex conversations are temporary working memory only.
- CatStays documentation should record project-specific product, architecture, database, deployment, onboarding, booking, UAT, and branch/ref context.
- Every GitHub note, sprint note, decision note, PR note, and Replit handoff must include `Working ref: <main | branch name | commit SHA>`.
- Do not copy central Operating System procedures into this repository. Link to the central source instead.

## Documentation Rules

- Project-specific architecture decisions must be documented before or with implementation.
- Significant implementation, roadmap, product, database, deployment, or onboarding changes must update the relevant CatStays docs.
- Documentation is part of the deliverable when project state changes.
- End-of-work verification, cleanup, UAT notes, and handoff format are governed by the central Operating System.
