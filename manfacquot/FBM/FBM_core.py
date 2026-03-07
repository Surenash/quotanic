"""
Feature-Based Machining (FBM) System - Core Module
Comprehensive foundation for automated feature recognition and toolpath generation.
Combines geometric analysis with manufacturing intelligence.
"""

import math
import json
import os
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

# OpenCASCADE Imports
try:
    from OCC.Core.STEPControl import STEPControl_Reader
    from OCC.Core.IGESControl import IGESControl_Reader
    from OCC.Core.IFSelect import IFSelect_RetDone
    from OCC.Core.TopExp import TopExp_Explorer
    from OCC.Core.TopAbs import TopAbs_FACE, TopAbs_EDGE, TopAbs_VERTEX, TopAbs_SOLID
    from OCC.Core.BRepGProp import brepgprop_SurfaceProperties, brepgprop_VolumeProperties
    from OCC.Core.GProp import GProp_GProps
    from OCC.Core.BRep import BRep_Tool
    from OCC.Core.GeomAbs import (GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone, 
                                   GeomAbs_Sphere, GeomAbs_Torus, GeomAbs_BSplineSurface, 
                                   GeomAbs_Circle, GeomAbs_Line)
    from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
    from OCC.Core.Bnd import Bnd_Box
    from OCC.Core.BRepBndLib import brepbndlib_Add
    from OCC.Core.gp import gp_Pnt, gp_Vec, gp_Dir, gp_Ax1
    from OCC.Core.TopoDS import topods_Face, topods_Edge
    from OCC.Core.BRepTools import breptools_UVBounds
    PYTHONOCC_AVAILABLE = True
except ImportError:
    PYTHONOCC_AVAILABLE = False

# ==============================================================================
# ENUMERATIONS
# ==============================================================================

class FeatureType(Enum):
    """Enumeration of recognizable machining features"""
    HOLE_THROUGH = 'Through Hole'
    HOLE_BLIND = 'Blind Hole'
    POCKET_RECTANGULAR = 'Rectangular Pocket'
    POCKET_CIRCULAR = 'Circular Pocket'
    POCKET_IRREGULAR = 'Irregular Pocket'
    SLOT = 'Slot'
    FACE_PLANAR = 'Planar Face'
    FACE_CONTOURED = 'Contoured Face'
    BOSS = 'Boss'
    RIB = 'Rib'
    GROOVE = 'Groove'
    THREAD = 'Thread'
    CHAMFER = 'Chamfer'
    FILLET = 'Fillet'
    COUNTERBORE = 'Counterbore'
    COUNTERSINK = 'Countersink'
    SURFACE_3D = '3D Surface'

class ToolType(Enum):
    """Types of cutting tools"""
    FACE_MILL = 'Face Mill'
    END_MILL = 'End Mill'
    BALL_MILL = 'Ball End Mill'
    DRILL = 'Drill'
    REAMER = 'Reamer'
    TAP = 'Tap'
    BORING_BAR = 'Boring Bar'
    CHAMFER_MILL = 'Chamfer Mill'
    THREAD_MILL = 'Thread Mill'
    SLOT_DRILL = 'Slot Drill'
    T_SLOT_CUTTER = 'T-Slot Cutter'

class MachiningStrategy(Enum):
    """Machining strategies/operations"""
    FACING = 'Facing'
    ROUGHING = 'Roughing'
    SEMI_FINISHING = 'Semi-Finishing'
    FINISHING = 'Finishing'
    DRILLING = 'Drilling'
    BORING = 'Boring'
    REAMING = 'Reaming'
    TAPPING = 'Tapping'
    POCKETING = 'Pocketing'
    CONTOURING = 'Contouring'
    PLUNGE_MILLING = 'Plunge Milling'
    HELICAL_INTERPOLATION = 'Helical Interpolation'
    ADAPTIVE_CLEARING = 'Adaptive Clearing'
    THREAD_MILLING = 'Thread Milling'
    CHAMFERING = 'Chamfering'

# ==============================================================================
# DATA STRUCTURES
# ==============================================================================

