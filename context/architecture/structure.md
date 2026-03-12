# Architecture & Structure

**Core Structure Map:**
- `manfacquot/`: The central application containing both Django and React components.
  - `gmqp_project/`: Django core configuration and settings.
  - `FBM/`: Feature-Based Manufacturing engine; process CAD files, quotes, and pricing. Uses `python-occ-core` and `numpy-stl` for analysis.
  - `accounts/`, `orders/`, `quotes/`, `reviews/`, `designs/`: Django apps for respective domains.
  - `components/`, `pages/`, `utils/`, `types/`: React frontend structure within `manfacquot`.
- `front end/`: The AI Studio standalone prototype.

**Data Flow:**
- React Frontends -> REST APIs (Django) -> PostgreSQL (Relational Data, running in a Docker container on EC2)
- React Frontends -> WebSockets (Django Channels) -> Redis (Real-time updates)
- Celery Workers -> Process CAD/FBM Tasks asynchronously using Redis as a broker.
- File Storage -> AWS S3 (`quotanic-fbm-designs-mumbai`) using pre-signed URLs for CAD uploads.

**Naming Conventions:**
- Python: `snake_case` for variables/functions, `PascalCase` for classes.
- TypeScript/React: `camelCase` for variables/functions, `PascalCase` for components/interfaces.
- Files: Use lowercase with underscores for Python (`add_pricing_rates.py`) and standard conventions for TS/TSX (`index.tsx`, `cost_breakdown_modal.tsx`).
