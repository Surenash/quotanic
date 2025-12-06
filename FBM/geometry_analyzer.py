"""
Geometry Analyzer Module
Advanced geometric analysis for FBM system
"""

from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopAbs import TopAbs_FACE, TopAbs_EDGE, TopAbs_SOLID, TopAbs_SHELL
from OCC.Core.BRepGProp import brepgprop_SurfaceProperties, brepgprop_VolumeProperties
from OCC.Core.GProp import GProp_GProps
from OCC.Core.BRep import BRep_Tool
from OCC.Core.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCC.Core.GeomAbs import GeomAbs_Plane, GeomAbs_Cylinder, GeomAbs_Cone
from OCC.Core.TopoDS import topods_Face, topods_Edge
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib_Add
from OCC.Core.gp import gp_Dir, gp_Vec
import math
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class GeometryAnalysis:
    """Results from geometry analysis"""
    has_undercuts: bool = False
    has_thin_walls: bool = False
    min_wall_thickness: float = 0.0
    draft_angles: List[float] = None
    accessibility_score: float = 1.0  # 0-1, 1 = fully accessible
    complexity_score: float = 0.0  # 0-10, higher = more complex
    manufacturing_risks: List[str] = None
    suggested_strategies: List[str] = None
    
    def __post_init__(self):
        if self.draft_angles is None:
            self.draft_angles = []
        if self.manufacturing_risks is None:
            self.manufacturing_risks = []
        if self.suggested_strategies is None:
            self.suggested_strategies = []


