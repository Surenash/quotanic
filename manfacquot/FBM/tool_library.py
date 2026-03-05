"""
Tool Library Module  
Comprehensive tool catalog and selection for FBM system
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import math


class ToolType(Enum):
    """Tool types available - Expanded library"""
    # Milling - Standard
    END_MILL = "End Mill"
    END_MILL_ROUGHING = "Roughing End Mill"
    END_MILL_FINISHING = "Finishing End Mill"
    END_MILL_HIGH_FEED = "High Feed End Mill"
    BALL_MILL = "Ball End Mill"
    BULL_NOSE = "Bull Nose End Mill"
    CORNER_RADIUS = "Corner Radius End Mill"
    
    # Milling - Face
    FACE_MILL = "Face Mill"
    FACE_MILL_INSERT = "Indexable Face Mill"
    FLY_CUTTER = "Fly Cutter"
    
    # Drilling
    DRILL = "Drill"
    DRILL_SPOT = "Spot Drill"
    DRILL_CENTER = "Center Drill"
    DRILL_STEP = "Step Drill"
    DRILL_CARBIDE = "Carbide Drill"
    
    # Reaming & Boring
    REAMER = "Reamer"
    REAMER_CHUCKING = "Chucking Reamer"
    BORING_BAR = "Boring Bar"
    BORING_HEAD = "Boring Head"
    
    # Threading
    THREAD_MILL = "Thread Mill"
    TAP = "Tap"
    TAP_SPIRAL = "Spiral Flute Tap"
    
    # Chamfering
    CHAMFER_MILL = "Chamfer Mill"
    DEBURR_TOOL = "Deburring Tool"
    
    # Specialty - Slots & Grooves
    T_SLOT_CUTTER = "T-Slot Cutter"
    SLOT_DRILL = "Slot Drill"
    DOVETAIL_CUTTER = "Dovetail Cutter"
    WOODRUFF_CUTTER = "Woodruff Keyseat Cutter"
    
    # Specialty - Radius & Contour
    RADIUS_CUTTER = "Radius Cutter"
    LOLLIPOP_CUTTER = "Lollipop Cutter"
    TAPERED_BALL = "Tapered Ball Nose"
    
    # Micro Machining
    MICRO_END_MILL = "Micro End Mill"
    MICRO_DRILL = "Micro Drill"
    
    # Long Reach
    LONG_REACH_EM = "Long Reach End Mill"
    LONG_NECK_BALL = "Long Neck Ball Mill"
    
    # Form Tools
    FORM_TOOL = "Form Tool"
    ENGRAVING_TOOL = "Engraving Tool"


class ToolMaterial(Enum):
    """Tool materials"""
    HSS = "High Speed Steel"
    CARBIDE = "Solid Carbide"
    COATED_CARBIDE = "Coated Carbide (TiN/TiAlN)"
    CERAMIC = "Ceramic"
    CBN = "Cubic Boron Nitride"
    PCD = "Polycrystalline Diamond"


@dataclass
class Tool:
    """Tool definition"""
    tool_id: str
    tool_type: ToolType
    diameter: float  # mm
    length: float  # mm (cutting length)
    overall_length: float  # mm
    number_of_flutes: int
    material: ToolMaterial
    suitable_materials: List[str]
    max_rpm: int
    cost: float  # USD
    tool_life_minutes: float  # Expected tool life
    in_stock: bool = True
    notes: str = ""


class ToolLibrary:
    """Tool library database and selection logic"""
    
    def __init__(self):
        self.tools = self._initialize_tool_library()
        
    def _initialize_tool_library(self) -> Dict[str, Tool]:
        """Initialize comprehensive tool catalog - EXPANDED"""
        tools = {}
        
        # ===== STANDARD END MILLS =====
        end_mill_sizes = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25]
        for diameter in end_mill_sizes:
            tool_id = f"EM-{diameter}mm-4F"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.END_MILL,
                diameter=diameter,
                length=diameter * 3,
                overall_length=diameter * 8,
                number_of_flutes=4,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass", "Plastic"],
                max_rpm=int(50000 / diameter),
                cost=15 + diameter * 2,
                tool_life_minutes=180
            )
        
        # ===== ROUGHING END MILLS (for heavy stock removal) =====
        roughing_sizes = [8, 10, 12, 16, 20, 25]
        for diameter in roughing_sizes:
            tool_id = f"EM-ROUGH-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.END_MILL_ROUGHING,
                diameter=diameter,
                length=diameter * 2.5,
                overall_length=diameter * 7,
                number_of_flutes=4,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel"],
                max_rpm=int(40000 / diameter),
                cost=25 + diameter * 3,
                tool_life_minutes=220,
                notes="Serrated edges for aggressive stock removal"
            )
        
        # ===== FINISHING END MILLS (polished, 6+ flutes) =====
        finishing_sizes = [3, 4, 5, 6, 8, 10, 12]
        for diameter in finishing_sizes:
            tool_id = f"EM-FINISH-{diameter}mm-6F"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.END_MILL_FINISHING,
                diameter=diameter,
                length=diameter * 2.5,
                overall_length=diameter * 7,
                number_of_flutes=6,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass"],
                max_rpm=int(55000 / diameter),
                cost=30 + diameter * 3,
                tool_life_minutes=160,
                notes="High flute count for superior finish"
            )
        
        # ===== HIGH-FEED END MILLS (shallow DOC, high feed) =====
        high_feed_sizes = [12, 16, 20, 25, 32]
        for diameter in high_feed_sizes:
            tool_id = f"EM-HIGHFEED-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.END_MILL_HIGH_FEED,
                diameter=diameter,
                length=diameter * 1.5,
                overall_length=diameter * 5,
                number_of_flutes=5,
                material=ToolMaterial.COATED_CARBIDE,
                suitable_materials=["Aluminum", "Steel"],
                max_rpm=int(35000 / diameter),
                cost=50 + diameter * 4,
                tool_life_minutes=200,
                notes="For high feed milling, shallow depth"
            )
        
        # ===== BALL END MILLS =====
        ball_mill_sizes = [1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16]
        for diameter in ball_mill_sizes:
            tool_id = f"BALL-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.BALL_MILL,
                diameter=diameter,
                length=diameter * 2.5,
                overall_length=diameter * 8,
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Plastic"],
                max_rpm=int(40000 / diameter),
                cost=25 + diameter * 3,
                tool_life_minutes=120,
                notes="For 3D contours and fillets"
            )
        
        # ===== BULL NOSE END MILLS (corner radius) =====
        bull_nose_specs = [(6, 0.5), (8, 1.0), (10, 1.0), (12, 2.0), (16, 2.0)]
        for diameter, radius in bull_nose_specs:
            tool_id = f"BULLNOSE-{diameter}mm-R{radius}"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.BULL_NOSE,
                diameter=diameter,
                length=diameter * 2.5,
                overall_length=diameter * 7,
                number_of_flutes=4,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel"],
                max_rpm=int(45000 / diameter),
                cost=35 + diameter * 3,
                tool_life_minutes=150,
                notes=f"R{radius}mm corner radius"
            )
        
        # ===== CORNER RADIUS END MILLS =====
        corner_rad_specs = [(6, 0.2), (8, 0.5), (10, 0.5), (12, 1.0)]
        for diameter, radius in corner_rad_specs:
            tool_id = f"CORNER-R{radius}-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.CORNER_RADIUS,
                diameter=diameter,
                length=diameter * 3,
                overall_length=diameter * 8,
                number_of_flutes=4,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Titanium"],
                max_rpm=int(48000 / diameter),
                cost=40 + diameter * 3,
                tool_life_minutes=175,
                notes=f"R{radius}mm corner, stronger than sharp corner"
            )
        
        # ===== DRILLS - Standard =====
        drill_sizes = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 6.8, 8, 10, 12, 14, 16, 20, 25]
        for diameter in drill_sizes:
            tool_id = f"DRILL-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.DRILL,
                diameter=diameter,
                length=diameter * 5,
                overall_length=diameter * 10,
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass", "Plastic"],
                max_rpm=int(30000 / diameter),
                cost=10 + diameter * 1.5,
                tool_life_minutes=300
            )
        
        # ===== SPOT DRILLS =====
        spot_drill_sizes = [6, 8, 10, 12, 16]
        for diameter in spot_drill_sizes:
            tool_id = f"SPOT-{diameter}mm-90deg"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.DRILL_SPOT,
                diameter=diameter,
                length=diameter * 1.5,
                overall_length=diameter * 5,
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass"],
                max_rpm=int(25000 / diameter),
                cost=20 + diameter * 2,
                tool_life_minutes=400,
                notes="90° spot drill for centering"
            )
        
        # ===== MICRO END MILLS =====
        micro_sizes = [0.1, 0.2, 0.3, 0.5, 0.8, 1.0]
        for diameter in micro_sizes:
            tool_id = f"MICRO-EM-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.MICRO_END_MILL,
                diameter=diameter,
                length=diameter * 4,
                overall_length=40,  # Standard shank
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Brass", "Plastic"],
                max_rpm=int(100000 / (diameter + 0.1)),
                cost=25 + diameter * 50,
                tool_life_minutes=60,
                notes="For micro machining, very fragile"
            )
        
        # ===== MICRO DRILLS =====
        micro_drill_sizes = [0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.5]
        for diameter in micro_drill_sizes:
            tool_id = f"MICRO-DRILL-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.MICRO_DRILL,
                diameter=diameter,
                length=diameter * 8,
                overall_length=40,
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Brass", "Plastic", "PCB"],
                max_rpm=int(80000 / (diameter + 0.1)),
                cost=15 + diameter * 40,
                tool_life_minutes=50,
                notes="Micro drilling, handle with care"
            )
        
        # ===== LONG REACH END MILLS =====
        long_reach_specs = [(6, 30), (8, 40), (10, 50), (12, 60)]
        for diameter, reach in long_reach_specs:
            tool_id = f"LONGREACH-{diameter}mm-L{reach}"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.LONG_REACH_EM,
                diameter=diameter,
                length=reach,
                overall_length=reach + diameter * 5,
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Plastic"],
                max_rpm=int(35000 / diameter),
                cost=60 + diameter * 5,
                tool_life_minutes=100,
                notes=f"Long reach {reach}mm, reduce feeds"
            )
        
        # ===== REAMERS =====
        reamer_sizes = [3, 4, 5, 6, 8, 10, 12, 16]
        for diameter in reamer_sizes:
            tool_id = f"REAMER-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.REAMER,
                diameter=diameter,
                length=diameter * 4,
                overall_length=diameter * 9,
                number_of_flutes=6,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass"],
                max_rpm=int(15000 / diameter),
                cost=40 + diameter * 4,
                tool_life_minutes=400,
                notes="For precision holes, H7 tolerance"
            )
        
        # ===== FACE MILLS =====
        face_mill_sizes = [25, 40, 50, 63, 80, 100, 125, 160]
        for diameter in face_mill_sizes:
            tool_id = f"FACE-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.FACE_MILL,
                diameter=diameter,
                length=diameter * 0.5,
                overall_length=diameter * 2,
                number_of_flutes=6,
                material=ToolMaterial.COATED_CARBIDE,
                suitable_materials=["Aluminum", "Steel"],
                max_rpm=int(20000 / diameter),
                cost=100 + diameter * 5,
                tool_life_minutes=600,
                notes="For large flat surfaces"
            )
        
        # ===== THREAD MILLS =====
        thread_specs = [
            ("M2", 2.0, 0.4), ("M2.5", 2.5, 0.45), ("M3", 3.0, 0.5),
            ("M4", 4.0, 0.7), ("M5", 5.0, 0.8), ("M6", 6.0, 1.0),
            ("M8", 8.0, 1.25), ("M10", 10.0, 1.5), ("M12", 12.0, 1.75),
            ("M14", 14.0, 2.0), ("M16", 16.0, 2.0), ("M20", 20.0, 2.5)
        ]
        for name, diameter, pitch in thread_specs:
            tool_id = f"THREAD-{name}"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.THREAD_MILL,
                diameter=pitch * 0.8,
                length=diameter * 2,
                overall_length=diameter * 6,
                number_of_flutes=3,
                material=ToolMaterial.COATED_CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Stainless"],
                max_rpm=int(25000 / diameter),
                cost=60 + diameter * 3,
                tool_life_minutes=200,
                notes=f"For {name}x{pitch} threads"
            )
        
        # ===== CHAMFER MILLS =====
        chamfer_angles = [30, 45, 60, 82, 90, 100, 120]
        for angle in chamfer_angles:
            tool_id = f"CHAMFER-{angle}deg"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.CHAMFER_MILL,
                diameter=12.0,
                length=20,
                overall_length=60,
                number_of_flutes=4,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass", "Plastic"],
                max_rpm=4000,
                cost=35,
                tool_life_minutes=250,
                notes=f"{angle}° chamfer/countersink"
            )
        
        # ===== T-SLOT CUTTERS =====
        t_slot_sizes = [6, 8, 10, 12, 14, 16, 18, 22]
        for width in t_slot_sizes:
            tool_id = f"TSLOT-{width}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.T_SLOT_CUTTER,
                diameter=width,
                length=width * 1.5,
                overall_length=width * 6,
                number_of_flutes=4,
                material=ToolMaterial.HSS,
                suitable_materials=["Aluminum", "Steel"],
                max_rpm=int(10000 / width),
                cost=60 + width * 2,
                tool_life_minutes=150,
                notes="For T-slot grooves"
            )
        
        # ===== SLOT DRILLS =====
        slot_sizes = [2, 3, 4, 5, 6, 8, 10, 12]
        for diameter in slot_sizes:
            tool_id = f"SLOT-{diameter}mm"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.SLOT_DRILL,
                diameter=diameter,
                length=diameter * 4,
                overall_length=diameter * 8,
                number_of_flutes=2,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Steel", "Brass"],
                max_rpm=int(35000 / diameter),
                cost=20 + diameter * 2,
                tool_life_minutes=200,
                notes="Can plunge like a drill"
            )
        
        # ===== ENGRAVING TOOLS =====
        engraving_angles = [30, 60, 90, 120]
        for angle in engraving_angles:
            tool_id = f"ENGRAVE-{angle}deg"
            tools[tool_id] = Tool(
                tool_id=tool_id,
                tool_type=ToolType.ENGRAVING_TOOL,
                diameter=0.1,  # Tip diameter
                length=10,
                overall_length=50,
                number_of_flutes=1,
                material=ToolMaterial.CARBIDE,
                suitable_materials=["Aluminum", "Brass", "Plastic"],
                max_rpm=20000,
                cost=35,
                tool_life_minutes=100,
                notes=f"{angle}° engraving tool"
            )
        
        return tools
    
    def find_tool(self, tool_type: ToolType, diameter: float, 
                  tolerance: float = 0.5) -> Optional[Tool]:
        """Find a tool matching type and diameter"""
        for tool in self.tools.values():
            if tool.tool_type == tool_type and tool.in_stock:
                if abs(tool.diameter - diameter) <= tolerance:
                    return tool
        return None
    
    def find_best_tool_for_feature(self, feature_type: str, 
                                   diameter: float,
                                   depth: float,
                                   material: str) -> Optional[Tool]:
        """Find optimal tool for a specific feature"""
        # Map feature types to tool types
        if "hole" in feature_type.lower():
            if "thread" in feature_type.lower():
                tool_type = ToolType.THREAD_MILL
            else:
                tool_type = ToolType.DRILL
        elif "pocket" in feature_type.lower() or "slot" in feature_type.lower():
            if depth > diameter * 2:
                tool_type = ToolType.SLOT_DRILL  # Can plunge
            else:
                tool_type = ToolType.END_MILL
        elif "face" in feature_type.lower() and diameter > 20:
            tool_type = ToolType.FACE_MILL
        elif "3d" in feature_type.lower() or "contour" in feature_type.lower():
            tool_type = ToolType.BALL_MILL
        elif "chamfer" in feature_type.lower():
            tool_type = ToolType.CHAMFER_MILL
        elif "t-slot" == feature_type.lower():
            tool_type = ToolType.T_SLOT_CUTTER
        else:
            tool_type = ToolType.END_MILL  # Default
        
        # Find matching tool
        tool = self.find_tool(tool_type, diameter)
        
        # Check if tool can handle the depth
        if tool and depth > tool.length:
            # Need a longer tool, try to find one
            for t in self.tools.values():
                if t.tool_type == tool_type and t.diameter == diameter and t.length >= depth:
                    return t
        
        return tool
    
    def suggest_alternative_tools(self, desired_diameter: float, 
                                  desired_type: ToolType) -> List[Tool]:
        """Suggest alternative tools if exact match not available"""
        alternatives = []
        
        for tool in self.tools.values():
            if tool.tool_type == desired_type and tool.in_stock:
                # Find tools within 20% of desired size
                if 0.8 * desired_diameter <= tool.diameter <= 1.2 * desired_diameter:
                    alternatives.append(tool)
        
        # Sort by proximity to desired diameter
        alternatives.sort(key=lambda t: abs(t.diameter - desired_diameter))
        
        return alternatives[:5]  # Top 5
    
    def calculate_tool_cost_per_operation(self, tool: Tool, 
                                          operation_time: float) -> float:
        """Calculate tool cost for a specific operation"""
        # Tool wear rate
        wear_rate = operation_time / tool.tool_life_minutes
        
        # Portion of tool cost
        cost_portion = tool.cost * wear_rate
        
        return round(cost_portion, 2)
    
    def estimate_remaining_tool_life(self, tool: Tool, 
                                    minutes_used: float) -> float:
        """Estimate remaining tool life percentage"""
        remaining = ((tool.tool_life_minutes - minutes_used) / tool.tool_life_minutes) * 100
        return max(0, min(100, remaining))
    
    def get_tools_by_type(self, tool_type: ToolType) -> List[Tool]:
        """Get all tools of a specific type"""
        return [t for t in self.tools.values() if t.tool_type == tool_type and t.in_stock]
    
    def get_all_available_diameters(self, tool_type: ToolType) -> List[float]:
        """Get all available diameters for a tool type"""
        tools = self.get_tools_by_type(tool_type)
        diameters = sorted(set(t.diameter for t in tools))
        return diameters
    
    def recommend_tool_for_material(self, material: str) -> List[str]:
        """Recommend best tool materials for given workpiece material"""
        recommendations = []
        
        if "aluminum" in material.lower():
            recommendations = [
                "Use sharp Carbide tools (2-3 flute for roughing, 4+ flute for finishing)",
                "PCD tools for long production runs",
                "Uncoated carbide preferred to prevent chip welding"
            ]
        elif "steel" in material.lower():
            if "stainless" in material.lower():
                recommendations = [
                    "Use Coated Carbide (TiAlN coating best)",
                    "Sharp tools essential - work hardens easily",
                    "Maintain positive chip load"
                ]
            else:
                recommendations = [
                    "Coated Carbide for best performance",
                    "HSS acceptable for low-volume",
                    "TiN or TiAlN coatings recommended"
                ]
        elif "titanium" in material.lower():
            recommendations = [
                "Carbide mandatory, preferably coated",
                "Sharp tools, avoid rubbing",
                "Aggressive coolant required"
            ]
        elif "plastic" in material.lower():
            recommendations = [
                "Sharp Carbide with polished flutes",
                "Diamond tools for abrasive plastics (carbon fiber)",
                "High helix angle for chip evacuation"
            ]
        
        return recommendations


# Singleton instance
tool_library = ToolLibrary()


# Example usage
if __name__ == "__main__":
    library = ToolLibrary()
    
    # Find a specific tool
    em10 = library.find_tool(ToolType.END_MILL, 10.0)
    if em10:
        print(f"Found: {em10.tool_id}")
        print(f"  Material: {em10.material.value}")
        print(f"  Flutes: {em10.number_of_flutes}")
        print(f"  Max RPM: {em10.max_rpm}")
        print(f"  Cost: ${em10.cost}")
        print(f"  Tool Life: {em10.tool_life_minutes} minutes")
    
    # Get all end mill sizes
    em_sizes = library.get_all_available_diameters(ToolType.END_MILL)
    print(f"\nAvailable End Mill sizes: {em_sizes}")
    
    # Find best tool for a feature
    best = library.find_best_tool_for_feature(
        feature_type="Rectangular Pocket",
        diameter=8.0,
        depth=15.0,
        material="Aluminum 6061"
    )
    if best:
        print(f"\nBest tool for 8mm pocket: {best.tool_id}")
    
    # Get recommendations for material
    recs = library.recommend_tool_for_material("Stainless Steel 304")
    print("\nRecommendations for Stainless Steel:")
    for rec in recs:
        print(f"  - {rec}")
