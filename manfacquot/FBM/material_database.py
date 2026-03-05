"""
Material Database Module
Material-specific machining parameters for FBM system
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum


class MaterialType(Enum):
    """Common machining materials - Expanded library"""
    # Aluminum Alloys
    ALUMINUM_6061 = "Aluminum 6061"
    ALUMINUM_7075 = "Aluminum 7075"
    ALUMINUM_2024 = "Aluminum 2024 (Aircraft)"
    ALUMINUM_5083 = "Aluminum 5083 (Marine)"
    ALUMINUM_MIC6 = "Aluminum MIC-6 (Cast Plate)"
    
    # Steels - Mild/Low Carbon
    STEEL_MILD = "Mild Steel (1018)"
    STEEL_1045 = "Steel 1045 (Medium Carbon)"
    STEEL_4140 = "Steel 4140 (Alloy)"
    
    # Steels - Stainless
    STEEL_STAINLESS_304 = "Stainless Steel 304"
    STEEL_STAINLESS_316 = "Stainless Steel 316"
    STEEL_STAINLESS_17_4PH = "Stainless Steel 17-4PH"
    
    # Steels - Tool Steels
    STEEL_TOOL = "Tool Steel (D2)"
    STEEL_A2 = "Tool Steel (A2)"
    STEEL_O1 = "Tool Steel (O1)"
    
    # Titanium Alloys
    TITANIUM_6AL4V = "Titanium 6Al-4V (Grade 5)"
    TITANIUM_CP = "Titanium CP (Grade 2)"
    
    # Nickel Alloys
    INCONEL_718 = "Inconel 718"
    MONEL_400 = "Monel 400"
    
    # Non-Ferrous
    BRASS = "Brass"
    BRONZE = "Bronze"
    COPPER = "Copper"
    
    # Plastics - Engineering
    PLASTIC_ABS = "ABS Plastic"
    PLASTIC_DELRIN = "Delrin (Acetal)"
    PLASTIC_PEEK = "PEEK"
    PLASTIC_NYLON = "Nylon 6/6"
    PLASTIC_POLYCARBONATE = "Polycarbonate"
    PLASTIC_ULTEM = "ULTEM (PEI)"
    
    # Composites
    CARBON_FIBER = "Carbon Fiber Composite"
    G10_FR4 = "G10/FR4 (Fiberglass)"


class ToolMaterial(Enum):
    """Cutting tool materials"""
    HSS = "High Speed Steel"
    CARBIDE = "Carbide"
    COATED_CARBIDE = "Coated Carbide"
    CERAMIC = "Ceramic"
    CBN = "Cubic Boron Nitride"
    PCD = "Polycrystalline Diamond"


@dataclass
class CuttingParameters:
    """Cutting parameters for material/tool combination"""
    cutting_speed_min: float  # m/min - minimum
    cutting_speed_max: float  # m/min - maximum
    feed_per_tooth_min: float  # mm/tooth - minimum
    feed_per_tooth_max: float  # mm/tooth - maximum
    depth_of_cut_factor: float  # multiplier of tool diameter
    stepover_factor: float  # percentage of tool diameter
    coolant_type: str  # Flood, Mist, Air, None
    notes: str = ""


@dataclass
class MaterialProperties:
    """Physical and machining properties of material"""
    density: float  # g/cm³
    hardness: str  # Brinell or Rockwell
    tensile_strength: float  # MPa
    machinability_rating: int  # 1-10, 10=easiest
    chip_formation: str  # Continuous, Discontinuous, Segmented
    thermal_conductivity: float  # W/m·K
    heat_affected: bool  # True if work hardening/heat affected


class MaterialDatabase:
    """Database of materials and their machining parameters"""
    
    def __init__(self):
        self.materials = self._initialize_materials()
        self.cutting_params = self._initialize_cutting_parameters()
        
    def _initialize_materials(self) -> Dict[MaterialType, MaterialProperties]:
        """Initialize material properties database"""
        return {
            # ALUMINUM ALLOYS
            MaterialType.ALUMINUM_6061: MaterialProperties(
                density=2.70,
                hardness="95 HB",
                tensile_strength=310,
                machinability_rating=9,
                chip_formation="Continuous",
                thermal_conductivity=167,
                heat_affected=False
            ),
            MaterialType.ALUMINUM_7075: MaterialProperties(
                density=2.81,
                hardness="150 HB",
                tensile_strength=572,
                machinability_rating=7,
                chip_formation="Continuous",
                thermal_conductivity=130,
                heat_affected=False
            ),
            MaterialType.ALUMINUM_2024: MaterialProperties(
                density=2.78,
                hardness="120 HB",
                tensile_strength=469,
                machinability_rating=8,
                chip_formation="Continuous",
                thermal_conductivity=121,
                heat_affected=False
            ),
            MaterialType.ALUMINUM_5083: MaterialProperties(
                density=2.66,
                hardness="85 HB",
                tensile_strength=317,
                machinability_rating=8,
                chip_formation="Continuous",
                thermal_conductivity=117,
                heat_affected=False
            ),
            MaterialType.ALUMINUM_MIC6: MaterialProperties(
                density=2.70,
                hardness="75 HB",
                tensile_strength=227,
                machinability_rating=9,
                chip_formation="Continuous",
                thermal_conductivity=155,
                heat_affected=False
            ),
            
            # MILD/CARBON STEELS
            MaterialType.STEEL_MILD: MaterialProperties(
                density=7.85,
                hardness="120 HB",
                tensile_strength=440,
                machinability_rating=7,
                chip_formation="Continuous",
                thermal_conductivity=51,
                heat_affected=True
            ),
            MaterialType.STEEL_1045: MaterialProperties(
                density=7.85,
                hardness="170 HB",
                tensile_strength=625,
                machinability_rating=6,
                chip_formation="Continuous",
                thermal_conductivity=49,
                heat_affected=True
            ),
            MaterialType.STEEL_4140: MaterialProperties(
                density=7.85,
                hardness="210 HB",
                tensile_strength=655,
                machinability_rating=6,
                chip_formation="Continuous",
                thermal_conductivity=42,
                heat_affected=True
            ),
            
            # STAINLESS STEELS
            MaterialType.STEEL_STAINLESS_304: MaterialProperties(
                density=8.00,
                hardness="201 HB",
                tensile_strength=515,
                machinability_rating=5,
                chip_formation="Continuous",
                thermal_conductivity=16,
                heat_affected=True
            ),
            MaterialType.STEEL_STAINLESS_316: MaterialProperties(
                density=8.00,
                hardness="217 HB",
                tensile_strength=579,
                machinability_rating=4,
                chip_formation="Continuous",
                thermal_conductivity=16,
                heat_affected=True
            ),
            MaterialType.STEEL_STAINLESS_17_4PH: MaterialProperties(
                density=7.81,
                hardness="38 HRC",
                tensile_strength=1310,
                machinability_rating=4,
                chip_formation="Segmented",
                thermal_conductivity=18,
                heat_affected=True
            ),
            
            # TOOL STEELS
            MaterialType.STEEL_TOOL: MaterialProperties(
                density=7.70,
                hardness="60 HRC",
                tensile_strength=2200,
                machinability_rating=3,
                chip_formation="Segmented",
                thermal_conductivity=20,
                heat_affected=True
            ),
            MaterialType.STEEL_A2: MaterialProperties(
                density=7.86,
                hardness="57 HRC",
                tensile_strength=1930,
                machinability_rating=4,
                chip_formation="Segmented",
                thermal_conductivity=21,
                heat_affected=True
            ),
            MaterialType.STEEL_O1: MaterialProperties(
                density=7.85,
                hardness="55 HRC",
                tensile_strength=1790,
                machinability_rating=5,
                chip_formation="Segmented",
                thermal_conductivity=46,
                heat_affected=True
            ),
            
            # TITANIUM ALLOYS
            MaterialType.TITANIUM_6AL4V: MaterialProperties(
                density=4.43,
                hardness="36 HRC",
                tensile_strength=950,
                machinability_rating=4,
                chip_formation="Segmented",
                thermal_conductivity=7,
                heat_affected=True
            ),
            MaterialType.TITANIUM_CP: MaterialProperties(
                density=4.51,
                hardness="200 HB",
                tensile_strength=434,
                machinability_rating=5,
                chip_formation="Continuous",
                thermal_conductivity=17,
                heat_affected=True
            ),
            
            # NICKEL ALLOYS
            MaterialType.INCONEL_718: MaterialProperties(
                density=8.19,
                hardness="40 HRC",
                tensile_strength=1375,
                machinability_rating=2,
                chip_formation="Continuous",
                thermal_conductivity=11,
                heat_affected=True
            ),
            MaterialType.MONEL_400: MaterialProperties(
                density=8.80,
                hardness="150 HB",
                tensile_strength=550,
                machinability_rating=3,
                chip_formation="Continuous",
                thermal_conductivity=22,
                heat_affected=True
            ),
            
            # NON-FERROUS
            MaterialType.BRASS: MaterialProperties(
                density=8.50,
                hardness="60 HB",
                tensile_strength=340,
                machinability_rating=10,
                chip_formation="Discontinuous",
                thermal_conductivity=120,
                heat_affected=False
            ),
            MaterialType.BRONZE: MaterialProperties(
                density=8.90,
                hardness="75 HB",
                tensile_strength=380,
                machinability_rating=9,
                chip_formation="Discontinuous",
                thermal_conductivity=42,
                heat_affected=False
            ),
            MaterialType.COPPER: MaterialProperties(
                density=8.96,
                hardness="45 HB",
                tensile_strength=220,
                machinability_rating=8,
                chip_formation="Continuous",
                thermal_conductivity=385,
                heat_affected=False
            ),
            
            # PLASTICS - ENGINEERING
            MaterialType.PLASTIC_ABS: MaterialProperties(
                density=1.04,
                hardness="N/A",
                tensile_strength=45,
                machinability_rating=10,
                chip_formation="Continuous",
                thermal_conductivity=0.17,
                heat_affected=True  # Melts
            ),
            MaterialType.PLASTIC_DELRIN: MaterialProperties(
                density=1.42,
                hardness="M94",
                tensile_strength=70,
                machinability_rating=10,
                chip_formation="Continuous",
                thermal_conductivity=0.23,
                heat_affected=True
            ),
            MaterialType.PLASTIC_PEEK: MaterialProperties(
                density=1.32,
                hardness="M99",
                tensile_strength=97,
                machinability_rating=9,
                chip_formation="Continuous",
                thermal_conductivity=0.25,
                heat_affected=True
            ),
            MaterialType.PLASTIC_NYLON: MaterialProperties(
                density=1.15,
                hardness="R118",
                tensile_strength=82,
                machinability_rating=9,
                chip_formation="Continuous",
                thermal_conductivity=0.25,
                heat_affected=True
            ),
            MaterialType.PLASTIC_POLYCARBONATE: MaterialProperties(
                density=1.20,
                hardness="M75",
                tensile_strength=65,
                machinability_rating=9,
                chip_formation="Continuous",
                thermal_conductivity=0.20,
                heat_affected=True
            ),
            MaterialType.PLASTIC_ULTEM: MaterialProperties(
                density=1.27,
                hardness="M109",
                tensile_strength=103,
                machinability_rating=8,
                chip_formation="Continuous",
                thermal_conductivity=0.22,
                heat_affected=True
            ),
            
            # COMPOSITES
            MaterialType.CARBON_FIBER: MaterialProperties(
                density=1.60,
                hardness="N/A",
                tensile_strength=600,
                machinability_rating=6,
                chip_formation="Discontinuous",
                thermal_conductivity=0.80,
                heat_affected=False
            ),
            MaterialType.G10_FR4: MaterialProperties(
                density=1.85,
                hardness="M110",
                tensile_strength=310,
                machinability_rating=7,
                chip_formation="Discontinuous",
                thermal_conductivity=0.30,
                heat_affected=False
            ),
        }
    
    def _initialize_cutting_parameters(self) -> Dict[Tuple[MaterialType, ToolMaterial], CuttingParameters]:
        """Initialize cutting parameter tables"""
        params = {}
        
        # Aluminum 6061 with Carbide
        params[(MaterialType.ALUMINUM_6061, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=200,
            cutting_speed_max=500,
            feed_per_tooth_min=0.05,
            feed_per_tooth_max=0.25,
            depth_of_cut_factor=0.5,  # 50% of diameter
            stepover_factor=0.45,  # 45% stepover
            coolant_type="Mist",
            notes="High speed, watch for chip welding"
        )
        
        # Aluminum 7075 with Carbide
        params[(MaterialType.ALUMINUM_7075, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=180,
            cutting_speed_max=400,
            feed_per_tooth_min=0.04,
            feed_per_tooth_max=0.20,
            depth_of_cut_factor=0.4,
            stepover_factor=0.40,
            coolant_type="Mist",
            notes="Harder than 6061, reduce speeds slightly"
        )
        
        # Mild Steel with Carbide
        params[(MaterialType.STEEL_MILD, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=80,
            cutting_speed_max=150,
            feed_per_tooth_min=0.05,
            feed_per_tooth_max=0.20,
            depth_of_cut_factor=0.4,
            stepover_factor=0.40,
            coolant_type="Flood",
            notes="Use heavy flood coolant"
        )
        
        # Stainless Steel 304 with Carbide
        params[(MaterialType.STEEL_STAINLESS_304, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=50,
            cutting_speed_max=100,
            feed_per_tooth_min=0.03,
            feed_per_tooth_max=0.15,
            depth_of_cut_factor=0.3,
            stepover_factor=0.35,
            coolant_type="Flood",
            notes="Work hardens easily, maintain chip load"
        )
        
        # Tool Steel with Carbide
        params[(MaterialType.STEEL_TOOL, ToolMaterial.COATED_CARBIDE)] = CuttingParameters(
            cutting_speed_min=30,
            cutting_speed_max=70,
            feed_per_tooth_min=0.02,
            feed_per_tooth_max=0.10,
            depth_of_cut_factor=0.25,
            stepover_factor=0.30,
            coolant_type="Flood",
            notes="Very hard, use coated tools"
        )
        
        # Titanium with Carbide
        params[(MaterialType.TITANIUM_6AL4V, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=40,
            cutting_speed_max=80,
            feed_per_tooth_min=0.03,
            feed_per_tooth_max=0.12,
            depth_of_cut_factor=0.2,
            stepover_factor=0.25,
            coolant_type="Flood",
            notes="Poor thermal conductor, use coolant aggressively"
        )
        
        # Brass with Carbide
        params[(MaterialType.BRASS, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=150,
            cutting_speed_max=400,
            feed_per_tooth_min=0.05,
            feed_per_tooth_max=0.30,
            depth_of_cut_factor=0.6,
            stepover_factor=0.50,
            coolant_type="Air",
            notes="Easy to machine, sharp tools prevent galling"
        )
        
        # ABS Plastic with Carbide
        params[(MaterialType.PLASTIC_ABS, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=200,
            cutting_speed_max=600,
            feed_per_tooth_min=0.08,
            feed_per_tooth_max=0.40,
            depth_of_cut_factor=0.8,
            stepover_factor=0.60,
            coolant_type="Air",
            notes="Sharp tools, high speed to prevent melting"
        )
        
        # Delrin Plastic with Carbide
        params[(MaterialType.PLASTIC_DELRIN, ToolMaterial.CARBIDE)] = CuttingParameters(
            cutting_speed_min=250,
            cutting_speed_max=700,
            feed_per_tooth_min=0.10,
            feed_per_tooth_max=0.50,
            depth_of_cut_factor=0.9,
            stepover_factor=0.65,
            coolant_type="Air",
            notes="Very machinable, sharp tools recommended"
        )
        
        return params
    
    def get_material_properties(self, material: MaterialType) -> Optional[MaterialProperties]:
        """Get properties for a material"""
        return self.materials.get(material)
    
    def get_cutting_parameters(self, material: MaterialType, 
                               tool_material: ToolMaterial = ToolMaterial.CARBIDE) -> Optional[CuttingParameters]:
        """Get recommended cutting parameters for material/tool combination"""
        return self.cutting_params.get((material, tool_material))
    
    def get_recommended_cutting_speed(self, material: MaterialType, 
                                     tool_material: ToolMaterial = ToolMaterial.CARBIDE,
                                     operation_type: str = "roughing") -> float:
        """Get recommended cutting speed based on operation type"""
        params = self.get_cutting_parameters(material, tool_material)
        if not params:
            return 100.0  # Default
        
        if operation_type == "roughing":
            return params.cutting_speed_min + (params.cutting_speed_max - params.cutting_speed_min) * 0.4
        elif operation_type == "finishing":
            return params.cutting_speed_max
        else:  # semi-finishing
            return (params.cutting_speed_min + params.cutting_speed_max) / 2
    
    def get_recommended_feed_per_tooth(self, material: MaterialType,
                                       tool_material: ToolMaterial = ToolMaterial.CARBIDE,
                                       operation_type: str = "roughing") -> float:
        """Get recommended feed per tooth"""
        params = self.get_cutting_parameters(material, tool_material)
        if not params:
            return 0.1  # Default
        
        if operation_type == "roughing":
            return params.feed_per_tooth_max * 0.8
        elif operation_type == "finishing":
            return params.feed_per_tooth_min
        else:  # semi-finishing
            return (params.feed_per_tooth_min + params.feed_per_tooth_max) / 2
    
    def get_coolant_recommendation(self, material: MaterialType,
                                   tool_material: ToolMaterial = ToolMaterial.CARBIDE) -> str:
        """Get coolant recommendation"""
        params = self.get_cutting_parameters(material, tool_material)
        if params:
            return params.coolant_type
        return "Flood"  # Default safe option
    
    def get_surface_finish_strategy(self, material: MaterialType, 
                                    finish_requirement: str) -> Dict[str, any]:
        """Get surface finish strategy recommendations"""
        props = self.get_material_properties(material)
        if not props:
            return {}
        
        strategy = {
            "tool_sharpness": "Critical" if props.machinability_rating < 5 else "Important",
            "recommended_doc": 0.1 if finish_requirement == "Mirror" else 0.3,
            "recommended_stepover": 0.1 if finish_requirement == "Mirror" else 0.2,
            "climb_milling": True if props.heat_affected else False,
            "multiple_passes": finish_requirement in ["Fine", "Mirror"]
        }
        
        return strategy
    
    def estimate_material_cost(self, material: MaterialType, volume_cm3: float) -> float:
        """Estimate material cost"""
        # Expanded cost per kg estimates (USD)
        cost_per_kg = {
            # Aluminum alloys
            MaterialType.ALUMINUM_6061: 3.0,
            MaterialType.ALUMINUM_7075: 8.0,
            MaterialType.ALUMINUM_2024: 7.0,
            MaterialType.ALUMINUM_5083: 4.5,
            MaterialType.ALUMINUM_MIC6: 5.5,
            
            # Mild/Carbon steels
            MaterialType.STEEL_MILD: 1.5,
            MaterialType.STEEL_1045: 2.0,
            MaterialType.STEEL_4140: 3.5,
            
            # Stainless steels
            MaterialType.STEEL_STAINLESS_304: 4.0,
            MaterialType.STEEL_STAINLESS_316: 5.5,
            MaterialType.STEEL_STAINLESS_17_4PH: 12.0,
            
            # Tool steels
            MaterialType.STEEL_TOOL: 20.0,
            MaterialType.STEEL_A2: 18.0,
            MaterialType.STEEL_O1: 15.0,
            
            # Titanium alloys
            MaterialType.TITANIUM_6AL4V: 35.0,
            MaterialType.TITANIUM_CP: 25.0,
            
            # Nickel alloys
            MaterialType.INCONEL_718: 45.0,
            MaterialType.MONEL_400: 28.0,
            
            # Non-ferrous
            MaterialType.BRASS: 6.0,
            MaterialType.BRONZE: 8.0,
            MaterialType.COPPER: 7.0,
            
            # Plastics
            MaterialType.PLASTIC_ABS: 2.5,
            MaterialType.PLASTIC_DELRIN: 8.0,
            MaterialType.PLASTIC_PEEK: 65.0,  # Very expensive
            MaterialType.PLASTIC_NYLON: 4.0,
            MaterialType.PLASTIC_POLYCARBONATE: 5.0,
            MaterialType.PLASTIC_ULTEM: 50.0,  # Expensive
            
            # Composites
            MaterialType.CARBON_FIBER: 40.0,
            MaterialType.G10_FR4: 12.0,
        }
        
        props = self.get_material_properties(material)
        if not props or material not in cost_per_kg:
            return 0.0
        
        # Calculate weight
        weight_kg = (volume_cm3 * props.density) / 1000
        
        # Calculate cost
        cost = weight_kg * cost_per_kg[material]
        
        return round(cost, 2)
    
    def get_material_category(self, material: MaterialType) -> str:
        """Get material category for grouping"""
        if "ALUMINUM" in material.name:
            return "Aluminum Alloy"
        elif "STEEL_STAINLESS" in material.name:
            return "Stainless Steel"
        elif "STEEL_TOOL" in material.name or "_A2" in material.name or "_O1" in material.name:
            return "Tool Steel"
        elif "STEEL" in material.name:
            return "Carbon Steel"
        elif "TITANIUM" in material.name:
            return "Titanium Alloy"
        elif "INCONEL" in material.name or "MONEL" in material.name:
            return "Nickel Alloy"
        elif material.name in ["BRASS", "BRONZE", "COPPER"]:
            return "Non-Ferrous"
        elif "PLASTIC" in material.name:
            return "Engineering Plastic"
        elif material.name in ["CARBON_FIBER", "G10_FR4"]:
            return "Composite"
        return "Other"
    
    def get_default_cutting_parameters(self, material: MaterialType) -> CuttingParameters:
        """Get default cutting parameters for materials without specific definitions"""
        category = self.get_material_category(material)
        
        # Category-based defaults
        defaults = {
            "Aluminum Alloy": CuttingParameters(190, 450, 0.04, 0.22, 0.45, 0.42, "Mist", "Aluminum alloy"),
            "Carbon Steel": CuttingParameters(75, 140, 0.04, 0.18, 0.38, 0.38, "Flood", "Carbon steel"),
            "Stainless Steel": CuttingParameters(48, 95, 0.03, 0.14, 0.32, 0.35, "Flood", "Stainless steel"),
            "Tool Steel": CuttingParameters(32, 68, 0.02, 0.10, 0.26, 0.30, "Flood", "Tool steel"),
            "Titanium Alloy": CuttingParameters(42, 78, 0.03, 0.11, 0.22, 0.26, "Flood", "Titanium alloy"),
            "Nickel Alloy": CuttingParameters(25, 55, 0.02, 0.08, 0.20, 0.25, "Flood", "Difficult material"),
            "Non-Ferrous": CuttingParameters(140, 380, 0.05, 0.28, 0.55, 0.48, "Air", "Easy machining"),
            "Engineering Plastic": CuttingParameters(220, 650, 0.08, 0.45, 0.85, 0.62, "Air", "Plastic"),
            "Composite": CuttingParameters(180, 380, 0.03, 0.15, 0.40, 0.35, "Air", "Abrasive"),
        }
        
        return defaults.get(category, CuttingParameters(100, 200, 0.05, 0.15, 0.4, 0.4, "Flood", "General"))
    
    def get_cutting_parameters(self, material: MaterialType, 
                                tool_material: ToolMaterial = ToolMaterial.CARBIDE) -> Optional[CuttingParameters]:
        """Get recommended cutting parameters for material/tool combination"""
        # Try to get specific parameters
        params = self.cutting_params.get((material, tool_material))
        
        # If not found, use category-based defaults
        if not params:
            params = self.get_default_cutting_parameters(material)
        
        return params
    
    def list_all_materials(self) -> List[Tuple[str, str, int]]:
        """List all materials with category and machinability"""
        materials = []
        for mat in MaterialType:
            props = self.get_material_properties(mat)
            if props:
                category = self.get_material_category(mat)
                materials.append((mat.value, category, props.machinability_rating))
        return sorted(materials, key=lambda x: (x[1], -x[2]))  # Sort by category, then machinability


# Singleton instance
material_db = MaterialDatabase()


# Example usage
if __name__ == "__main__":
    # Test material database
    material = MaterialType.ALUMINUM_6061
    
    props = material_db.get_material_properties(material)
    print(f"Material: {material.value}")
    print(f"  Machinability: {props.machinability_rating}/10")
    print(f"  Density: {props.density} g/cm³")
    
    params = material_db.get_cutting_parameters(material)
    print(f"\nCutting Parameters:")
    print(f"  Speed: {params.cutting_speed_min}-{params.cutting_speed_max} m/min")
    print(f"  Feed: {params.feed_per_tooth_min}-{params.feed_per_tooth_max} mm/tooth")
    print(f"  Coolant: {params.coolant_type}")
    print(f"  Notes: {params.notes}")
    
    # Get recommendation for specific operation
    roughing_speed = material_db.get_recommended_cutting_speed(material, operation_type="roughing")
    finishing_speed = material_db.get_recommended_cutting_speed(material, operation_type="finishing")
    print(f"\nRecommended Speeds:")
    print(f"  Roughing: {roughing_speed:.0f} m/min")
    print(f"  Finishing: {finishing_speed:.0f} m/min")
