
import os
import sys

# Add the project directory to sys.path
sys.path.append('/Users/mac/Desktop/quotanic anti/manfacquot')

# Mock Django setup for a simple logic check
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

# Simulating the update logic from the serializer
def simulate_update(instance, validated_data, initial_data):
    user_data = validated_data.pop('user', {})
    company_name = user_data.get('company_name') or initial_data.get('companyName') or initial_data.get('company_name')
    
    if company_name:
        instance.user.company_name = company_name
        instance.user.save()
    
    print(f"Validated data after pop: {validated_data}")

# Test Case 1: companyName in initial_data
print("--- Test Case 1: companyName in initial_data ---")
user1 = MockUser("Old Name")
inst1 = MockInstance(user1)
simulate_update(inst1, {}, {'companyName': 'New Name 1'})

# Test Case 2: company_name in initial_data
print("\n--- Test Case 2: company_name in initial_data ---")
user2 = MockUser("Old Name")
inst2 = MockInstance(user2)
simulate_update(inst2, {}, {'company_name': 'New Name 2'})

# Test Case 3: company_name in validated_data (from source='user.company_name')
print("\n--- Test Case 3: company_name in validated_data ---")
user3 = MockUser("Old Name")
inst3 = MockInstance(user3)
simulate_update(inst3, {'user': {'company_name': 'New Name 3'}}, {})
