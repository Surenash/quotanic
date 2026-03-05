"""
Cost Estimator Module
Comprehensive cost estimation for FBM system
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import math


class MachineType(Enum):
    """CNC machine types"""
    MILL_3AXIS_MANUAL = "3-Axis Manual Mill"
    MILL_3AXIS_CNC = "3-Axis CNC Mill"
    MILL_4AXIS = "4-Axis CNC Mill"
    MILL_5AXIS = "5-Axis CNC Mill"
    LATHE_CNC = "CNC Lathe"
    SWISS_LATHE = "Swiss Lathe"


@dataclass
class MachineRate:
    """Machine hourly rates"""
    machine_type: MachineType
    hourly_rate: float  # USD per hour
    setup_time_hours: float  # Typical setup time
    tool_change_minutes: float  # Minutes per tool change


@dataclass
class LaborRate:
    """Labor rates"""
    machinist_hourly: float  # USD per hour
    programmer_hourly: float  # USD per hour
    setup_specialist_hourly: float  # USD per hour


@dataclass
class CostBreakdown:
    """Complete cost breakdown"""
    material_cost: float
    machining_cost: float
    setup_cost: float
    programming_cost: float
    tool_cost: float
    overhead_cost: float
    total_cost: float
    cost_per_unit: float
    breakdown_details: Dict


class CostEstimator:
    """Cost estimation for machining operations"""
    
    def __init__(self):
        self.machine_rates = self._initialize_machine_rates()
        self.labor_rates = LaborRate(
            machinist_hourly=65.0,
            programmer_hourly=85.0,
            setup_specialist_hourly=75.0
        )
        self.overhead_rate = 1.5  # 150% overhead multiplier
        self.profit_margin = 0.25  # 25% profit margin
        
    def _initialize_machine_rates(self) -> Dict[MachineType, MachineRate]:
        """Initialize machine hourly rates"""
        return {
            MachineType.MILL_3AXIS_MANUAL: MachineRate(
                machine_type=MachineType.MILL_3AXIS_MANUAL,
                hourly_rate=45.0,
                setup_time_hours=0.5,
                tool_change_minutes=3.0
            ),
            MachineType.MILL_3AXIS_CNC: MachineRate(
                machine_type=MachineType.MILL_3AXIS_CNC,
                hourly_rate=75.0,
                setup_time_hours=1.0,
                tool_change_minutes=1.5
            ),
            MachineType.MILL_4AXIS: MachineRate(
                machine_type=MachineType.MILL_4AXIS,
                hourly_rate=125.0,
                setup_time_hours=1.5,
                tool_change_minutes=2.0
            ),
            MachineType.MILL_5AXIS: MachineRate(
                machine_type=MachineType.MILL_5AXIS,
                hourly_rate=200.0,
                setup_time_hours=2.0,
                tool_change_minutes=2.5
            ),
        }
    
    def estimate_programming_time(self, num_features: int, 
                                  complexity_score: float,
                                  has_patterns: bool = False) -> float:
        """
        Estimate programming time in hours
        
        With FBM: Minimal time (automated)
        Without FBM: Would be much longer
        """
        # Base time per feature (with FBM automation)
        base_time_per_feature = 0.05  # 3 minutes per feature with automation
        
        # Complexity multiplier
        complexity_multiplier = 1.0 + (complexity_score / 10.0)
        
        # Pattern recognition saves time
        time_saved = 0.5 if has_patterns else 0.0
        
        programming_hours = max(0.25, num_features * base_time_per_feature * complexity_multiplier - time_saved)
        
        return round(programming_hours, 2)
    
    def estimate_setup_time(self, machine_type: MachineType,
                           num_setups: int,
                           part_complexity: float) -> float:
        """Estimate setup time in hours"""
        machine_rate = self.machine_rates.get(machine_type)
        if not machine_rate:
            return 1.0  # Default
        
        base_setup = machine_rate.setup_time_hours
        
        # Additional setups beyond first
        additional_setup_time = (num_setups - 1) * base_setup * 0.5
        
        # Complexity adds to setup time
        complexity_multiplier = 1.0 + (part_complexity / 20.0)
        
        total_setup_hours = (base_setup + additional_setup_time) * complexity_multiplier
        
        return round(total_setup_hours, 2)
    
    def calculate_tool_change_time(self, num_tools: int,
                                   machine_type: MachineType) -> float:
        """Calculate total tool change time in hours"""
        machine_rate = self.machine_rates.get(machine_type)
        if not machine_rate:
            return 0.0
        
        # Time per tool change in hours
        time_per_change = machine_rate.tool_change_minutes / 60.0
        
        # Total tool changes (typically num_tools - 1, since first tool is loaded)
        total_changes = max(0, num_tools - 1)
        
        total_time = total_changes * time_per_change
        
        return round(total_time, 2)
    
    def calculate_total_machining_time(self, operations: List,
                                       include_tool_changes: bool = True,
                                       machine_type: MachineType = MachineType.MILL_3AXIS_CNC) -> float:
        """Calculate total machining time including all factors"""
        # Cutting time from operations
        cutting_time = sum(op.estimated_time for op in operations if hasattr(op, 'estimated_time'))
        cutting_hours = cutting_time / 60.0
        
        # Tool change time
        if include_tool_changes:
            unique_tools = len(set((op.tool_type, op.tool_diameter) for op in operations 
                                  if hasattr(op, 'tool_type') and hasattr(op, 'tool_diameter')))
            tool_change_hours = self.calculate_tool_change_time(unique_tools, machine_type)
        else:
            tool_change_hours = 0.0
        
        # Rapid moves (estimated as 10% of cutting time)
        rapid_time_hours = cutting_hours * 0.10
        
        total_hours = cutting_hours + tool_change_hours + rapid_time_hours
        
        return round(total_hours, 2)
    
    def estimate_complete_cost(self, 
                              material_type: str,
                              material_volume_cm3: float,
                              num_features: int,
                              num_operations: int,
                              num_setups: int,
                              machining_time_hours: float,
                              complexity_score: float,
                              tool_costs: float,
                              machine_type: MachineType = MachineType.MILL_3AXIS_CNC,
                              quantity: int = 1,
                              has_patterns: bool = False) -> CostBreakdown:
        """
        Complete cost estimation for a part
        
        Returns detailed cost breakdown
        """
        # Material cost (from material database)
        from material_database import material_db, MaterialType
        try:
            mat_type = MaterialType[material_type.upper().replace(" ", "_").replace("-", "_")]
            material_cost_per_part = material_db.estimate_material_cost(mat_type, material_volume_cm3)
        except:
            material_cost_per_part = material_volume_cm3 * 0.01  # Fallback
        
        total_material_cost = material_cost_per_part * quantity
        
        # Programming cost (one-time for batch)
        programming_hours = self.estimate_programming_time(num_features, complexity_score, has_patterns)
        programming_cost = programming_hours * self.labor_rates.programmer_hourly
        
        # Setup cost
        setup_hours = self.estimate_setup_time(machine_type, num_setups, complexity_score)
        setup_cost_per_part = (setup_hours * self.labor_rates.setup_specialist_hourly) / quantity
        total_setup_cost = setup_cost_per_part * quantity
        
        # Machining cost
        machine_rate = self.machine_rates.get(machine_type, self.machine_rates[MachineType.MILL_3AXIS_CNC])
        machining_cost_per_part = machining_time_hours * machine_rate.hourly_rate
        total_machining_cost = machining_cost_per_part * quantity
        
        # Tool cost
        total_tool_cost = tool_costs * quantity
        
        # Subtotal (direct costs)
        subtotal = total_material_cost + programming_cost + total_setup_cost + total_machining_cost + total_tool_cost
        
        # Overhead (applied to direct costs)
        overhead_cost = subtotal * (self.overhead_rate - 1.0)
        
        # Total cost before profit
        cost_before_profit = subtotal + overhead_cost
        
        # Total cost with profit margin
        total_cost = cost_before_profit * (1 + self.profit_margin)
        
        # Cost per unit
        cost_per_unit = total_cost / quantity if quantity > 0 else 0
        
        # Detailed breakdown
        breakdown_details = {
            "quantity": quantity,
            "material_cost_per_part": round(material_cost_per_part, 2),
            "machining_cost_per_part": round(machining_cost_per_part, 2),
            "setup_cost_per_part": round(setup_cost_per_part, 2),
            "programming_cost_total": round(programming_cost, 2),
            "programming_hours": programming_hours,
            "setup_hours": setup_hours,
            "machining_hours_per_part": machining_time_hours,
            "machine_rate_per_hour": machine_rate.hourly_rate,
            "overhead_rate_percentage": int((self.overhead_rate - 1.0) * 100),
            "profit_margin_percentage": int(self.profit_margin * 100)
        }
        
        return CostBreakdown(
            material_cost=round(total_material_cost, 2),
            machining_cost=round(total_machining_cost, 2),
            setup_cost=round(total_setup_cost, 2),
            programming_cost=round(programming_cost, 2),
            tool_cost=round(total_tool_cost, 2),
            overhead_cost=round(overhead_cost, 2),
            total_cost=round(total_cost, 2),
            cost_per_unit=round(cost_per_unit, 2),
            breakdown_details=breakdown_details
        )
    
    def compare_batch_sizes(self, base_params: Dict, quantities: List[int]) -> Dict:
        """Compare costs across different batch sizes"""
        results = {}
        
        for qty in quantities:
            cost = self.estimate_complete_cost(**{**base_params, 'quantity': qty})
            results[qty] = {
                'total_cost': cost.total_cost,
                'cost_per_unit': cost.cost_per_unit,
                'savings_vs_single': round(cost.cost_per_unit / results[1]['cost_per_unit'] * 100 - 100, 1) if 1 in results else 0
            }
        
        return results
    
    def estimate_roi_of_fbm(self, num_parts_per_year: int,
                           avg_complexity: float,
                           avg_features_per_part: int) -> Dict:
        """
        Estimate ROI of using FBM system
        
        Compares automated FBM vs manual programming
        """
        # Manual programming time (hours per part)
        manual_programming_hours = avg_features_per_part * 0.5 * (1 + avg_complexity / 10)
        
        # FBM programming time (automated)
        fbm_programming_hours = self.estimate_programming_time(avg_features_per_part, avg_complexity)
        
        # Time saved per part
        time_saved_hours = manual_programming_hours - fbm_programming_hours
        
        # Annual savings
        annual_time_saved = time_saved_hours * num_parts_per_year
        annual_cost_saved = annual_time_saved * self.labor_rates.programmer_hourly
        
        # FBM system cost (estimated)
        fbm_system_cost = 0  # Already developed
        
        # Payback period
        if fbm_system_cost > 0:
            payback_months = (fbm_system_cost / annual_cost_saved) * 12
        else:
            payback_months = 0
        
        return {
            'manual_programming_hours_per_part': round(manual_programming_hours, 2),
            'fbm_programming_hours_per_part': round(fbm_programming_hours, 2),
            'time_saved_per_part_hours': round(time_saved_hours, 2),
            'annual_parts': num_parts_per_year,
            'annual_time_saved_hours': round(annual_time_saved, 1),
            'annual_cost_saved_usd': round(annual_cost_saved, 2),
            'fbm_system_cost': fbm_system_cost,
            'payback_months': round(payback_months, 1),
            'efficiency_improvement_percentage': round((time_saved_hours / manual_programming_hours) * 100, 1)
        }


# Singleton instance
cost_estimator = CostEstimator()


# Example usage
if __name__ == "__main__":
    estimator = CostEstimator()
    
    # Example part estimation
    cost = estimator.estimate_complete_cost(
        material_type="ALUMINUM_6061",
        material_volume_cm3=500,  # 500 cm³ part
        num_features=15,
        num_operations=35,
        num_setups=1,
        machining_time_hours=2.5,
        complexity_score=5.5,
        tool_costs=25.0,
        machine_type=MachineType.MILL_3AXIS_CNC,
        quantity=10,
        has_patterns=True
    )
    
    print("Cost Estimation for Part:")
    print(f"  Quantity: {cost.breakdown_details['quantity']}")
    print(f"  Material Cost: ${cost.material_cost:.2f}")
    print(f"  Machining Cost: ${cost.machining_cost:.2f}")
    print(f"  Setup Cost: ${cost.setup_cost:.2f}")
    print(f"  Programming Cost: ${cost.programming_cost:.2f}")
    print(f"  Tool Cost: ${cost.tool_cost:.2f}")
    print(f"  Overhead: ${cost.overhead_cost:.2f}")
    print(f"  TOTAL: ${cost.total_cost:.2f}")
    print(f"  Cost per Unit: ${cost.cost_per_unit:.2f}")
    
    # FBM ROI Analysis
    print("\nFBM System ROI Analysis:")
    roi = estimator.estimate_roi_of_fbm(
        num_parts_per_year=100,
        avg_complexity=6.0,
        avg_features_per_part=12
    )
    print(f"  Manual Programming: {roi['manual_programming_hours_per_part']} hrs/part")
    print(f"  FBM Programming: {roi['fbm_programming_hours_per_part']} hrs/part")
    print(f"  Time Saved: {roi['time_saved_per_part_hours']} hrs/part ({roi['efficiency_improvement_percentage']}% faster)")
    print(f"  Annual Savings: ${roi['annual_cost_saved_usd']:,.2f}")
