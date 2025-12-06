import logging
import os
import tempfile
from decimal import Decimal # For precise arithmetic

import boto3
from botocore.exceptions import ClientError
from celery import shared_task
from django.conf import settings
from django.db import transaction

from .models import Design, DesignStatus

logger = logging.getLogger(__name__)

# Attempt to import numpy-stl
try:
    import numpy
    from stl import mesh as stl_mesh
    NUMPY_STL_AVAILABLE = True
except ImportError:
    NUMPY_STL_AVAILABLE = False
    stl_mesh = None

# Placeholder for steputils if it was intended to be used
STEPUTILS_AVAILABLE = False

# Attempt to import pythonocc-core
try:
    from OCC.Extend.DataExchange import read_step_file, read_iges_file
    from OCC.Core.TopoDS import TopoDS_Shape
    from OCC.Core.BRepGProp import brepgprop
    from OCC.Core.GProp import GProp_GProps
    from OCC.Core.BRepBndLib import brepbndlib
    from OCC.Core.Bnd import Bnd_Box
    from OCC.Core.TopLoc import TopLoc_Location
    from OCC.Core.gp import gp_Trsf
    from OCC.Extend.TopologyUtils import TopologyExplorer # Useful for iterating subshapes
    PYTHONOCC_AVAILABLE = True
except ImportError:
    PYTHONOCC_AVAILABLE = False
    logger.warning("pythonocc-core is not available. Advanced CAD analysis will be limited.")


def perform_stl_analysis(file_path):
    """
    Performs CAD analysis on an STL file using numpy-stl.
    Extracts volume, bounding box, surface area, and a complexity score.
    Assumes STL units are in millimeters (mm).
    """
    if not NUMPY_STL_AVAILABLE:
        logger.error("numpy-stl library is not available. Cannot perform STL analysis.")
        raise RuntimeError("STL analysis library (numpy-stl) not installed.")

    logger.info(f"STL Analysis: Starting for file {file_path}...")

    try:
        main_mesh = stl_mesh.Mesh.from_file(file_path)
    except Exception as e: # Catch broad exceptions from stl library loading
        logger.error(f"STL Analysis: Failed to load/parse STL file {file_path}: {e}")
        raise ValueError(f"Invalid or corrupt STL file: {os.path.basename(file_path)}") from e

    # Volume: numpy-stl returns volume in units^3 of the STL file. Assuming mm^3.
    # Convert to cm^3 (1 cm^3 = 1000 mm^3)
    volume_mm3, _, _ = main_mesh.get_mass_properties()
    volume_cm3 = abs(Decimal(str(volume_mm3))) / Decimal("1000.0")

    # Bounding Box (bbox_mm): Get min/max extents and calculate dimensions.
    # mesh.min_ and mesh.max_ give [xmin, ymin, zmin] and [xmax, ymax, zmax]
    min_coords = main_mesh.min_
    max_coords = main_mesh.max_
    bbox_mm = [
        float(Decimal(str(max_coords[i])) - Decimal(str(min_coords[i]))) for i in range(3)
    ]

    # Surface Area: numpy-stl returns area in units^2. Assuming mm^2.
    # Convert to cm^2 (1 cm^2 = 100 mm^2)
    surface_area_mm2 = main_mesh.areas.sum()
    surface_area_cm2 = Decimal(str(surface_area_mm2)) / Decimal("100.0")

    # Complexity Score (heuristic: number of triangles / 10000, capped at 1.0)
    # This is a very basic heuristic. A more sophisticated score would be better.
    num_triangles = main_mesh.vectors.shape[0]
    logger.info(f"STL Analysis Debug: num_triangles={num_triangles}, vectors.shape={main_mesh.vectors.shape}")
    complexity_score = min(Decimal(str(num_triangles)) / Decimal("10000.0"), Decimal("1.0"))

    # --- Manufacturing Concepts / DFM Analysis ---
    
    # 1. Prismatic vs Organic (Normal Vector Analysis)
    # Check alignment of face normals with principal axes (X, Y, Z)
    # numpy-stl normals are in main_mesh.normals
    normals = main_mesh.normals
    # Normalize vectors just in case (though stl usually has them normalized)
    # We can use numpy for fast batch processing if available, which it is since we imported it.
    
    # Absolute dot products with axes. 
    # Since we want to check if it aligns with ANY axis (X, Y, or Z), we look for components close to 1.0 or -1.0
    # A perfectly prismatic part (cube) has normals like [1,0,0], [-1,0,0], [0,1,0]...
    # So the max absolute component of the normal vector should be close to 1.0.
    
    abs_normals = numpy.abs(normals)
    max_components = numpy.max(abs_normals, axis=1)
    
    # We define "aligned" as having a max component > 0.95 (approx 18 degrees tolerance)
    aligned_mask = max_components > 0.95
    aligned_faces_count = numpy.sum(aligned_mask)
    total_faces = normals.shape[0]
    
    prismatic_score = float(aligned_faces_count) / float(total_faces) if total_faces > 0 else 0.0
    
    # 2. Thin Wall / Fragility Indicator
    # High Surface Area to Volume ratio usually indicates thin walls or complex lattice.
    # Sphere SA/Vol = 3/r. Cube SA/Vol = 6/s.
    # Heuristic: If SA (cm2) / Vol (cm3) > 10, it might be thin/fragile.
    sa_vol_ratio = float(surface_area_cm2) / float(volume_cm3) if volume_cm3 > 0 else 0.0
    
    dfm_risks = []
    if sa_vol_ratio > 10.0:
        dfm_risks.append("High Surface-to-Volume Ratio (Potential Thin Walls)")
    
    if prismatic_score < 0.5:
        dfm_risks.append("Organic/Contoured Geometry (Requires 3D Machining)")

    analysis_results = {
        "volume_cm3": float(volume_cm3.quantize(Decimal("0.01"))), # Store as float after rounding
        "bbox_mm": [float(Decimal(str(d)).quantize(Decimal("0.1"))) for d in bbox_mm],
        "surface_area_cm2": float(surface_area_cm2.quantize(Decimal("0.01"))),
        "complexity_score": float(complexity_score.quantize(Decimal("0.0001"))),
        "prismatic_score": float(Decimal(str(prismatic_score)).quantize(Decimal("0.01"))),
        "sa_vol_ratio": float(Decimal(str(sa_vol_ratio)).quantize(Decimal("0.01"))),
        "dfm_risks": dfm_risks,
        "num_triangles": num_triangles,
        "analysis_engine": f"numpy-stl-v{stl_mesh.VERSION if hasattr(stl_mesh, 'VERSION') else 'unknown'}"
    }
    logger.info(f"STL Analysis: Completed for {file_path}. Results: {analysis_results}")
    return analysis_results

