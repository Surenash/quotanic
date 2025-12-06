# FBM System - Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Module Dependencies](#module-dependencies)
3. [Data Structures](#data-structures)
4. [Extension Guide](#extension-guide)
5. [Best Practices](#best-practices)
6. [Performance Optimization](#performance-optimization)
7. [Integration Guide](#integration-guide)

---

## Architecture Overview

### System Design

The FBM system follows a modular, layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│              (FBM_advanced.py - Main Entry Point)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                Intelligence & Analysis Layer                 │
├──────────────────────────────────────────────────────────────┤
│  ● advanced_algorithms.py  (Classification, Graphs, Scoring) │
│  ● pattern_recognizer.py   (Pattern Detection)              │
│  ● geometry_analyzer.py    (Risk Assessment)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Processing & Strategy Layer               │
├──────────────────────────────────────────────────────────────┤
│  ● toolpath_optimizer.py   (Engagement, Trochoidal, HSM)   │
│  ● cost_estimator.py       (Cost Breakdown, ROI)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                     Data & Knowledge Layer                   │
├──────────────────────────────────────────────────────────────┤
│  ● material_database.py    (Materials, Parameters)          │
│  ● tool_library.py         (80+ Tools, Selection)           │
└──────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **Singleton Pattern** - Database instances
   ```python
   material_db = MaterialDatabase()  # Single instance
   tool_library = ToolLibrary()
   ```

2. **Strategy Pattern** - Toolpath strategies
   ```python
   class ToolpathStrategy(Enum):
       ZIGZAG = "Zigzag"
       SPIRAL_IN = "Spiral Inward"
       TROCHOIDAL = "Trochoidal Milling"
   ```

3. **Builder Pattern** - Cost breakdown construction
   ```python
   cost = cost_estimator.estimate_complete_cost(...)
   ```

4. **Factory Pattern** - Feature creation
   ```python
   feature = AdvancedMachiningFeature(...)
   ```

---

## Module Dependencies

### Dependency Graph

```
FBM_advanced.py
    ├── FBM_core.py (base classes)
    ├── geometry_analyzer.py
    ├── pattern_recognizer.py
    ├── material_database.py
    ├── tool_library.py
    ├── toolpath_optimizer.py
    ├── cost_estimator.py
    └── advanced_algorithms.py

toolpath_optimizer.py
    └── (standalone)

cost_estimator.py
    └── material_database.py (for material costs)

pattern_recognizer.py
    └── (standalone, optional pythonocc-core)

geometry_analyzer.py
    └── pythonocc-core (optional)

material_database.py
    └── (standalone)

tool_library.py
    └── (standalone)

advanced_algorithms.py
    └── (standalone)
```

###External Dependencies

**Required:**
- Python 3.8+
- Standard library: `math`, `typing`, `dataclasses`, `enum`, `datetime`

**Optional:**
- `pythonocc-core` - For CAD file processing (STEP, IGES)
- `matplotlib` - For visualization (future)

### Installation

```bash
# Core dependencies (included in Python)
python -m pip install --upgrade pip

# Optional: CAD processing
pip install pythonocc-core

# Optional: Visualization
pip install matplotlib
```

---

## Data Structures

### Core Data Classes

#### MaterialProperties
```python
@dataclass
class MaterialProperties:
    density: float              # g/cm³
    hardness: str              # Brinell or Rockwell
    tensile_strength: float    # MPa
    machinability_rating: int  # 1-10
    chip_formation: str        # Continuous/Discontinuous/Segmented
    thermal_conductivity: float # W/m·K
    heat_affected: bool        # Work hardening
```

#### Tool
```python
@dataclass
class Tool:
    tool_id: str
    tool_type: ToolType
    diameter: float              # mm
    length: float               # mm
    overall_length: float       # mm
    number_of_flutes: int
    material: ToolMaterial
    suitable_materials: List[str]
    max_rpm: int
    cost: float                 # USD
    tool_life_minutes: float
    in_stock: bool = True
    notes: str = ""
```

#### AdvancedMachiningFeature
```python
@dataclass
class AdvancedMachiningFeature(MachiningFeature):
    # Base properties
    feature_id: int
    feature_type: AdvancedFeatureType
    geometry: Dict
    
    # Dimensions
    depth: float = 0.0
    diameter: float = 0.0
    width: float = 0.0
    length: float = 0.0
    area: float = 0.0
    volume: float = 0.0
    
    # Advanced intelligence
    confidence_score: float = 1.0      # 0-1
    complexity_rating: int = 1         # 1-10
    related_features: List[int] = []
    manufacturing_notes: List[str] = []
    alternative_strategies: List[str] = []
    risk_factors: List[str] = []
    pattern_id: Optional[int] = None
    geometry_analysis: Optional[GeometryAnalysis] = None
```

#### FeaturePattern
```python
@dataclass
class FeaturePattern:
    pattern_id: int
    pattern_type: PatternType
    feature_ids: List[int]
    pattern_count: int
    spacing: float              # mm
    angle: float               # degrees
    center: Tuple[float, float, float]
    confidence: float          # 0-1
```

---

## Extension Guide

### Adding a New Material

1. Add to `MaterialType` enum:
```python
class MaterialType(Enum):
    MY_NEW_MATERIAL = "My New Material"
```

2. Add properties:
```python
def _initialize_materials(self):
    return {
        MaterialType.MY_NEW_MATERIAL: MaterialProperties(
            density=7.85,
            hardness="200 HB",
            tensile_strength=500,
            machinability_rating=6,
            chip_formation="Continuous",
            thermal_conductivity=50,
            heat_affected=True
        )
    }
```

3. Add cutting parameters:
```python
params[(MaterialType.MY_NEW_MATERIAL, ToolMaterial.CARBIDE)] = CuttingParameters(
    cutting_speed_min=100,
    cutting_speed_max=200,
    feed_per_tooth_min=0.05,
    feed_per_tooth_max=0.15,
    depth_of_cut_factor=0.4,
    stepover_factor=0.40,
    coolant_type="Flood",
    notes="Custom material notes"
)
```

### Adding a New Tool

```python
# Add to tool library initialization
tool_id = "CUSTOM-12mm"
tools[tool_id] = Tool(
    tool_id=tool_id,
    tool_type=ToolType.END_MILL,
    diameter=12.0,
    length=36.0,
    overall_length=96.0,
    number_of_flutes=4,
    material=ToolMaterial.CARBIDE,
    suitable_materials=["Aluminum", "Steel"],
    max_rpm=4000,
    cost=45.0,
    tool_life_minutes=200,
    notes="Custom tool"
)
```

### Adding a New Feature Type

1. Add to enum:
```python
class AdvancedFeatureType(Enum):
    MY_FEATURE = "My Feature Type"
```

2. Create detection method:
```python
def recognize_my_features(self) -> List[AdvancedMachiningFeature]:
    """Detect my custom features"""
    features = []
    
    # Your detection logic here
    # Analyze CAD geometry, identify features
    
    feature = AdvancedMachiningFeature(
        feature_id=self.feature_counter,
        feature_type=AdvancedFeatureType.MY_FEATURE,
        geometry={...},
        confidence_score=0.85,
        complexity_rating=6
    )
    
    features.append(feature)
    self.feature_counter += 1
    
    return features
```

3. Add toolpath generation:
```python
def generate_my_feature_operations(self, feature) -> List[MachiningOperation]:
    """Generate operations for my feature"""
    operations = []
    
    # Your toolpath logic here
    
    return operations
```

### Adding a New Toolpath Strategy

```python
class AdvancedToolpathGenerator(ToolpathGenerator):
    
    def generate_my_strategy_operations(self, feature):
        """Custom toolpath strategy"""
        operation = MachiningOperation(
            operation_id=self.operation_counter,
            operation_name="My Custom Strategy",
            feature=feature,
            strategy=MachiningStrategy.CUSTOM,
            tool_type=ToolType.END_MILL,
            # ... parameters ...
        )
        
        return [operation]
```

---

## Best Practices

### Code Style

1. **Type Hints**: Always use type hints
   ```python
   def calculate_cost(diameter: float, depth: float) -> float:
       return diameter * depth
   ```

2. **Docstrings**: Document all public functions
   ```python
   def find_tool(self, tool_type: ToolType, diameter: float) -> Optional[Tool]:
       """
       Find a tool by type and diameter.
       
       Args:
           tool_type: Type of tool to find
           diameter: Desired diameter in mm
           
       Returns:
           Tool object if found, None otherwise
       """
       pass
   ```

3. **Constants**: Use UPPERCASE for constants
   ```python
   MAX_ENGAGEMENT_ANGLE = 180.0
   OPTIMAL_ENGAGEMENT_ANGLE = 90.0
   ```

4. **Enums**: Use for fixed sets of values
   ```python
   class MaterialType(Enum):
       ALUMINUM_6061 = "Aluminum 6061"
   ```

### Error Handling

```python
def process_feature(self, feature):
    """Process a machining feature"""
    try:
        # Validate input
        if feature.diameter <= 0:
            raise ValueError("Diameter must be positive")
        
        # Process
        result = self._do_processing(feature)
        
        return result
        
    except ValueError as e:
        print(f"Validation error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return None
```

### Testing

```python
def test_material_database():
    """Test material database functionality"""
    from material_database import material_db, MaterialType
    
    # Test 1: Get properties
    props = material_db.get_material_properties(MaterialType.ALUMINUM_6061)
    assert props.machinability_rating == 9
    
    # Test 2: Get parameters
    params = material_db.get_cutting_parameters(MaterialType.ALUMINUM_6061)
    assert params.cutting_speed_min == 200
    
    print("✅ Material database tests passed")
```

---

## Performance Optimization

### Caching

```python
from functools import lru_cache

class MaterialDatabase:
    
    @lru_cache(maxsize=128)
    def get_cutting_parameters(self, material, tool_material):
        """Cached parameter lookup"""
        return self.cutting_params.get((material, tool_material))
```

### Batch Processing

```python
def process_multiple_features(features: List) -> List:
    """Process features in batch"""
    results = []
    
    # Group by type for efficient processing
    by_type = {}
    for feature in features:
        feat_type = feature.feature_type
        if feat_type not in by_type:
            by_type[feat_type] = []
        by_type[feat_type].append(feature)
    
    # Process each group
    for feat_type, group in by_type.items():
        results.extend(self._process_group(group))
    
    return results
```

### Memory Management

```python
def process_large_cad_file(filepath: str):
    """Process large file efficiently"""
    # Load only necessary data
    shape = self.load_file()
    
    # Process in chunks
    for chunk in self._chunk_geometry(shape):
        features = self.recognize_features(chunk)
        self._stream_to_output(features)
        
        # Clean up
        del features
```

---

## Integration Guide

### With CAM Software

```python
# Export to CAM-compatible format
def export_to_cam(features, operations, output_file):
    """Export FBM results for CAM import"""
    cam_data = {
        'features': [f.to_dict() for f in features],
        'operations': [op.to_dict() for op in operations],
        'tool_list': [op.tool_type for op in operations]
    }
    
    with open(output_file, 'w') as f:
        json.dump(cam_data, f, indent=2)
```

### With ERP Systems

```python
def generate_erp_quotation(cost_breakdown, part_number):
    """Generate ERP-compatible quotation"""
    return {
        'part_number': part_number,
        'material_cost': cost_breakdown.material_cost,
        'labor_cost': cost_breakdown.machining_cost + cost_breakdown.setup_cost,
        'overhead': cost_breakdown.overhead_cost,
        'total': cost_breakdown.total_cost,
        'timestamp': datetime.now().isoformat()
    }
```

### With PLM Systems

```python
def export_manufacturing_data(planner, output_format='xml'):
    """Export for PLM integration"""
    data = {
        'features': planner.features,
        'operations': planner.operations,
        'tooling_requirements': planner.get_tool_list(),
        'estimated_costs': planner.get_cost_summary()
    }
    
    if output_format == 'xml':
        return to_xml(data)
    elif output_format == 'json':
        return json.dumps(data)
```

---

## Advanced Topics

### Custom Algorithms

Implement custom classification:

```python
class CustomFeatureClassifier(FeatureClassifier):
    
    def classify_with_ml(self, feature_properties):
        """Use machine learning for classification"""
        # Load trained model
        model = self.load_model()
        
        # Extract features
        X = self.extract_features(feature_properties)
        
        # Predict
        prediction = model.predict([X])[0]
        confidence = model.predict_proba([X]).max()
        
        return ClassificationResult(
            feature_id=feature_properties['id'],
            primary_classification=prediction,
            confidence=confidence,
            alternative_classifications=[],
            reasoning=["ML model prediction"]
        )
```

### Custom Toolpath Strategies

```python
def generate_custom_spiral(self, pocket_geometry):
    """Custom spiral strategy"""
    center = pocket_geometry['center']
    radius = pocket_geometry['radius']
    depth = pocket_geometry['depth']
    
    # Calculate spiral parameters
    turns = int(radius / tool_diameter)
    pitch = depth / turns
    
    toolpath = []
    for i in range(turns):
        r = tool_diameter * (i + 1)
        angle = 360 * i
        z = -pitch * i
        
        toolpath.append({
            'x': center[0] + r * math.cos(math.radians(angle)),
            'y': center[1] + r * math.sin(math.radians(angle)),
            'z': z
        })
    
    return toolpath
```

---

## Troubleshooting

### Common Issues

1. **Module Not Found**
   ```bash
   # Ensure all files are in the same directory
   ls -l /path/to/FBM/*.py
   ```

2. **Type Errors**
   ```python
   # Use proper types
   diameter = float(10)  # Not int(10) for dimensions
   ```

3. **Memory Issues with Large CAD Files**
   ```python
   # Process in chunks
   for chunk in process_in_chunks(cad_file):
       ...
   ```

---

## Contributing

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Add your code with tests
4. Update documentation
5. Submit pull request

### Code Review Checklist

- [ ] Type hints on all functions
- [ ] Docstrings for public methods
- [ ] Unit tests added
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Error handling in place

---

## Version History

- **v1.0** (2025-12-06): Initial release with 40+ features
- **v1.1** (Future): G-code generation
- **v1.2** (Future): 3D visualization

---

**For more information, see:**
- [API Documentation](API_DOCUMENTATION.md)
- [README](README.md)
- [Test Suite](test_fbm_system.py)