@dataclass
class MachiningFeature:
    """Represents a recognized machining feature with geometric and manufacturing data"""
    feature_id: int
    feature_type: Any # Can be FeatureType or extended types
    geometry: Dict[str, Any]
    depth: float = 0.0
    diameter: float = 0.0
    width: float = 0.0
    length: float = 0.0
    area: float = 0.0
    volume: float = 0.0
    orientation: Dict[str, float] = field(default_factory=lambda: {'x': 0.0, 'y': 0.0, 'z': 1.0})
    accessibility: str = 'Top'
    surface_finish_required: str = 'Standard'
    tolerance: str = 'Standard'

@dataclass
class MachiningOperation:
    """Represents a single machining step generated for a feature"""
    operation_id: int
    operation_name: str
    feature: MachiningFeature
    strategy: MachiningStrategy
    tool_type: ToolType
    tool_diameter: float
    cutting_speed: float # m/min
    feed_rate: float # mm/min
    depth_of_cut: float # mm
    stepover: float # mm
    number_of_passes: int
    estimated_time: float # minutes
    setup_required: int = 1
    priority: int = 10
    spindle_speed: float = 0.0 # RPM
    coolant: str = 'Flood'
    notes: str = ''

    def to_dict(self) -> Dict:
        """Convert operation to dictionary for JSON export"""
        return {
            'operation_id': self.operation_id,
            'name': self.operation_name,
            'strategy': self.strategy.value if hasattr(self.strategy, 'value') else str(self.strategy),
            'tool_type': self.tool_type.value if hasattr(self.tool_type, 'value') else str(self.tool_type),
            'tool_diameter': self.tool_diameter,
            'spindle_speed': round(self.spindle_speed, 0),
            'feed_rate': round(self.feed_rate, 1),
            'estimated_time': round(self.estimated_time, 2),
            'setup': self.setup_required,
            'notes': self.notes
        }

# ==============================================================================
# FEATURE RECOGNITION ENGINE
# ==============================================================================

