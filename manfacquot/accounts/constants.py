from django.db import models

class UserRole(models.TextChoices):
    CUSTOMER = 'customer', 'Customer'
    MANUFACTURER = 'manufacturer', 'Manufacturer'
