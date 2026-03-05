"""
Visualization Module
3D visualization and toolpath plotting for FBM system
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import math


class VisualizationEngine:
    """Generate visualization data for FBM operations"""
    
    def __init__(self):
        self.features = []
        self.toolpaths = []
        self.colors = {
            'hole': '#FF6B6B',
            'pocket': '#4ECDC4',
            'boss': '#95E1D3',
            'slot': '#F38181',
            'face': '#AA96DA',
            'thread': '#FCBAD3',
            'chamfer': '#FFFFD2',
            'default': '#A8DADC'
        }
    
    def generate_feature_plot_data(self, features: List) -> Dict:
        """Generate 2D/3D plot data for features"""
        plot_data = {
            'features': [],
            'bounds': {'x_min': 0, 'x_max': 100, 'y_min': 0, 'y_max': 100, 'z_min': 0, 'z_max': 50}
        }
        
        for feature in features:
            feature_data = self._extract_feature_geometry(feature)
            if feature_data:
                plot_data['features'].append(feature_data)
                
                # Update bounds
                if hasattr(feature, 'center_x'):
                    plot_data['bounds']['x_min'] = min(plot_data['bounds']['x_min'], feature.center_x)
                    plot_data['bounds']['x_max'] = max(plot_data['bounds']['x_max'], feature.center_x)
        
        return plot_data
    
    def generate_toolpath_animation(self, operations: List) -> List[Dict]:
        """Generate toolpath animation frames"""
        frames = []
        
        for idx, op in enumerate(operations):
            frame = {
                'operation_number': idx + 1,
                'operation_name': op.operation_name,
                'tool': f"{op.tool_type.value if hasattr(op.tool_type, 'value') else op.tool_type}",
                'path_segments': self._generate_path_segments(op),
                'cutting_time': op.estimated_time if hasattr(op, 'estimated_time') else 0
            }
            frames.append(frame)
        
        return frames
    
    def generate_ascii_visualization(self, features: List, width: int = 80, height: int = 40) -> str:
        """Generate ASCII art visualization of part"""
        canvas = [[' ' for _ in range(width)] for _ in range(height)]
        
        # Draw features
        for feature in features:
            self._draw_feature_ascii(canvas, feature, width, height)
        
        # Convert to string
        result = []
        result.append("+" + "-" * width + "+")
        for row in canvas:
            result.append("|" + "".join(row) + "|")
        result.append("+" + "-" * width + "+")
        
        return "\n".join(result)
    
    def generate_svg_visualization(self, features: List, width: int = 800, height: int = 600) -> str:
        """Generate SVG visualization"""
        svg_elements = []
        
        svg_elements.append(f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">')
        svg_elements.append(f'  <rect width="{width}" height="{height}" fill="#f8f9fa"/>')
        svg_elements.append('  <g id="features">')
        
        for feature in features:
            svg_element = self._feature_to_svg(feature, width, height)
            if svg_element:
                svg_elements.append(f'    {svg_element}')
        
        svg_elements.append('  </g>')
        svg_elements.append('</svg>')
        
        return "\n".join(svg_elements)
    
    def generate_html_report(self, features: List, operations: List, 
                            cost_breakdown: Optional[Dict] = None) -> str:
        """Generate interactive HTML report"""
        html = []
        html.append('<!DOCTYPE html>')
        html.append('<html>')
        html.append('<head>')
        html.append('  <meta charset="UTF-8">')
        html.append('  <title>FBM Visualization Report</title>')
        html.append('  <style>')
        html.append(self._get_css_styles())
        html.append('  </style>')
        html.append('</head>')
        html.append('<body>')
        
        html.append('  <div class="container">')
        html.append('    <h1>FBM System - Machining Report</h1>')
        
        # Summary section
        html.append('    <div class="section">')
        html.append('      <h2>Summary</h2>')
        html.append(f'      <p>Total Features: <strong>{len(features)}</strong></p>')
        html.append(f'      <p>Total Operations: <strong>{len(operations)}</strong></p>')
        
        if cost_breakdown:
            html.append(f'      <p>Estimated Cost: <strong>${cost_breakdown.get("total_cost", 0):.2f}</strong></p>')
        
        html.append('    </div>')
        
        # Features table
        html.append('    <div class="section">')
        html.append('      <h2>Features Detected</h2>')
        html.append('      <table>')
        html.append('        <tr><th>#</th><th>Type</th><th>Dimensions</th><th>Complexity</th></tr>')
        
        for idx, feature in enumerate(features[:20], 1):  # Limit to 20
            feat_type = feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type)
            dimensions = f"Ø{feature.diameter:.1f} x {feature.depth:.1f}mm" if hasattr(feature, 'diameter') else "N/A"
            complexity = getattr(feature, 'complexity_rating', 5)
            
            html.append(f'        <tr>')
            html.append(f'          <td>{idx}</td>')
            html.append(f'          <td>{feat_type}</td>')
            html.append(f'          <td>{dimensions}</td>')
            html.append(f'          <td>{"⭐" * min(complexity, 5)}</td>')
            html.append(f'        </tr>')
        
        html.append('      </table>')
        html.append('    </div>')
        
        # Visualization
        html.append('    <div class="section">')
        html.append('      <h2>2D Layout</h2>')
        svg = self.generate_svg_visualization(features)
        html.append(f'      {svg}')
        html.append('    </div>')
        
        # Operations timeline
        html.append('    <div class="section">')
        html.append('      <h2>Operations Timeline</h2>')
        html.append('      <div class="timeline">')
        
        for idx, op in enumerate(operations[:15], 1):  # Limit to 15
            html.append(f'        <div class="timeline-item">')
            html.append(f'          <div class="timeline-marker">{idx}</div>')
            html.append(f'          <div class="timeline-content">')
            html.append(f'            <h4>{op.operation_name}</h4>')
            html.append(f'            <p>Tool: {op.tool_type.value if hasattr(op.tool_type, "value") else op.tool_type}</p>')
            if hasattr(op, 'estimated_time'):
                html.append(f'            <p>Time: {op.estimated_time:.1f} min</p>')
            html.append(f'          </div>')
            html.append(f'        </div>')
        
        html.append('      </div>')
        html.append('    </div>')
        
        html.append('  </div>')
        html.append('</body>')
        html.append('</html>')
        
        return "\n".join(html)
    
    def _extract_feature_geometry(self, feature) -> Optional[Dict]:
        """Extract plottable geometry from feature"""
        geometry = {}
        
        if hasattr(feature, 'center_x'):
            geometry['x'] = feature.center_x
            geometry['y'] = getattr(feature, 'center_y', 0)
            geometry['z'] = getattr(feature, 'center_z', 0)
        
        if hasattr(feature, 'diameter'):
            geometry['diameter'] = feature.diameter
            geometry['radius'] = feature.diameter / 2
        
        if hasattr(feature, 'width'):
            geometry['width'] = feature.width
            geometry['length'] = getattr(feature, 'length', feature.width)
        
        if hasattr(feature, 'depth'):
            geometry['depth'] = feature.depth
        
        geometry['type'] = feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type)
        geometry['color'] = self._get_feature_color(geometry['type'])
        
        return geometry if geometry else None
    
    def _get_feature_color(self, feature_type: str) -> str:
        """Get color for feature type"""
        for key, color in self.colors.items():
            if key in feature_type.lower():
                return color
        return self.colors['default']
    
    def _generate_path_segments(self, operation) -> List[Dict]:
        """Generate toolpath segments for operation"""
        segments = []
        
        # Simplified - would generate actual toolpath points
        if hasattr(operation, 'feature'):
            feature = operation.feature
            if hasattr(feature, 'center_x'):
                segments.append({
                    'type': 'rapid',
                    'from': (0, 0, 50),
                    'to': (feature.center_x, feature.center_y, 5)
                })
                segments.append({
                    'type': 'feed',
                    'from': (feature.center_x, feature.center_y, 5),
                    'to': (feature.center_x, feature.center_y, -feature.depth if hasattr(feature, 'depth') else -10)
                })
        
        return segments
    
    def _draw_feature_ascii(self, canvas: List[List[str]], feature, width: int, height: int):
        """Draw feature on ASCII canvas"""
        if not hasattr(feature, 'center_x'):
            return
        
        # Scale to canvas
        x = int((feature.center_x / 100) * width)
        y = int((feature.center_y / 100) * height)
        
        # Ensure within bounds
        x = max(0, min(width - 1, x))
        y = max(0, min(height - 1, y))
        
        # Draw symbol
        symbol = self._get_feature_symbol(feature)
        
        if hasattr(feature, 'diameter'):
            radius = int((feature.diameter / 200) * min(width, height))
            for dy in range(-radius, radius + 1):
                for dx in range(-radius, radius + 1):
                    if dx*dx + dy*dy <= radius*radius:
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < height and 0 <= nx < width:
                            canvas[ny][nx] = symbol
        else:
            canvas[y][x] = symbol
    
    def _get_feature_symbol(self, feature) -> str:
        """Get ASCII symbol for feature"""
        feat_type = feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type)
        
        if 'hole' in feat_type.lower():
            return 'O'
        elif 'pocket' in feat_type.lower():
            return '□'
        elif 'boss' in feat_type.lower():
            return '■'
        elif 'slot' in feat_type.lower():
            return '═'
        else:
            return '·'
    
    def _feature_to_svg(self, feature, canvas_width: int, canvas_height: int) -> Optional[str]:
        """Convert feature to SVG element"""
        if not hasattr(feature, 'center_x'):
            return None
        
        # Scale coordinates
        scale = min(canvas_width, canvas_height) / 100
        x = feature.center_x * scale
        y = feature.center_y * scale if hasattr(feature, 'center_y') else 0
        
        color = self._get_feature_color(feature.feature_type.value if hasattr(feature.feature_type, 'value') else str(feature.feature_type))
        
        if hasattr(feature, 'diameter'):
            r = (feature.diameter / 2) * scale
            return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}" fill-opacity="0.6" stroke="#333" stroke-width="2"/>'
        elif hasattr(feature, 'width'):
            w = feature.width * scale
            h = feature.length * scale if hasattr(feature, 'length') else w
            return f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" fill="{color}" fill-opacity="0.6" stroke="#333" stroke-width="2"/>'
        
        return None
    
    def _get_css_styles(self) -> str:
        """Get CSS styles for HTML report"""
        return """
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            border-bottom: 4px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
            border-left: 5px solid #667eea;
            padding-left: 15px;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #667eea;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background: #f1f1f1;
        }
        .timeline {
            position: relative;
            padding: 20px 0;
        }
        .timeline-item {
            display: flex;
            margin: 20px 0;
        }
        .timeline-marker {
            width: 40px;
            height: 40px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        .timeline-content {
            margin-left: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            flex-grow: 1;
        }
        .timeline-content h4 {
            margin: 0 0 10px 0;
            color: #667eea;
        }
        .timeline-content p {
            margin: 5px 0;
            color: #666;
        }
        svg {
            border: 2px solid #ddd;
            border-radius: 8px;
            margin: 20px 0;
        }
        """


def save_html_report(features: List, operations: List, output_file: str, 
                    cost_breakdown: Optional[Dict] = None):
    """Save visualization as HTML file"""
    viz = VisualizationEngine()
    html = viz.generate_html_report(features, operations, cost_breakdown)
    
    with open(output_file, 'w') as f:
        f.write(html)
    
    print(f"HTML report saved to: {output_file}")


# Example usage
if __name__ == "__main__":
    print("Visualization Module - Ready")
    print("Use save_html_report() to generate interactive reports")
