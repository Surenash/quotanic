"""
Machine Capability Database
Machine specifications, capabilities, and selection logic
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class MachineClass(Enum):
    """Machine tool classes"""
    MILL_3AXIS = "3-Axis Milling Machine"
    MILL_4AXIS = "4-Axis Milling Machine"
    MILL_5AXIS = "5-Axis Milling Machine"
    LATHE_2AXIS = "2-Axis Lathe"
    LATHE_LIVE_TOOL = "Lathe with Live Tooling"
    TURN_MILL = "Turn-Mill Center"
    ROUTER_3AXIS = "3-Axis Router"
    EDM_WIRE = "Wire EDM"
    EDM_SINKER = "Sinker EDM"


class ControllerType(Enum):
    """CNC controller types"""
    FANUC = "Fanuc"
    HAAS = "Haas"
    SIEMENS = "Siemens 840D"
    HEIDENHAIN = "Heidenhain TNC"
    MAZAK = "Mazak"
    OKUMA = "Okuma OSP"
    MITSUBISHI = "Mitsubishi"


@dataclass
class MachineCapability:
    """Machine tool capability specification"""
    machine_id: str
    machine_class: MachineClass
    manufacturer: str
    model: str
    controller: ControllerType
    
    # Work envelope (mm)
    x_travel: float
    y_travel: float
    z_travel: float
    
    # Spindle specifications
    max_spindle_speed: int  # RPM
    spindle_power: float  # kW
    spindle_taper: str  # e.g., "CAT40", "HSK-A63"
    
    # Tool magazine
    tool_positions: int
    max_tool_diameter: float  # mm
    max_tool_length: float  # mm
    max_tool_weight: float  # kg
    
    # Performance
    rapid_feed_rate: int  # mm/min
    cutting_feed_rate: int  # mm/min
    positioning_accuracy: float  # mm
    repeatability: float  # mm
    
    # Features
    has_coolant_through_spindle: bool = False
    has_pallet_changer: bool = False
    has_probe: bool = False
    has_chip_conveyor: bool = False
    
    # Operating costs
    hourly_rate: float = 75.0  # USD/hr
    
    # Current status
    available: bool = True
    utilization_percent: float = 75.0


class MachineDatabase:
    """Database of available machines and their capabilities"""
    
    def __init__(self):
        self.machines = self._initialize_machine_database()
    
    def _initialize_machine_database(self) -> Dict[str, MachineCapability]:
        """Initialize with common machine types"""
        machines = {}
        
        # 3-Axis Vertical Mill #1
        machines['VMC-001'] = MachineCapability(
            machine_id='VMC-001',
            machine_class=MachineClass.MILL_3AXIS,
            manufacturer='Haas',
            model='VF-2',
            controller=ControllerType.HAAS,
            x_travel=762,
            y_travel=406,
            z_travel=508,
            max_spindle_speed=8100,
            spindle_power=22.4,
            spindle_taper='CAT40',
            tool_positions=20,
            max_tool_diameter=80,
            max_tool_length=300,
            max_tool_weight=4.5,
            rapid_feed_rate=25400,
            cutting_feed_rate=12700,
            positioning_accuracy=0.005,
            repeatability=0.003,
            has_coolant_through_spindle=True,
            has_probe=True,
            hourly_rate=75.0,
            available=True,
            utilization_percent=70.0
        )
        
        # 3-Axis Vertical Mill #2 (Smaller)
        machines['VMC-002'] = MachineCapability(
            machine_id='VMC-002',
            machine_class=MachineClass.MILL_3AXIS,
            manufacturer='Haas',
            model='Mini Mill',
            controller=ControllerType.HAAS,
            x_travel=406,
            y_travel=254,
            z_travel=254,
            max_spindle_speed=10000,
            spindle_power=5.6,
            spindle_taper='CAT40',
            tool_positions=10,
            max_tool_diameter=50,
            max_tool_length=200,
            max_tool_weight=2.3,
            rapid_feed_rate=15240,
            cutting_feed_rate=7620,
            positioning_accuracy=0.008,
            repeatability=0.005,
            hourly_rate=45.0,
            available=True,
            utilization_percent=50.0
        )
        
        # 4-Axis Horizontal Mill
        machines['HMC-001'] = MachineCapability(
            machine_id='HMC-001',
            machine_class=MachineClass.MILL_4AXIS,
            manufacturer='Mazak',
            model='HCN-5000',
            controller=ControllerType.MAZAK,
            x_travel=560,
            y_travel=560,
            z_travel=560,
            max_spindle_speed=12000,
            spindle_power=26,
            spindle_taper='CAT40',
            tool_positions=60,
            max_tool_diameter=120,
            max_tool_length=400,
            max_tool_weight=7.0,
            rapid_feed_rate=30000,
            cutting_feed_rate=20000,
            positioning_accuracy=0.003,
            repeatability=0.002,
            has_coolant_through_spindle=True,
            has_pallet_changer=True,
            has_probe=True,
            has_chip_conveyor=True,
            hourly_rate=125.0,
            available=True,
            utilization_percent=85.0
        )
        
        # 5-Axis Mill
        machines['5AX-001'] = MachineCapability(
            machine_id='5AX-001',
            machine_class=MachineClass.MILL_5AXIS,
            manufacturer='DMG Mori',
            model='DMU 50',
            controller=ControllerType.SIEMENS,
            x_travel=500,
            y_travel=450,
            z_travel=400,
            max_spindle_speed=18000,
            spindle_power=31,
            spindle_taper='HSK-A63',
            tool_positions=42,
            max_tool_diameter=100,
            max_tool_length=350,
            max_tool_weight=6.0,
            rapid_feed_rate=60000,
            cutting_feed_rate=30000,
            positioning_accuracy=0.002,
            repeatability=0.001,
            has_coolant_through_spindle=True,
            has_probe=True,
            has_chip_conveyor=True,
            hourly_rate=200.0,
            available=True,
            utilization_percent=90.0
        )
        
        # CNC Lathe
        machines['LATHE-001'] = MachineCapability(
            machine_id='LATHE-001',
            machine_class=MachineClass.LATHE_LIVE_TOOL,
            manufacturer='Haas',
            model='ST-20',
            controller=ControllerType.HAAS,
            x_travel=254,  # Diameter capacity
            y_travel=510,  # Z-axis travel
            z_travel=60,   # Cross slide (Y for live tools)
            max_spindle_speed=5000,
            spindle_power=15,
            spindle_taper='A2-5',
            tool_positions=12,
            max_tool_diameter=32,
            max_tool_length=150,
            max_tool_weight=3.0,
            rapid_feed_rate=15240,
            cutting_feed_rate=7620,
            positioning_accuracy=0.005,
            repeatability=0.003,
            has_coolant_through_spindle=False,
            hourly_rate=85.0,
            available=True,
            utilization_percent=60.0
        )
        
        return machines
    
    def find_suitable_machines(self, part_size: Tuple[float, float, float],
                              required_axes: int = 3,
                              required_tools: int = 1) -> List[MachineCapability]:
        """Find machines suitable for part"""
        suitable = []
        
        x_size, y_size, z_size = part_size
        
        for machine in self.machines.values():
            if not machine.available:
                continue
            
            # Check work envelope
            if (machine.x_travel >= x_size and
                machine.y_travel >= y_size and
                machine.z_travel >= z_size):
                
                # Check axes
                machine_axes = 3  # Base
                if machine.machine_class == MachineClass.MILL_4AXIS:
                    machine_axes = 4
                elif machine.machine_class == MachineClass.MILL_5AXIS:
                    machine_axes = 5
                
                if machine_axes >= required_axes:
                    # Check tool capacity
                    if machine.tool_positions >= required_tools:
                        suitable.append(machine)
        
        # Sort by hourly rate (cheaper first)
        suitable.sort(key=lambda m: m.hourly_rate)
        
        return suitable
    
    def recommend_machine(self, features: List, operations: List) -> Optional[MachineCapability]:
        """Recommend best machine for job"""
        # Analyze requirements
        max_x = max_y = max_z = 0
        required_tools = set()
        needs_4axis = False
        needs_5axis = False
        
        for feature in features:
            # Check for features needing multi-axis
            feat_type = feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type)
            if 'undercut' in feat_type.lower():
                needs_4axis = True
            if 'complex' in feat_type.lower() or '3d' in feat_type.lower():
                needs_5axis = True
        
        for op in operations:
            # Count unique tools
            tool_id = f"{op.tool_type}_{op.tool_diameter}" if hasattr(op, 'tool_type') else "tool"
            required_tools.add(tool_id)
        
        # Determine minimum axes
        if needs_5axis:
            min_axes = 5
        elif needs_4axis:
            min_axes = 4
        else:
            min_axes = 3
        
        # Find suitable machines
        part_size = (max_x or 100, max_y or 100, max_z or 50)
        suitable = self.find_suitable_machines(part_size, min_axes, len(required_tools))
        
        if not suitable:
            return None
        
        # Prefer machine with lowest utilization (availability)
        suitable.sort(key=lambda m: m.utilization_percent)
        
        return suitable[0]
    
    def calculate_machine_utilization(self, machine_id: str, 
                                     job_time_hours: float) -> Dict:
        """Calculate impact on machine utilization"""
        machine = self.machines.get(machine_id)
        if not machine:
            return {'error': 'Machine not found'}
        
        # Assume 168 hours per week
        weekly_hours = 168
        current_used = (machine.utilization_percent / 100) * weekly_hours
        new_used = current_used + job_time_hours
        new_utilization = (new_used / weekly_hours) * 100
        
        return {
            'machine_id': machine_id,
            'current_utilization': machine.utilization_percent,
            'job_hours': job_time_hours,
            'new_utilization': round(new_utilization, 1),
            'remaining_capacity': round(weekly_hours - new_used, 1),
            'overbooked': new_utilization > 100
        }
    
    def get_machine_cost_comparison(self, machines: List[str], 
                                    job_time_hours: float) -> List[Dict]:
        """Compare costs across machines"""
        comparisons = []
        
        for machine_id in machines:
            machine = self.machines.get(machine_id)
            if machine:
                cost = machine.hourly_rate * job_time_hours
                comparisons.append({
                    'machine_id': machine_id,
                    'model': machine.model,
                    'class': machine.machine_class.value,
                    'hourly_rate': machine.hourly_rate,
                    'total_cost': round(cost, 2),
                    'available': machine.available,
                    'utilization': machine.utilization_percent
                })
        
        # Sort by total cost
        comparisons.sort(key=lambda x: x['total_cost'])
        
        return comparisons


# Singleton instance
machine_db = MachineDatabase()


# Example usage
if __name__ == "__main__":
    # Find machines for 300x200x100mm part
    suitable = machine_db.find_suitable_machines((300, 200, 100), required_axes=3, required_tools=5)
    
    print(f"Found {len(suitable)} suitable machines:")
    for machine in suitable:
        print(f"  {machine.machine_id}: {machine.model} - ${machine.hourly_rate}/hr")
