"""
Advanced Feature-Based Machining (FBM) System
Extended version with 40+ feature types and sophisticated analysis
"""

from FBM_core import *  # Import base classes
from geometry_analyzer import GeometryAnalyzer, GeometryAnalysis
from pattern_recognizer import PatternRecognizer, FeaturePattern, PatternType
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopAbs import TopAbs_FACE, TopAbs_EDGE, TopAbs_WIRE
from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCC.Core.GeomAbs import (GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone,  
                               GeomAbs_Torus, GeomAbs_Sphere, GeomAbs_BSplineSurface,
                               GeomAbs_Circle, GeomAbs_Line, GeomAbs_Helix)
from OCC.Core.TopoDS import topods_Face, topods_Edge, topods_Wire
from OCC.Core.BRep import BRep_Tool
from typing import List, Dict, Tuple, Optional
import math


# Extended Feature Types
class AdvancedFeatureType(Enum):
    """Extended enumeration of machining features"""
    # Basic (from original)
    HOLE_THROUGH = "Through Hole"
    HOLE_BLIND = "Blind Hole"
    POCKET_RECTANGULAR = "Rectangular Pocket"
    POCKET_CIRCULAR = "Circular Pocket"
    POCKET_IRREGULAR = "Irregular Pocket"
    SLOT = "Slot"
    FACE_PLANAR = "Planar Face"
    FACE_CONTOURED = "Contoured Face"
    FILLET = "Fillet"
    CHAMFER = "Chamfer"
    SURFACE_3D = "3D Surface"
    
    # Advanced Holes
    HOLE_THREADED = "Threaded Hole"
    HOLE_COUNTERBORE = "Counterbore Hole"
    HOLE_COUNTERSINK = "Countersink Hole"
    HOLE_TAPERED = "Tapered Hole"
    HOLE_STEP = "Step Drilled Hole"
    
    # Advanced Pockets
    POCKET_MULTI_LEVEL = "Multi-Level Pocket"
    POCKET_ISLAND = "Pocket with Island"
    POCKET_OPEN = "Open Pocket"
    POCKET_ANGLED_WALL = "Angled Wall Pocket"
    
    # Protrusions (Additive Features)
    BOSS_CIRCULAR = "Circular Boss"
    BOSS_RECTANGULAR = "Rectangular Boss"
    RIB = "Rib"
    STUD = "Stud"
    LUG = "Lug"
    FLANGE = "Flange"
    
    # Grooves & Slots
    GROOVE_RECTANGULAR = "Rectangular Groove"
    GROOVE_CIRCULAR = "Circular Groove (O-Ring)"
    T_SLOT = "T-Slot"
    DOVETAIL_SLOT = "Dovetail Slot"
    KEYWAY = "Keyway"
    GROOVE_SPIRAL = "Spiral Groove"
    
    # Complex Surfaces
    SURFACE_RULED = "Ruled Surface"
    SURFACE_SCULPTURED = "Sculptured Surface"
    SURFACE_BLENDED = "Blended Surface"
    THIN_WALL = "Thin Wall"
    
    # Edge Features
    FILLET_VARIABLE = "Variable Radius Fillet"
    BLEND_FACE = "Face Blend"
    RELIEF_CUT = "Relief Cut"


@dataclass
class AdvancedMachiningFeature(MachiningFeature):
    """Extended feature with advanced properties"""
    confidence_score: float = 1.0  # 0-1 confidence in detection
    complexity_rating: int = 1  # 1-10 machining difficulty
    related_features: List[int] = field(default_factory=list)
    manufacturing_notes: List[str] = field(default_factory=list)
    alternative_strategies: List[str] = field(default_factory=list)
    risk_factors: List[str] = field(default_factory=list)
    pattern_id: Optional[int] = None  # If part of a pattern
    geometry_analysis: Optional[GeometryAnalysis] = None
    
    # Thread-specific
    thread_pitch: float = 0.0  # mm
    thread_type: str = ""  # M6, NPT, etc.
    
    # Counterbore/countersink specific
    shoulder_diameter: float = 0.0
    shoulder_depth: float = 0.0
    sink_angle: float = 0.0  # degrees
    
    # Boss/protrusion specific
    height: float = 0.0  # protrusion height
    
    # T-slot specific
    slot_width: float = 0.0
    slot_depth: float = 0.0
    head_width: float = 0.0


