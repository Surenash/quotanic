"""
Toolpath Optimizer Module
Advanced toolpath optimization strategies for FBM system
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import math


class ToolpathStrategy(Enum):
    """Advanced toolpath strategies"""
    ZIGZAG = "Zigzag"
    SPIRAL_IN = "Spiral Inward"
    SPIRAL_OUT = "Spiral Outward"
    ADAPTIVE = "Adaptive Clearing"
    TROCHOIDAL = "Trochoidal Milling"
    MORPHED_SPIRAL = "Morphed Spiral"
    CONSTANT_ENGAGEMENT = "Constant Engagement"
    ONE_WAY = "One-Way Cutting"
    RASTER = "Raster Pattern"


class MillingType(Enum):
    """Milling direction"""
    CLIMB = "Climb Milling"
    CONVENTIONAL = "Conventional Milling"
    MIXED = "Mixed"


@dataclass
class ToolEngagement:
    """Tool engagement analysis"""
    engagement_angle: float  # degrees
    radial_depth: float  # mm
    axial_depth: float  # mm
    chip_thinning_factor: float  # 0-1
    cutting_force_factor: float  # relative to full engagement
    recommended_feed_adjustment: float  # multiplier


@dataclass
class RestMachiningArea:
    """Area left by previous operations"""
    area_id: int
    previous_tool_diameter: float
    remaining_stock: float  # mm
    location: Tuple[float, float, float]
    size:Tuple[float, float]  # width x length
    accessible_from_top: bool


class ToolpathOptimizer:
    """Advanced toolpath optimization"""
    
    def __init__(self):
        self.MAX_ENGAGEMENT_ANGLE = 180.0  # degrees
        self.OPTIMAL_ENGAGEMENT_ANGLE = 90.0  # degrees for best tool life
        self.TROCHOIDAL_DIAMETER_RATIO = 0.15  # trochoidal loop diameter
        
    def analyze_tool_engagement(self, tool_diameter: float, 
                                stepover: float, 
                                depth_of_cut: float,
                                feature_width: float = None) -> ToolEngagement:
        """
        Analyze tool engagement conditions
        Returns engagement parameters and recommended adjustments
        """
        # Calculate radial engagement
        radial_engagement = stepover
        radial_engagement_pct = (radial_engagement / tool_diameter) * 100
        
        # Calculate engagement angle
        if radial_engagement >= tool_diameter:
            engagement_angle = 180.0  # Full width cut
        else:
            # Arc cosine formula for engagement angle
            engagement_angle = math.degrees(2 * math.asin(min(radial_engagement / (2 * (tool_diameter / 2)), 1.0)))
        
        # Chip thinning factor (chips are thinner at lower engagement)
        chip_thinning = math.sin(math.radians(engagement_angle / 2))
        
        # Estimate cutting force (lower at lower engagement)
        force_factor = (engagement_angle / 180.0) * (depth_of_cut / tool_diameter)
        
        # Feed rate adjustment recommendation
        # Can increase feed at lower engagement due to reduced load
        if engagement_angle < 90:
            feed_adjustment = 1.0 / chip_thinning  # Compensate for chip thinning
        elif engagement_angle > 135:
            feed_adjustment = 0.8  # Reduce feed at high engagement
        else:
            feed_adjustment = 1.0
        
        return ToolEngagement(
            engagement_angle=engagement_angle,
            radial_depth=radial_engagement,
            axial_depth=depth_of_cut,
            chip_thinning_factor=chip_thinning,
            cutting_force_factor=force_factor,
            recommended_feed_adjustment=feed_adjustment
        )
    
    def recommend_milling_type(self, material_hardness: str, 
                               feature_type: str,
                               tool_rigidity: str = "standard") -> MillingType:
        """
        Recommend climb vs conventional milling
        
        Climb milling (down milling):
        - Better surface finish
        - Less work hardening
        - Requires rigid setup
        - Good for hard materials
        
        Conventional milling (up milling):
        - More forgiving of backlash
        - Better for soft materials
        - Can work with less rigid setups
        """
        # Hard materials benefit from climb milling
        if "HRC" in material_hardness or "hardened" in material_hardness.lower():
            return MillingType.CLIMB
        
        # Roughing can use conventional for stability
        if "rough" in feature_type.lower():
            return MillingType.CONVENTIONAL
        
        # Finishing should use climb for better surface
        if "finish" in feature_type.lower():
            return MillingType.CLIMB
        
        # Default to climb for modern machines
        return MillingType.CLIMB
    
    def calculate_trochoidal_parameters(self, slot_width: float, 
                                       tool_diameter: float,
                                       target_feed_rate: float) -> Dict:
        """
        Calculate parameters for trochoidal milling
        Trochoidal milling: Circular tool motion for deep slots
        
        Benefits:
        - Reduced tool deflection
        - Better chip evacuation
        - Higher feed rates possible
        - Less heat generation
        """
        # Trochoidal loop diameter (typically 10-20% of tool diameter)
        loop_diameter = tool_diameter * self.TROCHOIDAL_DIAMETER_RATIO
        
        # Step forward per loop
        if slot_width < tool_diameter * 1.2:
            # Narrow slot - small steps
            step_forward = tool_diameter * 0.1
        else:
            # Wider slot - larger steps
            step_forward = tool_diameter * 0.3
        
        # Calculate effective engagement
        engagement_width = loop_diameter
        
        # Number of loops per distance
        loops_per_mm = 1.0 / step_forward
        
        # Feed adjustment (can increase due to low engagement)
        feed_multiplier = 1.5  # 50% faster than conventional
        
        return {
            "loop_diameter": loop_diameter,
            "step_forward": step_forward,
            "engagement_width": engagement_width,
            "feed_multiplier": feed_multiplier,
            "loops_per_mm": loops_per_mm,
            "notes": "Trochoidal milling reduces tool deflection and heat"
        }
    
    def detect_rest_machining_areas(self, feature_geometry: Dict,
                                    previous_operations: List) -> List[RestMachiningArea]:
        """
        Detect areas left by previous operations (rest machining)
        
        Rest machining is material left behind by larger tools that
        couldn't reach into corners or small features
        """
        rest_areas = []
        
        # Simple heuristic: if current feature is smaller than previous tool
        # there will be rest material in corners
        
        if not previous_operations:
            return rest_areas
        
        # Get smallest previous tool used
        previous_tool_sizes = [op.tool_diameter for op in previous_operations 
                              if hasattr(op, 'tool_diameter')]
        
        if not previous_tool_sizes:
            return rest_areas
        
        min_previous_tool = min(previous_tool_sizes)
        
        # Estimate rest material in corners
        # For rectangular pockets, corners will have radius = previous tool radius
        if 'width' in feature_geometry and 'length' in feature_geometry:
            width = feature_geometry.get('width', 0)
            length = feature_geometry.get('length', 0)
            
            # Each corner has rest material
            corner_radius = min_previous_tool / 2
            remaining_stock = corner_radius
            
            # Create rest areas for each corner
            corners = [
                (-width/2 + corner_radius, -length/2 + corner_radius),
                (width/2 - corner_radius, -length/2 + corner_radius),
                (-width/2 + corner_radius, length/2 - corner_radius),
                (width/2 - corner_radius, length/2 - corner_radius)
            ]
            
            for i, (x, y) in enumerate(corners):
                rest_area = RestMachiningArea(
                    area_id=i,
                    previous_tool_diameter=min_previous_tool,
                    remaining_stock=remaining_stock,
                    location=(x, y, 0),
                    size=(corner_radius * 2, corner_radius * 2),
                    accessible_from_top=True
                )
                rest_areas.append(rest_area)
        
        return rest_areas
    
    def optimize_tool_sequence(self, required_tools: List[Tuple[str, float]],
                              minimize_changes: bool = True) -> List[Tuple[str, float]]:
        """
        Optimize tool change sequence
        
        Strategy:
        1. Group operations by tool
        2. Order by tool diameter (large to small for roughing)
        3. Minimize tool changes
        """
        if not minimize_changes:
            return required_tools
        
        # Group by tool type and diameter
        tool_groups = {}
        for tool_type, diameter in required_tools:
            key = (tool_type, diameter)
            tool_groups[key] = tool_groups.get(key, 0) + 1
        
        # Sort by frequency (most used first) then by diameter (large to small)
        optimized = sorted(tool_groups.keys(), 
                          key=lambda x: (-tool_groups[x], -x[1]))
        
        return optimized
    
    def calculate_air_time_reduction(self, operations: List) -> Dict:
        """
        Analyze and reduce non-cutting air moves
        
        Strategies:
        - Optimize approach/retract heights
        - Minimize rapid moves
        - Group nearby operations
        """
        if not operations:
            return {}
        
        # Calculate total rapid move distance (simplified)
        total_rapids = 0
        cutting_time = 0
        
        for op in operations:
            if hasattr(op, 'estimated_time'):
                cutting_time += op.estimated_time
            # Estimate rapid moves between operations (simplified)
            total_rapids += 2.0  # Approach + retract per operation
        
        # Estimate rapid time (assume 5000 mm/min rapid rate)
        rapid_time = total_rapids  # minutes (simplified)
        
        # Potential savings by optimizing
        potential_savings = rapid_time * 0.3  # 30% reduction possible
        
        return {
            "total_rapid_time": rapid_time,
            "total_cutting_time": cutting_time,
            "potential_time_savings": potential_savings,
            "optimization_percentage": 30.0,
            "recommendations": [
                "Reduce clearance heights where safe",
                "Group operations by proximity",
                "Optimize tool change locations"
            ]
        }
    
    def recommend_adaptive_stepdown(self, material_hardness: str,
                                    tool_diameter: float,
                                    feature_depth: float) -> List[float]:
        """
        Calculate adaptive depth of cut for multi-pass operations
        
        Strategy:
        - Larger depths for initial passes
        - Smaller depths as approaching final depth
        - Considers material and tool size
        """
        # Base DoC on tool diameter
        max_doc = tool_diameter * 0.5
        min_doc = tool_diameter * 0.1
        
        # Adjust for material hardness
        if "HRC" in material_hardness:
            max_doc *= 0.6  # Reduce for hard materials
        
        # Calculate number of passes needed
        num_passes = math.ceil(feature_depth / max_doc)
        
        # Generate adaptive stepdown schedule
        stepdowns = []
        remaining_depth = feature_depth
        
        for i in range(num_passes):
            if i < num_passes - 1:
                # Earlier passes use larger DoC
                doc = min(max_doc * (1.0 - i * 0.1), remaining_depth)
            else:
                # Final pass uses whatever remains
                doc = remaining_depth
            
            stepdowns.append(round(doc, 2))
            remaining_depth -= doc
        
        return stepdowns
    
    def calculate_high_speed_parameters(self, base_cutting_speed: float,
                                       tool_diameter: float,
                                       material: str) -> Dict:
        """
        Calculate high-speed machining (HSM) parameters
        
        HSM characteristics:
        - Higher spindle speeds
        - Lower radial engagement
        - Higher feed rates
        - Adaptive toolpaths
        """
        # HSM typically 2-4x conventional speeds for soft materials
        if "aluminum" in material.lower() or "plastic" in material.lower():
            hsm_speed_multiplier = 3.0
            hsm_feed_multiplier = 2.0
        elif "steel" in material.lower():
            hsm_speed_multiplier = 1.5
            hsm_feed_multiplier = 1.3
        else:
            hsm_speed_multiplier = 2.0
            hsm_feed_multiplier = 1.5
        
        hsm_cutting_speed = base_cutting_speed * hsm_speed_multiplier
        
        # Calculate HSM spindle speed
        hsm_rpm = (hsm_cutting_speed * 1000) / (math.pi * tool_diameter)
        
        return {
            "cutting_speed": hsm_cutting_speed,
            "spindle_rpm": hsm_rpm,
            "feed_multiplier": hsm_feed_multiplier,
            "radial_engagement": tool_diameter * 0.1,  # 10% for HSM
            "axial_engagement": tool_diameter * 0.3,  # 30% for HSM
            "strategy": "Adaptive with constant engagement",
            "benefits": [
                "Reduced cutting forces",
                "Better surface finish",
                "Longer tool life",
                "Higher metal removal rates"
            ]
        }


# Singleton instance
toolpath_optimizer = ToolpathOptimizer()


# Example usage
if __name__ == "__main__":
    optimizer = ToolpathOptimizer()
    
    # Test tool engagement analysis
    engagement = optimizer.analyze_tool_engagement(
        tool_diameter=10.0,
        stepover=4.0,
        depth_of_cut=5.0
    )
    
    print("Tool Engagement Analysis:")
    print(f"  Engagement Angle: {engagement.engagement_angle:.1f}°")
    print(f"  Chip Thinning Factor: {engagement.chip_thinning_factor:.2f}")
    print(f"  Feed Adjustment: {engagement.recommended_feed_adjustment:.2f}x")
    
    # Test trochoidal parameters
    troch = optimizer.calculate_trochoidal_parameters(
        slot_width=12.0,
        tool_diameter=8.0,
        target_feed_rate=500
    )
    
    print("\nTrochoidal Milling Parameters:")
    print(f"  Loop Diameter: {troch['loop_diameter']:.2f}mm")
    print(f"  Step Forward: {troch['step_forward']:.2f}mm")
    print(f"  Feed Multiplier: {troch['feed_multiplier']:.1f}x")
    
    # Test HSM parameters
    hsm = optimizer.calculate_high_speed_parameters(
        base_cutting_speed=200,
        tool_diameter=10.0,
        material="Aluminum 6061"
    )
    
    print("\nHigh-Speed Machining Parameters:")
    print(f"  Cutting Speed: {hsm['cutting_speed']:.0f} m/min")
    print(f"  Spindle RPM: {hsm['spindle_rpm']:.0f}")
    print(f"  Radial Engagement: {hsm['radial_engagement']:.1f}mm")
