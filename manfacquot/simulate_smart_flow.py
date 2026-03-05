
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import User, Manufacturer
from designs.models import Design, DesignStatus
from designs.fbm_manufacturing_intelligence import fbm_manufacturing_intelligence
from designs.matcher import smart_matcher

# 1. Setup Dummy Design (Complex)
# Needs 5-Axis (Undercuts) + Aluminum (Needs Anodizing)
complex_geom = {
    "bbox_mm": [100, 100, 50],
    "fbm_features": [
        {"feature_type": "Pocket", "orientation": "Z"},
        {"feature_type": "Pocket", "orientation": "X"}, # Multi-axis
    ],
    "machinability_assessment": {"has_undercuts": True} # Triggers 5-Axis
}

print("\n--- SIMULATION: Intelligent Quote Routing ---")

# Mock Design Object (not saving to DB to avoid clutter, just passing object-like structure if possible, 
# but Matcher needs object attributes. Let's create a temp one or mock class)

class MockDesign:
    def __init__(self, material, data):
        self.material = material
        self.geometric_data = data
        self.quantity = 10
        self.id = "SIM-001"

design = MockDesign("Aluminum 6061", complex_geom)
print(f"Design: {design.material}, Complex Geometry (Undercuts=True)")

# 2. Analyze Requirements
reqs = fbm_manufacturing_intelligence.determine_manufacturing_requirements(
    design.geometric_data, design.material, design.quantity
)
print(f"\n[AI Analysis Result]")
print(f"Primary Process: {reqs.get('primary_process')}")
print(f"Secondary Ops: {reqs.get('secondary_operations')}")
print(f"Reasoning: {reqs.get('reasoning')}")

# 3. Match against Manufacturers
print(f"\n[Matching Evaluation]")
all_mfs = Manufacturer.objects.all()

for mf in all_mfs:
    # Skip if no company name or capabilities map
    if not mf.user.company_name: continue
    caps = mf.capabilities or {}
    
    score = smart_matcher.calculate_match_score(design, reqs, mf)
    
    # Highlight our seeded ones for clarity
    is_seeded = mf.user.email in ["tech_mfg@example.com", "basic_mfg@example.com", "sheet_mfg@example.com"]
    prefix = ">>> " if is_seeded else "    "
    
    print(f"{prefix}Manufacturer: {mf.user.company_name} ({mf.user.email})")
    print(f"{prefix}   - Capabilities: {caps.get('processes', [])[:3]}...") 
    print(f"{prefix}   - Match Score: {score:.1f}/100")
    
    if score > 80:
        print(f"{prefix}   -> STATUS: EXCELLENT MATCH - SELECTED")
    elif score > 30:
        print(f"{prefix}   -> STATUS: POSSIBLE MATCH")
    else:
        print(f"{prefix}   -> STATUS: REJECTED")
    print("-" * 30)