class FeatureRecognitionEngine:
    """Base class for identifying machining features from CAD shapes"""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.shape = None
        self.features: List[MachiningFeature] = []
        self.feature_counter = 0
        if filepath and os.path.exists(filepath):
            self.load_file()

    def load_file(self) -> bool:
        """Load STEP or IGES file into OpenCASCADE shape"""
        if not PYTHONOCC_AVAILABLE:
            print("Error: pythonocc-core not available")
            return False
            
        file_ext = self.filepath.lower().split('.')[-1]
        try:
            if file_ext in ['step', 'stp']:
                reader = STEPControl_Reader()
                status = reader.ReadFile(self.filepath)
            elif file_ext in ['iges', 'igs']:
                reader = IGESControl_Reader()
                status = reader.ReadFile(self.filepath)
            else:
                return False

            if status != IFSelect_RetDone:
                return False
                
            reader.TransferRoots()
            self.shape = reader.OneShape()
            return True
        except Exception as e:
            print(f"Error loading CAD file: {e}")
            return False

    def recognize_holes(self) -> List[MachiningFeature]:
        """Detect cylindrical holes and calculate their properties"""
        holes = []
        if not self.shape: return []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Cylinder:
                cylinder = adaptor.Cylinder()
                radius = cylinder.Radius()
                diameter = 2 * radius
                
                # Calculate properties
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                depth = area / (2 * math.pi * radius) if radius > 0 else 0
                
                axis = cylinder.Axis()
                direction = axis.Direction()
                
                # Heuristic for through vs blind
                hole_type = FeatureType.HOLE_THROUGH if depth > 50 else FeatureType.HOLE_BLIND
                
                feature = MachiningFeature(
                    feature_id=self.feature_counter,
                    feature_type=hole_type,
                    geometry={'center': axis.Location(), 'axis': direction},
                    diameter=diameter,
                    depth=depth,
                    area=math.pi * radius * radius,
                    orientation={'x': direction.X(), 'y': direction.Y(), 'z': direction.Z()},
                    accessibility=self._determine_accessibility(direction)
                )
                holes.append(feature)
                self.feature_counter += 1
            explorer.Next()
        return holes

    def recognize_pockets(self) -> List[MachiningFeature]:
        """Detect pocket-like features from planar faces"""
        pockets = []
        if not self.shape: return []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Plane:
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                
                plane = adaptor.Plane()
                normal = plane.Axis().Direction()
                
                # Identify internal planar faces (pockets) based on area and Z-orientation
                if area < 5000 and abs(normal.Z()) > 0.7:
                    bbox = Bnd_Box()
                    brepbndlib_Add(topods_Face(face), bbox)
                    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
                    
                    width = xmax - xmin
                    length = ymax - ymin
                    aspect_ratio = max(width, length) / (min(width, length) + 0.001)
                    
                    if aspect_ratio < 1.5:
                        pocket_type = FeatureType.POCKET_CIRCULAR
                    elif aspect_ratio > 3:
                        pocket_type = FeatureType.SLOT
                    else:
                        pocket_type = FeatureType.POCKET_RECTANGULAR
                        
                    feature = MachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=pocket_type,
                        geometry={'plane': plane, 'normal': normal},
                        width=width,
                        length=length,
                        area=area,
                        depth=10.0, # Heuristic default
                        orientation={'x': normal.X(), 'y': normal.Y(), 'z': normal.Z()},
                        accessibility=self._determine_accessibility(normal)
                    )
                    pockets.append(feature)
                    self.feature_counter += 1
            explorer.Next()
        return pockets

    def recognize_planar_faces(self) -> List[MachiningFeature]:
        """Detect large planar surfaces for facing operations"""
        faces = []
        if not self.shape: return []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Plane:
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                
                if area > 5000: # Threshold for "Large" face
                    plane = adaptor.Plane()
                    normal = plane.Axis().Direction()
                    
                    feature = MachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=FeatureType.FACE_PLANAR,
                        geometry={'plane': plane, 'normal': normal},
                        area=area,
                        orientation={'x': normal.X(), 'y': normal.Y(), 'z': normal.Z()},
                        accessibility=self._determine_accessibility(normal)
                    )
                    faces.append(feature)
                    self.feature_counter += 1
            explorer.Next()
        return faces

    def recognize_contoured_surfaces(self) -> List[MachiningFeature]:
        """Detect complex 3D surfaces requiring ball-mill finishing"""
        surfaces = []
        if not self.shape: return []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            surf_type = adaptor.GetType()
            
            if surf_type in (GeomAbs_BSplineSurface, GeomAbs_Sphere, GeomAbs_Torus):
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                
                feature = MachiningFeature(
                    feature_id=self.feature_counter,
                    feature_type=FeatureType.SURFACE_3D,
                    geometry={'surface_type': str(surf_type)},
                    area=area,
                    accessibility='Multi-axis',
                    surface_finish_required='Fine'
                )
                surfaces.append(feature)
                self.feature_counter += 1
            explorer.Next()
        return surfaces

    def recognize_fillets_chamfers(self) -> List[MachiningFeature]:
        """Detect edge features"""
        features = []
        if not self.shape: return []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_EDGE)
        while explorer.More():
            edge = explorer.Current()
            adaptor = BRepAdaptor_Curve(topods_Edge(edge))
            
            if adaptor.GetType() == GeomAbs_Circle:
                circle = adaptor.Circle()
                radius = circle.Radius()
                
                if radius < 20: # Heuristic for fillets
                    feature = MachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=FeatureType.FILLET,
                        geometry={'radius': radius},
                        diameter=2 * radius,
                        surface_finish_required='Fine'
                    )
                    features.append(feature)
                    self.feature_counter += 1
            explorer.Next()
        return features

    def _determine_accessibility(self, normal: Any) -> str:
        """Heuristic to determine if a feature is accessible from Top, Bottom, or Side"""
        if not hasattr(normal, 'Z'): return 'Top'
        z_component = abs(normal.Z())
        if z_component > 0.9:
            return 'Top' if normal.Z() > 0 else 'Bottom'
        return 'Side' if z_component < 0.3 else 'Multi-axis'

    def recognize_all_features(self) -> List[MachiningFeature]:
        """Run complete recognition pipeline"""
        if not self.shape and not self.load_file():
            return []
            
        self.features = []
        self.features.extend(self.recognize_holes())
        self.features.extend(self.recognize_pockets())
        self.features.extend(self.recognize_planar_faces())
        self.features.extend(self.recognize_contoured_surfaces())
        self.features.extend(self.recognize_fillets_chamfers())
        return self.features

    # Placeholders for Advanced Recognition (to be overridden by FBM_advanced)
    def _looks_like_thread(self, edge) -> bool: return False
    def _estimate_thread_diameter(self, edge) -> float: return 0.0
    def _estimate_thread_depth(self, edge) -> float: return 0.0
    def _estimate_thread_pitch(self, edge) -> float: return 0.0
    def _classify_thread(self, diameter, pitch) -> str: return f"M{diameter}x{pitch}"

