
import os

# Mock DRF-like structure
class Field:
    def __init__(self, source=None):
        self.source = source

class Serializer:
    def __init__(self, instance):
        self.instance = instance
        self.data = self.to_representation(instance)
    
    def to_representation(self, instance):
        # Simplification of how DRF works
        data = {}
        # In ManufacturerProfileSerializer:
        # company_name = serializers.CharField(source='user.company_name')
        
        # Simulate source traversal
        if hasattr(instance, 'user'):
            data['company_name'] = instance.user.company_name
        return data

class MockUser:
    def __init__(self, company_name):
        self.company_name = company_name

class MockManufacturer:
    def __init__(self, user):
        self.user = user

user = MockUser("Test Company")
mfg = MockManufacturer(user)
ser = Serializer(mfg)
print(f"Data: {ser.data}")
