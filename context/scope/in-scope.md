# In-Scope

**Core Areas:**
- **Feature-Based Manufacturing (FBM) Engine:** Analyzing CAD geometry, extracting manufacturing features (holes, pockets, bends, etc.), and mapping them to processes.
- **Quotation System:** Generating cost breakdowns, pricing logic, applying manufacturer rates, and managing the lifecycle of a quote.
- **Manufacturer Settings:** Tools for manufacturers to configure capabilities, materials, and pricing structures (`manufacturer_settings_component.tsx`, `add_mfg_capabilities.py`).
- **Order Management:** Tracking accepted quotes through the manufacturing process.
- **AI Studio Frontend:** A dedicated React application (`front end `) for exploring AI capabilities in manufacturing.

**Audiences Served:**
- Manufacturing Service Providers (Job Shops, Contract Manufacturers).
- Product Designers and Engineers requesting quotes.

**Open Items:**
- Refactoring large frontend components (`index.tsx`).
- Enhancing test coverage for edge cases in pricing logic (`test_pricing.py`, `simulate_pricing.py`).