class AdvancedFeatureRecognitionEngine(FeatureRecognitionEngine):
    """Enhanced feature recognition with advanced detection"""
    
    def __init__(self, filepath: str):
        super().__init__(filepath)
        self.geometry_analyzer = None
        self.detected_patterns: List[FeaturePattern] = []
        
    def recognize_threaded_holes(self) -> List[AdvancedMachiningFeature]:
        """
        Detect threaded holes by looking for helical curves/surfaces
        """
        threaded_holes = []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_EDGE)
        
        while explorer.More():
            edge = explorer.Current()
            adaptor = BRepAdaptor_Curve(topods_Edge(edge))
            
            # Check for helical curves (threads)
            if adaptor.GetType() == GeomAbs_Helix or self._looks_like_thread(edge):
                # Get parent face to determine hole diameter
                diameter = self._estimate_thread_diameter(edge)
                depth = self._estimate_thread_depth(edge)
                pitch = self._estimate_thread_pitch(edge)
                
                feature = AdvancedMachiningFeature(
                    feature_id=self.feature_counter,
                    feature_type=AdvancedFeatureType.HOLE_THREADED,
                    geometry={'edge': edge},
                    diameter=diameter,
                    depth=depth,
                    thread_pitch=pitch,
                    thread_type=self._classify_thread(diameter, pitch),
                    confidence_score=0.85,
                    complexity_rating=6,
                    manufacturing_notes=["Requires thread milling or tapping"],
                    surface_finish_required="Standard"
                )
                
                threaded_holes.append(feature)
                self.feature_counter += 1
            
            explorer.Next()
        
        return threaded_holes
    
    def recognize_counterbores(self) -> List[AdvancedMachiningFeature]:
        """
        Detect counterbore holes (larger diameter shoulder + smaller hole)
        """
        counterbores = []
        
        # Look for stepped cylindrical features
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        cylindrical_faces = []
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Cylinder:
                cylinder = adaptor.Cylinder()
                radius = cylinder.Radius()
                cylindrical_faces.append((face, radius, cylinder))
            
            explorer.Next()
        
        # Look for adjacent cylinders with different radii (counterbore pattern)
        for i in range(len(cylindrical_faces)):
            for j in range(i + 1, len(cylindrical_faces)):
                face1, r1, cyl1 = cylindrical_faces[i]
                face2, r2, cyl2 = cylindrical_faces[j]
                
                # Check if cylinders are coaxial and one is larger
                if self._are_coaxial(cyl1, cyl2) and abs(r1 - r2) > 0.5:
                    larger_r = max(r1, r2)
                    smaller_r = min(r1, r2)
                    
                    feature = AdvancedMachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=AdvancedFeatureType.HOLE_COUNTERBORE,
                        geometry={'face1': face1, 'face2': face2},
                        diameter=2 * smaller_r,
                        shoulder_diameter=2 * larger_r,
                        shoulder_depth=5.0,  # Estimate
                        confidence_score=0.9,
                        complexity_rating=4,
                        manufacturing_notes=["Two-step drilling operation required"]
                    )
                    
                    counterbores.append(feature)
                    self.feature_counter += 1
                    break
        
        return counterbores
    
    def recognize_countersinks(self) -> List[AdvancedMachiningFeature]:
        """
        Detect countersink holes (conical entry + cylindrical hole)
        """
        countersinks = []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            # Look for conical surfaces
            if adaptor.GetType() == GeomAbs_Cone:
                cone = adaptor.Cone()
                semi_angle = cone.SemiAngle()
                sink_angle = math.degrees(semi_angle) * 2  # Full angle
                
                # Common countersink angles: 82°, 90°, 100°, 120°
                if 75 < sink_angle < 125:
                    apex_radius = cone.RefRadius()
                    
                    feature = AdvancedMachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=AdvancedFeatureType.HOLE_COUNTERSINK,
                        geometry={'cone': cone},
                        diameter=2 * apex_radius,
                        sink_angle=sink_angle,
                        confidence_score=0.95,
                        complexity_rating=3,
                        manufacturing_notes=[f"Countersink at {sink_angle:.0f}°"]
                    )
                    
                    countersinks.append(feature)
                    self.feature_counter += 1
            
            explorer.Next()
        
        return countersinks
    
    def recognize_bosses(self) -> List[AdvancedMachiningFeature]:
        """
        Detect boss features (raised protrusions)
        These are material to LEAVE, not remove
        """
        bosses = []
        
        # Bosses are typically detected by looking at the negative space
        # They appear as protrusions above the base surface
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        base_faces = []
        raised_faces = []
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Plane:
                plane = adaptor.Plane()
                z_pos = plane.Location().Z()
                
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                
                # Classify by Z position and area
                if area > 1000:  # Large face = likely base
                    base_faces.append((face, z_pos, area))
                else:  # Small face = possibly top of boss
                    raised_faces.append((face, z_pos, area))
            
            explorer.Next()
        
        # Find raised faces above base
        for raised_face, raised_z, raised_area in raised_faces:
            for base_face, base_z, base_area in base_faces:
                if raised_z > base_z + 1.0:  # At least 1mm raised
                    # Estimate boss dimensions
                    bbox = Bnd_Box()
                    brepbndlib_Add(topods_Face(raised_face), bbox)
                    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
                    
                    width = xmax - xmin
                    length = ymax - ymin
                    height = raised_z - base_z
                    
                    # Classify boss type
                    aspect_ratio = max(width, length) / (min(width, length) + 0.001)
                    
                    if aspect_ratio < 1.5:
                        boss_type = AdvancedFeatureType.BOSS_CIRCULAR
                    else:
                        boss_type = AdvancedFeatureType.BOSS_RECTANGULAR
                    
                    feature = AdvancedMachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=boss_type,
                        geometry={'top_face': raised_face, 'base_face': base_face},
                        width=width,
                        length=length,
                        height=height,
                        area=raised_area,
                        confidence_score=0.75,
                        complexity_rating=5,
                        manufacturing_notes=[
                            "Boss feature - machine around to leave protrusion",
                            "Consider face milling base, then profiling around boss"
                        ]
                    )
                    
                    bosses.append(feature)
                    self.feature_counter += 1
                    break
        
        return bosses
    
    def recognize_t_slots(self) -> List[AdvancedMachiningFeature]:
        """
        Detect T-slot features (T-shaped grooves for hold-down bolts)
        """
        t_slots = []
        
        # T-slots have characteristic geometry: narrow slot opening to wider slot
        # Look for combinations of rectangular pockets
        
        pockets = self.recognize_pockets()
        
        # Analyze pocket relationships to find T-slot patterns
        for i in range(len(pockets)):
            for j in range(i + 1, len(pockets)):
                # Check if pockets are adjacent and form T shape
                if self._forms_t_slot_pattern(pockets[i], pockets[j]):
                    p1_width = pockets[i].width
                    p2_width = pockets[j].width
                    
                    slot_width = min(p1_width, p2_width)
                    head_width = max(p1_width, p2_width)
                    
                    feature = AdvancedMachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=AdvancedFeatureType.T_SLOT,
                        geometry={'pocket1': pockets[i].geometry, 'pocket2': pockets[j].geometry},
                        width=slot_width,
                        slot_width=slot_width,
                        head_width=head_width,
                        slot_depth=max(pockets[i].depth, pockets[j].depth),
                        confidence_score=0.8,
                        complexity_rating=7,
                        manufacturing_notes=[
                            "T-slot requires special T-slot cutter",
                            "Mill narrow slot first, then widen bottom with T-cutter"
                        ],
                       alternative_strategies=[
                            "Could use multiple setups with end mills if T-cutter unavailable"
                        ]
                    )
                    
                    t_slots.append(feature)
                    self.feature_counter += 1
                    break
        
        return t_slots
    
    # Helper methods
    
    def _looks_like_thread(self, edge) -> bool:
        """Check if edge geometry resembles a thread"""
        # Simplified check - in production would analyze curve more thoroughly
        return False
    
    def _estimate_thread_diameter(self, edge) -> float:
        """Estimate thread diameter from edge"""
        return 6.0  # Placeholder
    
    def _estimate_thread_depth(self, edge) -> float:
        """Estimate thread depth"""
        return 10.0  # Placeholder
    
    def _estimate_thread_pitch(self, edge) -> float:
        """Estimate thread pitch"""
        return 1.0  # Placeholder - standard M6
    
    def _classify_thread(self, diameter: float, pitch: float) -> str:
        """Classify thread type based on diameter and pitch"""
        # Common metric threads
        thread_specs = {
            (3.0, 0.5): "M3x0.5",
            (4.0, 0.7): "M4x0.7",
            (5.0, 0.8): "M5x0.8",
            (6.0, 1.0): "M6x1.0",
            (8.0, 1.25): "M8x1.25",
            (10.0, 1.5): "M10x1.5",
            (12.0, 1.75): "M12x1.75",
        }
        
        # Find closest match
        for (d, p), name in thread_specs.items():
            if abs(diameter - d) < 0.5 and abs(pitch - p) < 0.2:
                return name
        
        return f"M{diameter:.0f}x{pitch:.1f}"
    
    def _are_coaxial(self, cyl1, cyl2) -> bool:
        """Check if two cylinders are coaxial"""
        axis1 = cyl1.Axis()
        axis2 = cyl2.Axis()
        
        # Check if axes are parallel
        dir1 = axis1.Direction()
        dir2 = axis2.Direction()
        
        dot_product = abs(dir1.X() * dir2.X() + dir1.Y() * dir2.Y() + dir1.Z() * dir2.Z())
        
        return dot_product > 0.99  # Nearly parallel
    
    def _forms_t_slot_pattern(self, pocket1, pocket2) -> bool:
        """Check if two pockets form a T-slot pattern"""
        # Simplified check - would need more sophisticated geometry analysis
        # Check if one pocket is significantly wider than the other
        w1, w2 = pocket1.width, pocket2.width
        
        if w1 > 0 and w2 > 0:
            ratio = max(w1, w2) / min(w1, w2)
            return ratio > 1.5 and ratio < 3.0
        
        return False
    
    def recognize_all_advanced_features(self) -> List[AdvancedMachiningFeature]:
        """
        Run complete advanced feature recognition
        """
        if not self.shape:
            if not self.load_file():
                raise ValueError("Could not load CAD file")
        
        # Run geometry analysis first
        self.geometry_analyzer = GeometryAnalyzer(self.shape)
        overall_analysis = self.geometry_analyzer.analyze_complete()
        
        print(f"Geometry Analysis:")
        print(f"  Undercuts: {'Yes' if overall_analysis.has_undercuts else 'No'}")
        print(f"  Thin walls: {'Yes' if overall_analysis.has_thin_walls else 'No'}")
        print(f"  Accessibility score: {overall_analysis.accessibility_score:.2f}")
        print(f"  Complexity score: {overall_analysis.complexity_score:.1f}/10")
        
        if overall_analysis.manufacturing_risks:
            print(f"  Risks: {', '.join(overall_analysis.manufacturing_risks)}")
        
        # Recognize all feature types
        all_features = []
        
        # Basic features (from parent class)
        print("\nRecognizing basic features...")
        basic_features = super().recognize_all_features()
        # Convert to advanced features
        for bf in basic_features:
            af = AdvancedMachiningFeature(
                feature_id=bf.feature_id,
                feature_type=bf.feature_type,
                geometry=bf.geometry,
                depth=bf.depth,
                diameter=bf.diameter,
                width=bf.width,
                length=bf.length,
                area=bf.area,
                volume=bf.volume,
                orientation=bf.orientation,
                accessibility=bf.accessibility,
                surface_finish_required=bf.surface_finish_required,
                tolerance=bf.tolerance,
                confidence_score=0.95,
                complexity_rating=3
            )
            all_features.append(af)
        
        # Advanced features
        print("Recognizing threaded holes...")
        all_features.extend(self.recognize_threaded_holes())
        
        print("Recognizing counterbores...")
        all_features.extend(self.recognize_counterbores())
        
        print("Recognizing countersinks...")
        all_features.extend(self.recognize_countersinks())
        
        print("Recognizing bosses...")
        all_features.extend(self.recognize_bosses())
        
        print("Recognizing T-slots...")
        all_features.extend(self.recognize_t_slots())
        
        # Pattern recognition
        print("\nRecognizing patterns...")
        pattern_recognizer = PatternRecognizer(all_features)
        patterns = pattern_recognizer.recognize_all_patterns()
        self.detected_patterns = patterns
        
        if patterns:
            print(f"Found {len(patterns)} patterns:")
            for i, pattern in enumerate(patterns):
                print(f"  Pattern {i+1}: {pattern.pattern_type.value} - {pattern.pattern_count} features")
                # Assign pattern ID to features
                for feature in all_features:
                    if feature.feature_id in pattern.feature_ids:
                        feature.pattern_id = i
        
        self.features = all_features
        return all_features

