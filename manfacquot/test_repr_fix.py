
import os
import django
import logging

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from designs.models import Design
import OCC.Core.BRepMesh
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Extend.DataExchange import read_step_file
from OCC.Core.StlAPI import StlAPI_Writer

def test_single_conversion(design_id):
    try:
        design = Design.objects.get(id=design_id)
        from django.conf import settings
        local_path = os.path.join(settings.MEDIA_ROOT, design.s3_file_key)
        
        print(f"Testing Design {design_id} at {local_path}")
        
        print("1. Loading STEP file...")
        shape = read_step_file(local_path)
        if not shape or shape.IsNull():
            print("  FAILED: Shape is null")
            return
        
        print("2. Performing tessellation...")
        mesh = BRepMesh_IncrementalMesh(shape, 0.5, False, 0.5, True)
        mesh.Perform()
        print(f"  Done. IsDone: {mesh.IsDone()}")
        
        print("3. Exporting STL fallback...")
        stl_path = local_path.rsplit('.', 1)[0] + '_fallback.stl'
        writer = StlAPI_Writer()
        writer.Write(shape, stl_path)
        if os.path.exists(stl_path):
            print(f"  SUCCESS: STL saved to {stl_path}")
        else:
            print("  FAILED: STL file not created")

    except Exception as e:
        print(f"  CRASHED: {e}")

if __name__ == "__main__":
    # Test the problematic design
    test_single_conversion('4f6ea315-a9f1-4d88-ac76-07cba0bd93ff')
