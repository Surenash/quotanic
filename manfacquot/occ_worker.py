import os
import sys
import django
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("occ_worker")

def run_conversion(file_path, design_id, task_type):
    # Setup Django
    sys.path.append(os.getcwd())
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
    django.setup()

    from designs.tasks import generate_feature_aware_glb, generate_snapshot

    try:
        if task_type == 'glb':
            # Do NOT run perform_fbm_analysis again, it causes redundant work and crashes
            # We generate a standard GLB view of the base shape
            output_path = generate_feature_aware_glb(file_path, raw_features=None)
            if output_path and os.path.exists(output_path):
                print(f"SUCCESS:{output_path}")
                return True
            else:
                print("FAILED: No output path returned")
                return False
                
        elif task_type == 'snapshot':
            output_path = file_path.rsplit('.', 1)[0] + '_thumb.png'
            success = generate_snapshot(file_path, output_path)
            if success and os.path.exists(output_path):
                print(f"SUCCESS:{output_path}")
                return True
            else:
                print("FAILED: Snapshot generation returned false")
                return False
                
    except Exception as e:
        print(f"CRASHED:{str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python occ_worker.py <file_path> <design_id> <task_type(glb|snapshot)>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    design_id = sys.argv[2]
    task_type = sys.argv[3]
    run_conversion(file_path, design_id, task_type)
