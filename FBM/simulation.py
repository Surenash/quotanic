"""
Machining Simulation Module
Simulates machining process, detects collisions, predicts outcomes
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import math


class SimulationMode(Enum):
    """Simulation modes"""
    RAPID = "Rapid Traverse"
    CUTTING = "Cutting"
    PLUNGE = "Plunge"
    RETRACT = "Retract"
    TOOL_CHANGE = "Tool Change"


class CollisionType(Enum):
    """Types of collisions"""
    TOOL_PART = "Tool-Part Collision"
    TOOL_FIXTURE = "Tool-Fixture Collision"
    HOLDER_PART = "Tool Holder-Part Collision"
    NONE = "No Collision"


@dataclass
class SimulationState:
    """Current simulation state"""
    time: float  # seconds
    position: Tuple[float, float, float]  # X, Y, Z
    tool_id: str
    spindle_speed: float  # RPM
    feed_rate: float  # mm/min
    mode: SimulationMode
    material_removed: float  # cm³
    power_draw: float  # kW
    cutting_force: float  # N


@dataclass
class CollisionEvent:
    """Detected collision"""
    time: float
    position: Tuple[float, float, float]
    collision_type: CollisionType
    severity: str  # Low, Medium, High, Critical
    recommendation: str


@dataclass
class ChipLoadAnalysis:
    """Chip load analysis results"""
    tool_diameter: float
    feed_per_tooth: float
    chip_thickness: float
    chip_load_ok: bool
    warning: Optional[str] = None


class MachiningSimulator:
    """Simulate machining operations"""
    
    def __init__(self):
        self.state = None
        self.history = []
        self.collisions = []
        self.warnings = []
        
    def simulate_operation(self, operation, part_bounds: Dict) -> Dict:
        """Simulate a single machining operation"""
        results = {
            'operation_name': operation.operation_name,
            'simulated_time': 0.0,
            'material_removed': 0.0,
            'avg_power': 0.0,
            'max_force': 0.0,
            'collisions': [],
            'warnings': [],
            'success': True
        }
        
        # Check initial conditions
        if not self._check_tool_clearance(operation, part_bounds):
            results['warnings'].append("Tool may not clear part - check setup")
        
        # Simulate chip load
        chip_load = self._analyze_chip_load(operation)
        if not chip_load.chip_load_ok:
            results['warnings'].append(chip_load.warning)
        
        # Calculate material removal
        results['material_removed'] = self._calculate_material_removal(operation)
        
        # Estimate power draw
        results['avg_power'] = self._estimate_power_draw(operation)
        
        # Estimate cutting forces
        results['max_force'] = self._estimate_cutting_force(operation)
        
        # Simulate time
        results['simulated_time'] = self._simulate_time(operation)
        
        # Check for potential issues
        self._check_for_issues(operation, results)
        
        return results
    
    def simulate_complete_process(self, operations: List, part_bounds: Dict) -> Dict:
        """Simulate entire machining process"""
        total_results = {
            'total_time': 0.0,
            'total_material_removed': 0.0,
            'total_energy': 0.0,
            'operation_results': [],
            'critical_warnings': [],
            'collision_count': 0,
            'success_rate': 0.0
        }
        
        successful_ops = 0
        
        for op in operations:
            result = self.simulate_operation(op, part_bounds)
            total_results['operation_results'].append(result)
            
            total_results['total_time'] += result['simulated_time']
            total_results['total_material_removed'] += result['material_removed']
            total_results['total_energy'] += result['avg_power'] * (result['simulated_time'] / 60)  # kWh
            total_results['collision_count'] += len(result['collisions'])
            
            if result['success']:
                successful_ops += 1
            
            # Collect critical warnings
            for warning in result['warnings']:
                if 'critical' in warning.lower() or 'collision' in warning.lower():
                    total_results['critical_warnings'].append(warning)
        
        total_results['success_rate'] = (successful_ops / len(operations)) * 100 if operations else 0
        
        return total_results
    
    def detect_collisions(self, operation, fixtures: List = None) -> List[CollisionEvent]:
        """Detect potential collisions"""
        collisions = []
        
        # Check tool length vs. part depth
        if hasattr(operation, 'depth') and hasattr(operation, 'tool_diameter'):
            tool_length = operation.tool_diameter * 3  # Typical cutting length
            if operation.depth > tool_length:
                collisions.append(CollisionEvent(
                    time=0.0,
                    position=(0, 0, -operation.depth),
                    collision_type=CollisionType.TOOL_PART,
                    severity="High",
                    recommendation="Use longer tool or reduce depth per pass"
                ))
        
        # Check for holder collisions on deep pockets
        if 'pocket' in operation.operation_name.lower():
            if hasattr(operation, 'width') and hasattr(operation, 'depth'):
                if operation.depth > operation.width * 2:
                    collisions.append(CollisionEvent(
                        time=0.0,
                        position=(0, 0, 0),
                        collision_type=CollisionType.HOLDER_PART,
                        severity="Medium",
                        recommendation="Check tool holder clearance for deep/narrow pocket"
                    ))
        
        return collisions
    
    def predict_surface_finish(self, operation) -> Dict:
        """Predict surface finish quality"""
        finish = {
            'ra_microns': 0.0,
            'quality': 'Unknown',
            'factors': []
        }
        
        # Base finish from material
        material_finish = {
            'Aluminum': 0.8,
            'Steel': 1.6,
            'Stainless': 2.0,
            'Titanium': 2.5,
            'Brass': 0.4,
            'Plastic': 0.3
        }
        
        material = getattr(operation, 'material', 'Steel')
        base_ra = material_finish.get(material, 1.6)
        
        # Adjust for feed rate
        feed_rate = getattr(operation, 'feed_rate', 500)
        if feed_rate > 1000:
            base_ra *= 1.5
            finish['factors'].append("High feed rate increases roughness")
        elif feed_rate < 200:
            base_ra *= 0.7
            finish['factors'].append("Low feed rate improves finish")
        
        # Adjust for tool condition
        if hasattr(operation, 'tool_type'):
            tool_type = operation.tool_type.value if hasattr(operation.tool_type, 'value') else str(operation.tool_type)
            if 'finishing' in tool_type.lower():
                base_ra *= 0.6
                finish['factors'].append("Finishing tool improves surface")
            elif 'roughing' in tool_type.lower():
                base_ra *= 1.8
                finish['factors'].append("Roughing tool increases roughness")
        
        finish['ra_microns'] = round(base_ra, 2)
        
        # Classify quality
        if base_ra < 0.8:
            finish['quality'] = 'Excellent (Mirror finish)'
        elif base_ra < 1.6:
            finish['quality'] = 'Good (Fine finish)'
        elif base_ra < 3.2:
            finish['quality'] = 'Acceptable (Standard)'
        elif base_ra < 6.3:
            finish['quality'] = 'Rough'
        else:
            finish['quality'] = 'Very Rough'
        
        return finish
    
    def estimate_tool_wear(self, operation, material_hardness: str) -> Dict:
        """Estimate tool wear for operation"""
        wear = {
            'wear_rate': 0.0,  # % per minute
            'expected_life_remaining': 100.0,  # %
            'replacement_recommended': False,
            'factors': []
        }
        
        # Base wear rate from hardness
        if 'HRC' in material_hardness:
            hardness_value = float(material_hardness.split()[0])
            wear['wear_rate'] = hardness_value / 500  # Approximate
        else:
            wear['wear_rate'] = 0.1
        
        # Adjust for cutting speed
        speed = getattr(operation, 'spindle_speed', 3000)
        if speed > 8000:
            wear['wear_rate'] *= 1.5
            wear['factors'].append("High speed increases wear")
        
        # Calculate remaining life
        operation_time = getattr(operation, 'estimated_time', 10)
        wear_amount = wear['wear_rate'] * operation_time
        wear['expected_life_remaining'] = max(0, 100 - wear_amount)
        
        if wear['expected_life_remaining'] < 20:
            wear['replacement_recommended'] = True
            wear['factors'].append("Tool replacement recommended soon")
        
        return wear
    
    def _check_tool_clearance(self, operation, part_bounds: Dict) -> bool:
        """Check if tool can clear part"""
        if not hasattr(operation, 'tool_diameter'):
            return True
        
        # Simplified clearance check
        return True  # Would implement full 3D clearance in production
    
    def _analyze_chip_load(self, operation) -> ChipLoadAnalysis:
        """Analyze chip load conditions"""
        tool_dia = getattr(operation, 'tool_diameter', 10)
        feed = getattr(operation, 'feed_rate', 500)
        rpm = getattr(operation, 'spindle_speed', 3000)
        flutes = getattr(operation, 'number_of_flutes', 4)
        
        # Calculate feed per tooth
        if rpm > 0 and flutes > 0:
            feed_per_tooth = feed / (rpm * flutes)
        else:
            feed_per_tooth = 0.1
        
        # Calculate chip thickness (simplified)
        chip_thickness = feed_per_tooth * 0.5
        
        # Check if chip load is acceptable
        chip_load_ok = 0.02 <= feed_per_tooth <= 0.3
        
        warning = None
        if feed_per_tooth < 0.02:
            warning = "Chip load too low - risk of rubbing and poor finish"
        elif feed_per_tooth > 0.3:
            warning = "Chip load too high - risk of tool breakage"
        
        return ChipLoadAnalysis(
            tool_diameter=tool_dia,
            feed_per_tooth=feed_per_tooth,
            chip_thickness=chip_thickness,
            chip_load_ok=chip_load_ok,
            warning=warning
        )
    
    def _calculate_material_removal(self, operation) -> float:
        """Calculate material removal volume"""
        if hasattr(operation, 'volume'):
            return operation.volume
        
        # Estimate based on feature geometry
        if hasattr(operation, 'width') and hasattr(operation, 'length') and hasattr(operation, 'depth'):
            return (operation.width * operation.length * operation.depth) / 1000  # cm³
        elif hasattr(operation, 'diameter') and hasattr(operation, 'depth'):
            radius = operation.diameter / 2
            return (math.pi * radius * radius * operation.depth) / 1000  # cm³
        
        return 0.0
    
    def _estimate_power_draw(self, operation) -> float:
        """Estimate power consumption (kW)"""
        # Simplified power model
        material_removal_rate = self._calculate_material_removal(operation)  # cm³
        
        # Base power from material type
        power_factors = {
            'Aluminum': 0.3,
            'Steel': 1.0,
            'Stainless': 1.5,
            'Titanium': 2.0,
            'Brass': 0.4,
            'Plastic': 0.1
        }
        
        material = getattr(operation, 'material', 'Steel')
        factor = power_factors.get(material, 1.0)
        
        # Power = MRR × specific cutting energy
        power = material_removal_rate * factor * 0.5
        
        return max(0.5, min(15.0, power))  # Clamp between 0.5-15 kW
    
    def _estimate_cutting_force(self, operation) -> float:
        """Estimate cutting force (Newtons)"""
        # Simplified force model
        tool_dia = getattr(operation, 'tool_diameter', 10)
        doc = getattr(operation, 'depth_of_cut', 5)
        feed = getattr(operation, 'feed_rate', 500)
        
        # Force proportional to chip area and feed
        chip_area = tool_dia * doc
        force = chip_area * (feed / 1000) * 100  # Simplified
        
        return force
    
    def _simulate_time(self, operation) -> float:
        """Simulate operation time"""
        if hasattr(operation, 'estimated_time'):
            return operation.estimated_time * 60  # Convert to seconds
        return 60.0  # Default 1 minute
    
    def _check_for_issues(self, operation, results: Dict):
        """Check for potential issues"""
        # Check power draw
        if results['avg_power'] > 10:
            results['warnings'].append("High power draw - monitor spindle load")
        
        # Check cutting force
        if results['max_force'] > 2000:
            results['warnings'].append("High cutting forces - reduce DOC or feed")
        
        # Check material removal
        if results['material_removed'] > 100:
            results['warnings'].append("Large material removal - consider multiple passes")


# Singleton instance
simulator = MachiningSimulator()


# Example usage
if __name__ == "__main__":
    print("Machining Simulator - Ready")
    print("Capabilities:")
    print("  - Operation simulation")
    print("  - Collision detection")
    print("  - Surface finish prediction")
    print("  - Tool wear estimation")
    print("  - Power/force prediction")
