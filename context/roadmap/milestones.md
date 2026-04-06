# Milestones & Phasing

**Phase 1: Foundation & Prototype (Completed)**
- Setup Django backend (`gmqp_project`) and initial React+Vite frontend.
- Implement basic FBM processing and generic cost calculation (`test_pricing_simple.py`, `simulate_pricing.py`).
- Implement the standalone `front end` AI Studio.

**Phase 2: Manufacturer Configuration & Quoting (Completed)**
- Develop robust `manufacturer_settings_component.tsx` allowing detailed capability and pricing inputs.
- Ensure the FBM engine (`add_mfg_capabilities.py`, `check_manufacturers.py`) reads these settings accurately.
- Connect the frontend quote flow to the backend API.
- Implement highly detailed, client-ready cost breakdown UI with visual flowcharts and explicit totals.

**Phase 3: Order Management & Advanced Analytics (In Progress)**
- Implement robust tracking for orders (`orders/` app).
- Overhaul Manufacturer Dashboard with functional "Quick Actions" and interactive KPI deep-dives.
- Integrate in-table visual aids (3D thumbnails) for high-density dashboard views.
- Refactor the FBM engine to handle complex multi-part assemblies or exotic manufacturing processes.

**Definitions of Done:**
- Code is merged to main.
- All existing tests pass.
- At least one manual or automated test exists for the new feature.
- Relevant documentation or `context/` files are updated.
