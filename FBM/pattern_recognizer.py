"""
Pattern Recognizer Module
Detects feature patterns and symmetry for FBM system
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
import math
from enum import Enum


class PatternType(Enum):
    """Types of geometric patterns - EXPANDED"""
    # Basic patterns
    LINEAR = "Linear Pattern"
    CIRCULAR = "Circular Pattern (Bolt Circle)"
    GRID = "Grid Pattern (2D Array)"
    MIRROR = "Mirror Symmetry"
    
    # Advanced patterns - NEW
    HEXAGONAL = "Hexagonal Pattern"
    RADIAL = "Radial Pattern (Star)"
    CONCENTRIC = "Concentric Circles"
    SPIRAL = "Spiral Pattern"
    CUSTOM_PATH = "Custom Path Pattern"
    RANDOM_SCATTER = "Random Scatter (Statistical)"
    IRREGULAR = "Irregular Pattern"
    
    # Symmetry types - NEW
    ROTATIONAL_SYMMETRY = "Rotational Symmetry"
    BILATERAL_SYMMETRY = "Bilateral Symmetry"
    POINT_SYMMETRY = "Point Symmetry"
    PATH = "Path Pattern"
    NONE = "No Pattern"


@dataclass
class FeaturePattern:
    """Represents a detected pattern of features"""
    pattern_type: PatternType
    feature_ids: List[int]
    pattern_count: int
    spacing: float = 0.0  # For linear patterns
    angle: float = 0.0  # For circular patterns (degrees between features)
    center: Tuple[float, float, float] = None  # For circular patterns
    direction: Tuple[float, float, float] = None  # For linear patterns
    confidence: float = 1.0  # 0-1 confidence in pattern detection


class PatternRecognizer:
    """Detects and analyzes feature patterns"""
    
    def __init__(self, features: List):
        self.features = features
        self.POSITION_TOLERANCE = 0.5  # mm tolerance for position matching
        self.ANGLE_TOLERANCE = 2.0  # degrees tolerance for angle matching
        self.MIN_PATTERN_COUNT = 2  # Minimum features to form a pattern
        
    def recognize_all_patterns(self) -> List[FeaturePattern]:
        """Recognize all patterns in the feature set"""
        patterns = []
        
        # Group features by type
        feature_groups = self._group_features_by_type()
        
        for feature_type, feature_list in feature_groups.items():
            if len(feature_list) < self.MIN_PATTERN_COUNT:
                continue
            
            # Try to detect different pattern types
            linear_patterns = self.detect_linear_patterns(feature_list)
            patterns.extend(linear_patterns)
            
            circular_patterns = self.detect_circular_patterns(feature_list)
            patterns.extend(circular_patterns)
            
            grid_patterns = self.detect_grid_patterns(feature_list)
            patterns.extend(grid_patterns)
            
            mirror_patterns = self.detect_mirror_patterns(feature_list)
            patterns.extend(mirror_patterns)
        
        return patterns
    
    def _group_features_by_type(self) -> Dict:
        """Group features by their type"""
        groups = {}
        for feature in self.features:
            feat_type = feature.feature_type.value
            if feat_type not in groups:
                groups[feat_type] = []
            groups[feat_type].append(feature)
        return groups
    
    def _get_feature_center(self, feature) -> Tuple[float, float, float]:
        """Extract center position from feature geometry"""
        # Try to get center from geometry
        if 'center' in feature.geometry:
            center = feature.geometry['center']
            return (center.X(), center.Y(), center.Z())
        
        # Otherwise estimate from bounding box or other properties
        return (0.0, 0.0, 0.0)
    
    def detect_linear_patterns(self, features: List) -> List[FeaturePattern]:
        """
        Detect linear patterns (features arranged in a straight line)
        Example: Row of holes
        """
        patterns = []
        
        if len(features) < self.MIN_PATTERN_COUNT:
            return patterns
        
        # Get feature centers
        centers = [self._get_feature_center(f) for f in features]
        
        # Try all pairs as potential pattern starts
        used_features = set()
        
        for i in range(len(features)):
            if i in used_features:
                continue
                
            for j in range(i + 1, len(features)):
                if j in used_features:
                    continue
                
                # Calculate direction vector
                dx = centers[j][0] - centers[i][0]
                dy = centers[j][1] - centers[i][1]
                dz = centers[j][2] - centers[i][2]
                
                spacing = math.sqrt(dx**2 + dy**2 + dz**2)
                if spacing < 0.1:  # Too close
                    continue
                
                # Normalize direction
                direction = (dx/spacing, dy/spacing, dz/spacing)
                
                # Find all features along this line
                pattern_features = [i, j]
                
                for k in range(len(features)):
                    if k in [i, j] or k in used_features:
                        continue
                    
                    # Check if feature k is along the same line
                    if self._is_on_line(centers[i], direction, spacing, centers[k]):
                        pattern_features.append(k)
                
                # If we found a pattern with enough features
                if len(pattern_features) >= self.MIN_PATTERN_COUNT:
                    # Sort by distance along line
                    pattern_features.sort(key=lambda idx: self._distance_along_line(
                        centers[i], direction, centers[idx]
                    ))
                    
                    # Verify consistent spacing
                    spacings = []
                    for p in range(len(pattern_features) - 1):
                        idx1, idx2 = pattern_features[p], pattern_features[p + 1]
                        dist = math.sqrt(sum((centers[idx2][d] - centers[idx1][d])**2 for d in range(3)))
                        spacings.append(dist)
                    
                    avg_spacing = sum(spacings) / len(spacings)
                    max_deviation = max(abs(s - avg_spacing) for s in spacings)
                    
                    if max_deviation < self.POSITION_TOLERANCE:
                        # Valid linear pattern
                        feature_ids = [features[idx].feature_id for idx in pattern_features]
                        
                        pattern = FeaturePattern(
                            pattern_type=PatternType.LINEAR,
                            feature_ids=feature_ids,
                            pattern_count=len(feature_ids),
                            spacing=avg_spacing,
                            direction=direction,
                            confidence=1.0 - (max_deviation / avg_spacing)
                        )
                        patterns.append(pattern)
                        used_features.update(pattern_features)
                        break
        
        return patterns
    
    def detect_circular_patterns(self, features: List) -> List[FeaturePattern]:
        """
        Detect circular/radial patterns (features arranged in a circle)
        Example: Bolt circle, radial holes
        """
        patterns = []
        
        if len(features) < 3:  # Need at least 3 for circular pattern
            return patterns
        
        centers = [self._get_feature_center(f) for f in features]
        
        # Try to find circular arrangement
        # Use first 3 points to determine circle center
        for i in range(len(features)):
            for j in range(i + 1, len(features)):
                for k in range(j + 1, len(features)):
                    # Calculate circle center from 3 points
                    circle_center = self._calculate_circle_center_3d(
                        centers[i], centers[j], centers[k]
                    )
                    
                    if circle_center is None:
                        continue
                    
                    # Calculate radius
                    radius = math.sqrt(sum((centers[i][d] - circle_center[d])**2 for d in range(3)))
                    
                    # Check how many other features fit this circle
                    pattern_features = [i, j, k]
                    
                    for m in range(len(features)):
                        if m in pattern_features:
                            continue
                        
                        dist = math.sqrt(sum((centers[m][d] - circle_center[d])**2 for d in range(3)))
                        if abs(dist - radius) < self.POSITION_TOLERANCE:
                            pattern_features.append(m)
                    
                    if len(pattern_features) >= 3:
                        # Calculate angle between features
                        if len(pattern_features) > 0:
                            avg_angle = 360.0 / len(pattern_features)
                        else:
                            avg_angle = 0.0
                        
                        feature_ids = [features[idx].feature_id for idx in pattern_features]
                        
                        pattern = FeaturePattern(
                            pattern_type=PatternType.CIRCULAR,
                            feature_ids=feature_ids,
                            pattern_count=len(feature_ids),
                            angle=avg_angle,
                            center=circle_center,
                            confidence=0.9
                        )
                        patterns.append(pattern)
                        return patterns  # Return first found circular pattern
        
        return patterns
    
    def detect_grid_patterns(self, features: List) -> List[FeaturePattern]:
        """
        Detect 2D grid patterns (rows and columns)
        Example: Grid of mounting holes
        """
        patterns = []
        
        if len(features) < 4:  # Need at least 2x2 grid
            return patterns
        
        centers = [self._get_feature_center(f) for f in features]
        
        # Try to detect regular grid spacing in X and Y
        x_spacings = []
        y_spacings = []
        
        for i in range(len(centers)):
            for j in range(i + 1, len(centers)):
                dx = abs(centers[j][0] - centers[i][0])
                dy = abs(centers[j][1] - centers[i][1])
                dz = abs(centers[j][2] - centers[i][2])
                
                # Only consider points in same Z plane
                if dz < self.POSITION_TOLERANCE:
                    if dx > 0.1:
                        x_spacings.append(dx)
                    if dy > 0.1:
                        y_spacings.append(dy)
        
        if x_spacings and y_spacings:
            # Look for dominant spacing values
            x_spacing = self._find_dominant_spacing(x_spacings)
            y_spacing = self._find_dominant_spacing(y_spacings)
            
            if x_spacing and y_spacing:
                # Count how many features fit the grid
                grid_features = list(range(len(features)))
                
                if len(grid_features) >= 4:
                    feature_ids = [features[idx].feature_id for idx in grid_features]
                    
                    pattern = FeaturePattern(
                        pattern_type=PatternType.GRID,
                        feature_ids=feature_ids,
                        pattern_count=len(feature_ids),
                        spacing=min(x_spacing, y_spacing),
                        confidence=0.8
                    )
                    patterns.append(pattern)
        
        return patterns
    
    def detect_mirror_patterns(self, features: List) -> List[FeaturePattern]:
        """
        Detect mirror symmetry
        Example: Symmetric part features
        """
        patterns = []
        
        if len(features) < 2:
            return patterns
        
        centers = [self._get_feature_center(f) for f in features]
        
        # Try different mirror planes (XY, XZ, YZ at origin)
        mirror_planes = [
            ('XY', 2),  # Mirror across XY plane (flip Z)
            ('XZ', 1),  # Mirror across XZ plane (flip Y)
            ('YZ', 0)   # Mirror across YZ plane (flip X)
        ]
        
        for plane_name, flip_axis in mirror_planes:
            mirrored_pairs = []
            used_indices = set()
            
            for i in range(len(features)):
                if i in used_indices:
                    continue
                
                # Calculate mirrored position
                mirrored_pos = list(centers[i])
                mirrored_pos[flip_axis] = -mirrored_pos[flip_axis]
                
                # Find matching feature
                for j in range(i + 1, len(features)):
                    if j in used_indices:
                        continue
                    
                    dist = math.sqrt(sum((centers[j][d] - mirrored_pos[d])**2 for d in range(3)))
                    if dist < self.POSITION_TOLERANCE:
                        mirrored_pairs.append((i, j))
                        used_indices.add(i)
                        used_indices.add(j)
                        break
            
            if len(mirrored_pairs) >= 1:
                feature_ids = []
                for pair in mirrored_pairs:
                    feature_ids.extend([features[pair[0]].feature_id, features[pair[1]].feature_id])
                
                pattern = FeaturePattern(
                    pattern_type=PatternType.MIRROR,
                    feature_ids=feature_ids,
                    pattern_count=len(feature_ids),
                    direction=(plane_name,),
                    confidence=0.85
                )
                patterns.append(pattern)
        
        return patterns
    
    def _is_on_line(self, line_point: Tuple, direction: Tuple, spacing: float, 
                    test_point: Tuple) -> bool:
        """Check if a point lies on a line within tolerance"""
        # Calculate distance from point to line
        dx = test_point[0] - line_point[0]
        dy = test_point[1] - line_point[1]
        dz = test_point[2] - line_point[2]
        
        # Projection onto line
        proj = dx * direction[0] + dy * direction[1] + dz * direction[2]
        
        # Point on line closest to test point
        closest_x = line_point[0] + proj * direction[0]
        closest_y = line_point[1] + proj * direction[1]
        closest_z = line_point[2] + proj * direction[2]
        
        # Distance from test point to line
        dist = math.sqrt(
            (test_point[0] - closest_x)**2 +
            (test_point[1] - closest_y)**2 +
            (test_point[2] - closest_z)**2
        )
        
        return dist < self.POSITION_TOLERANCE
    
    def _distance_along_line(self, line_point: Tuple, direction: Tuple, 
                            test_point: Tuple) -> float:
        """Calculate distance along line from line_point to projection of test_point"""
        dx = test_point[0] - line_point[0]
        dy = test_point[1] - line_point[1]
        dz = test_point[2] - line_point[2]
        
        proj = dx * direction[0] + dy * direction[1] + dz * direction[2]
        return proj
    
    def _calculate_circle_center_3d(self, p1: Tuple, p2: Tuple, p3: Tuple) -> Optional[Tuple]:
        """Calculate circle center from 3 points in 3D space"""
        # Simplified: assume points are coplanar in XY plane
        # For production, would use full 3D circle fitting
        
        x1, y1 = p1[0], p1[1]
        x2, y2 = p2[0], p2[1]
        x3, y3 = p3[0], p3[1]
        
        # Calculate circle center in 2D
        d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
        
        if abs(d) < 0.001:  # Collinear points
            return None
        
        ux = ((x1**2 + y1**2) * (y2 - y3) + (x2**2 + y2**2) * (y3 - y1) + 
              (x3**2 + y3**2) * (y1 - y2)) / d
        uy = ((x1**2 + y1**2) * (x3 - x2) + (x2**2 + y2**2) * (x1 - x3) + 
              (x3**2 + y3**2) * (x2 - x1)) / d
        
        # Use average Z
        uz = (p1[2] + p2[2] + p3[2]) / 3.0
        
        return (ux, uy, uz)
    
    def _find_dominant_spacing(self, spacings: List[float]) -> Optional[float]:
        """Find the most common spacing value from a list"""
        if not spacings:
            return None
        
        # Group similar spacings
        spacing_groups = {}
        for spacing in spacings:
            found_group = False
            for key in spacing_groups:
                if abs(spacing - key) < self.POSITION_TOLERANCE:
                    spacing_groups[key].append(spacing)
                    found_group = True
                    break
            if not found_group:
                spacing_groups[spacing] = [spacing]
        
        # Find largest group
        max_group = max(spacing_groups.values(), key=len)
        if len(max_group) >= 2:
            return sum(max_group) / len(max_group)
        
        return None
