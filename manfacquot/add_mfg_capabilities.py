#!/usr/bin/env python
"""
Add manufacturing capabilities to test manufacturers
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import Manufacturer

# Update all manufacturers to have basic milling capability
manufacturers = Manufacturer.objects.all()

print(f"\nUpdating {manufacturers.count()} manufacturers with MILLING_3_AXIS capability...\n")

for mf in manufacturers:
    capabilities = mf.capabilities or {}
    
    # Add processes if not present
    if 'processes' not in capabilities:
        capabilities['processes'] = []
    
    # Add MILLING_3_AXIS if not already present
    if 'milling_3_axis' not in capabilities['processes']:
        capabilities['processes'].append('milling_3_axis')
    
    # Add common materials if not present
    if 'materials_supported' not in capabilities:
        capabilities['materials_supported'] = [
            'Aluminum 6061',
            'Aluminum 7075', 
            'Stainless Steel 304',
            'Stainless Steel 316',
            'Brass',
            'Copper',
            'Steel'
        ]
    
    mf.capabilities = capabilities
    mf.save()
    
    print(f"✅ Updated {mf.user.email}")
    print(f"   Processes: {capabilities['processes']}")
    print(f"   Materials: {len(capabilities['materials_supported'])} types")
    print()

print("✅ All manufacturers updated successfully!")
