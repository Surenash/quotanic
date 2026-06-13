
import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Manufacturer
from accounts.constants import UserRole

User = get_user_model()

def create_user_if_not_exists(email, password, role, company_name):
    try:
        user = User.objects.get(email=email)
        print(f"User {email} already exists.")
        # Reset password just in case
        user.set_password(password)
        user.save()
        print(f"Reset password for {email} to '{password}'")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=email,
            password=password,
            role=role,
            company_name=company_name
        )
        print(f"Created user {email} with role {role}")
    
    return user

def setup():
    # Create Customer
    customer = create_user_if_not_exists(
        email='customer@test.com',
        password='pass1234',
        role=UserRole.CUSTOMER,
        company_name='Test Customer Inc.'
    )

    # Create Manufacturer
    manufacturer_user = create_user_if_not_exists(
        email='manufacturer@test.com',
        password='pass1234',
        role=UserRole.MANUFACTURER,
        company_name='Test Manufacturer Co.'
    )

    # Ensure Manufacturer Profile exists
    if not hasattr(manufacturer_user, 'manufacturer_profile'):
        Manufacturer.objects.create(
            user=manufacturer_user,
            location='Test Location',
            capabilities={"pricing_factors": {}},
            certifications=[],
            markup_factor=1.2
        )
        print(f"Created Manufacturer profile for {manufacturer_user.email}")
    else:
        print(f"Manufacturer profile already exists for {manufacturer_user.email}")

if __name__ == '__main__':
    setup()
