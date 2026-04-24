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
    from OCC.Core.RWGltf import RWGltf_CafWriter
    from OCC.Core.TDocStd import TDocStd_Document
    from OCC.Core.XCAFApp import XCAFApp_Application
    from OCC.Core.TCollection import TCollection_AsciiString
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.TDF import TDF_Label
    from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool, XCAFDoc_ColorGen
    PYTHONOCC_AVAILABLE = True
except ImportError:
    PYTHONOCC_AVAILABLE = False
    logger.warning("pythonocc-core is not available. Advanced CAD analysis will be limited.")

# Attempt to import FBM system
try:
    from .fbm_integration import fbm_analyzer, FBM_AVAILABLE
    if FBM_AVAILABLE:
        logger.info("FBM system loaded successfully")
except ImportError as e:
    FBM_AVAILABLE = False
    fbm_analyzer = None
    logger.warning(f"FBM system not available: {e}")


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
        logger.info(f"CadQuery imported successfully (version: {cq.__version__ if hasattr(cq, '__version__') else 'unknown'})")
    except ImportError:
        logger.error("CadQuery not installed. Cannot perform advanced analysis.")
        raise RuntimeError("CadQuery library not installed.")

    logger.info(f"Advanced Analysis: Starting for {file_path}...")
    logger.info(f"File exists: {os.path.exists(file_path)}, File size: {os.path.getsize(file_path) if os.path.exists(file_path) else 'N/A'} bytes")

    try:
        # Load the model
        # CadQuery importers infer format from extension or content
        logger.info(f"About to call cq.importers.importStep() for {file_path}...")
        model = cq.importers.importStep(file_path)
        logger.info(f"Successfully loaded STEP file. Model type: {type(model)}")
    except Exception as e:
        logger.error(f"Failed to load STEP file {file_path}: {e}", exc_info=True)
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


