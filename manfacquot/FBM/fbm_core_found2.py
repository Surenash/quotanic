# Decompiled with PyLingual (https://pylingual.io)
# Internal filename: 'FBM_core.py'
# Bytecode version: 3.11a7e (3495)
# Source timestamp: 2025-12-05 18:12:05 UTC (1764958325)

"""\nFeature-Based Machining (FBM) Toolpath Generator\nAutomatically recognizes machining features and generates optimized toolpath strategies\n"""
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.IGESControl import IGESControl_Reader
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopAbs import TopAbs_FACE, TopAbs_EDGE, TopAbs_VERTEX, TopAbs_SOLID
from OCC.Core.BRepGProp import brepgprop_SurfaceProperties, brepgprop_VolumeProperties
from OCC.Core.GProp import GProp_GProps
from OCC.Core.BRep import BRep_Tool
from OCC.Core.GeomAbs import GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone, GeomAbs_Sphere, GeomAbs_Torus, GeomAbs_BSplineSurface, GeomAbs_Circle, GeomAbs_Line
from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib_Add
from OCC.Core.gp import gp_Pnt, gp_Vec, gp_Dir, gp_Ax1
from OCC.Core.TopoDS import topods_Face, topods_Edge
from OCC.Core.BRepTools import breptools_UVBounds
import math
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import json
from datetime import datetime
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
@dataclass
class MachiningFeature:
    """Represents a recognized machining feature"""
    feature_id: int
    feature_type: FeatureType
    geometry: Dict[str, Any]
    depth: float = 0.0
    diameter: float = 0.0
    width: float = 0.0
    length: float = 0.0
    area: float = 0.0
    volume: float = 0.0
    orientation: Dict[str, float] = field(default_factory=dict)
    accessibility: str = 'Top'
    surface_finish_required: str = 'Standard'
    tolerance: str = 'Standard'
@dataclass
class MachiningOperation:
    """Represents a single machining operation"""
    operation_id: int
    operation_name: str
    feature: MachiningFeature
    strategy: MachiningStrategy
    tool_type: ToolType
    tool_diameter: float
    cutting_speed: float
    feed_rate: float
    depth_of_cut: float
    stepover: float
    number_of_passes: int
    estimated_time: float
    setup_required: int
    priority: int
    spindle_speed: float = 0.0
    coolant: str = 'Flood'
    notes: str = ''