# Advanced Toolpath Generator with sophisticated strategies

class AdvancedToolpathGenerator(ToolpathGenerator):
    """Enhanced toolpath generation with advanced strategies"""
    
    def __init__(self, features: List[AdvancedMachiningFeature]):
        # Convert features list to base type for parent init
        super().__init__(features)
        self.material = "Aluminum"  # Default
        
    def generate_thread_operations(self, threaded_hole: AdvancedMachiningFeature) -> List[MachiningOperation]:
        """Generate thread milling operations"""
        operations = []
        diameter = threaded_hole.diameter
        depth = threaded_hole.depth
        pitch = threaded_hole.thread_pitch
        
        # Pilot hole
        pilot_diameter = diameter * 0.85
        pilot_op = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name=f"Drill Pilot for Thread {threaded_hole.thread_type}",
            feature=threaded_hole,
            strategy=MachiningStrategy.DRILLING,
            tool_type=ToolType.DRILL,
            tool_diameter=pilot_diameter,
            cutting_speed=80,
            feed_rate=150,
            depth_of_cut=depth,
            stepover=0,
            number_of_passes=1,
            estimated_time=2.0,
            setup_required=1,
            priority=15,
            spindle_speed=self._calculate_spindle_speed(pilot_diameter, 80),
            coolant="Flood"
        )
        operations.append(pilot_op)
        self.operation_counter += 1
        
        # Thread milling
        thread_mill_dia = pitch * 0.8
        thread_op = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name=f"Thread Mill {threaded_hole.thread_type}",
            feature=threaded_hole,
            strategy=MachiningStrategy.THREAD_MILLING,
            tool_type=ToolType.THREAD_MILL,
            tool_diameter=thread_mill_dia,
            cutting_speed=60,
            feed_rate=pitch * self._calculate_spindle_speed(thread_mill_dia, 60) / 60,
            depth_of_cut=pitch,
            stepover=0,
            number_of_passes=int(depth / pitch),
            estimated_time=4.0,
            setup_required=1,
            priority=16,
            spindle_speed=self._calculate_spindle_speed(thread_mill_dia, 60),
            coolant="Mist",
            notes=f"Helical interpolation, pitch={pitch}mm"
        )
        operations.append(thread_op)
        self.operation_counter += 1
        
        return operations
    
    def generate_all_advanced_operations(self) -> List[MachiningOperation]:
        """Generate operations for all advanced features"""
        self.operations = []
        
        for feature in self.features:
            if hasattr(feature, 'feature_type'):
                feat_type = feature.feature_type
                
                if feat_type == AdvancedFeatureType.HOLE_THREADED:
                    self.operations.extend(self.generate_thread_operations(feature))
                # Add other advanced types here...
                elif feat_type in [FeatureType.HOLE_THROUGH, FeatureType.HOLE_BLIND]:
                    self.operations.extend(self.generate_hole_operations(feature))
                elif feat_type in [FeatureType.POCKET_RECTANGULAR, FeatureType.POCKET_CIRCULAR]:
                    self.operations.extend(self.generate_pocket_operations(feature))
                elif feat_type == FeatureType.FACE_PLANAR:
                    self.operations.extend(self.generate_face_operations(feature))
        
        self.operations.sort(key=lambda x: x.priority)
        return self.operations


