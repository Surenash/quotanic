# Limits

**Technical Constraints:**
- Python 3.10+ and Node.js 18+ must be used.
- Redis is mandatory for Celery and caching.
- PostgreSQL (or an equivalent relational database supported by Django) is required for persistent data.
- Do not introduce synchronous blocking calls for CAD processing in Django views; always use Celery tasks.
- Frontend components must use TypeScript (`.tsx` or `.ts`) for type safety.
- Do not commit secrets, API keys, or large binary files (CAD files) to version control.
- Avoid large single files (e.g., `index.tsx` is an exception that should be broken down).

**Resource/Time Constraints:**
- Ensure PRs are small, focused, and tested before submission.
- Do not leave unused dependencies in `package.json` or `requirements.txt`.

**Quality Constraints:**
- Tests must pass before any code is submitted.
- Code should follow PEP 8 (Python) and standard Prettier/ESLint rules (TypeScript/React).
