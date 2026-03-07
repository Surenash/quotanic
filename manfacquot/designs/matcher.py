from decimal import Decimal
import logging
from .fbm_manufacturing_intelligence import ManufacturingProcess

logger = logging.getLogger(__name__)

class ManufacturerSmartMatcher:
    """
    Intelligent engine to match Design Requirements to Manufacturer Capabilities.
    Calculates a 'Suitability Score' (0-100) and filters ineligible partners.
    """

    def calculate_match_score(self, design, requirements, manufacturer) -> float:
        """
        Calculates a match score. Returns 0.0 if hard constraints fail.
        """
        score = 100.0
        capabilities = manufacturer.capabilities or {}
        
        # 1. PRIMARY PROCESS CHECK (Hard Constraint)
        # Assuming manufacturer has a list of 'processes' in their capabilities
        # e.g., ["milling_3_axis", "turning_standard", "sheet_laser_cut"]
        # If 'processes' is missing (legacy data), we might infer from 'cnc': True etc.
        
        required_process = requirements.get('primary_process')
        mf_processes = capabilities.get('processes', [])
        
        # Legacy fallback
        if not mf_processes:
            if capabilities.get('cnc', False):
                mf_processes.extend([
                    ManufacturingProcess.MILLING_3_AXIS.value,  # Use .value for string 
                    ManufacturingProcess.TURNING_STANDARD.value
                ])
            # If no legacy flags, assume no capability? Or lenient?
            # Let's be strict: if no data, they can't do it.
        
        # CRITICAL FIX: Convert enum to string for comparison
        required_process_str = required_process.value if hasattr(required_process, 'value') else str(required_process)
        
        # Check Primary
        if required_process and required_process_str not in mf_processes:
            # Check alternatives
            alternatives = requirements.get('alternative_processes', [])
            found_alt = False
            for alt in alternatives:
                alt_str = alt.value if hasattr(alt, 'value') else str(alt)
                if alt_str in mf_processes:
                    found_alt = True
                    score -= 15 # Penalty for using alternative process
                    break
            
            if not found_alt:
                # One last check: maybe the mf has the raw enum value as a string
                if str(required_process) in mf_processes:
                    pass # OK
                else:
                    logger.info(f"Mf {manufacturer.user.email} rejected: Missing required process {required_process_str} (has: {mf_processes})")
                    return 0.0 # FAIL
        
        # 2. MACHINE CHECK (Hard Constraint)
        # If specific machines are strictly required (e.g. 5-axis)
        required_machines = requirements.get('machines_required', [])
        # This is harder to match perfectly with string matching, simplistic approach:
        # We rely on the process check usually covers this.
        
        # 3. SECONDARY OPS CHECK (Soft Constraint / Bonus)
        secondary_ops = requirements.get('secondary_operations', [])
        for op in secondary_ops:
            op_str = op.value if hasattr(op, 'value') else str(op)
            if op_str in mf_processes:
                score += 5 # Bonus for one-stop shop
            else:
                score -= 10 # Penalty for needing outsourcing
                
        # 4. MATERIAL MATCH (Hard-ish Constraint)
        # mf_materials = capabilities.get('materials_supported', []) 
        # (This is already checked in the view filter usually, but good to include in score)
        # Checking specialized materials bonus
        specialized_materials = capabilities.get('specialized_materials', [])
        if design.material in specialized_materials:
            score += 10 # Expert bonus
            
        # 5. SIZE CHECK (Already done in view, but precision check here)
        # If part requires high precision (<0.02mm) and mf has 'precision_machining' flag
        if "requires_high_precision" in str(requirements.get('constraints', [])):
             if capabilities.get('high_precision', False):
                 score += 10
             else:
                 score -= 30 # Big penalty if they aren't precision shop
                 
        # 6. BUSINESS METRICS
        # Rating (0-5) -> 0-20 points
        rating = float(manufacturer.average_rating)
        score += (rating * 4) - 20 # Normalize: 5.0=+20, 2.5=-10, 0.0=-20? 
        # Actually better: simply add (rating/5)*10
        score += (rating / 5.0) * 10
        
        # Lead time performance? (Mocked)
        
        # Cap score
        return max(0.0, min(100.0, score))

smart_matcher = ManufacturerSmartMatcher()
