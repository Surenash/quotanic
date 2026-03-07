# Decompiled with PyLingual (https://pylingual.io)
# Internal filename: '/Users/mac/Desktop/quotanic anti/manfacquot/FBM/FBM_core.py'
# Bytecode version: 3.11a7e (3495)
# Source timestamp: 2025-12-11 22:10:11 UTC (1765491011)

"""\nCore classes and definitions for the Feature-Based Machining (FBM) system.\nProvides base classes for features, operations, and recognition engines.\n"""
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple
class FeatureType(Enum):
    """Basic machining feature types"""
    HOLE = 'Hole'
    HOLE_THROUGH = 'Through Hole'
    HOLE_BLIND = 'Blind Hole'
    POCKET = 'Pocket'
    POCKET_RECTANGULAR = 'Rectangular Pocket'
    POCKET_CIRCULAR = 'Circular Pocket'
    SLOT = 'Slot'
    FACE = 'Face'
    FACE_PLANAR = 'Planar Face'
    BOSS = 'Boss'
class MachiningStrategy(Enum):
    """Strategies for machining operations"""
    DRILLING = 'Drilling'
    MILLING = 'Milling'
    THREAD_MILLING = 'Thread Milling'
    CONTOUR = 'Contour'
    POCKETING = 'Pocketing'
    FACING = 'Facing'
    CHAMFERING = 'Chamfering'
@dataclass
class MachiningFeature:
    """Base class for a detected machining feature"""
    feature_id: int
    feature_type: Any
    geometry: Dict[str, Any]
    diameter: Optional[float] = None
    depth: Optional[float] = None
    width: Optional[float] = None
    length: Optional[float] = None
    area: Optional[float] = None
    volume: Optional[float] = None
    orientation: List[float] = field(default_factory=lambda: [0.0, 0.0, 1.0])
    accessibility: float = 1.0
    surface_finish_required: str = 'Standard'
    tolerance: str = '+/- 0.1mm'
@dataclass
class MachiningOperation:
    """Base class for a machining operation"""
    operation_id: int
    operation_name: str
    feature: MachiningFeature
    strategy: MachiningStrategy
    tool_type: Any
    tool_diameter: float
    cutting_speed: float
    spindle_speed: int
    feed_rate: float
    depth_of_cut: float
    stepover: float
    number_of_passes: int
    estimated_time: float
    setup_required: int = 1
    priority: int = 10
    coolant: str = 'Flood'
    notes: str = ''
class FeatureRecognitionEngine:
    """Base class for feature recognition logic"""
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.shape = None
        self.features = []
        self.feature_counter = 0
    def load_file(self) -> bool:
        # irreducible cflow, using cdg fallback
        """Load the CAD file (STEP/IGES)"""
        # ***<module>.FeatureRecognitionEngine.load_file: Failure: Compilation Error
        from OCC.Extend.DataExchange import read_step_file, read_iges_file
        if self.filepath.lower().endswith(('.step', '.stp')):
            self.shape = read_step_file(self.filepath)
                return True
            if self.filepath.lower().endswith(('.iges', '.igs')):
                self.shape = read_iges_file(self.filepath)
                    return True
                return False
                except ImportError:
                    print('Error: pythonocc-core not installed or load failed')
                        return False
                    except Exception as e:
                            print(f'Error loading file: {e}')
                                return False
    def recognize_all_features(self) -> List[MachiningFeature]:
        """Placeholder for base recognition - to be overridden"""
        if not self.shape and (not self.load_file()):
            return []
        else:
            return []
class ToolpathGenerator:
    """Base class for generating operations from features"""
    def __init__(self, features: List[MachiningFeature]):
        self.features = features
        self.operations = []
        self.operation_counter = 1
    def _calculate_spindle_speed(self, tool_diameter: float, cutting_speed: float) -> int:
        """Calculate RPM = (Vc * 1000) / (pi * D)"""
        import math
        if tool_diameter <= 0:
            return 0
        else:
            return int(cutting_speed * 1000 / (math.pi * tool_diameter))
    def generate_hole_operations(self, feature: MachiningFeature) -> List[MachiningOperation]:
        """Placeholder for hole ops"""
        return []
    def generate_pocket_operations(self, feature: MachiningFeature) -> List[MachiningOperation]:
        """Placeholder for pocket ops"""
        return []
    def generate_face_operations(self, feature: MachiningFeature) -> List[MachiningOperation]:
        """Placeholder for face ops"""
        return []