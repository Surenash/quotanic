# Findings & Experiments

**Dated Entries:**

**[Current Date]:**
- **Source:** Codebase exploration (`manfacquot/index.tsx`, `simulate_pricing.py`).
- **Finding:** The primary frontend for `manfacquot` is tightly integrated within the main application directory, but a massive `index.tsx` file (~240KB) indicates a potential performance and maintainability bottleneck. The pricing logic is under active development or testing, as evidenced by multiple simulation scripts (`simulate_pricing.py`, `simulate_smart_flow.py`).
- **Relevance:** High. This impacts future frontend refactoring efforts and the stability of the core quoting engine.
- **Action:** Prioritize refactoring `index.tsx` into smaller components (e.g., `cost_breakdown_modal.tsx`, `manufacturer_settings_component.tsx`) and ensure test scripts pass before merging changes.
