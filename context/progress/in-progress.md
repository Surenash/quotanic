# In-Progress Tasks

**Active Tasks:**
- Real-world verification of FBM pricing logic across different part geometries and materials.
- Refactoring the main application's frontend to break down the monolithic `index.tsx` into smaller components.
- Stress-testing the multi-provider currency engine and its error states.

**Blockers:**
- None currently reported.

**Next Actions:**
- Audit `index.tsx` for further refactoring opportunities (e.g., extracting modals into a `/modals` directory).
- Verify 3D thumbnail rendering performance on the memory-constrained EC2 instance.
- Run `manual_test.py` and `test_quote_generation.py` to verify system stability after recent UI changes.
