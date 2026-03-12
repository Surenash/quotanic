# Design Patterns

**Frameworks & Libraries:**
- **Backend:** Python 3.11-slim (Docker image), Django 5.2.4, Django REST Framework, Celery (with Redis).
- **Frontend:** React 18+, Vite, TypeScript, Tailwind CSS.
- **AI/Processing:** Custom FBM (Feature-Based Manufacturing) engine utilizing `numpy-stl` and `steputils` (from `python-occ-core`).
- **Deployment:** AWS EC2 (t3.micro) for backend + DB, AWS Amplify for frontend hosting (`amplify.yml`), Docker Compose for containerization.

**Key Design Patterns:**
- **MVC/MVT:** Django's Model-View-Template pattern (mostly Model-View-Controller via APIs).
- **Component-Based UI:** Reusable React components (`cost_breakdown_modal.tsx`, `manufacturer_settings_component.tsx`).
- **Asynchronous Task Queue:** Heavy lifting (CAD processing via `analyze_cad_file` task) delegated to Celery workers.
- **Direct S3 Uploads:** Frontend requests pre-signed URLs from Django (`/api/designs/upload-url`), uploads directly to S3, then notifies Django.

**Avoided Patterns:**
- Synchronous blocking operations in the request-response cycle for heavy tasks.
- Tight coupling between the FBM engine and the HTTP layer.