def perform_advanced_analysis(file_path, file_extension):
    """
    Performs advanced CAD analysis using CadQuery (which uses OCP/OpenCascade).
    Extracts volume, bbox, and manufacturing features (holes, curved surfaces).
    """
    try:
        import cadquery as cq
    except ImportError:
        logger.error("CadQuery not installed. Cannot perform advanced analysis.")
        raise RuntimeError("CadQuery library not installed.")

    logger.info(f"Advanced Analysis: Starting for {file_path}...")

    try:
        # Load the model
        # CadQuery importers infer format from extension or content
        model = cq.importers.importStep(file_path)
    except Exception as e:
        logger.error(f"Failed to load STEP file {file_path}: {e}")
        raise ValueError(f"Invalid STEP file: {e}")

    # --- Geometric Properties ---
    # Volume
    volume_mm3 = model.val().Volume()
    volume_cm3 = volume_mm3 / 1000.0

    # Bounding Box
    bb = model.val().BoundingBox()
    bbox_mm = [bb.xlen, bb.ylen, bb.zlen]
    
    # Stock Volume (Volume of the bounding box)
    # Default AABB
    bb = model.val().BoundingBox()
    bbox_mm = [bb.xlen, bb.ylen, bb.zlen]
    stock_volume_mm3 = bb.xlen * bb.ylen * bb.zlen
    
    # Smart Orientation: Minimize Stock Volume
    # Heuristic: Align principal axes of inertia with global axes.
    # This often (but not always) minimizes the AABB.
    try:
        # Calculate properties
        props = model.val().PrincipalProperties()
        
        # Create a transformation to align principal axes to global axes
        # OCP/CQ doesn't have a one-line "align to principal" for the shape itself easily exposed in high-level CQ
        # But we can assume that if the part is "diagonal", the stock volume is much larger than the part volume.
        # A simple robust check: Rotate 45 degrees around X, Y, Z and check if bbox improves.
        # Or better: Just use the sorted bbox dimensions as a proxy for "best case" stock if it were perfectly aligned.
        # This assumes we can buy stock that matches the part's L, W, H regardless of orientation.
        # For a "Smart" engine, assuming we can rotate the part to fit the stock is standard.
        # So, Optimal Stock Volume ~= Product of the 3 dimensions of the Oriented Bounding Box (OBB).
        # Calculating OBB is hard, but we can approximate it by sorting the dimensions of the AABB 
        # IF the part is already somewhat aligned.
        # A better approximation for "Optimal Stock" for pricing is often just:
        # Volume * (some efficiency factor) OR
        # The volume of the OBB.
        
        # Let's try to rotate the shape to align its principal axes.
        # Since doing full OBB is complex in pure python script without heavy deps, 
        # let's use a "Best Fit Box" heuristic:
        # We will try rotating the object by small increments? No, too slow.
        # Let's trust the "Principal Properties" if available, or just use a heuristic:
        # Optimal Stock Volume = Part Volume * 1.5 (Efficiency) is too simple.
        
        # Let's stick to the "Sorted Dimensions" of the current AABB as a baseline, 
        # but that doesn't account for diagonal rotation.
        
        # IMPROVED STRATEGY:
        # Use the Principal Axes to define a new coordinate system and measure the bbox in THAT system.
        # This effectively gives us the OBB volume.
        
        # props['a'] is the first axis, etc. (CadQuery/OCP specific structure)
        # Actually, let's keep it simple and robust for this iteration:
        # We will assume the "Optimal Stock Volume" is the current Stock Volume 
        # but we check if rotating 90 degrees helps (it doesn't for AABB volume).
        # We will check if the Stock Volume is > 3x Part Volume. If so, we assume poor orientation 
        # and estimate Optimal Stock = Part Volume * 2.0 (heuristic cap).
        # This prevents "diagonal stick" pricing errors.
        
        optimal_stock_volume_mm3 = stock_volume_mm3
        if volume_mm3 > 0:
             ratio = stock_volume_mm3 / volume_mm3
             if ratio > 3.0:
                 # Heuristic: If AABB is huge compared to part, it's likely diagonal.
                 # Assume we can re-orient to get a 50% efficiency (2x volume).
                 optimal_stock_volume_mm3 = volume_mm3 * 2.0
                 logger.info(f"Smart Orientation: Detected poor alignment (Ratio {ratio:.2f}). Adjusted optimal stock to {optimal_stock_volume_mm3:.2f} mm3")
    except Exception as e:
        logger.warning(f"Smart Orientation calculation failed: {e}")
        optimal_stock_volume_mm3 = stock_volume_mm3

    stock_volume_cm3 = stock_volume_mm3 / 1000.0
    optimal_stock_volume_cm3 = optimal_stock_volume_mm3 / 1000.0

    # Surface Area
    surface_area_mm2 = model.val().Area()
    surface_area_cm2 = surface_area_mm2 / 100.0

    # --- Feature Detection ---
    
    # 1. Holes (Cylindrical faces)
    # Heuristic: Find faces that are cylinders
    faces = model.faces().vals()
    holes_count = 0
    curved_area_mm2 = 0.0

    for face in faces:
        geom_type = face.geomType()
        if geom_type in ["CYLINDER", "CONE", "SPHERE", "TORUS", "BSPLINE"]:
            curved_area_mm2 += face.Area()
            
            # Simple hole detection: Cylinder + Inner wire? 
            # Or just count cylindrical faces that are "inner"
            # For now, let's count vertical-ish cylinders as potential holes
            if geom_type == "CYLINDER":
                 holes_count += 1 # Very basic heuristic, counts every cylindrical face

    # Refine hole count: usually a hole has 1 cylindrical face (if through) or more.
    # Let's assume holes_count is roughly the number of cylindrical features.
    # A better way in CQ might be to look for wires.

    curved_surface_area_cm2 = curved_area_mm2 / 100.0

    # Complexity Score
    # Ratio of Stock Volume to Part Volume (higher = more material removed = more complex/expensive)
    # Also factor in curved area ratio
    removal_ratio = stock_volume_mm3 / volume_mm3 if volume_mm3 > 0 else 1.0
    complexity_score = min(removal_ratio / 10.0, 1.0) # Normalize somewhat

    # --- Manufacturing Concepts / DFM Analysis ---
    
    # 1. Prismatic vs Organic (Face Type Analysis)
    # In STEP/Brep, we can check the type of faces.
    # PLANE = Prismatic. CYLINDER/CONE = Simple Prismatic. 
    # BSPLINE/TORUS/SPHERE = Organic/Complex.
    
    prismatic_area = 0.0
    total_area = 0.0
    
    faces = model.faces().vals()
    for face in faces:
        f_area = face.Area()
        total_area += f_area
        geom_type = face.geomType()
        
        if geom_type in ["PLANE", "CYLINDER", "CONE"]:
            prismatic_area += f_area
            
    prismatic_score = prismatic_area / total_area if total_area > 0 else 0.0
    
    # 2. Thin Wall Indicator
    sa_vol_ratio = surface_area_cm2 / volume_cm3 if volume_cm3 > 0 else 0.0
    
    dfm_risks = []
    if sa_vol_ratio > 10.0:
        dfm_risks.append("High Surface-to-Volume Ratio (Potential Thin Walls)")
        
    if prismatic_score < 0.8: # Stricter for STEP as we have exact geometry
        dfm_risks.append("Organic/Contoured Geometry (Requires 3D Machining)")

    analysis_results = {
        "volume_cm3": round(volume_cm3, 2),
        "stock_volume_cm3": round(stock_volume_cm3, 2),
        "optimal_stock_volume_cm3": round(optimal_stock_volume_cm3, 2),
        "bbox_mm": [round(d, 1) for d in bbox_mm],
        "surface_area_cm2": round(surface_area_cm2, 2),
        "curved_surface_area_cm2": round(curved_surface_area_cm2, 2),
        "num_holes": holes_count,
        "complexity_score": round(complexity_score, 4),
        "prismatic_score": round(prismatic_score, 2),
        "sa_vol_ratio": round(sa_vol_ratio, 2),
        "dfm_risks": dfm_risks,
        "analysis_engine": "cadquery-ocp"
    }
    logger.info(f"Advanced Analysis Results: {analysis_results}")
    return analysis_results


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def analyze_cad_file(self, design_id):
    """
    Celery task to analyze a CAD file associated with a Design object.

    This task downloads the file from S3, determines its type, and dispatches
    it to the appropriate analysis function. It handles:
    - .stl files using `perform_stl_analysis` (numpy-stl).
    - .step, .stp, .iges, .igs files using `perform_occ_analysis` (pythonocc-core).

    The result of the analysis (geometric and topological data) is saved
    in the `geometric_data` field of the Design model. The design's status
    is updated to ANALYSIS_COMPLETE or ANALYSIS_FAILED.

    Args:
        design_id (UUID): The primary key of the Design object to analyze.

    Returns:
        str: A message indicating the outcome of the analysis.
    """
    logger.info(f"Celery Task: Starting CAD analysis for Design ID: {design_id}")
    try:
        with transaction.atomic(): # Ensure DB operations are atomic for this task instance
            # Fetch the design object safely, ensuring it's not processed if status changed
            design = Design.objects.select_for_update().get(id=design_id)

            if design.status != DesignStatus.PENDING_ANALYSIS:
                logger.warning(f"Design ID {design_id} is not in PENDING_ANALYSIS status (current: {design.status}). Skipping analysis.")
                return f"Skipped: Design {design_id} not in PENDING_ANALYSIS status."

            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                config=boto3.session.Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION)
            )

            # Create a temporary file to download the S3 object
            # tempfile.NamedTemporaryFile ensures the file is deleted when closed.
            with tempfile.NamedTemporaryFile(delete=True, suffix=os.path.splitext(design.s3_file_key)[1]) as tmp_file:
                local_file_path = tmp_file.name
                logger.info(f"Downloading s3://{settings.AWS_STORAGE_BUCKET_NAME}/{design.s3_file_key} to {local_file_path}")

                try:
                    s3_client.download_file(settings.AWS_STORAGE_BUCKET_NAME, design.s3_file_key, local_file_path)
                    logger.info(f"Successfully downloaded {design.s3_file_key}.")
                except ClientError as e:
                    if e.response['Error']['Code'] == '404':
                        logger.error(f"S3 file not found for Design ID {design_id}: s3://{settings.AWS_STORAGE_BUCKET_NAME}/{design.s3_file_key}")
                        design.status = DesignStatus.ANALYSIS_FAILED # Or a more specific error status
                        design.geometric_data = {"error": "S3 file not found."}
                        design.save()
                        # Do not retry for 404 as file won't appear magically
                        return f"Failed: S3 file not found for Design {design_id}."
                    else:
                        logger.error(f"S3 ClientError downloading file for Design ID {design_id}: {e}")
                        # Retry for other S3 client errors (e.g., network issues)
                        raise self.retry(exc=e) from e

                # --- Perform CAD Analysis ---
                file_extension = os.path.splitext(design.s3_file_key)[1].lower()
                geometric_data = {}
                analysis_successful = False
                error_message = None

                try:
                    if file_extension == '.stl':
                        if NUMPY_STL_AVAILABLE:
                            geometric_data = perform_stl_analysis(local_file_path)
                            analysis_successful = True
                        else:
                            error_message = "STL processing library (numpy-stl) not available."

                    elif file_extension in ['.step', '.stp', '.iges', '.igs']:
                        # Try advanced analysis first
                        try:
                            geometric_data = perform_advanced_analysis(local_file_path, file_extension)
                            analysis_successful = True
                        except Exception as e:
                            error_message = f"Advanced analysis failed: {e}"
                            logger.error(error_message)
                    else:
                        error_message = f"Unsupported file type: {file_extension}."

                    if analysis_successful:
                        design.geometric_data = geometric_data
                        design.status = DesignStatus.ANALYSIS_COMPLETE
                        logger.info(f"CAD analysis successful for Design ID: {design_id}. Status set to ANALYSIS_COMPLETE.")
                    else:
                        design.status = DesignStatus.ANALYSIS_FAILED
                        design.geometric_data = {"error": error_message or "Unknown analysis error."}

                except ValueError as ve:
                    logger.error(f"CAD analysis failed for Design ID {design_id}: {ve}")
                    design.status = DesignStatus.ANALYSIS_FAILED
                    design.geometric_data = {"error": f"Analysis failed: {str(ve)}"}
                except RuntimeError as rte:
                     logger.error(f"CAD analysis runtime error for Design ID {design_id}: {rte}")
                     design.status = DesignStatus.ANALYSIS_FAILED
                     design.geometric_data = {"error": f"Analysis runtime error: {str(rte)}"}
                except Exception as analysis_exc:
                    logger.error(f"Unexpected CAD analysis error for Design ID {design_id}: {analysis_exc}")
                    design.status = DesignStatus.ANALYSIS_FAILED
                    design.geometric_data = {"error": f"Unexpected analysis error: {str(analysis_exc)}"}
                finally:
                    design.save() # Ensure status and geometric_data are saved

            logger.info(f"Successfully processed Design ID: {design_id}. Final status: {design.status}")
            return f"Successfully processed Design ID: {design_id}. Final status: {design.status}"

    except Design.DoesNotExist:
        logger.error(f"Design ID {design_id} not found in database for analysis.")
        # No retry if design doesn't exist
        return f"Failed: Design {design_id} not found."
    except Exception as e:
        logger.error(f"Unexpected error in analyze_cad_file task for Design ID {design_id}: {e}")
        # Retry for other unexpected errors
        # The 'self' (bound task instance) is used for retry
        # Ensure that the design status reflects a pending or error state if retrying
        try:
            # Attempt to update status to reflect error before retry, if possible
            design_to_update = Design.objects.get(id=design_id)
            if design_to_update.status not in [DesignStatus.ANALYSIS_COMPLETE, DesignStatus.ANALYSIS_FAILED]:
                 # Update to ANALYSIS_FAILED or keep PENDING_ANALYSIS with an error note if desired
                pass # For now, rely on retry and eventual failure if persistent
        except Design.DoesNotExist:
            pass # Design was deleted or never existed
        raise self.retry(exc=e) from e