# ==============================================================================
# TOOLPATH GENERATOR
# ==============================================================================

class ToolpathGenerator:
    """Generates machining operations and estimated times for recognized features"""
    
    def __init__(self, features: List[MachiningFeature]):
        self.features = features
        self.operations: List[MachiningOperation] = []
        self.operation_counter = 0

    def _calculate_spindle_speed(self, diameter_mm: float, cutting_speed_m_min: float) -> float:
        """Calculate RPM from surface speed and tool diameter"""
        if diameter_mm <= 0: return 0
        rpm = (cutting_speed_m_min * 1000) / (math.pi * diameter_mm)
        return round(rpm, 0)

    def generate_hole_operations(self, hole: MachiningFeature) -> List[MachiningOperation]:
        """Generate drilling sequence for holes"""
        ops = []
        diameter = hole.diameter
        depth = hole.depth
        
        # Add Pilot Drill for large holes
        if diameter > 12:
            pilot_dia = diameter * 0.5
            pilot_op = MachiningOperation(
                operation_id=self.operation_counter,
                operation_name=f'Pilot Drill Ø{pilot_dia:.1f}mm',
                feature=hole,
                strategy=MachiningStrategy.DRILLING,
                tool_type=ToolType.DRILL,
                tool_diameter=pilot_dia,
                cutting_speed=80,
                feed_rate=150,
                depth_of_cut=depth,
                stepover=0,
                number_of_passes=1,
                estimated_time=1.5,
                priority=10,
                spindle_speed=self._calculate_spindle_speed(pilot_dia, 80)
            )
            ops.append(pilot_op)
            self.operation_counter += 1
            
        # Main Drill
        drill_op = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name=f'Drill Ø{diameter:.1f}mm x {depth:.1f}mm',
            feature=hole,
            strategy=MachiningStrategy.DRILLING,
            tool_type=ToolType.DRILL,
            tool_diameter=diameter,
            cutting_speed=80,
            feed_rate=200,
            depth_of_cut=depth,
            stepover=0,
            number_of_passes=1,
            estimated_time=2.5,
            priority=20,
            spindle_speed=self._calculate_spindle_speed(diameter, 80)
        )
        ops.append(drill_op)
        self.operation_counter += 1
        return ops

    def generate_pocket_operations(self, pocket: MachiningFeature) -> List[MachiningOperation]:
        """Generate roughing and finishing operations for pockets"""
        ops = []
        tool_dia = min(pocket.width * 0.6 if pocket.width > 0 else 10, 12)
        
        # Roughing
        rough_op = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name=f'Pocket Roughing - {pocket.feature_type.value}',
            feature=pocket,
            strategy=MachiningStrategy.ADAPTIVE_CLEARING,
            tool_type=ToolType.END_MILL,
            tool_diameter=tool_dia,
            cutting_speed=150,
            feed_rate=800,
            depth_of_cut=tool_dia * 0.5,
            stepover=tool_dia * 0.4,
            number_of_passes=int(max(1, pocket.depth / (tool_dia * 0.5))),
            estimated_time=5.0,
            priority=40,
            spindle_speed=self._calculate_spindle_speed(tool_dia, 150)
        )
        ops.append(rough_op)
        self.operation_counter += 1
        
        # Finishing
        finish_op = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name=f'Pocket Finishing - {pocket.feature_type.value}',
            feature=pocket,
            strategy=MachiningStrategy.FINISHING,
            tool_type=ToolType.END_MILL,
            tool_diameter=tool_dia * 0.8,
            cutting_speed=180,
            feed_rate=600,
            depth_of_cut=pocket.depth,
            stepover=0.2,
            number_of_passes=1,
            estimated_time=3.0,
            priority=50,
            spindle_speed=self._calculate_spindle_speed(tool_dia * 0.8, 180)
        )
        ops.append(finish_op)
        self.operation_counter += 1
        return ops

    def generate_face_operations(self, face: MachiningFeature) -> List[MachiningOperation]:
        """Generate high-speed facing operations"""
        ops = []
        tool_dia = 50.0
        
        facing_op = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name='Surface Facing',
            feature=face,
            strategy=MachiningStrategy.FACING,
            tool_type=ToolType.FACE_MILL,
            tool_diameter=tool_dia,
            cutting_speed=200,
            feed_rate=1000,
            depth_of_cut=2.0,
            stepover=tool_dia * 0.75,
            number_of_passes=1,
            estimated_time=4.0,
            priority=5,
            spindle_speed=self._calculate_spindle_speed(tool_dia, 200)
        )
        ops.append(facing_op)
        self.operation_counter += 1
        return ops

    def generate_all_operations(self) -> List[MachiningOperation]:
        """Generate sequence for all detected features"""
        self.operations = []
        for feature in self.features:
            f_type = feature.feature_type
            if f_type in (FeatureType.HOLE_THROUGH, FeatureType.HOLE_BLIND):
                self.operations.extend(self.generate_hole_operations(feature))
            elif f_type in (FeatureType.POCKET_RECTANGULAR, FeatureType.POCKET_CIRCULAR, FeatureType.POCKET_IRREGULAR, FeatureType.SLOT):
                self.operations.extend(self.generate_pocket_operations(feature))
            elif f_type == FeatureType.FACE_PLANAR:
                self.operations.extend(self.generate_face_operations(feature))
        
        self.operations.sort(key=lambda x: x.priority)
        return self.operations

