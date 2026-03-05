#!/usr/bin/env python
"""
Test pricing calculation
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from designs.models import Design
from accounts.models import Manufacturer
from quotes.pricing import calculate_quote_price

# Get latest design
design = Design.objects.filter(status='analysis_complete').order_by('-created_at').first()

print(f"\n=== Testing Pricing Calculation ===")
print(f"Design: {design.design_name}")

# Test each manufacturer
manufacturers = Manufacturer.objects.all()
print(f"\nTesting {manufacturers.count()} manufacturers:\n")

for mf in manufacturers:
    print(f"{mf.user.email}:")
    result = calculate_quote_price(design=design, manufacturer=mf)
    print(f"  Price: ${result.price_usd}")
    print(f"  Lead time: {result.estimated_lead_time_days} days")
    print(f"  Errors: {result.errors}")
    print(f"  Details: {result.calculation_details[:100] if result.calculation_details else 'None'}...")
    print()