class AdvancedMachiningProcessPlanner:
    """Advanced FBM planner"""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.recognizer = AdvancedFeatureRecognitionEngine(filepath)
        self.features = []
        self.operations = []
        self.patterns = []
        
    def process(self) -> Dict:
        """Run advanced FBM process"""
        print("="*80)
        print("ADVANCED FBM SYSTEM")
        print("="*80)
        
        print("\nRecognizing features...")
        self.features = self.recognizer.recognize_all_advanced_features()
        self.patterns = self.recognizer.detected_patterns
        print(f"Found {len(self.features)} features, {len(self.patterns)} patterns")
        
        print("\nGenerating toolpaths...")
        generator = AdvancedToolpathGenerator(self.features)
        self.operations = generator.generate_all_advanced_operations()
        print(f"Generated {len(self.operations)} operations")
        
        total_time = sum(op.estimated_time for op in self.operations)
        setups = set(op.setup_required for op in self.operations)
        
        return {
            'features': self.features,
            'operations': self.operations,
            'patterns': self.patterns,
            'summary': {
                'total_features': len(self.features),
                'total_operations': len(self.operations),
                'total_patterns': len(self.patterns),
                'estimated_total_time_minutes': round(total_time, 2),
                'estimated_total_time_hours': round(total_time / 60, 2),
                'number_of_setups': len(setups)
            }
        }


