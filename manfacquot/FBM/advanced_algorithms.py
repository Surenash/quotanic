"""
Advanced Algorithms Module
Sophisticated classification and decision-making for FBM system
"""

from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
import math
from enum import Enum


@dataclass
class FeatureRelationship:
    """Relationship between two features"""
    feature1_id: int
    feature2_id: int
    relationship_type: str  # "adjacent", "overlapping", "contained", "parent-child"
    strength: float  # 0-1, how strong the relationship
    notes: str = ""


@dataclass
class ClassificationResult:
    """Result from feature classification"""
    feature_id: int
    primary_classification: str
    confidence: float
    alternative_classifications: List[Tuple[str, float]]  # (classification, confidence)
    reasoning: List[str]


class FeatureClassifier:
    """Advanced feature classification using multiple criteria"""
    
    def __init__(self):
        self.classification_rules = self._initialize_rules()
        
    def _initialize_rules(self) -> Dict:
        """Initialize fuzzy classification rules"""
        return {
            'hole': {
                'must_have': ['cylindrical_face'],
                'prefer': ['vertical_axis', 'through_part'],
                'geometry_type': 'cylinder',
                'aspect_ratio_range': (0.5, 10.0)  # depth/diameter
            },
            'pocket': {
                'must_have': ['planar_floor'],
                'prefer': ['rectangular_boundary', 'depth_less_than_width'],
                'geometry_type': 'multi-face',
                'aspect_ratio_range': (0.1, 2.0)
            },
            'boss': {
                'must_have': ['raised_above_datum'],
                'prefer': ['cylindrical', 'top_planar_face'],
                'volume_classification': 'additive',
                'relative_height': 'positive'
            }
        }
    
    def classify_by_volume(self, feature_geometry: Dict, 
                          base_surface_z: float) -> str:
        """
        Volume-based classification (remove vs add material)
        
        Material removal: holes, pockets, grooves
        Material addition: bosses, ribs, studs
        """
        # Get feature bounding box
        if 'bbox' in feature_geometry:
            z_min = feature_geometry['bbox']['z_min']
            z_max = feature_geometry['bbox']['z_max']
            
            # If feature extends above base surface, it's additive
            if z_max > base_surface_z + 0.5:
                return "additive"  # Boss, rib, stud
            # If below, it's subtractive
            elif z_min < base_surface_z - 0.5:
                return "subtractive"  # Hole, pocket, groove
        
        return "unknown"
    
    def fuzzy_classify(self, feature_properties: Dict) -> ClassificationResult:
        """
        Fuzzy logic classification for borderline cases
        
        Uses membership functions to handle ambiguity
        """
        # Calculate membership values for each class
        memberships = {}
        
        # Example: Hole vs. Pocket classification
        aspect_ratio = feature_properties.get('depth', 0) / (feature_properties.get('diameter', 1) + 0.001)
        
        # Membership functions
        # Hole: high aspect ratio (deep and narrow)
        if aspect_ratio > 2.0:
            hole_membership = 1.0
        elif aspect_ratio > 1.0:
            hole_membership = (aspect_ratio - 1.0) / 1.0  # Linear from 1.0 to 2.0
        else:
            hole_membership = 0.0
        
        # Pocket: low aspect ratio (shallow and wide)
        if aspect_ratio < 0.5:
            pocket_membership = 1.0
        elif aspect_ratio < 1.0:
            pocket_membership = (1.0 - aspect_ratio) / 0.5
        else:
            pocket_membership = 0.0
        
        memberships['hole'] = hole_membership
        memberships['pocket'] = pocket_membership
        
        # Select primary classification (highest membership)
        primary = max(memberships.items(), key=lambda x: x[1])
        
        # Alternatives (membership > 0.3)
        alternatives = [(k, v) for k, v in memberships.items() 
                       if v > 0.3 and k != primary[0]]
        alternatives.sort(key=lambda x: x[1], reverse=True)
        
        # Reasoning
        reasoning = [
            f"Aspect ratio: {aspect_ratio:.2f}",
            f"Hole membership: {hole_membership:.2f}",
            f"Pocket membership: {pocket_membership:.2f}"
        ]
        
        return ClassificationResult(
            feature_id=feature_properties.get('id', 0),
            primary_classification=primary[0],
            confidence=primary[1],
            alternative_classifications=alternatives,
            reasoning=reasoning
        )
    
    def multi_criteria_decision(self, feature: any, 
                               criteria_weights: Dict[str, float]) -> Dict:
        """
        Multi-criteria decision making for feature classification
        
        Combines multiple criteria with weights
        """
        criteria_scores = {}
        
        # Geometric criteria
        if hasattr(feature, 'diameter') and feature.diameter > 0:
            # Cylindrical likelihood
            criteria_scores['cylindrical'] = 1.0
        else:
            criteria_scores['cylindrical'] = 0.0
        
        # Depth criteria
        if hasattr(feature, 'depth') and hasattr(feature, 'width'):
            if feature.depth > feature.width:
                criteria_scores['deep'] = 1.0
            else:
                criteria_scores['deep'] = 0.0
        
        # Size criteria
        if hasattr(feature, 'area'):
            if feature.area > 1000:
                criteria_scores['large'] = 1.0
            elif feature.area > 100:
                criteria_scores['large'] = 0.5
            else:
                criteria_scores['large'] = 0.0
        
        # Calculate weighted score
        weighted_score = 0.0
        for criterion, score in criteria_scores.items():
            weight = criteria_weights.get(criterion, 0.33)
            weighted_score += score * weight
        
        return {
            'criteria_scores': criteria_scores,
            'weighted_score': weighted_score,
            'decision': 'accept' if weighted_score > 0.6 else 'uncertain'
        }