class FeatureRecognitionEngine:
    """Recognizes machining features from CAD geometry"""
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.shape = None
        self.features = []
        self.feature_counter = 0
    def load_file(self) -> bool:
        """Load STEP or IGES file"""
        file_ext = self.filepath.lower().split('.')[(-1)]
        if file_ext in ['step', 'stp']:
            reader = STEPControl_Reader()
            status = reader.ReadFile(self.filepath)
        else:
            if file_ext in ['iges', 'igs']:
                reader = IGESControl_Reader()
                status = reader.ReadFile(self.filepath)
            else:
                raise ValueError(f'Unsupported file format: {file_ext}')
        if status!= IFSelect_RetDone:
            return False
        else:
            reader.TransferRoots()
            self.shape = reader.OneShape()
            return True
    def recognize_holes(self) -> List[MachiningFeature]:
        """Recognize hole features"""
        holes = []
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            if adaptor.GetType() == GeomAbs_Cylinder:
                cylinder = adaptor.Cylinder()
                radius = cylinder.Radius()
                diameter = 2 * radius
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                depth = area / (2 * math.pi * radius) if radius > 0 else 0
                axis = cylinder.Axis()
                direction = axis.Direction()
                hole_type = FeatureType.HOLE_THROUGH if depth > 50 else FeatureType.HOLE_BLIND
                feature = MachiningFeature(feature_id=self.feature_counter, feature_type=hole_type, geometry={'center': axis.Location(), 'axis': direction}, diameter=diameter, depth=depth, area=math.pi * radius * radius, orientation={'x': direction.X(), 'y': direction.Y(), 'z': direction.Z()}, accessibility=self._determine_accessibility(direction))
                holes.append(feature)
                self.feature_counter += 1
            explorer.Next()
        return holes
    def recognize_pockets(self) -> List[MachiningFeature]:
        """Recognize pocket features"""
        pockets = []
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        planar_faces = []
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            if adaptor.GetType() == GeomAbs_Plane:
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                plane = adaptor.Plane()
                normal = plane.Axis().Direction()
                if area < 5000 and abs(normal.Z()) > 0.7:
                        bbox = Bnd_Box()
                        brepbndlib_Add(topods_Face(face), bbox)
                        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
                        width = xmax - xmin
                        length = ymax - ymin
                        aspect_ratio = max(width, length) / (min(width, length) + 0.001)
                        if aspect_ratio < 1.5:
                            pocket_type = FeatureType.POCKET_CIRCULAR
                        else:
                            if aspect_ratio > 3:
                                pocket_type = FeatureType.SLOT
                            else:
                                pocket_type = FeatureType.POCKET_RECTANGULAR
                        feature = MachiningFeature(feature_id=self.feature_counter, feature_type=pocket_type, geometry={'plane': plane, 'normal': normal}, width=width, length=length, area=area, depth=10.0, orientation={'x': normal.X(), 'y': normal.Y(), 'z': normal.Z()}, accessibility=self._determine_accessibility(normal))
                        pockets.append(feature)
                        self.feature_counter += 1
            explorer.Next()
        return pockets
    def recognize_planar_faces(self) -> List[MachiningFeature]:
        """Recognize planar faces requiring machining"""
        faces = []
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            if adaptor.GetType() == GeomAbs_Plane:
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                if area > 5000:
                    plane = adaptor.Plane()
                    normal = plane.Axis().Direction()
                    feature = MachiningFeature(feature_id=self.feature_counter, feature_type=FeatureType.FACE_PLANAR, geometry={'plane': plane, 'normal': normal}, area=area, orientation={'x': normal.X(), 'y': normal.Y(), 'z': normal.Z()}, accessibility=self._determine_accessibility(normal))
                    faces.append(feature)
                    self.feature_counter += 1
            explorer.Next()
        return faces
    def recognize_contoured_surfaces(self) -> List[MachiningFeature]:
        """Recognize complex 3D contoured surfaces"""
        surfaces = []
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            surf_type = adaptor.GetType()
            if surf_type in (GeomAbs_BSplineSurface, GeomAbs_Sphere, GeomAbs_Torus):
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                feature = MachiningFeature(feature_id=self.feature_counter, feature_type=FeatureType.SURFACE_3D, geometry={'surface_type': str(surf_type)}, area=area, accessibility='Multi-axis', surface_finish_required='Fine')
                surfaces.append(feature)
                self.feature_counter += 1
            explorer.Next()
        return surfaces
    def recognize_fillets_chamfers(self) -> List[MachiningFeature]:
        """Recognize fillets and chamfers"""
        features = []
        explorer = TopExp_Explorer(self.shape, TopAbs_EDGE)
        while explorer.More():
            edge = explorer.Current()
            adaptor = BRepAdaptor_Curve(topods_Edge(edge))
            if adaptor.GetType() == GeomAbs_Circle:
                circle = adaptor.Circle()
                radius = circle.Radius()
                if radius < 20:
                    feature = MachiningFeature(feature_id=self.feature_counter, feature_type=FeatureType.FILLET, geometry={'radius': radius}, diameter=2 * radius, surface_finish_required='Fine')
                    features.append(feature)
                    self.feature_counter += 1
            explorer.Next()
        return features
    def _determine_accessibility(self, normal: gp_Dir) -> str:
        """Determine feature accessibility based on normal direction"""
        z_component = abs(normal.Z())
        if z_component > 0.9:
            return 'Top' if normal.Z() > 0 else 'Bottom'
        else:
            if z_component < 0.3:
                return 'Side'
            else:
                return 'Multi-axis'
    def recognize_all_features(self) -> List[MachiningFeature]:
        """Run complete feature recognition"""
        if not self.shape and (not self.load_file()):
            raise ValueError('Could not load CAD file')
        else:
            self.features = []
            self.features.extend(self.recognize_holes())
            self.features.extend(self.recognize_pockets())
            self.features.extend(self.recognize_planar_faces())
            self.features.extend(self.recognize_contoured_surfaces())
            self.features.extend(self.recognize_fillets_chamfers())
            return self.features
