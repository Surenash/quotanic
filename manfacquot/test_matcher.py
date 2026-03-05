#!/usr/bin/env python
"""
Direct test of matcher logic
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from designs.models import Design
from accounts.models import Manufacturer
from designs.fbm_manufacturing_intelligence import fbm_manufacturing_intelligence, ManufacturingProcess
from designs.matcher import smart_matcher

# Get latest design  
design = Design.objects.filter(status='analysis_complete').order_by('-created_at').first()

print(f"\n=== Testing Matcher Logic ===")
print(f"Design: {design.design_name}")
print(f"Material: {design.material}")

# Get requirements
requirements = fbm_manufacturing_intelligence.determine_manufacturing_requirements(
    design.geometric_data, 
    design.material, 
    design.quantity
)

print(f"\nRequirements:")
print(f"  Primary: {requirements['primary_process']}")
print(f"  Primary value: {requirements['primary_process'].value if hasattr(requirements['primary_process'], 'value') else requirements['primary_process']}")
print(f"  Secondary ops: {requirements['secondary_operations']}")

# Test each manufacturer
manufacturers = Manufacturer.objects.all()
print(f"\nTesting {manufacturers.count()} manufacturers:\n")

for mf in manufacturers:
    caps = mf.capabilities or {}
    processes = caps.get('processes', [])
    print(f"{mf.user.email}:")
    print(f"  Processes in DB: {processes}")
    print(f"  Has milling_3_axis: {'milling_3_axis' in processes}")
    
    score = smart_matcher.calculate_match_score(design, requirements, mf)
    print(f"  Match score: {score}")
    print(f"  Passes threshold (>30.0): {score > 30.0}")
    print()
