"""
FBM Integration Module
Provides interface between Django app and FBM (Feature-Based Machining) system
"""
import sys
import os
import logging
from typing import Dict, List, Optional, Tuple
from decimal import Decimal

logger = logging.getLogger(__name__)

# Add FBM directory to Python path
FBM_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'FBM')
if FBM_DIR not in sys.path:
    sys.path.insert(0, FBM_DIR)

# Import FBM modules
try:
    from FBM_advanced import (
        AdvancedMachiningProcessPlanner,
        AdvancedFeatureType,
        AdvancedMachiningFeature,
        MachiningOperation
    )
    from material_database import material_db, MaterialType
    from tool_library import tool_library, ToolType
    from cost_estimator import cost_estimator, MachineType
    from pattern_recognizer import PatternType
    from geometry_analyzer import GeometryAnalyzer
    
    FBM_AVAILABLE = True
    logger.info("FBM system loaded successfully")
except ImportError as e:
    FBM_AVAILABLE = False
    logger.warning(f"FBM system not available: {e}")


class FBMAnalyzer:
    """
    Wrapper for FBM analysis system
    Provides Django-friendly interface to FBM functionality
    """
    
    def __init__(self):
        if not FBM_AVAILABLE:
            raise RuntimeError("FBM system is not available. Check FBM module imports.")
    
    def analyze_file(self, file_path: str) -> Dict:
        """
        Run complete FBM analysis on CAD file
        
        Args:
            file_path: Path to STEP/IGES file
            
        Returns:
            Dict containing:
                - features: List of detected features
                - operations: List of machining operations
                - patterns: List of detected patterns
                - geometry_analysis: Overall geometry analysis
                - cost_estimate: Cost breakdown
                - summary: Summary statistics
        """
        logger.info(f"Starting FBM analysis for {file_path}")
        
        try:
            # Initialize FBM planner
            planner = AdvancedMachiningProcessPlanner(file_path)
            
            # Run analysis
            result = planner.process()
            
            # Extract and format data
            analysis_result = {
                'features': self.extract_features(result.get('features', [])),
                'operations': self.extract_operations(result.get('operations', [])),
                'patterns': self.extract_patterns(result.get('patterns', [])),
                'geometry_analysis': self.extract_geometry_analysis(planner.recognizer),
                'summary': result.get('summary', {}),
                'fbm_available': True,
                'analysis_engine': 'FBM-Advanced'
            }
            
            logger.info(f"FBM analysis completed: {analysis_result['summary']}")
            return analysis_result
            
        except Exception as e:
            logger.error(f"FBM analysis failed: {e}", exc_info=True)
            return {
                'fbm_available': False,
                'error': str(e),
                'features': [],
                'operations': [],
                'patterns': []
            }
    
    def extract_features(self, features: List) -> List[Dict]:
        """
        Extract feature data in Django-friendly format
        
        Args:
            features: List of AdvancedMachiningFeature objects
            
        Returns:
            List of feature dictionaries
        """
        result = []
        
        for feature in features:
            feature_data = {
                'feature_id': feature.feature_id,
                'feature_type': feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type),
                'diameter': float(feature.diameter) if feature.diameter else None,
                'depth': float(feature.depth) if feature.depth else None,
                'width': float(feature.width) if feature.width else None,
                'length': float(feature.length) if feature.length else None,
                'area': float(feature.area) if feature.area else None,
                'volume': float(feature.volume) if feature.volume else None,
                'orientation': feature.orientation,
                'accessibility': feature.accessibility,
                'surface_finish_required': feature.surface_finish_required,
                'tolerance': feature.tolerance,
            }
            
            # Add advanced feature data if available
            if hasattr(feature, 'confidence_score'):
                feature_data.update({
                    'confidence_score': float(feature.confidence_score),
                    'complexity_rating': feature.complexity_rating,
                    'manufacturing_notes': feature.manufacturing_notes,
                    'alternative_strategies': feature.alternative_strategies if hasattr(feature, 'alternative_strategies') else [],
                    'risk_factors': feature.risk_factors if hasattr(feature, 'risk_factors') else [],
                    'pattern_id': feature.pattern_id if hasattr(feature, 'pattern_id') else None,
                })
            
            # Add thread-specific data
            if hasattr(feature, 'thread_pitch') and feature.thread_pitch > 0:
                feature_data.update({
                    'thread_pitch': float(feature.thread_pitch),
                    'thread_type': feature.thread_type,
                })
            
            # Add counterbore/countersink data
            if hasattr(feature, 'shoulder_diameter') and feature.shoulder_diameter > 0:
                feature_data.update({
                    'shoulder_diameter': float(feature.shoulder_diameter),
                    'shoulder_depth': float(feature.shoulder_depth) if feature.shoulder_depth else None,
                })
            
            if hasattr(feature, 'sink_angle') and feature.sink_angle > 0:
                feature_data['sink_angle'] = float(feature.sink_angle)
            
            # Add boss/protrusion data
            if hasattr(feature, 'height') and feature.height > 0:
                feature_data['height'] = float(feature.height)
            
            result.append(feature_data)
        
        return result
    
    def extract_operations(self, operations: List) -> List[Dict]:
        """
        Extract operation data in Django-friendly format
        
        Args:
            operations: List of MachiningOperation objects
            
        Returns:
            List of operation dictionaries
        """
        result = []
        
        for op in operations:
            op_data = {
                'operation_id': op.operation_id,
                'operation_name': op.operation_name,
                'strategy': op.strategy.value if hasattr(op.strategy, 'value') else str(op.strategy),
                'tool_type': op.tool_type.value if hasattr(op.tool_type, 'value') else str(op.tool_type),
                'tool_diameter': float(op.tool_diameter),
                'cutting_speed': float(op.cutting_speed),
                'feed_rate': float(op.feed_rate),
                'spindle_speed': int(op.spindle_speed),
                'depth_of_cut': float(op.depth_of_cut),
                'stepover': float(op.stepover),
                'number_of_passes': int(op.number_of_passes),
                'estimated_time': float(op.estimated_time),  # in minutes
                'setup_required': int(op.setup_required),
                'priority': int(op.priority),
                'coolant': op.coolant if hasattr(op, 'coolant') else 'Flood',
                'notes': op.notes if hasattr(op, 'notes') else '',
            }
            
            result.append(op_data)
        
        return result
    
    def extract_patterns(self, patterns: List) -> List[Dict]:
        """
        Extract pattern data in Django-friendly format
        
        Args:
            patterns: List of FeaturePattern objects
            
        Returns:
            List of pattern dictionaries
        """
        result = []
        
        for pattern in patterns:
            pattern_data = {
                'pattern_type': pattern.pattern_type.value if hasattr(pattern.pattern_type, 'value') else str(pattern.pattern_type),
                'feature_ids': pattern.feature_ids,
                'pattern_count': pattern.pattern_count,
                'spacing': float(pattern.spacing) if hasattr(pattern, 'spacing') else None,
                'confidence': float(pattern.confidence),
                'center': [float(pattern.center.X()), float(pattern.center.Y()), float(pattern.center.Z())] if hasattr(pattern, 'center') else None,
            }
            
            # Add pattern-specific data
            if hasattr(pattern, 'direction') and pattern.direction:
                pattern_data['direction'] = [
                    float(pattern.direction.X()),
                    float(pattern.direction.Y()),
                    float(pattern.direction.Z())
                ]
            
            if hasattr(pattern, 'radius'):
                pattern_data['radius'] = float(pattern.radius)
            
            if hasattr(pattern, 'angle_step'):
                pattern_data['angle_step'] = float(pattern.angle_step)
            
            result.append(pattern_data)
        
        return result
    
    def extract_geometry_analysis(self, recognizer) -> Dict:
        """
        Extract geometry analysis data
        
        Args:
            recognizer: AdvancedFeatureRecognitionEngine instance
            
        Returns:
            Geometry analysis dictionary
        """
        if not hasattr(recognizer, 'geometry_analyzer') or not recognizer.geometry_analyzer:
            return {}
        
        analyzer = recognizer.geometry_analyzer
        
        # Get overall analysis if available
        if hasattr(analyzer, 'overall_analysis'):
            analysis = analyzer.overall_analysis
            return {
                'has_undercuts': analysis.has_undercuts,
                'has_thin_walls': analysis.has_thin_walls,
                'min_wall_thickness': float(analysis.min_wall_thickness),
                'accessibility_score': float(analysis.accessibility_score),
                'complexity_score': float(analysis.complexity_score),
                'manufacturing_risks': analysis.manufacturing_risks,
                'draft_angles': analysis.draft_angles if hasattr(analysis, 'draft_angles') else [],
            }
        
        return {}
    
    def estimate_cost(self, fbm_result: Dict, material: str, quantity: int) -> Dict:
        """
        Estimate cost using FBM analysis data
        
        Args:
            fbm_result: Result from analyze_file()
            material: Material type (e.g., 'ALUMINUM_6061')
            quantity: Number of parts
            
        Returns:
            Cost breakdown dictionary
        """
        try:
            # Map material string to MaterialType enum
            material_type = self._map_material_to_fbm(material)
            
            # Calculate total machining time from operations
            operations = fbm_result.get('operations', [])
            total_machining_time_minutes = sum(op['estimated_time'] for op in operations)
            total_machining_time_hours = total_machining_time_minutes / 60.0
            
            # Get volume from summary or calculate
            volume_cm3 = fbm_result.get('summary', {}).get('total_volume', 0)
            
            # Use FBM cost estimator
            cost_result = cost_estimator.estimate_complete_cost(
                material_type=material_type,
                material_volume_cm3=volume_cm3,
                num_features=len(fbm_result.get('features', [])),
                num_operations=len(operations),
                machining_time_hours=total_machining_time_hours,
                quantity=quantity,
                machine_type=MachineType.CNC_3AXIS  # Default, could be determined from features
            )
            
            return {
                'total_cost': float(cost_result.total_cost),
                'cost_per_unit': float(cost_result.cost_per_unit),
                'material_cost': float(cost_result.material_cost),
                'programming_time_cost': float(cost_result.programming_time_cost),
                'setup_cost': float(cost_result.setup_cost),
                'machining_cost': float(cost_result.machining_cost),
                'tool_cost': float(cost_result.tool_cost),
                'overhead_cost': float(cost_result.overhead_cost),
                'profit': float(cost_result.profit),
                'machining_time_hours': total_machining_time_hours,
                'fbm_enhanced': True,
            }
            
        except Exception as e:
            logger.error(f"FBM cost estimation failed: {e}")
            return {
                'fbm_enhanced': False,
                'error': str(e)
            }
    
    def _map_material_to_fbm(self, material: str) -> str:
        """
        Map Django material string to FBM MaterialType enum value
        
        Args:
            material: Material string from Django
            
        Returns:
            FBM MaterialType enum value string
        """
        # Mapping from common material names to FBM MaterialType
        material_mapping = {
            'Aluminum': 'ALUMINUM_6061',
            'Aluminum 6061': 'ALUMINUM_6061',
            'Aluminum 7075': 'ALUMINUM_7075',
            'Steel': 'STEEL_MILD',
            'Mild Steel': 'STEEL_MILD',
            'Stainless Steel': 'STEEL_STAINLESS_304',
            'Stainless 304': 'STEEL_STAINLESS_304',
            'Tool Steel': 'STEEL_TOOL',
            'Titanium': 'TITANIUM_6AL4V',
            'Brass': 'BRASS',
            'ABS': 'PLASTIC_ABS',
            'Delrin': 'PLASTIC_DELRIN',
        }
        
        return material_mapping.get(material, 'ALUMINUM_6061')  # Default to aluminum
    
    def generate_operation_sheet(self, fbm_result: Dict, output_path: str) -> bool:
        """
        Generate human-readable operation sheet
        
        Args:
            fbm_result: Result from analyze_file()
            output_path: Path to save operation sheet
            
        Returns:
            True if successful
        """
        try:
            with open(output_path, 'w') as f:
                f.write("=" * 80 + "\n")
                f.write("FEATURE-BASED MACHINING (FBM) OPERATION SHEET\n")
                f.write("=" * 80 + "\n\n")
                
                # Summary
                summary = fbm_result.get('summary', {})
                f.write("SUMMARY\n")
                f.write("-" * 40 + "\n")
                f.write(f"Total Features Recognized: {summary.get('total_features', 0)}\n")
                f.write(f"Total Operations: {summary.get('total_operations', 0)}\n")
                f.write(f"Estimated Total Time: {summary.get('estimated_total_time_hours', 0):.2f} hours\n")
                f.write(f"Number of Setups: {summary.get('number_of_setups', 1)}\n\n")
                
                # Features
                features = fbm_result.get('features', [])
                f.write("FEATURES RECOGNIZED\n")
                f.write("-" * 40 + "\n")
                for feature in features:
                    f.write(f"  {feature['feature_type']}: ")
                    if feature.get('diameter'):
                        f.write(f"Ø{feature['diameter']:.1f}mm")
                    if feature.get('depth'):
                        f.write(f" x {feature['depth']:.1f}mm deep")
                    f.write("\n")
                f.write("\n")
                
                # Operations
                operations = fbm_result.get('operations', [])
                f.write("MACHINING OPERATIONS SEQUENCE\n")
                f.write("=" * 80 + "\n")
                for op in operations:
                    f.write(f"\nOperation #{op['operation_id']}: {op['operation_name']}\n")
                    f.write(f"  Strategy: {op['strategy']}\n")
                    f.write(f"  Tool: {op['tool_type']}, Ø{op['tool_diameter']:.1f}mm\n")
                    f.write(f"  Cutting Speed: {op['cutting_speed']} m/min\n")
                    f.write(f"  Spindle Speed: {op['spindle_speed']} RPM\n")
                    f.write(f"  Feed Rate: {op['feed_rate']} mm/min\n")
                    f.write(f"  Estimated Time: {op['estimated_time']:.1f} min\n")
                    if op.get('notes'):
                        f.write(f"  Notes: {op['notes']}\n")
                
                f.write("\n" + "=" * 80 + "\n")
            
            logger.info(f"Operation sheet generated: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate operation sheet: {e}")
            return False


# Singleton instance
fbm_analyzer = FBMAnalyzer() if FBM_AVAILABLE else None
