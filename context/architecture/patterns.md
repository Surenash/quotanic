# Design Patterns

**Frameworks & Libraries:**
- **Backend:** Python 3.10+, Django, Django REST Framework, Celery (with Redis).
- **Frontend:** React 18+, Vite, TypeScript, Tailwind CSS (assumed based on standard Vite setups).
- **AI/Processing:** Custom FBM (Feature-Based Manufacturing) engine.

**Key Design Patterns:**
- **MVC/MVT:** Django's Model-View-Template pattern (mostly Model-View-Controller via APIs).
- **Component-Based UI:** Reusable React components (`cost_breakdown_modal.tsx`, `manufacturer_settings_component.tsx`).
- **Asynchronous Task Queue:** Heavy lifting (CAD processing, email sending) delegated to Celery workers.
- **Repository/Service Layer:** Business logic separated from views where possible (e.g., in `FBM/` engine).

**Avoided Patterns:**
- "God Objects" or massive single files (though some files like `index.tsx` are large and may need refactoring).
- Synchronous blocking operations in the request-response cycle for heavy tasks.
- Tight coupling between the FBM engine and the HTTP layer.