class ToolpathGenerator:
    """Generates optimized toolpaths for recognized features"""
    def __init__(self, features: List[MachiningFeature]):
        self.features = features
        self.operations = []
        self.operation_counter = 0
    def generate_hole_operations(self, hole: MachiningFeature) -> List[MachiningOperation]:
        """Generate drilling operations for holes"""
        operations = []
        diameter = hole.diameter
        depth = hole.depth
        needs_pilot = diameter > 12
        if needs_pilot:
            pilot_diameter = diameter * 0.5
            pilot_op = MachiningOperation(operation_id=self.operation_counter, operation_name=f'Drill Pilot Hole {pilot_diameter:.1f}mm', feature=hole, strategy=MachiningStrategy.DRILLING, tool_type=ToolType.DRILL, tool_diameter=pilot_diameter, cutting_speed=80, feed_rate=150, depth_of_cut=depth, stepover=0, number_of_passes=1, estimated_time=1.5, setup_required=1, priority=10, spindle_speed=self._calculate_spindle_speed(pilot_diameter, 80), coolant='Flood', notes='Pilot hole for main drilling operation')
            operations.append(pilot_op)
            self.operation_counter += 1
        drill_op = MachiningOperation(operation_id=self.operation_counter, operation_name=f'Drill {diameter:.1f}mm x {depth:.1f}mm', feature=hole, strategy=MachiningStrategy.DRILLING, tool_type=ToolType.DRILL, tool_diameter=diameter, cutting_speed=80, feed_rate=200, depth_of_cut=depth, stepover=0, number_of_passes=1, estimated_time=2.0 if needs_pilot else 2.5, setup_required=1, priority=20, spindle_speed=self._calculate_spindle_speed(diameter, 80), coolant='Flood')
        operations.append(drill_op)
        self.operation_counter += 1
        if hole.tolerance == 'Precision' and diameter < 30:
                ream_op = MachiningOperation(operation_id=self.operation_counter, operation_name=f'Ream {diameter:.1f}mm', feature=hole, strategy=MachiningStrategy.REAMING, tool_type=ToolType.REAMER, tool_diameter=diameter, cutting_speed=50, feed_rate=100, depth_of_cut=depth, stepover=0, number_of_passes=1, estimated_time=1.5, setup_required=1, priority=30, spindle_speed=self._calculate_spindle_speed(diameter, 50), coolant='Flood', notes='Precision reaming for tight tolerance')
                operations.append(ream_op)
                self.operation_counter += 1
        return operations
    def generate_pocket_operations(self, pocket: MachiningFeature) -> List[MachiningOperation]:
        """Generate pocketing operations"""
        # ***<module>.ToolpathGenerator.generate_pocket_operations: Failure: Different bytecode
        operations = []
        tool_diameter = min(pocket.width * 0.6, 12)
        rough_op = MachiningOperation(operation_id=self.operation_counter, operation_name=f'Pocket Roughing - {pocket.feature_type.value}', feature=pocket, strategy=MachiningStrategy.ADAPTIVE_CLEARING, tool_type=ToolType.END_MILL, tool_diameter=tool_diameter, cutting_speed=150, feed_rate=800, depth_of_cut=tool_diameter * 0.5, stepover=tool_diameter * 0.4, number_of_passes=int(pocket.depth / (tool_diameter * 0.5)) + 1, priority=40, spindle_speed=self._calculate_spindle_speed(tool_diameter, 150), coolant='Flood', notes='Adaptive clearing for efficient material removal')
        operations.append(rough_op)
        self.operation_counter += 1
        finish_tool = tool_diameter * 0.8
        finish_op = MachiningOperation(operation_id=self.operation_counter, operation_name=f'Pocket Finishing - {pocket.feature_type.value}', feature=pocket, strategy=MachiningStrategy.FINISHING, tool_type=ToolType.END_MILL, tool_diameter=finish_tool, cutting_speed=180, feed_rate=600, depth_of_cut=pocket.depth, stepover=0.2, number_of_passes=1, estimated_time=3.0, setup_required=1, priority=50, spindle_speed=self._calculate_spindle_speed(finish_tool, 180), coolant='Mist', notes='Contour finishing for final dimensions')
        operations.append(finish_op)
        self.operation_counter += 1
        return operations
    def generate_face_operations(self, face: MachiningFeature) -> List[MachiningOperation]:
        """Generate face milling operations"""
        operations = []
        tool_diameter = 50
        rough_op = MachiningOperation(operation_id=self.operation_counter, operation_name='Face Milling - Roughing', feature=face, strategy=MachiningStrategy.FACING, tool_type=ToolType.FACE_MILL, tool_diameter=tool_diameter, cutting_speed=200, feed_rate=1000, depth_of_cut=2.0, stepover=tool_diameter * 0.75, number_of_passes=1, estimated_time=4.0, setup_required=1, priority=5, spindle_speed=self._calculate_spindle_speed(tool_diameter, 200), coolant='Flood', notes='Remove bulk material')
        operations.append(rough_op)
        self.operation_counter += 1
        finish_op = MachiningOperation(operation_id=self.operation_counter, operation_name='Face Milling - Finishing', feature=face, strategy=MachiningStrategy.FINISHING, tool_type=ToolType.FACE_MILL, tool_diameter=tool_diameter, cutting_speed=220, feed_rate=800, depth_of_cut=0.5, stepover=tool_diameter * 0.6, number_of_passes=1, estimated_time=2.5, setup_required=1, priority=6, spindle_speed=self._calculate_spindle_speed(tool_diameter, 220), coolant='Mist', notes='Final surface finish')
        operations.append(finish_op)
        self.operation_counter += 1
        return operations
    def generate_3d_surface_operations(self, surface: MachiningFeature) -> List[MachiningOperation]:
        """Generate 3D surface machining operations"""
        operations = []
        tool_diameter = 10
        rough_op = MachiningOperation(operation_id=self.operation_counter, operation_name='3D Surface Roughing', feature=surface, strategy=MachiningStrategy.ROUGHING, tool_type=ToolType.BALL_MILL, tool_diameter=tool_diameter, cutting_speed=120, feed_rate=600, depth_of_cut=1.0, stepover=tool_diameter * 0.5, number_of_passes=3, estimated_time=15.0, setup_required=1, priority=60, spindle_speed=self._calculate_spindle_speed(tool_diameter, 120), coolant='Flood', notes='3D adaptive roughing')
        operations.append(rough_op)
        self.operation_counter += 1
        semi_tool = tool_diameter * 0.6
        semi_op = MachiningOperation(operation_id=self.operation_counter, operation_name='3D Surface Semi-Finishing', feature=surface, strategy=MachiningStrategy.SEMI_FINISHING, tool_type=ToolType.BALL_MILL, tool_diameter=semi_tool, cutting_speed=150, feed_rate=500, depth_of_cut=0.5, stepover=semi_tool * 0.3, number_of_passes=2, estimated_time=12.0, setup_required=1, priority=70, spindle_speed=self._calculate_spindle_speed(semi_tool, 150), coolant='Mist', notes='Parallel finishing strategy')
        operations.append(semi_op)
        self.operation_counter += 1
        finish_tool = semi_tool * 0.5
        finish_op = MachiningOperation(operation_id=self.operation_counter, operation_name='3D Surface Finishing', feature=surface, strategy=MachiningStrategy.FINISHING, tool_type=ToolType.BALL_MILL, tool_diameter=finish_tool, cutting_speed=180, feed_rate=400, depth_of_cut=0.2, stepover=finish_tool * 0.2, number_of_passes=1, estimated_time=10.0, setup_required=1, priority=80, spindle_speed=self._calculate_spindle_speed(finish_tool, 180), coolant='Air', notes='Final surface finish, scallop height < 0.01mm')
        operations.append(finish_op)
        self.operation_counter += 1
        return operations
    def _calculate_spindle_speed(self, diameter_mm: float, cutting_speed_m_min: float) -> float:
        """Calculate spindle speed in RPM"""
        if diameter_mm <= 0:
            return 0
        else:
            rpm = cutting_speed_m_min * 1000 / (math.pi * diameter_mm)
            return round(rpm, 0)
    def generate_all_operations(self) -> List[MachiningOperation]:
        """Generate operations for all features"""
        self.operations = []
        for feature in self.features:
            if feature.feature_type in (FeatureType.HOLE_THROUGH, FeatureType.HOLE_BLIND):
                self.operations.extend(self.generate_hole_operations(feature))
            else:
                if feature.feature_type in [FeatureType.POCKET_RECTANGULAR, FeatureType.POCKET_CIRCULAR, FeatureType.POCKET_IRREGULAR, FeatureType.SLOT]:
                    self.operations.extend(self.generate_pocket_operations(feature))
                else:
                    if feature.feature_type == FeatureType.FACE_PLANAR:
                        self.operations.extend(self.generate_face_operations(feature))
                    else:
                        if feature.feature_type == FeatureType.SURFACE_3D:
                            self.operations.extend(self.generate_3d_surface_operations(feature))
        self.operations.sort(key=lambda x: x.priority)
        return self.operations
