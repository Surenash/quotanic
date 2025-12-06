import os
import django
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import User, UserRole, Manufacturer

# Create or Get Manufacturer User
email = "manufacturer_test@example.com"
password = "StrongPass123!@#"
company_name = "Test Mfg Co."

user, created = User.objects.get_or_create(email=email, defaults={
    'company_name': company_name,
    'role': UserRole.MANUFACTURER,
    'is_active': True
})

if created:
    user.set_password(password)
    user.save()
    print(f"Created user: {email}")
else:
    print(f"User exists: {email}")

# Create or Update Manufacturer Profile
# Define capabilities with pricing factors
capabilities = {
    "materials_supported": ["Aluminum", "Steel", "ABS"],
    "pricing_factors": {
        "material_properties": {
            "Aluminum": {"density_g_cm3": 2.7, "cost_usd_kg": 5.0},
            "Steel": {"density_g_cm3": 7.85, "cost_usd_kg": 2.0},
            "ABS": {"density_g_cm3": 1.04, "cost_usd_kg": 3.0}
        },
        "machining": {
            "setup_fee_usd": 50.0,
            "base_run_cost_unit": 5.0,
            "time_multiplier_complexity_cost_unit": 50.0,
            "drilling_cost_per_hole": 2.0,
            "contouring_cost_per_cm2": 0.5,
            "material_removal_rate_cm3_min": 20.0,
            "machining_rate_usd_min": 1.5,
            "5_axis_multiplier": 2.0
        },
        "tooling": {
            "custom_tooling_cost_usd": 100.0,
            "amortize": True
        },
        "engineering": {
            "review_fee_usd": 75.0
        },
        "qc": {
            "inspection_costs": {
                "CMM": 50.0,
                "Visual": 10.0,
                "Material Cert": 25.0
            }
        },
        "labor": {
            "skilled_rate_hourly": 25.0,
            "unskilled_rate_hourly": 15.0,
            "efficiency_factor": 0.9
        },
        "overheads": {
            "rate_percent": 0.20  # 20% of direct costs
        },
        "material_factors": {
            "scrap_rate_percent": 0.10, # 10% scrap
            "yield_rate_percent": 0.90
        },
        "packaging": {
            "standard_cost_unit": 2.0,
            "custom_cost_unit": 5.0,
            "export_cost_unit": 15.0
        },
        "logistics": {
            "cost_per_kg": 5.0,
            "insurance_rate_percent": 0.01
        },
        "risk_contingency": {
            "rate_percent": 0.05 # 5% risk buffer
        },
        "profit_margin": {
            "rate_percent": 0.25 # 25% margin
        },
        "urgency_premium": {
            "rate_percent": 0.20 # 20% extra for urgent
        },
        "terms": {
            "validity_days": 30,
            "payment_terms": "50% Advance, 50% Before Dispatch"
        },
        "estimated_lead_time_base_days": 5
    },
    "max_size_mm": [500, 500, 500],
    "cnc": True
}

mf, created = Manufacturer.objects.get_or_create(user=user)
mf.capabilities = capabilities
mf.markup_factor = Decimal("1.20") # 20% markup
mf.location = "New York, USA"
mf.save()

print(f"Updated Manufacturer profile for {company_name} with capabilities.")
