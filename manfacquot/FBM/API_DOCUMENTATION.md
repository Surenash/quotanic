# FBM System - Complete API Documentation

## Table of Contents
1. [Material Database API](#material-database-api)
2. [Tool Library API](#tool-library-api)
3. [Toolpath Optimizer API](#toolpath-optimizer-api)
4. [Cost Estimator API](#cost-estimator-api)
5. [Pattern Recognizer API](#pattern-recognizer-api)
6. [Geometry Analyzer API](#geometry-analyzer-api)
7. [Advanced Algorithms API](#advanced-algorithms-api)
8. [FBM Advanced API](#fbm-advanced-api)

---

## Material Database API

**Module:** `material_database.py`  
**Purpose:** Material properties and cutting parameter database

### Classes

#### `MaterialType` (Enum)
Available materials:
- `ALUMINUM_6061` - General purpose aluminum
- `ALUMINUM_7075` - High-strength aerospace aluminum
- `STEEL_MILD` - Mild steel (1018)
- `STEEL_STAINLESS_304` - Stainless steel 304
- `STEEL_TOOL` - Tool steel (D2)
- `TITANIUM_6AL4V` - Titanium alloy
- `BRASS` - Brass
- `COPPER` - Copper
- `PLASTIC_ABS` - ABS plastic
- `PLASTIC_DELRIN` - Delrin (Acetal)
- `PLASTIC_PEEK` - PEEK high-performance plastic
- `CARBON_FIBER` - Carbon fiber composite

#### `MaterialDatabase`

**Properties:**
```python
materials: Dict[MaterialType, MaterialProperties]
cutting_params: Dict[Tuple[MaterialType, ToolMaterial], CuttingParameters]
```

**Methods:**

##### `get_material_properties(material: MaterialType) -> MaterialProperties`
Get physical and machining properties of a material.

```python
from material_database import material_db, MaterialType

props = material_db.get_material_properties(MaterialType.ALUMINUM_6061)
print(f"Density: {props.density} g/cm³")
print(f"Machinability: {props.machinability_rating}/10")
print(f"Hardness: {props.hardness}")
```

**Returns:** `MaterialProperties` with:
- `density`: g/cm³
- `hardness`: Brinell or Rockwell
- `tensile_strength`: MPa
- `machinability_rating`: 1-10 scale
- `chip_formation`: Continuous/Discontinuous/Segmented
- `thermal_conductivity`: W/m·K
- `heat_affected`: Boolean

##### `get_cutting_parameters(material, tool_material) -> CuttingParameters`
Get recommended cutting parameters for material/tool combination.

```python
params = material_db.get_cutting_parameters(
    MaterialType.ALUMINUM_6061,
    ToolMaterial.CARBIDE
)
print(f"Speed: {params.cutting_speed_min}-{params.cutting_speed_max} m/min")
print(f"Feed: {params.feed_per_tooth_min}-{params.feed_per_tooth_max} mm/tooth")
```

**Returns:** `CuttingParameters` with:
- `cutting_speed_min/max`: m/min
- `feed_per_tooth_min/max`: mm/tooth
- `depth_of_cut_factor`: multiplier of tool diameter
- `stepover_factor`: percentage of tool diameter
- `coolant_type`: Flood/Mist/Air/None
- `notes`: String

##### `get_recommended_cutting_speed(material, tool_material, operation_type) -> float`
Get specific cutting speed for operation type.

```python
rough_speed = material_db.get_recommended_cutting_speed(
    MaterialType.STEEL_STAINLESS_304,
    operation_type="roughing"
)
finish_speed = material_db.get_recommended_cutting_speed(
    MaterialType.STEEL_STAINLESS_304,
    operation_type="finishing"
)
```

**Operation Types:**
- `"roughing"` - Lower end of speed range
- `"finishing"` - Higher end of speed range  
- `"semi-finishing"` - Middle of range

##### `estimate_material_cost(material, volume_cm3) -> float`
Calculate material cost based on volume.

```python
cost = material_db.estimate_material_cost(
    MaterialType.ALUMINUM_7075,
    500  # cm³
)
print(f"Material cost: ${cost:.2f}")
```

---

## Tool Library API

**Module:** `tool_library.py`  
**Purpose:** Comprehensive tool catalog and selection

### Classes

#### `ToolType` (Enum)
Available tool types:
- `END_MILL` - Standard end mills
- `FACE_MILL` - Face milling cutters
- `DRILL` - Twist drills
- `REAMER` - Precision reamers
- `BALL_MILL` - Ball end mills
- `THREAD_MILL` - Thread milling cutters
- `CHAMFER_MILL` - Chamfer/countersink tools
- `T_SLOT_CUTTER` - T-slot cutters
- `SLOT_DRILL` - Plunging slot drills
- `DOVETAIL_CUTTER` - Dovetail cutters
- And more...

#### `ToolLibrary`

**Properties:**
```python
tools: Dict[str, Tool]  # 80+ tools
```

**Methods:**

##### `find_tool(tool_type, diameter, tolerance=0.5) -> Tool`
Find a tool by type and diameter.

```python
from tool_library import tool_library, ToolType

tool = tool_library.find_tool(ToolType.END_MILL, 10.0)
print(f"Found: {tool.tool_id}")
print(f"Flutes: {tool.number_of_flutes}")
print(f"Max RPM: {tool.max_rpm}")
```

##### `find_best_tool_for_feature(feature_type, diameter, depth, material) -> Tool`
Find optimal tool for a specific machining feature.

```python
best_tool = tool_library.find_best_tool_for_feature(
    feature_type="Rectangular Pocket",
    diameter=8.0,
    depth=15.0,
    material="Aluminum"
)
```

**Feature Types:**
- "hole", "pocket", "slot", "face", "3d", "chamfer", "t-slot", etc.

##### `get_all_available_diameters(tool_type) -> List[float]`
Get all available sizes for a tool type.

```python
sizes = tool_library.get_all_available_diameters(ToolType.DRILL)
# Returns: [2, 3, 4, 5, 6, 6.8, 8, 10, 12, 16, 20]
```

##### `calculate_tool_cost_per_operation(tool, operation_time) -> float`
Calculate tool wear cost for an operation.

```python
cost = tool_library.calculate_tool_cost_per_operation(
    tool=my_tool,
    operation_time=30  # minutes
)
print(f"Tool wear: ${cost:.2f}")
```

##### `recommend_tool_for_material(material) -> List[str]`
Get tool material recommendations for workpiece material.

```python
recs = tool_library.recommend_tool_for_material("Titanium 6Al-4V")
for rec in recs:
    print(f"- {rec}")
```

---

## Toolpath Optimizer API

**Module:** `toolpath_optimizer.py`  
**Purpose:** Advanced toolpath strategies and optimization

### Classes

#### `ToolpathOptimizer`

**Methods:**

##### `analyze_tool_engagement(tool_diameter, stepover, depth_of_cut) -> ToolEngagement`
Analyze tool engagement conditions.

```python
from toolpath_optimizer import toolpath_optimizer

engagement = toolpath_optimizer.analyze_tool_engagement(
    tool_diameter=10.0,
    stepover=4.0,
    depth_of_cut=5.0
)

print(f"Engagement angle: {engagement.engagement_angle:.1f}°")
print(f"Chip thinning: {engagement.chip_thinning_factor:.2f}")
print(f"Feed adjustment: {engagement.recommended_feed_adjustment:.2f}x")
```

**Returns:** `ToolEngagement` with:
- `engagement_angle`: degrees (0-180)
- `radial_depth`: mm
- `axial_depth`: mm
- `chip_thinning_factor`: 0-1
- `cutting_force_factor`: relative measure
- `recommended_feed_adjustment`: multiplier

##### `calculate_trochoidal_parameters(slot_width, tool_diameter, target_feed_rate) -> Dict`
Calculate trochoidal milling parameters.

```python
troch = toolpath_optimizer.calculate_trochoidal_parameters(
    slot_width=12.0,
    tool_diameter=8.0,
    target_feed_rate=500
)

print(f"Loop diameter: {troch['loop_diameter']:.2f}mm")
print(f"Step forward: {troch['step_forward']:.2f}mm")
print(f"Feed multiplier: {troch['feed_multiplier']:.1f}x")
```

**Returns Dictionary:**
- `loop_diameter`: mm
- `step_forward`: mm/loop
- `engagement_width`: mm
- `feed_multiplier`: speed increase factor
- `loops_per_mm`: density
- `notes`: String

##### `recommend_milling_type(material_hardness, feature_type, tool_rigidity) -> MillingType`
Recommend climb vs conventional milling.

```python
milling_type = toolpath_optimizer.recommend_milling_type(
    material_hardness="36 HRC",
    feature_type="finish pocket",
    tool_rigidity="high"
)
# Returns: MillingType.CLIMB
```

##### `calculate_high_speed_parameters(base_speed, tool_diameter, material) -> Dict`
Calculate HSM (High-Speed Machining) parameters.

```python
hsm = toolpath_optimizer.calculate_high_speed_parameters(
    base_cutting_speed=200,
    tool_diameter=10.0,
    material="Aluminum 6061"
)

print(f"HSM Speed: {hsm['cutting_speed']:.0f} m/min")
print(f"HSM RPM: {hsm['spindle_rpm']:.0f}")
print(f"Radial engagement: {hsm['radial_engagement']:.1f}mm")
```

##### `recommend_adaptive_stepdown(material_hardness, tool_diameter, feature_depth) -> List[float]`
Generate adaptive depth-of-cut schedule.

```python
stepdowns = toolpath_optimizer.recommend_adaptive_stepdown(
    material_hardness="150 HB",
    tool_diameter=10.0,
    feature_depth=25.0
)
# Returns: [5.0, 4.5, 4.0, 3.5, 8.0] - depths per pass
```

##### `detect_rest_machining_areas(feature_geometry, previous_operations) -> List[RestMachiningArea]`
Detect material left by previous operations.

```python
rest_areas = toolpath_optimizer.detect_rest_machining_areas(
    feature_geometry={'width': 50, 'length': 80},
    previous_operations=my_operations
)
```

---

## Cost Estimator API

**Module:** `cost_estimator.py`  
**Purpose:** Complete machining cost analysis

### Classes

#### `MachineType` (Enum)
- `MILL_3AXIS_MANUAL` - $45/hr
- `MILL_3AXIS_CNC` - $75/hr
- `MILL_4AXIS` - $125/hr
- `MILL_5AXIS` - $200/hr

#### `CostEstimator`

**Methods:**

##### `estimate_complete_cost(...) -> CostBreakdown`
Complete cost estimation for a part.

```python
from cost_estimator import cost_estimator, MachineType

cost = cost_estimator.estimate_complete_cost(
    material_type="ALUMINUM_6061",
    material_volume_cm3=500,
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

print(f"Material: ${cost.material_cost:.2f}")
print(f"Machining: ${cost.machining_cost:.2f}")
print(f"Setup: ${cost.setup_cost:.2f}")
print(f"Programming: ${cost.programming_cost:.2f}")
print(f"Tools: ${cost.tool_cost:.2f}")
print(f"Overhead: ${cost.overhead_cost:.2f}")
print(f"TOTAL: ${cost.total_cost:.2f}")
print(f"Per Unit: ${cost.cost_per_unit:.2f}")
```

**Returns:** `CostBreakdown` with complete cost details

##### `estimate_roi_of_fbm(num_parts_per_year, avg_complexity, avg_features) -> Dict`
Calculate ROI of using FBM system.

```python
roi = cost_estimator.estimate_roi_of_fbm(
    num_parts_per_year=100,
    avg_complexity=6.0,
    avg_features_per_part=12
)

print(f"Manual: {roi['manual_programming_hours_per_part']:.1f} hrs")
print(f"FBM: {roi['fbm_programming_hours_per_part']:.1f} hrs")
print(f"Savings: {roi['efficiency_improvement_percentage']:.0f}%")
print(f"Annual $: ${roi['annual_cost_saved_usd']:,.2f}")
```

##### `compare_batch_sizes(base_params, quantities) -> Dict`
Compare costs across batch sizes.

```python
comparison = cost_estimator.compare_batch_sizes(
    base_params={...},
    quantities=[1, 10, 50, 100]
)

for qty, data in comparison.items():
    print(f"{qty} units: ${data['cost_per_unit']:.2f}/unit")
```

---

## Pattern Recognizer API

**Module:** `pattern_recognizer.py`  
**Purpose:** Detect geometric patterns in features

### Classes

#### `PatternType` (Enum)
- `LINEAR` - Row patterns
- `CIRCULAR` - Bolt circles
- `GRID` - 2D arrays
- `MIRROR` - Symmetric patterns

#### `PatternRecognizer`

```python
from pattern_recognizer import PatternRecognizer

recognizer = PatternRecognizer(features)
patterns = recognizer.recognize_all_patterns()

for pattern in patterns:
    print(f"Type: {pattern.pattern_type.value}")
    print(f"Count: {pattern.pattern_count}")
    print(f"Spacing: {pattern.spacing:.2f}mm")
    print(f"Confidence: {pattern.confidence:.0%}")
```

**Methods:**
- `detect_linear_patterns(features)` - Find rows
- `detect_circular_patterns(features)` - Find bolt circles
- `detect_grid_patterns(features)` - Find 2D arrays
- `detect_mirror_patterns(features)` - Find symmetry
- `recognize_all_patterns()` - Run all detections

---

## Geometry Analyzer API

**Module:** `geometry_analyzer.py`  
**Purpose:** Advanced geometry analysis and risk assessment

### Classes

#### `GeometryAnalyzer`

```python
from geometry_analyzer import GeometryAnalyzer

analyzer = GeometryAnalyzer(cad_shape)
analysis = analyzer.analyze_complete()

print(f"Undercuts: {analysis.has_undercuts}")
print(f"Thin walls: {analysis.has_thin_walls}")
print(f"Min thickness: {analysis.min_wall_thickness}mm")
print(f"Accessibility: {analysis.accessibility_score:.2f}")
print(f"Complexity: {analysis.complexity_score:.1f}/10")
print(f"Risks: {analysis.manufacturing_risks}")
```

**Methods:**
- `detect_undercuts()` - Find unmachnable areas
- `analyze_wall_thickness()` - Check for thin walls
- `measure_draft_angles()` - Verify draft
- `calculate_accessibility_score()` - Tool access rating
- `calculate_complexity_score()` - 1-10 difficulty
- `identify_risks()` - Manufacturing concerns
- `suggest_strategies()` - Recommendations

---

## Advanced Algorithms API

**Module:** `advanced_algorithms.py`  
**Purpose:** Intelligent classification and analysis

### Classes

#### `FeatureClassifier`

##### `fuzzy_classify(feature_properties) -> ClassificationResult`
Fuzzy logic classification for ambiguous features.

```python
from advanced_algorithms import feature_classifier

result = feature_classifier.fuzzy_classify({
    'id': 1,
    'depth': 15.0,
    'diameter': 10.0
})

print(f"Primary: {result.primary_classification}")
print(f"Confidence: {result.confidence:.2f}")
print(f"Alternatives: {result.alternative_classifications}")
```

##### `multi_criteria_decision(feature, criteria_weights) -> Dict`
Multi-criteria decision making.

```python
decision = feature_classifier.multi_criteria_decision(
    feature=my_feature,
    criteria_weights={
        'cylindrical': 0.4,
        'deep': 0.4,
        'large': 0.2
    }
)

print(f"Score: {decision['weighted_score']:.2f}")
print(f"Decision: {decision['decision']}")
```

#### `MachinabilityScorer`

##### `score_feature(feature, material_hardness) -> Dict`
Calculate machining difficulty.

```python
from advanced_algorithms import machinability_scorer

score = machinability_scorer.score_feature(
    feature=my_feature,
    material_hardness="250 HB"
)

print(f"Score: {score['score']:.1f}/10")
print(f"Difficulty: {score['difficulty']}")
print(f"Factors: {score['factors']}")
```

**Difficulty Levels:**
- 1-3: Easy
- 4-6: Moderate
- 7-9: Difficult
- 10: Very Difficult

#### `AdjacencyAnalyzer`

##### `analyze_adjacency(features) -> List[FeatureRelationship]`
Find relationships between features.

```python
from advanced_algorithms import adjacency_analyzer

relationships = adjacency_analyzer.analyze_adjacency(features)

for rel in relationships:
    print(f"{rel.feature1_id} → {rel.feature2_id}")
    print(f"Type: {rel.relationship_type}")
    print(f"Strength: {rel.strength:.2f}")
```

##### `build_feature_graph(features) -> Dict`
Create graph representation.

```python
graph = adjacency_analyzer.build_feature_graph(features)
# Returns: {'nodes': [...], 'edges': [...]}
```

---

## FBM Advanced API

**Module:** `FBM_advanced.py`  
**Purpose:** Complete advanced FBM system

### Classes

#### `AdvancedMachiningProcessPlanner`

Complete automated FBM workflow.

```python
from FBM_advanced import AdvancedMachiningProcessPlanner

# Load CAD file
planner = AdvancedMachiningProcessPlanner("complex_part.step")

# Run complete process
result = planner.process()

# Access results
features = result['features']
operations = result['operations']
patterns = result['patterns']
summary = result['summary']

print(f"Features: {summary['total_features']}")
print(f"Operations: {summary['total_operations']}")
print(f"Patterns: {summary['total_patterns']}")
print(f"Time: {summary['estimated_total_time_hours']:.2f} hrs")

# Generate operation sheet
planner.generate_operation_sheet("operation_sheet.txt")
```

**Returns Dictionary:**
- `features`: List of detected features
- `operations`: List of machining operations
- `patterns`: List of detected patterns
- `summary`: Totals and estimates

---

## Quick Reference

### Import Patterns

```python
# Material database
from material_database import material_db, MaterialType, ToolMaterial

# Tool library
from tool_library import tool_library, ToolType

# Toolpath optimizer
from toolpath_optimizer import toolpath_optimizer, ToolpathStrategy

# Cost estimator
from cost_estimator import cost_estimator, MachineType

# Pattern recognizer
from pattern_recognizer import PatternRecognizer, PatternType

# Geometry analyzer
from geometry_analyzer import GeometryAnalyzer

# Advanced algorithms
from advanced_algorithms import (
    feature_classifier,
    machinability_scorer,
    adjacency_analyzer
)

# FBM Advanced
from FBM_advanced import AdvancedMachiningProcessPlanner
```

### Common Workflows

#### 1. Get Cutting Parameters
```python
params = material_db.get_cutting_parameters(
    MaterialType.ALUMINUM_6061,
    ToolMaterial.CARBIDE
)
speed = material_db.get_recommended_cutting_speed(
    MaterialType.ALUMINUM_6061,
    operation_type="roughing"
)
```

#### 2. Select Tool
```python
tool = tool_library.find_best_tool_for_feature(
    "pocket", diameter=8.0, depth=15.0, material="Aluminum"
)
```

#### 3. Optimize Toolpath
```python
engagement = toolpath_optimizer.analyze_tool_engagement(10.0, 4.0, 5.0)
troch = toolpath_optimizer.calculate_trochoidal_parameters(12.0, 8.0, 500)
```

#### 4. Estimate Cost
```python
cost = cost_estimator.estimate_complete_cost(
    material_type="ALUMINUM_6061",
    material_volume_cm3=500,
    num_features=15,
    machining_time_hours=2.5,
    quantity=10
)
```

---

## Error Handling

All modules include proper error handling:

```python
try:
    tool = tool_library.find_tool(ToolType.END_MILL, 10.0)
    if tool is None:
        print("Tool not found")
except Exception as e:
    print(f"Error: {e}")
```

---

## Type Hints

All modules use comprehensive type hints:

```python
def find_tool(
    self, 
    tool_type: ToolType, 
    diameter: float,
    tolerance: float = 0.5
) -> Optional[Tool]:
    pass
```

---

**For complete examples, see the test suite: `test_fbm_system.py`**
