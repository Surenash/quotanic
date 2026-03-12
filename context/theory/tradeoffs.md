# Trade-offs Log

**Intentional Choices that Look Wrong but are Right:**

1. **Monorepo-ish Structure:** The React frontend for `manfacquot` lives inside the same directory as the Django backend.
   - *Reason:* Simplifies development and deployment for the core application, avoiding cross-origin issues during local dev when correctly configured, and keeps core logic close.
2. **Separate "front end " Directory:** A standalone AI Studio prototype exists outside the main `manfacquot` application.
   - *Reason:* The AI Studio is a distinct product or prototype and requires isolation from the core manufacturing quotation system to iterate quickly without affecting the main app.
3. **Large Component Files:** Files like `index.tsx` are unusually large.
   - *Reason:* This might be a result of rapid prototyping. *Note: Refactoring this into smaller, manageable components is likely a future goal.*