class MachiningProcessPlanner:
    """Complete FBM system - Feature recognition + Toolpath generation"""
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.recognizer = FeatureRecognitionEngine(filepath)
        self.features = []
        self.operations = []
    def process(self) -> Dict:
        """Complete FBM process"""
        print('Step 1: Recognizing features...')
        self.features = self.recognizer.recognize_all_features()
        print(f'  Found {len(self.features)} machining features')
        print('\nStep 2: Generating toolpaths...')
        generator = ToolpathGenerator(self.features)
        self.operations = generator.generate_all_operations()
        print(f'  Generated {len(self.operations)} machining operations')
        total_time = sum((op.estimated_time for op in self.operations))
        setups = set((op.setup_required for op in self.operations))
        return {'features': self.features, 'operations': self.operations, 'summary': {'total_features': len(self.features), 'total_operations': len(self.operations), 'estimated_total_time_minutes': round(total_time, 2), 'estimated_total_time_hours': round(total_time / 60, 2), 'number_of_setups': len(setups)}}
    def generate_operation_sheet(self, output_file: str=None) -> str:
        """Generate detailed operation sheet"""
        # ***<module>.MachiningProcessPlanner.generate_operation_sheet: Failure: Different bytecode
        if not self.operations:
            self.process()
        report = f"\n{'================================================================================'}\nFEATURE-BASED MACHINING (FBM) OPERATION SHEET\n{'================================================================================'}\nPart File: {self.filepath}\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\nSUMMARY\n-------\nTotal Features Recognized: {len(self.features)}\nTotal Operations: {len(self.operations)}\nEstimated Total Machining Time: {sum((op.estimated_time for op in self.operations)) / 60:.1f} hours)\nNumber of Setups Required: {len(set((op.setup_required for op in self.operations)))}\n\nFEATURES RECOGNIZED\n-------------------\n"
        feature_counts = {}
        for feature in self.features:
            feat_type = feature.feature_type.value
            feature_counts[feat_type] = feature_counts.get(feat_type, 0) + 1
        for feat_type, count in sorted(feature_counts.items()):
            report += f'  {feat_type}: {count}\n'
        report += f"\n{'================================================================================'}\n"
        report += 'MACHINING OPERATIONS SEQUENCE\n'
        report += f"{'================================================================================'}\n\n"
        current_setup = 0
        for op in self.operations:
            if op.setup_required!= current_setup:
                current_setup = op.setup_required
                report += f"\n{'================================================================================'}\n"
                report += f'SETUP {current_setup}\n'
                report += f"{'================================================================================'}\n\n"
            report += f'Operation #{op.operation_id}: {op.operation_name}\n'
            report += f'  Feature: {op.feature.feature_type.value}\n'
            report += f'  Strategy: {op.strategy.value}\n'
            report += f'  Tool: {op.tool_type.value}, Ø{op.tool_diameter:.1f}mm\n'
            report += f'  Cutting Speed: {op.cutting_speed} m/min\n'
            report += f'  Spindle Speed: {op.spindle_speed:.0f} RPM\n'
            report += f'  Feed Rate: {op.feed_rate} mm/min\n'
            report += f'  Depth of Cut: {op.depth_of_cut:.1f}mm\n'
            report += f'  Stepover: {op.stepover:.1f}mm\n'
            report += f'  Passes: {op.number_of_passes}\n'
            report += f'  Time: {op.estimated_time:.1f} min\n'
            report += f'  Coolant: {op.coolant}\n'
            if op.notes:
                report += f'  Notes: {op.notes}\n'
            report += '\n'
        report += f"{'================================================================================'}\n"
        report += 'END OF OPERATION SHEET\n'
        report += f"{'================================================================================'}\n"
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f'Operation sheet saved to: {output_file}')
        return report
    def export_json(self, output_file: str=None) -> dict:
        """Export FBM data to JSON format"""
        # ***<module>.MachiningProcessPlanner.export_json: Failure: Different bytecode
        if not self.operations:
            self.process()
        features_data = []
        for feature in self.features:
            feature_dict = {'feature_id': feature.feature_id, 'feature_type': feature.feature_type.value, 'depth': feature.depth, 'diameter': feature.diameter, 'width': feature.width, 'length': feature.length, 'area': feature.area, 'volume': feature.volume, 'orientation': feature.orientation, 'accessibility': feature.accessibility, 'surface_finish_required': feature.surface_finish_required, 'tolerance': feature.tolerance}
            features_data.append(feature_dict)
        operations_data = []
        for op in self.operations:
            op_dict = {'operation_id': op.operation_id, 'operation_name': op.operation_name, 'feature_id': op.feature.feature_id, 'strategy': op.strategy.value, 'tool_type': op.tool_type.value, 'tool_diameter': op.tool_diameter, 'cutting_speed': op.cutting_speed, 'spindle_speed': op.spindle_speed, 'feed_rate': op.feed_rate, 'depth_of_cut': op.depth_of_cut, 'stepover': op.stepover, 'number_of_passes': op.number_of_passes, 'estimated_time': op.estimated_time, 'setup_required': op.setup_required, 'priority': op.priority, 'coolant': op.coolant, 'notes': op.notes}
            operations_data.append(op_dict)
        data = {'filepath': self.filepath, 'generated_timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'features': features_data, 'operations': operations_data, 'summary': {'total_features': len(self.features), 'total_operations': len(self.operations), 'estimated_total_time_minutes': round(sum((op.estimated_time for op in self.operations)) / 60, 2), 'number_of_setups': len(set((op.setup_required for op in self.operations)))}}
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f'JSON export saved to: {output_file}')
        return data
