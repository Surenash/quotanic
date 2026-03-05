#!/usr/bin/env python
"""
Add pricing rates to manufacturers
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import Manufacturer

print("\nAdding pricing rates to manufacturers...\n")

manufacturers = Manufacturer.objects.all()

for mf in manufacturers:
    capabilities = mf.capabilities or {}
    
    # Add pricing rates
    if 'pricing_rates' not in capabilities:
        capabilities['pricing_rates'] = {}
    
    # Basic material pricing (USD per hour)
    capabilities['pricing_rates'] = {
        'Aluminum': {
            'machining_rate_per_hour': 75.0,
            'setup_fee': 150.0,
            'material_markup': 1.3
        },
        'Aluminum 6061': {
            'machining_rate_per_hour': 75.0,
            'setup_fee': 150.0,
            'material_markup': 1.3
        },
        'Aluminum 7075': {
            'machining_rate_per_hour': 85.0,
            'setup_fee': 150.0,
            'material_markup': 1.4
        },
        'Steel': {
            'machining_rate_per_hour': 90.0,
            'setup_fee': 200.0,
            'material_markup': 1.5
        },
        'Stainless Steel 304': {
            'machining_rate_per_hour': 100.0,
            'setup_fee': 200.0,
            'material_markup': 1.6
        },
        'Stainless Steel 316': {
            'machining_rate_per_hour': 110.0,
            'setup_fee': 200.0,
            'material_markup': 1.7
        },
        'Titanium': {
            'machining_rate_per_hour': 150.0,
            'setup_fee': 300.0,
            'material_markup': 2.0
        },
        'Brass': {
            'machining_rate_per_hour': 80.0,
            'setup_fee': 150.0,
            'material_markup': 1.4
        },
        'Copper': {
            'machining_rate_per_hour': 85.0,
            'setup_fee': 150.0,
            'material_markup': 1.5
        }
    }
    
    mf.capabilities = capabilities
    mf.save()
    
    print(f"✅ Updated {mf.user.email}")
    print(f"   Pricing rates: {len(capabilities['pricing_rates'])} materials")

print("\n✅ All manufacturers updated with pricing rates!")
