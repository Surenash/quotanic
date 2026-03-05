#!/usr/bin/env python
"""
Debug script to test quote generation manually
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from designs.models import Design
from accounts.models import Manufacturer
from designs.views import GenerateQuotesView
from rest_framework.test import APIRequestFactory, force_authenticate

# Get latest design
design = Design.objects.filter(status='analysis_complete').order_by('-created_at').first()

print(f"\n=== Testing Quote Generation ===")
print(f"Design ID: {design.id}")
print(f"Material: {design.material}")
print(f"Status: {design.status}")

# Create request
factory = APIRequestFactory()
request = factory.post(f'/api/designs/{design.id}/generate-quotes/')
force_authenticate(request, user=design.customer)

# Call view
view = GenerateQuotesView.as_view()
response = view(request, id=design.id)

print(f"\nResponse Status: {response.status_code}")
print(f"Response Data: {response.data}")

# Check actual quotes in database
from quotes.models import Quote
quotes = Quote.objects.filter(design=design)
print(f"\nQuotes in DB: {quotes.count()}")
for quote in quotes:
    print(f"  - {quote.manufacturer.email}: ${quote.price_usd}")