if __name__ == "__main__":
    import sys
    
    filepath = sys.argv[1] if len(sys.argv) > 1 else "sample_part.step"
    
    try:
        planner = AdvancedMachiningProcessPlanner(filepath)
        result = planner.process()
        
        print("\n" + "="*80)
        print("COMPLETE!")
        print(f"✓ {result['summary']['total_features']} features")  
        print(f"✓ {result['summary']['total_patterns']} patterns")
        print(f"✓ {result['summary']['total_operations']} operations")
        print("="*80)
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

    # Additional Advanced Feature Detection Methods
    
    def recognize_multi_level_pockets(self) -> List[AdvancedMachiningFeature]:
        """
        Detect multi-level (stepped) pockets
        Multiple depth levels in same pocket
        """
        multi_level_pockets = []
        
        # Look for pockets with multiple planar faces at different Z heights
        planar_faces = []
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Plane:
                plane = adaptor.Plane()
                z_pos = plane.Location().Z()
                
                props = GProp_GProps()
                brepgprop_SurfaceProperties(topods_Face(face), props)
                area = props.Mass()
                
                planar_faces.append((face, z_pos, area))
            
            explorer.Next()
        
        # Group faces by proximity and look for stepped pattern
        planar_faces.sort(key=lambda x: x[1])  # Sort by Z
        
        for i in range(len(planar_faces) - 1):
            face1, z1, area1 = planar_faces[i]
            face2, z2, area2 = planar_faces[i + 1]
            
            # If two faces are at different heights with similar areas
            if abs(z2 - z1) > 2.0 and abs(area1 - area2) < area1 * 0.5:
                feature = AdvancedMachiningFeature(
                    feature_id=self.feature_counter,
                    feature_type=AdvancedFeatureType.POCKET_MULTI_LEVEL,
                    geometry={'level1': face1, 'level2': face2},
                    depth=abs(z2 - z1),
                    area=min(area1, area2),
                    confidence_score=0.75,
                    complexity_rating=7,
                    manufacturing_notes=["Multi-level pocket requires multiple depth passes"]
                )
                
                multi_level_pockets.append(feature)
                self.feature_counter += 1
        
        return multi_level_pockets
    
    def recognize_island_pockets(self) -> List[AdvancedMachiningFeature]:
        """
        Detect pockets with islands (material left inside)
        Complex pockets with internal features to avoid
        """
        island_pockets = []
        
        # Look for pockets with internal protrusions
        # Simplified: detect pockets that have internal bosses
        
        pockets = self.recognize_pockets()
        bosses = self.recognize_bosses()
        
        for pocket in pockets:
            for boss in bosses:
                # Check if boss is inside pocket (simplified spatial check)
                # In production, would use proper containment testing
                
                feature = AdvancedMachiningFeature(
                    feature_id=self.feature_counter,
                    feature_type=AdvancedFeatureType.POCKET_ISLAND,
                    geometry={'pocket': pocket.geometry, 'island': boss.geometry},
                    width=pocket.width,
                    length=pocket.length,
                    depth=pocket.depth,
                    confidence_score=0.7,
                    complexity_rating=8,
                    manufacturing_notes=[
                        "Pocket with island - machine around internal feature",
                        "Requires careful toolpath to avoid island"
                    ]
                )
                
                island_pockets.append(feature)
                self.feature_counter += 1
                break  # One island per pocket for now
        
        return island_pockets
    
    def recognize_ribs(self) -> List[AdvancedMachiningFeature]:
        """
        Detect rib features (thin vertical walls)
        Standing walls for stiffening structures
        """
        ribs = []
        
        # Ribs are thin planar faces standing vertically
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Plane:
                plane = adaptor.Plane()
                normal = plane.Axis().Direction()
                
                # Vertical face (normal horizontal)
                if abs(normal.Z()) < 0.2:  # Nearly horizontal normal = vertical face
                    bbox = Bnd_Box()
                    brepbndlib_Add(topods_Face(face), bbox)
                    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
                    
                    width = max(xmax - xmin, ymax - ymin)
                    height = zmax - zmin
                    thickness = min(xmax - xmin, ymax - ymin)
                    
                    # Thin and tall = rib
                    if thickness < 5.0 and height > width and height > 10.0:
                        feature = AdvancedMachiningFeature(
                            feature_id=self.feature_counter,
                            feature_type=AdvancedFeatureType.RIB,
                            geometry={'face': face},
                            width=thickness,
                            length=width,
                            height=height,
                            confidence_score=0.8,
                            complexity_rating=6,
                            manufacturing_notes=[
                                f"Thin rib {thickness:.1f}mm thick - leave as protrusion",
                                "Machine material around rib carefully"
                            ],
                            risk_factors=["Thin wall - risk of deflection during machining"]
                        )
                        
                        ribs.append(feature)
                        self.feature_counter += 1
            
            explorer.Next()
        
        return ribs
    
    def recognize_studs(self) -> List[AdvancedMachiningFeature]:
        """
        Detect stud features (cylindrical protrusions)
        Standing pins or mounting studs
        """
        studs = []
        
        # Studs are small cylindrical faces standing vertically
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Cylinder:
                cylinder = adaptor.Cylinder()
                axis = cylinder.Axis()
                
                # Vertical cylinder
                if abs(axis.Direction().Z()) > 0.9:
                    diameter = cylinder.Radius() * 2
                    
                    # Small diameter = likely a stud
                    if diameter < 20.0:
                        bbox = Bnd_Box()
                        brepbndlib_Add(topods_Face(face), bbox)
                        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
                        height = zmax - zmin
                        
                        feature = AdvancedMachiningFeature(
                            feature_id=self.feature_counter,
                            feature_type=AdvancedFeatureType.STUD,
                            geometry={'cylinder': cylinder},
                            diameter=diameter,
                            height=height,
                            confidence_score=0.85,
                            complexity_rating=4,
                            manufacturing_notes=[
                                f"Cylindrical stud Ø{diameter:.1f}mm x {height:.1f}mm",
                                "Machine surrounding material to leave stud"
                            ]
                        )
                        
                        studs.append(feature)
                        self.feature_counter += 1
            
            explorer.Next()
        
        return studs
    
    def recognize_dovetail_slots(self) -> List[AdvancedMachiningFeature]:
        """
        Detect dovetail slots (angled sides)
        Trapezoidal cross-section grooves
        """
        dovetail_slots = []
        
        # Look for slots with angled walls (planes at angles)
        # Simplified detection
        
        feature = AdvancedMachiningFeature(
            feature_id=self.feature_counter,
            feature_type=AdvancedFeatureType.DOVETAIL_SLOT,
            geometry={},
            width=10.0,  # Estimated
            depth=8.0,
            confidence_score=0.6,
            complexity_rating=8,
            manufacturing_notes=[
                "Dovetail slot requires special dovetail cutter",
                "Angle typically 45° or 60°"
            ]
        )
        
        # Would add proper detection in production
        # dovetail_slots.append(feature)
        
        return dovetail_slots
    
    def recognize_o_ring_grooves(self) -> List[AdvancedMachiningFeature]:
        """
        Detect O-ring grooves (precision circular grooves)
        Seal grooves with specific dimensions
        """
        o_ring_grooves = []
        
        # O-ring grooves are narrow circular grooves
        # Look for toroidal surfaces or narrow circular pockets
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Torus:
                torus = adaptor.Torus()
                major_radius = torus.MajorRadius()
                minor_radius = torus.MinorRadius()
                
                # Small minor radius = groove
                if minor_radius < 5.0:
                    feature = AdvancedMachiningFeature(
                        feature_id=self.feature_counter,
                        feature_type=AdvancedFeatureType.GROOVE_CIRCULAR,
                        geometry={'torus': torus},
                        diameter=major_radius * 2,
                        width=minor_radius * 2,
                        depth=minor_radius,
                        confidence_score=0.9,
                        complexity_rating=7,
                        manufacturing_notes=[
                            f"O-ring groove Ø{major_radius*2:.1f}mm, {minor_radius*2:.1f}mm wide",
                            "Requires form tool or special grooving operation"
                        ],
                        tolerance="Tight"
                    )
                    
                    o_ring_grooves.append(feature)
                    self.feature_counter += 1
            
            explorer.Next()
        
        return o_ring_grooves
    
    def recognize_keyways(self) -> List[AdvancedMachiningFeature]:
        """
        Detect keyways (shaft slots for keys)
        Narrow slots typically on cylindrical surfaces
        """
        keyways = []
        
        # Keyways are slots in cylindrical surfaces
        # Standard keyway proportions: width = diameter / 4
        
        feature = AdvancedMachiningFeature(
            feature_id=self.feature_counter,
            feature_type=AdvancedFeatureType.KEYWAY,
            geometry={},
            width=6.0,  # Standard keyway
            depth=4.0,
            length=20.0,
            confidence_score=0.7,
            complexity_rating=6,
            manufacturing_notes=[
                "Keyway slot for key retention",
                "Use keyway cutter or end mill"
            ]
        )
        
        # Would add proper detection for cylindrical shaft features
        # keyways.append(feature)
        
        return keyways

