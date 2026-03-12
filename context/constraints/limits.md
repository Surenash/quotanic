# Limits

**Technical Constraints:**
- Python 3.11 (via Docker) and Node.js 18+ must be used.
- Redis is mandatory for Celery broker.
- PostgreSQL is required for persistent data, currently hosted in a Docker container on the EC2 instance (not RDS).
- Do not introduce synchronous blocking calls for CAD processing in Django views; always use Celery tasks (`analyze_cad_file`).
- File uploads for CAD designs must use AWS S3 pre-signed URLs, not direct uploads to the Django server.
- `numpy-stl` is used for `.stl` analysis; `.step`/`.stp` use `steputils`. `.iges`/`.igs` formats currently mark as `ANALYSIS_FAILED`.
- Frontend components must use TypeScript (`.tsx` or `.ts`) for type safety.
- Do not commit secrets, API keys, or large binary files to version control.

**Resource/Time Constraints:**
- AWS EC2 instance is a `t3.micro`. Keep memory constraints in mind for backend processes and Celery tasks.

**Quality Constraints:**
- Tests must pass before any code is submitted.
- Code should follow PEP 8 (Python) and standard Prettier/ESLint rules (TypeScript/React).