# ==============================================================================
# MACHINING PROCESS PLANNER (MAIN ORCHESTRATOR)
# ==============================================================================

class MachiningProcessPlanner:
    """End-to-end planner: Recognition -> Toolpaths -> Costing"""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.recognizer = FeatureRecognitionEngine(filepath)
        self.features: List[MachiningFeature] = []
        self.operations: List[MachiningOperation] = []

    def process(self) -> Dict:
        """Execute full FBM pipeline"""
        print(f"Processing File: {os.path.basename(self.filepath)}")
        
        # Step 1: Feature Recognition
        self.features = self.recognizer.recognize_all_features()
        
        # Step 2: Toolpath Generation
        generator = ToolpathGenerator(self.features)
        self.operations = generator.generate_all_operations()
        
        # Step 3: Summarization
        total_time = sum(op.estimated_time for op in self.operations)
        setups = len(set(op.setup_required for op in self.operations))
        
        return {
            'features': self.features,
            'operations': self.operations,
            'summary': {
                'total_features': len(self.features),
                'total_operations': len(self.operations),
                'estimated_total_time_minutes': round(total_time, 2),
                'estimated_total_time_hours': round(total_time / 60, 2),
                'number_of_setups': setups
            }
        }

    def generate_operation_sheet(self, output_file: str = None) -> str:
        """Create a human-readable machining report"""
        if not self.operations: self.process()
        
        report = "="*80 + "\nFBM OPERATION SHEET\n" + "="*80 + "\n"
        report += f"Part: {self.filepath}\nDate: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        
        report += "MACHINING SEQUENCE:\n"
        for op in self.operations:
            report += f"Op #{op.operation_id}: {op.operation_name}\n"
            report += f"  - Strategy: {op.strategy.value}\n"
            report += f"  - Tool: {op.tool_type.value} Ø{op.tool_diameter}mm\n"
            report += f"  - Time: {op.estimated_time} min\n\n"
            
        if output_file:
            with open(output_file, 'w') as f:
                f.write(report)
        return report

    def export_json(self, output_file: str = None) -> Dict:
        """Export manufacturing data for downstream integration"""
        if not self.operations: self.process()
        
        data = {
            'metadata': {'file': self.filepath, 'timestamp': str(datetime.now())},
            'summary': {
                'total_features': len(self.features),
                'total_operations': len(self.operations)
            },
            'operations': [op.to_dict() for op in self.operations]
        }
        
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
        return data

if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else ""
    if path:
        planner = MachiningProcessPlanner(path)
        res = planner.process()
        print(f"Success! Found {res['summary']['total_features']} features.")
    else:
        print("Please provide a STEP/IGES file path.")
