# Quotanic Context Directory

This directory contains the entire conceptual and technical context of the Quotanic project, designed to be read by AI assistants to ensure consistency, quality, and smooth production.

## Map & Workflow Guide

The `context/` directory is structured to provide targeted information for different types of tasks:

- **Starting a new task:** Read `LOAD_CONTEXT.md` at the root.
- **Writing new code:** Check `architecture/`, `style/`, and `instructions/`.
- **Planning features:** Consult `goals/`, `roadmap/`, and `scope/`.
- **Debugging/Refactoring:** Review `decisions/`, `theory/`, and `changelog/`.

### Usage Instructions for AI

1. Use the specific `LOAD_CONTEXT.md` files in each subdirectory when performing tasks related to those domains.
2. Always update the `changelog/log.md`, `memory/session_log.md`, and `decisions/log.md` when making significant changes or concluding a session.
3. Treat the files in this directory as the single source of truth for the project's direction and constraints.

## Directory Overview
- `instructions/`: AI role and rules.
- `architecture/`: Project structure and patterns.
- `theory/`: Philosophy and trade-offs.
- `goals/`: Objectives and anti-goals.
- `scope/`: In/out of scope definitions.
- `constraints/`: Hard limits.
- `style/`: Tone, voice, and formatting.
- `personas/`: Target users.
- `roadmap/`: Milestones and priorities.
- `progress/`: Status tracking.
- `memory/`: Session logs and notes.
- `decisions/`: Historical decision logs.
- `changelog/`: Project updates.
- `glossary/`: Terminology.
- `references/`: Links and external docs.
- `research/`: Findings and experiments.
- `feedback/`: User/stakeholder feedback.
- `integrations/`: Third-party services.