if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
    else:
        filepath = 'sample_part.step'
        print(f'No file specified. Using default: {filepath}')
        print('Usage: python FBM_core.py <path_to_step_or_iges_file>')
        print()
    print('================================================================================')
    print('FEATURE-BASED MACHINING (FBM) SYSTEM')
    print('================================================================================')
    print(f'Processing: {filepath}\n')
    try:
        planner = MachiningProcessPlanner(filepath)
        result = planner.process()
        print('\n================================================================================')
        print('PROCESSING COMPLETE')
        print('================================================================================')
        print(f"Total Features Recognized: {result['summary']['total_features']}")
        print(f"Total Operations Generated: {result['summary']['total_operations']}")
        print(f"Estimated Machining Time: {result['summary']['estimated_total_time_minutes']:.1f} minutes")
        print(f"                          ({result['summary']['estimated_total_time_hours']:.2f} hours)")
        print(f"Setups Required: {result['summary']['number_of_setups']}")
        print('\nGenerating operation sheet...')
        planner.generate_operation_sheet('operation_sheet.txt')
        print('Exporting to JSON...')
        planner.export_json('fbm_data.json')
        print('\n================================================================================')
        print('FBM PROCESSING COMPLETE - Files Generated:')
        print('  - operation_sheet.txt (Human-readable)')
        print('  - fbm_data.json (Machine-readable)')
        print('================================================================================')
    except FileNotFoundError:
        print(f'ERROR: File \'{filepath}\' not found.')
        print('Please provide a valid STEP or IGES file path.')
    except Exception as e:
        print(f'ERROR: {str(e)}')
        import traceback
        traceback.print_exc()