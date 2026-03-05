import os
import django
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import User, UserRole, Manufacturer

def create_manufacturer(email, name, capabilities, location="USA"):
    password = "StrongPass123!@#"
    user, created = User.objects.get_or_create(email=email, defaults={
        'company_name': name,
        'role': UserRole.MANUFACTURER,
        'is_active': True
    })
    if created:
        user.set_password(password)
        user.save()
        print(f"Created user: {email}")
    else:
        print(f"User exists: {email}")

    mf, created = Manufacturer.objects.get_or_create(user=user)
    mf.capabilities = capabilities
    mf.location = location
    mf.average_rating = Decimal("4.8") # High default for testing
    mf.save()
    print(f"Updated profile for {name}")

# Default Pricing Template (Full)
default_pricing = {
    "material_properties": {
        "Aluminum": {"density_g_cm3": 2.7, "cost_usd_kg": 5.0},
        "Steel": {"density_g_cm3": 7.85, "cost_usd_kg": 2.0},
        "ABS": {"density_g_cm3": 1.04, "cost_usd_kg": 3.0}
    },
    "machining": {
        "setup_fee_usd": 50.0,
        "base_run_cost_unit": 5.0,
        "machining_rate_usd_min": 1.5, # $90/hr
        "5_axis_multiplier": 2.0,
        "drilling_cost_per_hole": 2.0,
        "contouring_cost_per_cm2": 0.5,
        "material_removal_rate_cm3_min": 20.0
    },
    "finishing": {
        "anodize_type_ii_sulfuric": {"min_lot_usd": 120.0, "cost_sq_cm": 0.05},
        "anodize_type_iii_hardcoat": {"min_lot_usd": 150.0, "cost_sq_cm": 0.08},
        "chem_film_alodine": {"min_lot_usd": 100.0, "cost_sq_cm": 0.04},
        "plating_zinc": {"min_lot_usd": 120.0, "cost_sq_cm": 0.06},
        "passivation": {"min_lot_usd": 90.0, "cost_sq_cm": 0.03},
        "black_oxide": {"min_lot_usd": 100.0, "cost_sq_cm": 0.05},
        "heat_treatment": {"min_lot_usd": 200.0, "cost_per_kg": 8.0}, # Generic
        "powder_coating": {"min_lot_usd": 150.0, "cost_sq_cm": 0.04}
    },
    "tooling": {"custom_tooling_cost_usd": 100.0, "amortize": True},
    "engineering": {"review_fee_usd": 75.0},
    "qc": {"inspection_costs": {"CMM": 50.0}},
    "labor": {"skilled_rate_hourly": 25.0, "efficiency_factor": 0.9},
    "overheads": {"rate_percent": 0.20},
    "material_factors": {"scrap_rate_percent": 0.10, "yield_rate_percent": 0.90},
    "packaging": {"standard_cost_unit": 2.0},
    "logistics": {"cost_per_kg": 5.0},
    "risk_contingency": {"rate_percent": 0.05},
    "profit_margin": {"rate_percent": 0.25},
    "urgency_premium": {"rate_percent": 0.20},
    "terms": {"validity_days": 30}
}

def get_pricing_with_overrides(overrides):
    import copy
    pricing = copy.deepcopy(default_pricing)
    # Simple recursive update or key update could go here, for now just updating top level keys if passed
    # But for this simple seed, we'll just verify machining exists
    for cat, values in overrides.items():
        if cat in pricing:
            pricing[cat].update(values)
        else:
            pricing[cat] = values
    return pricing

# 1. High-Tech Precision Shop
high_tech_pricing = get_pricing_with_overrides({"machining": {"5_axis_multiplier": 1.5, "setup_fee_usd": 150.0, "machining_rate_usd_min": 2.5}}) # Higher rate $150/hr
high_tech_caps = {
    "materials_supported": ["Aluminum", "Steel", "Titanium", "Inconel"],
    "processes": [
        "milling_3_axis", "milling_5_axis", "turning_standard", 
        "turning_live_tooling", "swiss_turning", "edm_wire", 
        "grinding_surface", "anodize_type_ii_sulfuric", "anodize_type_iii_hardcoat"
    ],
    "specialized_materials": ["Titanium", "Inconel"],
    "high_precision": True,
    "max_size_mm": [800, 800, 600],
    "pricing_factors": high_tech_pricing
}
create_manufacturer("tech_mfg@example.com", "Precision Dynamics", high_tech_caps, "California, USA")

# 2. General Job Shop
basic_pricing = get_pricing_with_overrides({"machining": {"setup_fee_usd": 50.0}})
basic_caps = {
    "materials_supported": ["Aluminum", "Steel", "Brass", "ABS"],
    "processes": [
        "milling_3_axis", "turning_standard", "bead_blast", 
        "plating_zinc", "welding_mig", "welding_tig"
    ],
    "specialized_materials": ["Aluminum"],
    "high_precision": False,
    "max_size_mm": [1000, 500, 500],
    "pricing_factors": basic_pricing
}
create_manufacturer("basic_mfg@example.com", "General Job Shop Inc", basic_caps, "Ohio, USA")

# 3. Sheet Metal Specialist
sheet_pricing = get_pricing_with_overrides({"machining": {"setup_fee_usd": 30.0}})
sheet_caps = {
    "materials_supported": ["Aluminum", "Steel", "Stainless Steel"],
    "processes": [
        "sheet_laser_cut", "sheet_bend_brake", "welding_spot", 
        "powder_coating", "riveting"
    ],
    "specialized_materials": ["Steel", "Stainless Steel"],
    "high_precision": False,
    "max_size_mm": [3000, 1500, 20],
     "pricing_factors": sheet_pricing
}
create_manufacturer("sheet_mfg@example.com", "Rapid Sheet Metal", sheet_caps, "Texas, USA")

print("Seeding Complete: Created 3 Manufactuers with distinct intelligent capabilities.")
