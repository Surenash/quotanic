# Decision History Log

**Decision 1:** Use Django for the backend and React/Vite for the frontend within the same repository (`manfacquot`).
- **Context:** Need a robust backend for complex FBM calculations and database management, but also require a modern, reactive frontend for the user interface.
- **Reason:** Django provides excellent ORM and admin capabilities, while React offers a better user experience for dynamic forms (like CAD uploads and configuration). Keeping them in one repo simplifies initial development.
- **Alternatives:** Separate repos for front and back end, using Django templates (too slow for the desired UX), or using a Node.js backend (less suited for complex mathematical/scientific libraries often used in CAD processing).

**Decision 2:** Use Celery and Redis for asynchronous task processing.
- **Context:** Processing CAD files and generating quotes via the FBM engine is computationally expensive and slow.
- **Reason:** Doing this synchronously in the Django request/response cycle would lead to timeouts and poor UX. Celery allows for robust background processing.
- **Alternatives:** Django Q, RQ, or AWS SQS directly. Celery with Redis is an industry standard and well-supported.

**Decision 3:** Create a standalone `front end` for the AI Studio.
- **Context:** Experimenting with AI-driven manufacturing features that might not yet be ready for the core product.
- **Reason:** Allows rapid prototyping without risking the stability of the main `manfacquot` application.
