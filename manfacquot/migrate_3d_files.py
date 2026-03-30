
import os
import django
import logging

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from designs.models import Design, DesignStatus
from designs.tasks import generate_glb_from_step

logger = logging.getLogger(__name__)

def migrate_existing_designs():
    # Find all STEP/IGES designs that don't have a GLB key yet
    designs = Design.objects.filter(
        s3_file_key__iregex=r'\.(step|stp|iges|igs)$'
    )
    
    print(f"Found {designs.count()} STEP/IGES designs to process.")
    
    for design in designs:
        if design.geometric_data and 'glb_file_key' in design.geometric_data:
            print(f"Skipping Design {design.id} - already has GLB.")
            continue
            
        print(f"Processing Design {design.id} ({design.s3_file_key})...")
        
        # Construct local path (assuming local storage or file is synced)
        from django.conf import settings
        local_path = os.path.join(settings.MEDIA_ROOT, design.s3_file_key)
        
        if not os.path.exists(local_path):
            print(f"  Error: File not found at {local_path}")
            continue
            
        try:
            generated_path = generate_glb_from_step(local_path)
            if generated_path and os.path.exists(generated_path):
                # Determine extension (.glb or .stl)
                view_ext = os.path.splitext(generated_path)[1].lower()
                view_key = design.s3_file_key.rsplit('.', 1)[0] + '_view' + view_ext
                
                if not design.geometric_data:
                    design.geometric_data = {}
                
                design.geometric_data['view_file_key'] = view_key
                design.save()
                print(f"  Success: Generated and linked {view_key}")
            else:
                print(f"  Failed: generate_glb_from_step returned None")
        except Exception as e:
            print(f"  Error during conversion: {e}")

if __name__ == "__main__":
    migrate_existing_designs()