class AdjacencyAnalyzer:
    """Analyze relationships between features"""
    
    def __init__(self):
        self.proximity_threshold = 5.0  # mm
        
    def analyze_adjacency(self, features: List) -> List[FeatureRelationship]:
        """
        Find adjacent and related features
        
        Returns list of relationships
        """
        relationships = []
        
        for i, feat1 in enumerate(features):
            for j, feat2 in enumerate(features):
                if i >= j:  # Avoid duplicates
                    continue
                
                # Calculate proximity
                distance = self._calculate_distance(feat1, feat2)
                
                if distance < self.proximity_threshold:
                    rel_type = "adjacent"
                    strength = 1.0 - (distance / self.proximity_threshold)
                elif self._check_containment(feat1, feat2):
                    rel_type = "contained"
                    strength = 1.0
                elif self._check_overlap(feat1, feat2):
                    rel_type = "overlapping"
                    strength = 0.8
                else:
                    continue  # No relationship
                
                relationship = FeatureRelationship(
                    feature1_id=feat1.feature_id,
                    feature2_id=feat2.feature_id,
                    relationship_type=rel_type,
                    strength=strength,
                    notes=f"Distance: {distance:.1f}mm"
                )
                
                relationships.append(relationship)
        
        return relationships
    
    def _calculate_distance(self, feat1, feat2) -> float:
        """Calculate distance between features"""
        # Simplified: would use actual geometry centers
        return 10.0  # Placeholder
    
    def _check_containment(self, feat1, feat2) -> bool:
        """Check if feat2 is contained within feat1"""
        # Simplified containment check
        return False
    
    def _check_overlap(self, feat1, feat2) -> bool:
        """Check if features overlap"""
        # Simplified overlap check
        return False
    
    def build_feature_graph(self, features: List) -> Dict:
        """
        Build graph of feature relationships
        
        Nodes = features
        Edges = relationships
        """
        graph = {
            'nodes': [],
            'edges': []
        }
        
        # Add nodes
        for feature in features:
            graph['nodes'].append({
                'id': feature.feature_id,
                'type': feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type),
                'properties': {
                    'depth': getattr(feature, 'depth', 0),
                    'diameter': getattr(feature, 'diameter', 0)
                }
            })
        
        # Add edges (relationships)
        relationships = self.analyze_adjacency(features)
        for rel in relationships:
            graph['edges'].append({
                'source': rel.feature1_id,
                'target': rel.feature2_id,
                'type': rel.relationship_type,
                'strength': rel.strength
            })
        
        return graph
    
    def find_feature_clusters(self, features: List) -> List[List[int]]:
        """
        Find clusters of related features
        
        Returns list of feature ID clusters
        """
        relationships = self.analyze_adjacency(features)
        
        # Simple clustering: connected components
        clusters = []
        visited = set()
        
        for feature in features:
            if feature.feature_id in visited:
                continue
            
            # Start new cluster
            cluster = [feature.feature_id]
            visited.add(feature.feature_id)
            
            # Find connected features
            for rel in relationships:
                if rel.feature1_id == feature.feature_id and rel.feature2_id not in visited:
                    cluster.append(rel.feature2_id)
                    visited.add(rel.feature2_id)
                elif rel.feature2_id == feature.feature_id and rel.feature1_id not in visited:
                    cluster.append(rel.feature1_id)
                    visited.add(rel.feature1_id)
            
            if len(cluster) > 1:  # Only add clusters with multiple features
                clusters.append(cluster)
        
        return clusters


class MachinabilityScorer:
    """Score features for machinability difficulty"""
    
    def score_feature(self, feature: any, material_hardness: str) -> Dict:
        """
        Calculate machinability score
        
        Returns score 1-10 (1=easy, 10=very difficult)
        """
        score = 1.0
        factors = []
        
        # Depth factor
        if hasattr(feature, 'depth') and hasattr(feature, 'diameter'):
            if feature.depth > feature.diameter * 3:
                score += 2.0
                factors.append("Deep feature (L/D > 3)")
        
        # Size factor
        if hasattr(feature, 'diameter') and feature.diameter < 3.0:
            score += 1.5
            factors.append("Small diameter (< 3mm)")
        
        # Material factor
        if "HRC" in material_hardness or "hard" in material_hardness.lower():
            score += 2.0
            factors.append("Hard material")
        
        # Tolerance factor
        if hasattr(feature, 'tolerance') and feature.tolerance == "Precision":
            score += 1.0
            factors.append("Tight tolerance")
        
        # Accessibility factor
        if hasattr(feature, 'accessibility'):
            if feature.accessibility in ["Bottom", "Multi-axis"]:
                score += 1.5
                factors.append("Poor accessibility")
        
        return {
            'score': min(score, 10.0),
            'difficulty': self._get_difficulty_label(score),
            'factors': factors
        }
    
    def _get_difficulty_label(self, score: float) -> str:
        """Convert score to label"""
        if score < 3:
            return "Easy"
        elif score < 5:
            return "Moderate"
        elif score < 7:
            return "Difficult"
        else:
            return "Very Difficult"


# Singleton instances
feature_classifier = FeatureClassifier()
adjacency_analyzer = AdjacencyAnalyzer()
machinability_scorer = MachinabilityScorer()


# Example usage
if __name__ == "__main__":
    # Test fuzzy classification
    feature_props = {
        'id': 1,
        'depth': 15.0,
        'diameter': 10.0
    }
    
    result = feature_classifier.fuzzy_classify(feature_props)
    print("Fuzzy Classification:")
    print(f"  Primary: {result.primary_classification} ({result.confidence:.2f})")
    print(f"  Alternatives: {result.alternative_classifications}")
    print(f"  Reasoning: {result.reasoning}")
