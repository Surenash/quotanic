#!/usr/bin/env python
"""
Simple pricing test
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from designs.models import Design
from accounts.models import Manufacturer
from quotes.pricing import calculate_quote_price

d = Design.objects.filter(status='analysis_complete').first()
mf = Manufacturer.objects.first()

print(f"Testing pricing for {d.design_name} with {mf.user.email}")
print(f"Material: {d.material}")

result = calculate_quote_price(design=d, manufacturer=mf)

print(f"\nResult:")
print(f"  Price USD: {result.price_usd}")
print(f"  Lead time: {result.estimated_lead_time_days} days")
print(f"  Errors: {result.errors}")

if result.calculation_details:
    print(f"  Details: {result.calculation_details}")