def perform_fbm_analysis(file_path, file_extension):
    """
    Performs Feature-Based Machining (FBM) analysis using the FBM system.
    Detects 40+ feature types, generates machining operations, and provides 
    comprehensive manufacturing intelligence.
    
    This is the most advanced analysis available and should be used for 
    STEP/IGES files when maximum detail is required.
    """
    if not FBM_AVAILABLE or not fbm_analyzer:
        logger.error("FBM system is not available. Cannot perform FBM analysis.")
        raise RuntimeError("FBM system not installed or not properly configured.")
    
    logger.info(f"FBM Analysis: Starting for file {file_path}...")
    
    try:
        # Run FBM analysis
        fbm_result = fbm_analyzer.analyze_file(file_path)
        
        if not fbm_result.get('fbm_available', False):
            error_msg = fbm_result.get('error', 'Unknown FBM error')
            logger.error(f"FBM Analysis failed: {error_msg}")
            raise RuntimeError(f"FBM analysis failed: {error_msg}")
        
        # Extract summary and geometric data
        summary = fbm_result.get('summary', {})
        features = fbm_result.get('features', [])
        operations = fbm_result.get('operations', [])
        patterns = fbm_result.get('patterns', [])
        geometry_analysis = fbm_result.get('geometry_analysis', {})
        
        # Consolidate geometric metrics
        volume_cm3 = float(summary.get('total_volume_cm3', 0.0))
        bbox_mm = summary.get('bbox_mm', [0, 0, 0])
        surface_area_cm2 = float(summary.get('surface_area_cm2', 0.0))
        
        # If not in summary, fallback to feature calculation
        if volume_cm3 == 0:
            for feature in features:
                if feature.get('volume'):
                    volume_cm3 += float(feature['volume'])
        
        # Calculate complexity based on FBM data
        num_features = len(features)
        num_operations = len(operations)
        avg_complexity = sum(f.get('complexity_rating', 1) for f in features) / max(num_features, 1)
        
        # Build comprehensive analysis result
        analysis_results = {
            # Basic geometric data
            "volume_cm3": round(volume_cm3, 2),
            "bbox_mm": bbox_mm,
            "surface_area_cm2": round(surface_area_cm2, 2),
            "complexity_score": round(avg_complexity / 10.0, 4),
            "analysis_engine": "FBM-Comprehensive",
            
            # FBM-specific data
            "fbm_features": features,
            "fbm_operations": operations,
            "fbm_patterns": patterns,
            "fbm_geometry_analysis": geometry_analysis,
            "fbm_summary": {
                "total_features": num_features,
                "total_operations": num_operations,
                "total_patterns": len(patterns),
                "estimated_machining_time_hours": summary.get('estimated_total_time_hours', 0),
                "number_of_setups": summary.get('number_of_setups', 1),
            },
            
            # Manufacturing intelligence
            "feature_types_detected": list(set(f['feature_type'] for f in features)),
            "has_advanced_features": any(
                'Thread' in f.get('feature_type', '') or 
                'Counterbore' in f.get('feature_type', '') or
                'T-Slot' in f.get('feature_type', '') or
                'Boss' in f.get('feature_type', '')
                for f in features
            ),
            "manufacturing_risks": geometry_analysis.get('manufacturing_risks', []),
            "machinability_assessment": {
                "has_undercuts": geometry_analysis.get('has_undercuts', False),
                "has_thin_walls": geometry_analysis.get('has_thin_walls', False),
                "min_wall_thickness": geometry_analysis.get('min_wall_thickness', 0),
                "accessibility_score": geometry_analysis.get('accessibility_score', 1.0),
                "complexity_score": geometry_analysis.get('complexity_score', avg_complexity),
            },
            
            # Pattern recognition benefits
            "optimization_opportunities": [],
        }
        
        # Add pattern-based optimization opportunities
        if patterns:
            for pattern in patterns:
                pattern_type = pattern.get('pattern_type', '')
                feature_count = pattern.get('pattern_count', 0)
                if feature_count > 1:
                    analysis_results["optimization_opportunities"].append({
                        "type": "pattern_optimization",
                        "description": f"{pattern_type} pattern with {feature_count} features can be programmed once and repeated",
                        "time_savings_percent": min(30, (feature_count - 1) * 5),  # Up to 30% savings
                    })
        
        logger.info(f"FBM Analysis: Completed successfully with {num_features} features, {num_operations} operations, {len(patterns)} patterns")
        
        # ===================================================================
        # GENERATE MANUFACTURING INTELLIGENCE (Value-Add for Manufacturers)
        # ===================================================================
        try:
            from .fbm_manufacturing_intelligence import fbm_manufacturing_intelligence
            
            if fbm_manufacturing_intelligence:
                logger.info("Generating FBM manufacturing intelligence report...")
                
                # This provides comprehensive value-add analysis for manufacturers
                intelligence_report = fbm_manufacturing_intelligence.generate_comprehensive_analysis(
                    geometric_data=analysis_results,
                    material="Aluminum",  # Default, will be overridden by actual design material
                    quantity=1  # Default, will be overridden by actual quantity
                )
                
                # Add intelligence report to analysis results
                analysis_results["manufacturing_intelligence"] = intelligence_report
                
                logger.info("Manufacturing intelligence generated successfully")
        except Exception as intel_error:
            logger.warning(f"Could not generate manufacturing intelligence: {intel_error}")
            analysis_results["manufacturing_intelligence"] = {
                "available": False,
                "error": str(intel_error)
            }
        
        return analysis_results
        
    except Exception as e:
        logger.error(f"FBM Analysis: Failed with error: {e}", exc_info=True)
        raise RuntimeError(f"FBM analysis failed: {str(e)}")




def generate_snapshot(file_path, output_path):
    """
    Generates a static isometric PNG snapshot of a 3D file (STL/STEP/IGES).
    Uses pythonocc-core for offscreen rendering.
    """
    if not PYTHONOCC_AVAILABLE:
        logger.error("pythonocc-core not available for snapshot generation.")
        return False

    try:
        from OCC.Core.V3d import V3d_Viewer
        from OCC.Core.Aspect import Aspect_DisplayConnection
        from OCC.Core.OpenGl import OpenGl_GraphicDriver
        from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
        from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
        
        # 1. Load the shape
        file_ext = os.path.splitext(file_path)[1].lower()
        shape = None
        if file_ext == '.stl':
            from OCC.Core.StlAPI import StlAPI_Reader
            reader = StlAPI_Reader()
            shape = TopoDS_Shape()
            reader.Read(shape, file_path)
        elif file_ext in ['.step', '.stp']:
            shape = read_step_file(file_path)
        elif file_ext in ['.iges', '.igs']:
            shape = read_iges_file(file_path)
            
        if not shape or shape.IsNull():
            return False

        # 2. Setup Viewer & Offscreen View
        display_conn = Aspect_DisplayConnection()
        driver = OpenGl_GraphicDriver(display_conn)
        viewer = V3d_Viewer(driver)
        view = viewer.CreateView()
        
        # Enable offscreen rendering (required for headless servers)
        # Note: Depending on the OCC build, this may require Xvfb on Linux
        
        # 3. Create AIS Context and Display Shape
        from OCC.Core.AIS import AIS_InteractiveContext, AIS_Shape
        context = AIS_InteractiveContext(viewer)
        ais_shape = AIS_Shape(shape)
        
        # Set a nice color (Neon Cyan-ish)
        color = Quantity_Color(0.0, 0.9, 0.9, Quantity_TOC_RGB)
        ais_shape.SetColor(color)
        context.Display(ais_shape, True)
        
        # 4. Position Camera (Isometric)
        view.SetProj(1, -1, 1) # Standard Isometric
        view.FitAll()
        view.ZFitAll()
        
        # 5. Set Background (Deep Space Black)
        view.SetBgGradientColors(
            Quantity_Color(0.04, 0.04, 0.06, Quantity_TOC_RGB),
            Quantity_Color(0.02, 0.02, 0.04, Quantity_TOC_RGB),
            2, True
        )
        
        # 6. Dump to File
        # We use a reasonably high resolution for the thumbnail
        view.Dump(output_path)
        
        return os.path.exists(output_path)

    except Exception as e:
        logger.error(f"Snapshot Generation Failed: {e}", exc_info=True)
        return False


