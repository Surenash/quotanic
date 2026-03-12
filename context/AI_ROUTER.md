# Quotanic AI Router & Search Index

This file is designed specifically for AI agents to quickly locate the exact context files they need without unnecessary searching.

**Read this file if you are unsure where specific information is located.**

## 1. Task-Based Routing
Use this section to determine which `context/` files to read before starting a specific type of task:

- **Adding a New Django API Endpoint:**
  - Read: `architecture/structure.md` (for naming/placement)
  - Read: `instructions/rules.md` (for strict coding rules)
  - Read: `goals/anti-goals.md` (to avoid over-engineering)
- **Modifying the FBM (Feature-Based Manufacturing) Engine:**
  - Read: `architecture/patterns.md` (for async Celery processing rules)
  - Read: `theory/principles.md` (for accuracy over speed logic)
  - Read: `glossary/terms.md` (for exact terminology)
- **Refactoring React UI Components (e.g., `index.tsx`):**
  - Read: `architecture/structure.md` (for TS/React conventions)
  - Read: `style/formatting.md` (for code style)
  - Read: `research/findings.md` (for known issues with large components)
- **Working on Deployment or CI/CD (AWS/Docker):**
  - Read: `integrations/connections.md` (for EC2/Amplify/S3 details)
  - Read: `decisions/log.md` (for why RDS was skipped for Dockerized DB)
- **Starting a Brand New Feature:**
  - Read: `roadmap/priorities.md` (to ensure it aligns with the current stack)
  - Read: `scope/in-scope.md` and `scope/out-of-scope.md` (to check boundaries)
- **Reviewing Feedback or Bugs:**
  - Read: `feedback/log.md`
  - Read: `progress/in-progress.md`

---

## 2. Keyword Search Index
If you are looking for information related to a specific technical concept, start here:

| Keyword / Concept | Primary File | Secondary File |
| :--- | :--- | :--- |
| **AWS, EC2, Deployment** | `integrations/connections.md` | `decisions/log.md` |
| **CAD Files (.stl, .step)** | `glossary/terms.md` | `constraints/limits.md` |
| **Celery, Background Tasks** | `architecture/patterns.md` | `constraints/limits.md` |
| **Database, PostgreSQL** | `integrations/connections.md` | `decisions/log.md` |
| **Django APIs** | `architecture/structure.md` | `instructions/rules.md` |
| **FBM (Feature Recognition)** | `theory/principles.md` | `glossary/terms.md` |
| **Frontend, React, Vite** | `architecture/structure.md` | `research/findings.md` |
| **Node.js, TypeScript** | `instructions/rules.md` | `constraints/limits.md` |
| **Python, PEP 8** | `instructions/rules.md` | `constraints/limits.md` |
| **S3 Uploads, Pre-signed URLs**| `architecture/patterns.md` | `decisions/log.md` |
| **Target Audience, Personas** | `personas/users.md` | `scope/in-scope.md` |
| **Testing, Quality** | `constraints/limits.md` | `roadmap/milestones.md` |

---

## 3. How to Navigate This Directory
- Every folder contains a `LOAD_CONTEXT.md` file.
- If you need a broad overview of a domain (e.g., all architectural decisions), read the `LOAD_CONTEXT.md` inside that specific folder.
- If you need granular details (e.g., just the naming conventions), go directly to the specific markdown file (e.g., `architecture/structure.md`).
