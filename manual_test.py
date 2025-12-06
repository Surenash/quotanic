import requests
import json
import sys
import subprocess
import time

BASE_URL = "http://localhost:8000/api"

def print_step(step):
    print(f"\n{'='*50}\n{step}\n{'='*50}")

def run_command(command):
    try:
        subprocess.run(command, shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print(e.stderr.decode())
        sys.exit(1)

# 1. Check if server is running
try:
    requests.get("http://localhost:8000/admin/login/")
except requests.exceptions.ConnectionError:
    print("Error: Django server is not running on http://localhost:8000.")
    print("Please start the server in a separate terminal using: python manage.py runserver")
    sys.exit(1)

# --- Data ---
MF_EMAIL = "manuf_e2e@example.com"
MF_PASSWORD = "Password123!"
CUST_EMAIL = "cust_e2e@example.com"
CUST_PASSWORD = "Password123!"

# --- 2. Register Manufacturer ---
print_step("1. Registering Manufacturer")
resp = requests.post(f"{BASE_URL}/auth/register", json={
    "email": MF_EMAIL,
    "password": MF_PASSWORD,
    "password2": MF_PASSWORD,
    "company_name": "E2E Precision Machining",
    "role": "manufacturer"
})
if resp.status_code == 201:
    print("Manufacturer registered.")
elif resp.status_code == 400 and "already exists" in resp.text:
    print("Manufacturer already exists, proceeding to login.")
else:
    print(f"Failed to register manufacturer: {resp.text}")
    sys.exit(1)

# --- 3. Login Manufacturer ---
print_step("2. Logging in Manufacturer")
resp = requests.post(f"{BASE_URL}/auth/token", json={
    "email": MF_EMAIL,
    "password": MF_PASSWORD
})
if resp.status_code != 200:
    print(f"Login failed: {resp.text}")
    sys.exit(1)
mf_token = resp.json()['access']
print("Manufacturer logged in.")

# --- 4. Update Manufacturer Profile ---
print_step("3. Setting up Manufacturer Profile (Pricing)")
headers_mf = {"Authorization": f"Bearer {mf_token}"}
profile_data = {
    "markup_factor": "1.3",
    "capabilities": {
        "materials_supported": ["PLA", "ABS", "Steel"],
        "max_size_mm": [500, 500, 500],
        "pricing_factors": {
            "material_properties": {
                "PLA": {"density_g_cm3": 1.25, "cost_usd_kg": 20.0},
                "ABS": {"density_g_cm3": 1.04, "cost_usd_kg": 25.0},
                "Steel": {"density_g_cm3": 7.85, "cost_usd_kg": 5.0}
            },
            "machining": {
                "base_time_cost_unit": 15.0,
                "time_multiplier_complexity_cost_unit": 100.0
            },
            "estimated_lead_time_base_days": 5
        },
        "cnc": True
    }
}
resp = requests.patch(f"{BASE_URL}/manufacturers/profile", json=profile_data, headers=headers_mf)
if resp.status_code == 200:
    print("Manufacturer profile updated with pricing logic.")
else:
    print(f"Failed to update profile: {resp.text}")
    sys.exit(1)


# --- 5. Register Customer ---
print_step("4. Registering Customer")
resp = requests.post(f"{BASE_URL}/auth/register", json={
    "email": CUST_EMAIL,
    "password": CUST_PASSWORD,
    "password2": CUST_PASSWORD,
    "company_name": "Innovative Designs Inc.",
    "role": "customer"
})
if resp.status_code == 201:
    print("Customer registered.")
elif resp.status_code == 400 and "already exists" in resp.text:
    print("Customer already exists, proceeding to login.")
else:
    print(f"Failed to register customer: {resp.text}")
    sys.exit(1)

# --- 6. Login Customer ---
print_step("5. Logging in Customer")
resp = requests.post(f"{BASE_URL}/auth/token", json={
    "email": CUST_EMAIL,
    "password": CUST_PASSWORD
})
if resp.status_code != 200:
    print(f"Login failed: {resp.text}")
    sys.exit(1)
cust_token = resp.json()['access']
print("Customer logged in.")

# --- 7. Create Design (Upload Flow) ---
print_step("6. Creating Design Record")
# Note: We are skipping the actual S3 upload call (GET /upload-url) and PUT to S3 
# because we assume no AWS creds are set. We directly create the record.
headers_cust = {"Authorization": f"Bearer {cust_token}"}
design_data = {
    "design_name": "Prototype Gear V1",
    "s3_file_key": f"uploads/designs/dummy_user/gear_v1.stl", # Dummy key
    "material": "ABS",
    "quantity": 10
}
resp = requests.post(f"{BASE_URL}/designs/", json=design_data, headers=headers_cust)
if resp.status_code != 201:
    print(f"Failed to create design: {resp.text}")
    sys.exit(1)
design_id = resp.json()['id']
print(f"Design created! ID: {design_id}")
print("Note: The system is now trying to analyze this file via Celery.")
print("Since the file is not actually on S3, the task will fail (which is expected).")

# --- 8. Simulate Analysis (The Cheat) ---
print_step("7. Simulating Successful CAD Analysis (Bypassing S3)")
# We inject geometric data directly into the DB for this design
simulate_cmd = f"""
python manage.py shell -c "from designs.models import Design, DesignStatus; d = Design.objects.get(id='{design_id}'); d.status=DesignStatus.ANALYSIS_COMPLETE; d.geometric_data={{'volume_cm3': 150.5, 'bbox_mm': [100, 50, 25], 'surface_area_cm2': 400.0, 'complexity_score': 0.75, 'analysis_engine': 'simulation'}}; d.save(); print('Simulated analysis complete.')"
"""
run_command(simulate_cmd)
print("Database updated manually: Design is now 'ANALYSIS_COMPLETE' with valid geometry.")

# --- 9. Generate Quotes ---
print_step("8. Generating Quotes")
resp = requests.post(f"{BASE_URL}/designs/{design_id}/generate-quotes", headers=headers_cust)
if resp.status_code == 200:
    data = resp.json()
    print(f"Success! {data['message']}")
    print("\n--- Generated Quotes ---")
    for quote in data['generated_quotes']:
        print(f"Manufacturer ID: {quote['manufacturer']}")
        print(f"Price: ${quote['price_usd']}")
        print(f"Lead Time: {quote['estimated_lead_time_days']} days")
        print(f"Notes: {quote['notes']}")
        print("-" * 30)
else:
    print(f"Failed to generate quotes: {resp.text}")
    sys.exit(1)

print_step("Test Complete: End-to-End Flow Successful")
