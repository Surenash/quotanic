# In-Scope

**Core Areas:**
- **Feature-Based Manufacturing (FBM) Engine:** Analyzing CAD geometry, extracting manufacturing features (holes, pockets, bends, etc.), and mapping them to processes.
- **Quotation System:** Generating cost breakdowns, pricing logic, applying manufacturer rates, and managing the lifecycle of a quote.
- **Live 3D Viewer:** Modular browser-based inspection for STL, OBJ, and STEP/IGES (via backend GLB conversion).
- **Multi-Currency Support:** Real-time conversion using Frankfurter API for global reach.
- **Informational Pages:** Fully developed content for mission (About Us), process (How It Works), and legal compliance (FAQ, Privacy, Terms).
- **Session Persistence:** State management using History API to maintain user session across refreshes and tab changes.
- **Manufacturer Settings:** Tools for manufacturers to configure capabilities, materials, and pricing structures (`manufacturer_settings_component.tsx`, `add_mfg_capabilities.py`).
- **Order Management:** Tracking accepted quotes through the manufacturing process.
- **AI Studio Frontend:** A dedicated React application (`front end `) for exploring AI capabilities in manufacturing.

**Audiences Served:**
- Manufacturing Service Providers (Job Shops, Contract Manufacturers).
- Product Designers and Engineers requesting quotes.

**Open Items:**
- Refactoring large frontend components (`index.tsx`).
- Enhancing test coverage for edge cases in pricing logic (`test_pricing.py`, `simulate_pricing.py`).