def generate_feature_aware_glb(file_path, features_data=None):
    """
    Converts a STEP/IGES file to a GLB file with separate sub-meshes for each feature category.
    This enables targeted feature highlighting in the 3D viewer.
    """
    if not PYTHONOCC_AVAILABLE:
        logger.error("pythonocc-core not available for 3D conversion.")
        return None

    logger.info(f"Feature-Aware GLB Conversion: Starting for {file_path}...")
    
    try:
        from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
        from OCC.Core.TCollection import TCollection_AsciiString
        from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_MakeCompound
        from OCC.Core.BRep import BRep_Builder
        from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
        
        # 1. Initialize XCAF Document
        app = XCAFApp_Application.GetApplication()
        doc = TDocStd_Document(TCollection_AsciiString("CAF"))
        app.NewDocument(TCollection_AsciiString("MDTV-XCAF"), doc)
        
        shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
        color_tool = XCAFDoc_DocumentTool.ColorTool(doc.Main())
        
        # 2. Load the base shape
        file_ext = os.path.splitext(file_path)[1].lower()
        shape = None
        if file_ext in ['.step', '.stp']:
            from OCC.Extend.DataExchange import read_step_file
            shape = read_step_file(file_path)
        elif file_ext in ['.iges', '.igs']:
            from OCC.Extend.DataExchange import read_iges_file
            shape = read_iges_file(file_path)
            
        if not shape or shape.IsNull():
            return None

        # 3. Sub-mesh isolation logic
        # We group faces by their geometric signature to correspond with detected features
        explorer = TopologyExplorer(shape)
        faces = list(explorer.faces())
        
        hole_faces = []
        pocket_faces = []
        base_faces = []
        
        for face in faces:
            adaptor = BRepAdaptor_Surface(face)
            surf_type = adaptor.GetType()
            
            # Simplified classification
            if surf_type == GeomAbs_Cylinder:
                hole_faces.append(face)
            elif surf_type == GeomAbs_Plane:
                # Check if it's internal (likely a pocket floor)
                pocket_faces.append(face)
            else:
                base_faces.append(face)

        def create_submesh(face_list, name, color_rgb):
            if not face_list: return
            compound_builder = BRep_Builder()
            compound = TopoDS_Shape()
            compound_builder.MakeCompound(TopoDS.TopoDS_Compound(compound))
            for f in face_list:
                compound_builder.Add(compound, f)
            
            label = shape_tool.NewShape()
            shape_tool.SetShape(label, compound)
            shape_tool.SetComponentName(label, TCollection_AsciiString(name))
            color = Quantity_Color(color_rgb[0], color_rgb[1], color_rgb[2], Quantity_TOC_RGB)
            color_tool.SetColor(label, color, XCAFDoc_ColorGen)

        # Create distinct nodes in GLB
        create_submesh(hole_faces, "Features_Holes", (1.0, 0.4, 0.4)) # Reddish
        create_submesh(pocket_faces, "Features_Pockets", (0.4, 1.0, 0.4)) # Greenish
        create_submesh(base_faces, "BaseModel", (0.23, 0.51, 0.96)) # Blue (#3b82f6)

        # 4. Tessellate the entire compound
        BRepMesh_IncrementalMesh(shape, 0.1, False, 0.5, True)

        # 5. Export to GLB
        output_path = file_path.rsplit('.', 1)[0] + '_view.glb'
        writer = RWGltf_CafWriter(TCollection_AsciiString(output_path), True)
        status = writer.Perform(doc, gp_Trsf(), None)
        
        if status and os.path.exists(output_path):
            logger.info(f"Feature-Aware GLB: Successfully saved with sub-meshes to {output_path}")
            return output_path
            
        return generate_glb_from_step(file_path)

    except Exception as e:
        logger.error(f"GLB Multi-mesh Conversion Failed: {e}", exc_info=True)
        return generate_glb_from_step(file_path)


