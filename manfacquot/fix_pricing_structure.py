#!/usr/bin/env python
"""
Add proper pricing_factors structure to manufacturers
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import Manufacturer

print("\nAdding complete pricing_factors to manufacturers...\n")

manufacturers = Manufacturer.objects.all()

for mf in manufacturers:
    capabilities = mf.capabilities or {}
    
    # Create the proper pricing_factors structure
    capabilities['pricing_factors'] = {
        'material_properties': {
            'Aluminum': {
                'density_g_cm3': 2.7,
                'cost_usd_kg': 4.0
            },
            'Aluminum 6061': {
                'density_g_cm3': 2.7,
                'cost_usd_kg': 4.5
            },
            'Aluminum 7075': {
                'density_g_cm3': 2.81,
                'cost_usd_kg': 6.0
            },
            'Steel': {
                'density_g_cm3': 7.85,
                'cost_usd_kg': 2.0
            },
            'Stainless Steel 304': {
                'density_g_cm3': 8.0,
                'cost_usd_kg': 5.0
            },
            'Stainless Steel 316': {
                'density_g_cm3': 8.0,
                'cost_usd_kg': 6.5
            },
            'Titanium': {
                'density_g_cm3': 4.5,
                'cost_usd_kg': 40.0
            },
            'Brass': {
                'density_g_cm3': 8.5,
                'cost_usd_kg': 8.0
            },
            'Copper': {
                'density_g_cm3': 8.96,
                'cost_usd_kg': 10.0
            }
        },
        'machining': {
            'machining_rate_usd_min': 1.5,
            'setup_fee_usd': 150.0,
            'base_run_cost_unit': 5.0,
            'material_removal_rate_cm3_min': 20.0,
            '5_axis_multiplier': 2.0
        },
        'labor': {
            'skilled_rate_hourly': 25.0,
            'efficiency_factor': 1.0
        },
        'overheads': {
            'rate_percent': 0.20
        },
        'material_factors': {
            'scrap_rate_percent': 0.10,
            'yield_rate_percent': 0.95
        },
        'tooling': {
            'custom_tooling_cost_usd': 0.0,
            'amortize': True
        },
        'engineering': {
            'review_fee_usd': 50.0
        },
        'qc': {
            'inspection_costs': {}
        },
        'packaging': {
            'standard_cost_unit': 2.0,
            'custom_cost_unit': 5.0,
            'export_cost_unit': 10.0
        },
        'logistics': {
            'base_fee_usd': 50.0,
            'cost_per_kg': 2.0
        },
        'risk_contingency': {
            'rate_percent': 0.05
        },
        'profit_margin': {
            'rate_percent': 0.25
        },
        'urgency_premium': {
            'rate_percent': 0.20
        },
        'terms': {
            'validity_days': 30,
            'payment_terms': 'Net 30'
        },
        'finishing': {},
        'estimated_lead_time_base_days': 14
    }
    
    mf.capabilities = capabilities
    mf.save()
    
    print(f"✅ Updated {mf.user.email}")

print("\n✅ All manufacturers updated with complete pricing_factors!")
