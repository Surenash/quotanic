
import os
import sys

# Mocking the setup for testing
class MockUser:
    def __init__(self, company_name):
        self.company_name = company_name
    def save(self):
        print(f"User saved with company_name: {self.company_name}")

class MockInstance:
    def __init__(self, user):
        self.user = user
    def save(self):
        print("Instance saved")

def simulate_update(instance, validated_data, initial_data):
    # This matches the current logic in serializers.py
    user_data = validated_data.pop('user', {})
    company_name = user_data.get('company_name') or initial_data.get('companyName') or initial_data.get('company_name')
    
    print(f"DEBUG: user_data from validated_data: {user_data}")
    print(f"DEBUG: companyName from initial_data: {initial_data.get('companyName')}")
    print(f"DEBUG: company_name from initial_data: {initial_data.get('company_name')}")
    print(f"DEBUG: Resolved company_name: {company_name}")

    if company_name:
        instance.user.company_name = company_name
        instance.user.save()
    
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()

# Test Case: What the frontend actually sends
# In index.tsx handleSubmit:
# const payload = { companyName: formData.companyName, ... }
print("--- Test Case: Frontend Payload ---")
user = MockUser("Old Name")
inst = MockInstance(user)
frontend_payload = {'companyName': 'Brand New Name'}
simulate_update(inst, {}, frontend_payload)
