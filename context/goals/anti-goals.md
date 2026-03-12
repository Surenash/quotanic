# Anti-Goals

**What We Don't Optimize For:**
- **Building a General Purpose CAD Tool:** Quotanic analyzes CAD for manufacturing features; it is not a tool for *creating* or editing CAD designs.
- **Supporting Every Niche Manufacturing Process Immediately:** Focus on core processes (e.g., CNC, Sheet Metal, 3D Printing) first before expanding to highly specialized niche processes.
- **Over-Engineering the AI Studio Prototype:** The `front end` AI Studio is a prototype. Do not over-architect it at the expense of the core `manfacquot` application.
- **Managed RDS Databases:** Given past failures creating RDS instances, we currently accept running PostgreSQL inside a Docker container on EC2 via volume mounts, rather than optimizing for managed database services immediately.

**Temptations to Resist:**
- Adding unnecessary complexity to the Django models or API endpoints.
- Introducing new frameworks or languages unless absolutely necessary (stick to Python and TypeScript).
- Ignoring failing tests to push features faster.
