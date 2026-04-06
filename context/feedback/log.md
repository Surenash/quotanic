# Feedback Log

**Dated Entries:**

**[Current Date]:**
- **Source:** Initial Repository Setup & Context Generation
- **Sentiment:** Neutral/Constructive
- **Pattern:** The need for strong, structured AI context to ensure safe and smooth production. The presence of numerous `.py` test and simulation scripts (`test_matcher.py`, `test_pricing.py`, `manual_test.py`) suggests a high focus on verifying the complex FBM logic.
- **Action:** Created this `context/` directory to serve as the definitive guide for AI assistants working on the Quotanic codebase.

**[Recent Date]:**
- **Source:** User Feedback on Cost Breakdown
- **Sentiment:** Negative (Initial) -> Positive (After fix)
- **Pattern:** Missing detail in summaries and math discrepancies between "Total" and "Components" caused confusion. Hardcoded dollar signs in AI output were bypassing currency conversion.
- **Action:** Implemented a "Smart Cost Parser" to break out all hidden FBM variables (Overhead, Margin, etc.). Added an explicit "Totals Calculation" table. Updated `formatPrice` to be robust against string-based currency symbols.