class GeometryAnalyzer:
    """Advanced geometric analysis for manufacturing"""
    
    def __init__(self, shape):
        self.shape = shape
        self.THIN_WALL_THRESHOLD = 1.5  # mm
        self.MIN_DRAFT_ANGLE = 1.0  # degrees
        
    def analyze_complete(self) -> GeometryAnalysis:
        """Run complete geometry analysis"""
        analysis = GeometryAnalysis()
        
        # Run all analysis methods
        analysis.has_undercuts = self.detect_undercuts()
        analysis.has_thin_walls, analysis.min_wall_thickness = self.analyze_wall_thickness()
        analysis.draft_angles = self.measure_draft_angles()
        analysis.accessibility_score = self.calculate_accessibility_score()
        analysis.complexity_score = self.calculate_complexity_score()
        
        # Generate risks and suggestions
        analysis.manufacturing_risks = self.identify_risks(analysis)
        analysis.suggested_strategies = self.suggest_strategies(analysis)
        
        return analysis
    
    def detect_undercuts(self) -> bool:
        """
        Detect undercut features that cannot be machined from top
        Undercuts require side machining, complex setups, or special tools
        """
        has_undercut = False
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            # Get face normal
            if adaptor.GetType() == GeomAbs_Plane:
                plane = adaptor.Plane()
                normal = plane.Axis().Direction()
                
                # If normal points downward significantly, it's an undercut
                if normal.Z() < -0.3:  # Facing downward
                    has_undercut = True
                    break
            
            explorer.Next()
        
        return has_undercut
    
    def analyze_wall_thickness(self) -> Tuple[bool, float]:
        """
        Analyze wall thickness to identify thin-wall features
        Returns: (has_thin_walls, minimum_thickness)
        """
        # Get bounding box
        bbox = Bnd_Box()
        brepbndlib_Add(self.shape, bbox)
        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
        
        # Estimate minimum wall thickness (simplified)
        # In production, would use more sophisticated ray-casting
        dimensions = [xmax - xmin, ymax - ymin, zmax - zmin]
        min_dimension = min(dimensions)
        
        has_thin_walls = min_dimension < self.THIN_WALL_THRESHOLD
        
        return has_thin_walls, min_dimension
    
    def measure_draft_angles(self) -> List[float]:
        """
        Measure draft angles on angled surfaces
        Draft angles are important for mold/die work
        """
        draft_angles = []
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            # Check for conical surfaces (have draft)
            if adaptor.GetType() == GeomAbs_Cone:
                cone = adaptor.Cone()
                # Cone semi-angle is the draft angle
                semi_angle = cone.SemiAngle()
                draft_angle = math.degrees(semi_angle)
                draft_angles.append(draft_angle)
            
            explorer.Next()
        
        return draft_angles
    
    def calculate_accessibility_score(self) -> float:
        """
        Calculate how accessible features are for machining
        1.0 = fully accessible from top, 0.0 = very difficult
        """
        score = 1.0
        
        # Count faces by orientation
        top_facing = 0
        side_facing = 0
        bottom_facing = 0
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            
            if adaptor.GetType() == GeomAbs_Plane:
                plane = adaptor.Plane()
                normal = plane.Axis().Direction()
                z_comp = abs(normal.Z())
                
                if z_comp > 0.9:
                    if normal.Z() > 0:
                        top_facing += 1
                    else:
                        bottom_facing += 1
                elif z_comp < 0.3:
                    side_facing += 1
            
            explorer.Next()
        
        total_faces = top_facing + side_facing + bottom_facing
        if total_faces > 0:
            # Reduce score for side and bottom faces
            score = (top_facing + 0.5 * side_facing) / total_faces
        
        return score
    
    def calculate_complexity_score(self) -> float:
        """
        Calculate overall complexity (0-10 scale)
        Higher = more complex/difficult to machine
        """
        score = 0.0
        
        # Count different surface types
        planar_count = 0
        cylindrical_count = 0
        complex_count = 0
        
        explorer = TopExp_Explorer(self.shape, TopAbs_FACE)
        while explorer.More():
            face = explorer.Current()
            adaptor = BRepAdaptor_Surface(topods_Face(face))
            surf_type = adaptor.GetType()
            
            if surf_type == GeomAbs_Plane:
                planar_count += 1
            elif surf_type == GeomAbs_Cylinder:
                cylindrical_count += 1
            else:
                complex_count += 1
            
            explorer.Next()
        
        total_faces = planar_count + cylindrical_count + complex_count
        if total_faces > 0:
            # More complex surfaces = higher score
            score += (complex_count / total_faces) * 5.0
            
            # Many features = higher score
            if total_faces > 20:
                score += 2.0
            elif total_faces > 10:
                score += 1.0
        
        return min(score, 10.0)
    
    def identify_risks(self, analysis: GeometryAnalysis) -> List[str]:
        """Identify manufacturing risks based on analysis"""
        risks = []
        
        if analysis.has_undercuts:
            risks.append("Undercuts detected - may require special tooling or multiple setups")
        
        if analysis.has_thin_walls:
            risks.append(f"Thin walls detected ({analysis.min_wall_thickness:.1f}mm) - risk of deflection/chatter")
        
        if analysis.accessibility_score < 0.5:
            risks.append("Poor accessibility - may require 4/5-axis machining")
        
        if analysis.complexity_score > 7.0:
            risks.append("High complexity - extended programming and machining time")
        
        for angle in analysis.draft_angles:
            if angle < self.MIN_DRAFT_ANGLE:
                risks.append(f"Low draft angle ({angle:.1f}°) - may be difficult to machine")
        
        return risks
    
    def suggest_strategies(self, analysis: GeometryAnalysis) -> List[str]:
        """Suggest machining strategies based on analysis"""
        strategies = []
        
        if analysis.has_thin_walls:
            strategies.append("Use light depth of cut and multiple passes")
            strategies.append("Consider climb milling to reduce cutting forces")
            strategies.append("Use sharp tools to minimize deflection")
        
        if analysis.has_undercuts:
            strategies.append("Evaluate if undercuts can be accessed with angled tools")
            strategies.append("Consider additional setups or part rotation")
        
        if analysis.complexity_score > 7.0:
            strategies.append("Break into multiple operations with tool changes")
            strategies.append("Use adaptive clearing for efficient roughing")
        
        if analysis.accessibility_score < 0.7:
            strategies.append("Consider 4-axis or 5-axis machining")
            strategies.append("Optimize fixture design for better access")
        
        return strategies
    
    def analyze_feature_accessibility(self, feature_geometry: Dict, normal: gp_Dir) -> Dict:
        """
        Detailed accessibility analysis for a specific feature
        Returns tool requirements and approach recommendations
        """
        accessibility = {
            'approach_direction': 'top',
            'requires_special_tool': False,
            'minimum_tool_length': 0.0,
            'clearance_issues': False,
            'recommended_tool_angle': 0.0
        }
        
        # Determine approach direction
        z_comp = abs(normal.Z())
        if z_comp > 0.9:
            accessibility['approach_direction'] = 'top' if normal.Z() > 0 else 'bottom'
        elif z_comp < 0.3:
            accessibility['approach_direction'] = 'side'
        else:
            accessibility['approach_direction'] = 'angled'
            accessibility['requires_special_tool'] = True
            accessibility['recommended_tool_angle'] = math.degrees(math.acos(abs(normal.Z())))
        
        return accessibility
