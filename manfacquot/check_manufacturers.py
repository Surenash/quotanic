
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import Manufacturer, User
from accounts.constants import UserRole

count = Manufacturer.objects.count()
print(f"Manufacturer count: {count}")

if count == 0:
    print("Creating a test manufacturer...")
    email = "testmanuf@example.com"
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(
            email=email,
            password="Password123!",
            company_name="Test Manufacturer Inc.",
            role=UserRole.MANUFACTURER
        )
        Manufacturer.objects.create(
            user=user,
            location="Test City, TZ",
            capabilities={"pricing_factors": {}, "processes": ["CNC Milling"]},
            certifications=["ISO 9001"],
            average_rating=4.5,
            website_url="https://example.com"
        )
        print("Created test manufacturer.")
    else:
        print("User exists but no profile. Creating profile.")
        user = User.objects.get(email=email)
        Manufacturer.objects.create(
            user=user,
            location="Test City, TZ",
            capabilities={"pricing_factors": {}, "processes": ["CNC Milling"]},
            certifications=["ISO 9001"],
            average_rating=4.5,
            website_url="https://example.com"
        )
        print("Created profile for existing user.")
