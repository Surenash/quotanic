"""
Quality Control & Inspection Module
Dimensional inspection, tolerance analysis, and quality reporting
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import math


class ToleranceType(Enum):
    """Types of tolerance specifications"""
    BILATERAL = "Bilateral (±)"
    UNILATERAL_PLUS = "Unilateral (+)"
    UNILATERAL_MINUS = "Unilateral (-)"
    LIMIT = "Limit Dimensions"
    GEOMETRIC = "GD&T"


class InspectionMethod(Enum):
    """Inspection methods"""
    CMM = "Coordinate Measuring Machine"
    OPTICAL = "Optical Comparator"
    CALIPER = "Caliper/Micrometer"
    GAUGE = "Go/No-Go Gauge"
    VISUAL = "Visual Inspection"


class QualityLevel(Enum):
    """Quality acceptance levels"""
    PASS = "Pass"
    MARGINAL = "Marginal - Monitor"
    FAIL = "Fail - Rework Required"
    SCRAP = "Scrap - Beyond Repair"


@dataclass
class ToleranceSpec:
    """Tolerance specification"""
    feature_id: int
    dimension_type: str  # "diameter", "length", "position", etc.
    nominal: float  # mm
    upper_tolerance: float  # mm
    lower_tolerance: float  # mm
    tolerance_type: ToleranceType
    inspection_method: InspectionMethod


@dataclass
class InspectionResult:
    """Single dimension inspection result"""
    feature_id: int
    dimension_type: str
    nominal: float
    measured: float
    deviation: float
    within_tolerance: bool
    quality_level: QualityLevel
    cpk: Optional[float] = None  # Process capability index


@dataclass
class QualityReport:
    """Complete quality inspection report"""
    part_id: str
    inspection_date: str
    inspector: str
    total_dimensions: int
    passed: int
    failed: int
    marginal: int
    overall_quality: QualityLevel
    inspection_results: List[InspectionResult]
    recommendations: List[str]


class QualityController:
    """Quality control and inspection management"""
    
    def __init__(self):
        self.tolerance_specs = []
        self.inspection_results = []
        
    def define_tolerance(self, feature_id: int, dimension_type: str,
                        nominal: float, plus_tol: float, minus_tol: float = None) -> ToleranceSpec:
        """Define tolerance specification for a feature"""
        if minus_tol is None:
            minus_tol = plus_tol
            tolerance_type = ToleranceType.BILATERAL
        elif minus_tol == 0:
            tolerance_type = ToleranceType.UNILATERAL_PLUS
        elif plus_tol == 0:
            tolerance_type = ToleranceType.UNILATERAL_MINUS
        else:
            tolerance_type = ToleranceType.BILATERAL
        
        # Determine inspection method based on tolerance
        total_tol = plus_tol + abs(minus_tol)
        if total_tol < 0.01:
            inspection_method = InspectionMethod.CMM
        elif total_tol < 0.05:
            inspection_method = InspectionMethod.OPTICAL
        elif total_tol < 0.1:
            inspection_method = InspectionMethod.CALIPER
        else:
            inspection_method = InspectionMethod.GAUGE
        
        spec = ToleranceSpec(
            feature_id=feature_id,
            dimension_type=dimension_type,
            nominal=nominal,
            upper_tolerance=plus_tol,
            lower_tolerance=minus_tol,
            tolerance_type=tolerance_type,
            inspection_method=inspection_method
        )
        
        self.tolerance_specs.append(spec)
        return spec
    
    def inspect_dimension(self, feature_id: int, dimension_type: str,
                         measured_value: float) -> InspectionResult:
        """Inspect a single dimension"""
        # Find tolerance spec
        spec = None
        for s in self.tolerance_specs:
            if s.feature_id == feature_id and s.dimension_type == dimension_type:
                spec = s
                break
        
        if not spec:
            # No spec defined - assume ±0.1mm general tolerance
            spec = self.define_tolerance(feature_id, dimension_type, measured_value, 0.1)
        
        # Calculate deviation
        deviation = measured_value - spec.nominal
        
        # Check if within tolerance
        within = (spec.nominal + spec.lower_tolerance) <= measured_value <= (spec.nominal + spec.upper_tolerance)
        
        # Determine quality level
        if within:
            # Check how close to limits
            tolerance_range = spec.upper_tolerance + abs(spec.lower_tolerance)
            distance_from_nominal = abs(deviation)
            
            if distance_from_nominal < tolerance_range * 0.5:
                quality_level = QualityLevel.PASS
            else:
                quality_level = QualityLevel.MARGINAL
        else:
            # Outside tolerance
            overage = max(
                deviation - spec.upper_tolerance,
                spec.lower_tolerance - deviation,
                0
            )
            
            if overage < 0.05:  # Within 0.05mm of tolerance
                quality_level = QualityLevel.MARGINAL
            elif overage < 0.2:  # Reworkable
                quality_level = QualityLevel.FAIL
            else:  # Too far out
                quality_level = QualityLevel.SCRAP
        
        # Calculate Cpk (process capability)
        cpk = self._calculate_cpk(measured_value, spec)
        
        result = InspectionResult(
            feature_id=feature_id,
            dimension_type=dimension_type,
            nominal=spec.nominal,
            measured=measured_value,
            deviation=deviation,
            within_tolerance=within,
            quality_level=quality_level,
            cpk=cpk
        )
        
        self.inspection_results.append(result)
        return result
    
    def generate_quality_report(self, part_id: str, inspection_date: str = None,
                               inspector: str = "FBM System") -> QualityReport:
        """Generate complete quality inspection report"""
        if not inspection_date:
            from datetime import datetime
            inspection_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Count results
        passed = sum(1 for r in self.inspection_results if r.quality_level == QualityLevel.PASS)
        marginal = sum(1 for r in self.inspection_results if r.quality_level == QualityLevel.MARGINAL)
        failed = sum(1 for r in self.inspection_results if r.quality_level == QualityLevel.FAIL)
        scrapped = sum(1 for r in self.inspection_results if r.quality_level == QualityLevel.SCRAP)
        
        # Determine overall quality
        if scrapped > 0:
            overall_quality = QualityLevel.SCRAP
        elif failed > 0:
            overall_quality = QualityLevel.FAIL
        elif marginal > passed:
            overall_quality = QualityLevel.MARGINAL
        else:
            overall_quality = QualityLevel.PASS
        
        # Generate recommendations
        recommendations = []
        
        if marginal > 0:
            recommendations.append(f"{marginal} dimensions are marginal - monitor process closely")
        
        if failed > 0:
            recommendations.append(f"{failed} dimensions failed - rework required")
        
        # Check for systematic issues
        avg_cpk = sum(r.cpk for r in self.inspection_results if r.cpk) / len(self.inspection_results) if self.inspection_results else 0
        if avg_cpk < 1.33:
            recommendations.append("Process capability (Cpk) below 1.33 - process improvement needed")
        
        # Check for bias
        avg_deviation = sum(r.deviation for r in self.inspection_results) / len(self.inspection_results) if self.inspection_results else 0
        if abs(avg_deviation) > 0.01:
            if avg_deviation > 0:
                recommendations.append(f"Systematic positive bias detected (+{avg_deviation:.3f}mm) - check tool wear")
            else:
                recommendations.append(f"Systematic negative bias detected ({avg_deviation:.3f}mm) - check machine calibration")
        
        report = QualityReport(
            part_id=part_id,
            inspection_date=inspection_date,
            inspector=inspector,
            total_dimensions=len(self.inspection_results),
            passed=passed,
            failed=failed,
            marginal=marginal,
            overall_quality=overall_quality,
            inspection_results=self.inspection_results.copy(),
            recommendations=recommendations
        )
        
        return report
    
    def calculate_process_capability(self, measurements: List[float],
                                    upper_spec: float, lower_spec: float) -> Dict:
        """Calculate process capability indices (Cp, Cpk)"""
        if len(measurements) < 2:
            return {'cp': 0, 'cpk': 0, 'note': 'Insufficient data'}
        
        # Calculate statistics
        mean = sum(measurements) / len(measurements)
        variance = sum((x - mean) ** 2 for x in measurements) / (len(measurements) - 1)
        std_dev = math.sqrt(variance)
        
        if std_dev == 0:
            return {'cp': float('inf'), 'cpk': float('inf'), 'note': 'No variation'}
        
        # Process capability (Cp) - assumes centered process
        spec_range = upper_spec - lower_spec
        process_range = 6 * std_dev
        cp = spec_range / process_range if process_range > 0 else 0
        
        # Process capability index (Cpk) - accounts for centering
        cpu = (upper_spec - mean) / (3 * std_dev)
        cpl = (mean - lower_spec) / (3 * std_dev)
        cpk = min(cpu, cpl)
        
        # Interpret capability
        if cpk >= 2.0:
            capability = "Excellent (6σ)"
        elif cpk >= 1.67:
            capability = "Very Good (5σ)"
        elif cpk >= 1.33:
            capability = "Adequate (4σ)"
        elif cpk >= 1.0:
            capability = "Marginal (3σ)"
        else:
            capability = "Inadequate"
        
        return {
            'cp': round(cp, 3),
            'cpk': round(cpk, 3),
            'capability': capability,
            'mean': round(mean, 4),
            'std_dev': round(std_dev, 4),
            'defect_rate_ppm': self._estimate_defect_rate(cpk)
        }
    
    def generate_control_chart_data(self, measurements: List[float]) -> Dict:
        """Generate X-bar and R chart data"""
        if len(measurements) < 5:
            return {'error': 'Need at least 5 measurements'}
        
        # Calculate statistics
        mean = sum(measurements) / len(measurements)
        
        # Calculate range for each consecutive pair
        ranges = [abs(measurements[i+1] - measurements[i]) for i in range(len(measurements)-1)]
        avg_range = sum(ranges) / len(ranges) if ranges else 0
        
        # Control limits (using A2, D3, D4 constants for n=2)
        A2 = 1.880  # For sample size of 2
        D3 = 0      # For sample size of 2
        D4 = 3.267  # For sample size of 2
        
        ucl_xbar = mean + A2 * avg_range
        lcl_xbar = mean - A2 * avg_range
        
        ucl_r = D4 * avg_range
        lcl_r = D3 * avg_range
        
        return {
            'x_bar_chart': {
                'measurements': measurements,
                'center_line': mean,
                'ucl': ucl_xbar,
                'lcl': lcl_xbar
            },
            'r_chart': {
                'ranges': ranges,
                'center_line': avg_range,
                'ucl': ucl_r,
                'lcl': lcl_r
            }
        }
    
    def _calculate_cpk(self, measured: float, spec: ToleranceSpec) -> Optional[float]:
        """Calculate Cpk for single measurement (simplified)"""
        # Simplified - assumes std dev of 1/6 of tolerance range
        tolerance_range = spec.upper_tolerance + abs(spec.lower_tolerance)
        assumed_std_dev = tolerance_range / 6
        
        if assumed_std_dev == 0:
            return None
        
        upper_spec = spec.nominal + spec.upper_tolerance
        lower_spec = spec.nominal + spec.lower_tolerance
        
        cpu = (upper_spec - measured) / (3 * assumed_std_dev)
        cpl = (measured - lower_spec) / (3 * assumed_std_dev)
        
        return round(min(cpu, cpl), 2)
    
    def _estimate_defect_rate(self, cpk: float) -> int:
        """Estimate defect rate in PPM from Cpk"""
        # Simplified lookup table
        cpk_to_ppm = {
            0.5: 133614,
            1.0: 2700,
            1.33: 63,
            1.5: 7,
            1.67: 0.6,
            2.0: 0.002
        }
        
        # Find closest
        closest_cpk = min(cpk_to_ppm.keys(), key=lambda x: abs(x - cpk))
        return cpk_to_ppm[closest_cpk]


# Singleton instance
quality_controller = QualityController()


# Example usage
if __name__ == "__main__":
    qc = QualityController()
    
    # Define tolerances
    qc.define_tolerance(1, "diameter", 10.0, 0.05, -0.05)
    qc.define_tolerance(2, "length", 50.0, 0.1, -0.1)
    
    # Simulate measurements
    qc.inspect_dimension(1, "diameter", 10.02)  # Pass
    qc.inspect_dimension(2, "length", 50.08)    # Marginal
    
    # Generate report
    report = qc.generate_quality_report("PART-001")
    
    print(f"Quality Report: {report.overall_quality.value}")
    print(f"Passed: {report.passed}/{report.total_dimensions}")
    print(f"Recommendations: {len(report.recommendations)}")
