# Milestones & Phasing

**Phase 1: Foundation & Prototype (Completed)**
- Setup Django backend (`gmqp_project`) and initial React+Vite frontend.
- Implement basic FBM processing and generic cost calculation (`test_pricing_simple.py`, `simulate_pricing.py`).
- Implement the standalone `front end` AI Studio.

**Phase 2: Manufacturer Configuration & Quoting (In Progress)**
- Develop robust `manufacturer_settings_component.tsx` allowing detailed capability and pricing inputs.
- Ensure the FBM engine (`add_mfg_capabilities.py`, `check_manufacturers.py`) reads these settings accurately.
- Connect the frontend quote flow to the backend API.

**Phase 3: Order Management & Advanced FBM (Upcoming)**
- Implement robust tracking for orders (`orders/` app).
- Refactor the FBM engine to handle complex multi-part assemblies or exotic manufacturing processes.
- Enhance UI for detailed cost breakdown (`cost_breakdown_modal.tsx`).

**Definitions of Done:**
- Code is merged to main.
- All existing tests pass.
- At least one manual or automated test exists for the new feature.
- Relevant documentation or `context/` files are updated.
