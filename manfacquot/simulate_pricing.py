
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import User, Manufacturer
from designs.models import Design
from quotes.pricing import calculate_quote_price

print("\n--- SIMULATION: Detailed Feature-Based Pricing ---")

# 1. Setup Mock Data
# Manufacturer with rates
mfg_user = User.objects.get(email="tech_mfg@example.com") # Using our seeded High Tech Manufacturer
manufacturer = mfg_user.manufacturer_profile

print(f"Using Manufacturer: {mfg_user.company_name}")
print(f"Base Rate: {manufacturer.capabilities['pricing_factors']['machining']['machining_rate_usd_min']}/min ($90/hr)")

# 2. Case A: Simple 3-Axis Part
simple_geom = {
    "volume_cm3": 100,
    "fbm_features": [{"feature_type": "Pocket_Simple", "estimated_time": 10}],
    "machinability_assessment": {"has_undercuts": False},
    "bbox_mm": [50, 50, 20]
}
# Mock Design Object
class MockDesign:
    def __init__(self, material, data):
        self.material = material
        self.geometric_data = data
        self.quantity = 1
        self.design_name = "Test Part"
        self.id = 123
        self.requires_engineering_review = False

design_simple = MockDesign("Aluminum", simple_geom)

print("\n[Case A: Simple Part (3-Axis)]")
price_a = calculate_quote_price(design_simple, manufacturer)
# ...

# 3. Case B: Complex 5-Axis Part
complex_geom = {
    # ...
    "volume_cm3": 100,
    "fbm_features": [
        {"feature_type": "Pocket_Undercut", "estimated_time": 20}, # 20 mins
        {"feature_type": "Thread_M6", "estimated_time": 5}        # 5 mins
    ],
    "fbm_operations": [ # Pricing logic looks at 'fbm_operations' now
         {"feature_type": "Pocket_Undercut", "estimated_time": 20},
         {"feature_type": "Thread_M6", "estimated_time": 5}
    ],
    "machinability_assessment": {"has_undercuts": True}, # Triggers 5-Axis
    "bbox_mm": [100, 100, 100]
}
design_complex = MockDesign("Aluminum", complex_geom)

print("\n[Case B: Complex Part (5-Axis)]")
price_b = calculate_quote_price(design_complex, manufacturer)
print(f"Machine Selected: {price_b.calculation_details.get('machine_selected')}")
print(f"Hourly Rate Applied: {price_b.calculation_details.get('applied_hourly_rate')}")
print(f"Feature Costs: {price_b.calculation_details.get('feature_costs')}")
print(f"Total Price: ${price_b.price_usd}")
if price_b.errors:
    print(f"ERRORS: {price_b.errors}")