def generate_glb_from_step(file_path):
        logger.error(f"3D Conversion: Unexpected error: {e}", exc_info=True)
        return None


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
            
            # Download CAD file from S3 or use local file
            if settings.USE_LOCAL_STORAGE:
                from pathlib import Path
                local_file_path = str(Path(settings.MEDIA_ROOT) / design.s3_file_key)
                
                if not os.path.exists(local_file_path):
                    logger.error(f"Local file not found for Design ID {design_id}: {local_file_path}")
                    design.status = DesignStatus.ANALYSIS_FAILED
                    design.geometric_data = {"error": "Local file not found."}
                    design.save()
                    return f"Failed: Local file not found for Design {design_id}."
                
                logger.info(f"Using local file: {local_file_path}")
                
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
                        # Use unified FBM analysis for STEP/IGES files
                        try:
                            logger.info(f"Attempting FBM analysis for {file_extension} file...")
                            geometric_data = perform_fbm_analysis(local_file_path, file_extension)
                            analysis_successful = True
                            logger.info("FBM analysis successful")
                        except Exception as fbm_error:
                            error_message = f"FBM analysis failed: {fbm_error}"
                            logger.error(error_message)

                        # Generate view file (GLB with STL fallback)
                        try:
                            view_file_path = generate_feature_aware_glb(local_file_path, geometric_data.get('fbm_features'))
                            if view_file_path and os.path.exists(view_file_path):
                                # Determine correct extension (could be .glb or .stl)
                                view_ext = os.path.splitext(view_file_path)[1].lower()
                                view_file_key = design.s3_file_key.rsplit('.', 1)[0] + '_view' + view_ext
                                geometric_data['view_file_key'] = view_file_key

                                # Upload to S3 if not using local storage
                                if not settings.USE_LOCAL_STORAGE:
                                    try:
                                        s3_client.upload_file(view_file_path, settings.AWS_STORAGE_BUCKET_NAME, view_file_key)
                                        logger.info(f"Successfully uploaded view file to S3: {view_file_key}")
                                    except Exception as s3_err:
                                        logger.error(f"Failed to upload view file to S3: {s3_err}")

                                logger.info(f"Successfully generated view file: {view_file_key}")
                        except Exception as view_err:
                            logger.warning(f"View file generation failed (non-critical): {view_err}")

                    else:
                        error_message = f"Unsupported file type: {file_extension}."

                    # --- Generate Snapshot (Isometric Image) ---
                    try:
                        thumb_path = local_file_path.rsplit('.', 1)[0] + '_thumb.png'
                        if generate_snapshot(local_file_path, thumb_path):
                            thumb_key = design.s3_file_key.rsplit('.', 1)[0] + '_thumb.png'
                            geometric_data['thumbnail_key'] = thumb_key
                            if not settings.USE_LOCAL_STORAGE:
                                s3_client.upload_file(thumb_path, settings.AWS_STORAGE_BUCKET_NAME, thumb_key)
                            logger.info(f"Successfully generated thumbnail: {thumb_key}")
                    except Exception as thumb_err:
                        logger.warning(f"Thumbnail generation failed (non-critical): {thumb_err}")

                    if analysis_successful:
                        design.geometric_data = geometric_data
                        design.status = DesignStatus.ANALYSIS_COMPLETE
                        
                        # Auto-detect if engineering review is needed (Option 3)
                        if not design.requires_engineering_review:  # Only auto-set if user didn't manually check it
                            needs_review = False
                            
                            # Check 1: Complex FBM features
                            fbm_summary = geometric_data.get('fbm_summary', {})
                            total_features = fbm_summary.get('total_features', 0)
                            if total_features > 20:
                                needs_review = True
                                logger.info(f"Auto-flagging engineering review: {total_features} features detected")
                            
                            # Check 2: Tight tolerances
                            tolerances_str = design.tolerances.lower() if design.tolerances else ''
                            if any(keyword in tolerances_str for keyword in ['0.01', '0.02', '0.03', '0.04', '0.05']):
                                if '±' in tolerances_str or '+/-' in tolerances_str:
                                    needs_review = True
                                    logger.info(f"Auto-flagging engineering review: Tight tolerances detected")
                            
                            # Check 3: Exotic/difficult materials
                            exotic_materials = ['titanium', 'inconel', 'hastelloy', 'monel', 'nitronic']
                            if any(mat in design.material.lower() for mat in exotic_materials):
                                needs_review = True
                                logger.info(f"Auto-flagging engineering review: Exotic material {design.material}")
                            
                            # Check 4: Manufacturing intelligence warnings
                            mfg_intel = geometric_data.get('manufacturing_intelligence', {})
                            if mfg_intel.get('difficulty_score', 0) > 0.7:
                                needs_review = True
                                logger.info(f"Auto-flagging engineering review: High difficulty score")
                            
                            if needs_review:
                                design.requires_engineering_review = True
                                logger.info(f"Engineering review REQUIRED for Design ID: {design_id}")
                        
                        # CRITICAL: Save to database BEFORE generating quotes
                        design.save(update_fields=['status', 'geometric_data', 'updated_at', 'requires_engineering_review'])
                        analysis_successful = True
                        logger.info(f"CAD analysis successful for Design ID: {design_id}. Status set to ANALYSIS_COMPLETE.")
                        
                        # We will trigger auto-quoting OUTSIDE the transaction block
                        run_auto_quote = True

                    else:
                        design.status = DesignStatus.ANALYSIS_FAILED
                        design.geometric_data = {"error": error_message or "Unknown analysis error."}
                        run_auto_quote = False

                except ValueError as ve:
                    logger.error(f"CAD analysis failed for Design ID {design_id}: {ve}")
                    design.status = DesignStatus.ANALYSIS_FAILED
                    design.geometric_data = {"error": f"Analysis failed: {str(ve)}"}
                    run_auto_quote = False
                except RuntimeError as rte:
                     logger.error(f"CAD analysis runtime error for Design ID {design_id}: {rte}")
                     design.status = DesignStatus.ANALYSIS_FAILED
                     design.geometric_data = {"error": f"Analysis runtime error: {str(rte)}"}
                     run_auto_quote = False
                except Exception as analysis_exc:
                    logger.error(f"Unexpected CAD analysis error for Design ID {design_id}: {analysis_exc}")
                    design.status = DesignStatus.ANALYSIS_FAILED
                    design.geometric_data = {"error": f"Unexpected analysis error: {str(analysis_exc)}"}
                    run_auto_quote = False
                finally:
                    design.save() # Ensure status and geometric_data are saved

            # End of transaction.atomic()
            logger.info(f"Successfully processed Design ID: {design_id}. Final status: {design.status}")
            
            # Automatically generate quotes after successful analysis and transaction commit
            if locals().get('run_auto_quote', False):
                try:
                    logger.info(f"Triggering automatic quote generation for Design ID: {design_id}")
                    from .views import GenerateQuotesView
                    from rest_framework.test import APIRequestFactory, force_authenticate
                    
                    # Create request context
                    factory = APIRequestFactory()
                    request = factory.post(f'/api/designs/{design_id}/generate-quotes/')
                    
                    # IMPORTANT: Re-fetch design outside transaction to reflect exact DB state
                    committed_design = Design.objects.get(id=design_id)
                    
                    # CRITICAL: Properly authenticate the request
                    force_authenticate(request, user=committed_design.customer)
                    
                    # Call the view
                    view = GenerateQuotesView.as_view()
                    response = view(request, id=design_id)
                    
                    if response.status_code == 200:
                        response_data = response.data
                        quotes_count = response_data.get('message', '').split()[0]
                        logger.info(f"✅ Successfully auto-generated {quotes_count} quotes for Design ID: {design_id}")
                    else:
                        logger.warning(f"❌ Quote generation returned status {response.status_code} for Design ID: {design_id}: {response.data}")
                except Exception as quote_error:
                    logger.error(f"❌ Failed to auto-generate quotes for Design ID: {design_id}: {quote_error}", exc_info=True)
                    # Don't fail the entire analysis task if quote generation fails
            
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
