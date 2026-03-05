# Adding Secondary Process Pricing - Verificatioin

## Goal
Verify that the pricing engine accurately calculates costs for secondary operations.

## Methodology
-   Run `seed_manufacturer.py` to populate finishing rates.
-   Run `simulate_pricing.py`.
-   Check output for "Finishing: [Process] $X.XX".

## Results
-   **Anodizing**: Price should include Lot Charge ($120) / Qty + Surface Area Cost.
-   **Total Price**: Should reflect base machining + finishing.
