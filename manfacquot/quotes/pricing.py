import logging
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import List, Dict

from accounts.models import Manufacturer
from designs.models import Design

logger = logging.getLogger(__name__)

@dataclass
class PricingDetails:
    price_usd: Decimal = None
    estimated_lead_time_days: int = 14 # Default lead time
    errors: List[str] = field(default_factory=list)
    calculation_details: Dict[str, str] = field(default_factory=dict)

from designs.fbm_manufacturing_intelligence import fbm_manufacturing_intelligence, ManufacturingProcess


def calculate_quote_price(design: Design, manufacturer: Manufacturer) -> PricingDetails:
    """
    Calculates the automated price using the 14-Point Comprehensive Model.
    """
    details = PricingDetails()
    capabilities = manufacturer.capabilities or {}
    pricing_factors = capabilities.get('pricing_factors', {})
    geometric_data = design.geometric_data or {}

    # --- 1. Get Inputs and Validate ---
    volume_cm3 = geometric_data.get('volume_cm3')
    volume_cm3 = geometric_data.get('volume_cm3')
    complexity_score = geometric_data.get('complexity_score')
    prismatic_score = geometric_data.get('prismatic_score', 1.0) # Default to 1.0 (fully prismatic) if missing
    dfm_risks = geometric_data.get('dfm_risks', [])
    
    if not volume_cm3 or volume_cm3 <= 0:
        details.errors.append("Design volume is missing or invalid.")
        return details
    
    try:
        quantity = int(design.quantity)
        if quantity <= 0: raise ValueError()
        details.calculation_details['quantity'] = str(quantity)
    except (ValueError, TypeError):
        details.errors.append("Invalid quantity specified.")
        return details

    material = design.material
    material_properties = pricing_factors.get('material_properties', {})
    machining_factors = pricing_factors.get('machining', {})
    labor_factors = pricing_factors.get('labor', {})
    overhead_factors = pricing_factors.get('overheads', {})
    material_factors = pricing_factors.get('material_factors', {})
    tooling_factors = pricing_factors.get('tooling', {})
    engineering_factors = pricing_factors.get('engineering', {})
    qc_factors = pricing_factors.get('qc', {})
    packaging_factors = pricing_factors.get('packaging', {})
    logistics_factors = pricing_factors.get('logistics', {})
    risk_factors = pricing_factors.get('risk_contingency', {})
    margin_factors = pricing_factors.get('profit_margin', {})
    urgency_factors = pricing_factors.get('urgency_premium', {})
    terms_factors = pricing_factors.get('terms', {})

    if material not in material_properties:
        details.errors.append(f"Manufacturer does not provide pricing for material: {material}")
        return details

    mat_props = material_properties[material]

    # --- 2. Calculate Costs (14-Point Model) ---
    try:
        # 1. RAW MATERIAL COSTS
        stock_volume = geometric_data.get('optimal_stock_volume_cm3', geometric_data.get('stock_volume_cm3', volume_cm3))
        density = Decimal(str(mat_props['density_g_cm3']))
        cost_per_kg = Decimal(str(mat_props['cost_usd_kg']))
        scrap_rate = Decimal(str(material_factors.get('scrap_rate_percent', 0.0)))
        yield_rate = Decimal(str(material_factors.get('yield_rate_percent', 1.0)))
        
        mass_g = Decimal(str(stock_volume)) * density
        mass_kg = mass_g / Decimal("1000")
        
        # Adjust for Scrap and Yield
        # Material Required = (Net Mass / Yield) * (1 + Scrap)
        gross_mass_kg = (mass_kg / yield_rate) * (1 + scrap_rate)
        material_cost_per_unit = gross_mass_kg * cost_per_kg
        
        details.calculation_details['material_cost_per_unit'] = f"{material_cost_per_unit:.4f}"

        # ===================================================================
        # FBM-ENHANCED PRICING
        # Check if FBM analysis data is available for more accurate estimates
        # ===================================================================
        fbm_available = 'fbm_features' in geometric_data and 'fbm_operations' in geometric_data
        
        # ===================================================================
        # INTELLIGENT PRICING LOGIC
        # 1. Determine Process & Capabilities
        # ===================================================================
        
        # Call Intelligence Module to get the authoritative process
        requirements = fbm_manufacturing_intelligence.determine_manufacturing_requirements(
            geometric_data, material, quantity
        )
        primary_process = requirements.get('primary_process')
        
        # Log the intelligent decision
        details.calculation_details['ai_process_selected'] = str(primary_process)
        details.calculation_details['ai_reasoning'] = "; ".join(requirements.get('reasoning', []))

        # 2. Select Machine Rate based on Process
        base_rate_hourly = Decimal("50.0") # Fallback
        
        # Load Manufacturer Rates
        machining_factors = pricing_factors.get('machining', {})
        base_machining_rate = Decimal(str(machining_factors.get('machining_rate_usd_min', 1.5))) * Decimal("60") # Convert min to hour
        
        # Apply Multipliers based on Process
        if primary_process == ManufacturingProcess.MILLING_5_AXIS:
            multiplier = Decimal(str(machining_factors.get('5_axis_multiplier', 2.0)))
            hourly_rate = base_machining_rate * multiplier
            details.calculation_details['machine_selected'] = "5-Axis CNC Mill"
        elif primary_process == ManufacturingProcess.TURNING_LIVE_TOOLING:
            hourly_rate = base_machining_rate * Decimal("1.5")
            details.calculation_details['machine_selected'] = "Mill-Turn Lathe"
        elif primary_process in [ManufacturingProcess.SHEET_LASER_CUT, ManufacturingProcess.SHEET_WATERJET]:
             hourly_rate = Decimal("80.0") # Example specific rate for Laser
             details.calculation_details['machine_selected'] = "Laser Cutter"
        else:
            hourly_rate = base_machining_rate
            details.calculation_details['machine_selected'] = "Standard 3-Axis CNC"

        details.calculation_details['applied_hourly_rate'] = f"${hourly_rate:.2f}/hr"

        # 3. Feature-Based Costing
        run_cost_per_unit = Decimal("0.0")
        
        # --- RESTORED LABOR COST CALCULATION ---
        # Get Labor Factors
        labor_factors = pricing_factors.get('labor', {})
        skilled_rate = Decimal(str(labor_factors.get('skilled_rate_hourly', 25.0)))
        efficiency = Decimal(str(labor_factors.get('efficiency_factor', 1.0)))

        # Estimate labor hours based on machine time (simplified interaction ratio)
        # Assuming 1 operator per machine implies 100% labor time match, but usually it's less for CNC
        # Let's say 0.5 hours labor per 1 hour machine time for setup/loading
        labor_ratio = Decimal("0.5") 
        
        # We need estimated time first to calc labor
        total_estimated_min = Decimal("0.0")

        feature_costs_breakdown = []
        process_steps = [] # To store the step-by-step flow
        feature_sequences = {} # To store sequence per feature

        if 'fbm_operations' in geometric_data and geometric_data['fbm_operations']:
            # Precise Feature Pricing
            total_machining_cost = Decimal("0.0")
            
            # Group operations by feature_id for sequence description
            ops_by_feature = {}
            
            for op in geometric_data['fbm_operations']:
                op_time_min = Decimal(str(op.get('estimated_time', 0)))
                total_estimated_min += op_time_min
                
                op_cost = (op_time_min / Decimal("60")) * hourly_rate
                
                # Use real feature type name instead of Generic
                feature_type = op.get('feature_type', op.get('name', 'Generic Machining'))
                feature_id = op.get('feature_id', 'unknown')
                
                if 'Thread' in feature_type or 'Tap' in feature_type: 
                    op_cost += Decimal("2.0") # Tapping surcharge
                
                total_machining_cost += op_cost
                feature_costs_breakdown.append(f"{feature_type}: ${op_cost:.2f}")
                
                # Build the step-by-step process flow
                step_data = {
                    'step': op.get('operation_name', op.get('name', 'Machining Step')),
                    'tool': op.get('tool_type', 'Standard Tool') + (f" Ø{op.get('tool_diameter')}mm" if op.get('tool_diameter') else ""),
                    'time': f"{op_time_min:.1f} min",
                    'cost': f"${op_cost:.2f}"
                }
                process_steps.append(step_data)
                
                # Build feature sequences
                if feature_id not in ops_by_feature:
                    ops_by_feature[feature_id] = []
                ops_by_feature[feature_id].append(op.get('operation_name', op.get('name', 'Machining Step')))

            # Convert grouped ops to readable sequences
            for fid, ops in ops_by_feature.items():
                feature_name = "Unknown Feature"
                # Find feature name from fbm_features
                for f in geometric_data.get('fbm_features', []):
                    if f.get('feature_id') == fid:
                        feature_name = f.get('feature_type', 'Feature')
                        break
                feature_sequences[f"{feature_name} #{fid}"] = " -> ".join(ops)

            run_cost_per_unit = total_machining_cost
            details.calculation_details['feature_costs'] = ", ".join(feature_costs_breakdown[:10]) + ("..." if len(feature_costs_breakdown)>10 else "")
            details.calculation_details['process_flow'] = json.dumps(process_steps)
            details.calculation_details['feature_sequences'] = json.dumps(feature_sequences)
            
        else:
            # Fallback: Volumetric Estimation (if no detailed FBM features)
            # Use the hourly_rate we determined
            
            stock_vol = Decimal(str(stock_volume))
            part_vol = Decimal(str(volume_cm3))
            removed_vol = stock_vol - part_vol
            if removed_vol < 0: removed_vol = Decimal("0")
            
            mrr = Decimal(str(machining_factors.get('material_removal_rate_cm3_min', 20.0)))
            if mrr <= 0: mrr = Decimal("20.0")
            
            estimated_min = removed_vol / mrr
            total_estimated_min = estimated_min
            
            run_cost_per_unit = (estimated_min / Decimal("60")) * hourly_rate
            
            # Feature Count Surcharges (Simulated feature pricing)
            num_holes = int(geometric_data.get('num_holes', 0))
            if num_holes > 0:
                hole_cost = Decimal("2.0") * num_holes
                run_cost_per_unit += hole_cost
                details.calculation_details['feature_costs'] = f"Est. Volume Removal + {num_holes} Holes (${hole_cost})"

        # Calculate Labor Cost
        labor_hours = (total_estimated_min / Decimal("60")) * labor_ratio
        # Add fixed setup labor (e.g. 30 mins)
        labor_hours += Decimal("0.5") 
        
        effective_hours = labor_hours / efficiency
        labor_cost_per_unit = effective_hours * skilled_rate
        details.calculation_details['labor_cost_per_unit'] = f"{labor_cost_per_unit:.2f} ({effective_hours:.2f} hrs)"


        # Add Base Setup / Run
        setup_fee = Decimal(str(machining_factors.get('setup_fee_usd', 50.0)))
        base_run_fee = Decimal(str(machining_factors.get('base_run_cost_unit', 5.0)))
        run_cost_per_unit += base_run_fee

        
        # 4. Secondary / Finishing Costs (Realistic Multi-Process Pricing)
        secondary_ops = requirements.get('secondary_operations', [])
        finishing_factors = pricing_factors.get('finishing', {})
        total_finishing_cost_per_unit = Decimal("0.0")
        
        # We need Surface Area for finishing costs
        surface_area_cm2 = Decimal(str(geometric_data.get('surface_area_cm2', 100.0))) # Default fallback
        part_mass_kg = Decimal(str(mass_kg))

        if secondary_ops:
            fin_breakdown = []
            for op in secondary_ops:
                # Look for exact match or generic fallback
                rate_card = finishing_factors.get(op)
                
                # If granular not found, try generic mapping (simple heuristics)
                if not rate_card:
                    if "anodize" in str(op): rate_card = finishing_factors.get("anodize_type_ii_sulfuric")
                    elif "plating" in str(op): rate_card = finishing_factors.get("plating_zinc")
                    elif "heat" in str(op) or "harden" in str(op): rate_card = finishing_factors.get("heat_treatment")
                
                if rate_card:
                    min_lot = Decimal(str(rate_card.get('min_lot_usd', 100.0)))
                    
                    # Calculate Unit Cost portion
                    unit_metric_cost = Decimal("0.0")
                    if 'cost_sq_cm' in rate_card:
                        unit_metric_cost = Decimal(str(rate_card['cost_sq_cm'])) * surface_area_cm2
                    elif 'cost_per_kg' in rate_card:
                        unit_metric_cost = Decimal(str(rate_card['cost_per_kg'])) * part_mass_kg
                    
                    # Amortize Lot Charge
                    lot_charge_per_unit = min_lot / Decimal(quantity)
                    
                    op_cost = lot_charge_per_unit + unit_metric_cost
                    total_finishing_cost_per_unit += op_cost
                    
                    fin_breakdown.append(f"{op}: ${op_cost:.2f} (Lot: ${min_lot})")
                else:
                    # Fallback for unknown process
                    total_finishing_cost_per_unit += Decimal("5.0") # Nominal fee
                    fin_breakdown.append(f"{op}: $5.00 (Est)")

            details.calculation_details['finishing_cost_per_unit'] = f"{total_finishing_cost_per_unit:.2f}"
            details.calculation_details['finishing_details'] = ", ".join(fin_breakdown)
        
        run_cost_per_unit += total_finishing_cost_per_unit

        # 5. TOOLING (Amortized)
        # Custom tooling if specified in capabilities
        custom_tooling_cost = Decimal(str(tooling_factors.get('custom_tooling_cost_usd', 0.0)))
        should_amortize = tooling_factors.get('amortize', True)
        
        if should_amortize:
            tooling_cost_per_unit = custom_tooling_cost / Decimal(quantity)
        else:
            # If not amortized, it's usually a separate line item, but for unit price calculation we often amortize or add as NRE.
            # For this model, we'll amortize it to get a single unit price, but note it.
            tooling_cost_per_unit = custom_tooling_cost / Decimal(quantity)

        # 5. PRODUCTION QUANTITY (Impacts Setup Amortization)
        setup_cost_per_unit = setup_fee / Decimal(quantity)
        
        # 6. DESIGN & ENGINEERING
        engineering_cost_per_unit = Decimal("0.0")
        if getattr(design, 'requires_engineering_review', False):
             review_fee = Decimal(str(engineering_factors.get('review_fee_usd', 50.0)))
             engineering_cost_per_unit = review_fee / Decimal(quantity)

        # 7. QC & TESTING
        qc_cost_per_unit = Decimal("0.0")
        inspection_reqs = getattr(design, 'inspection_requirements', [])
        if inspection_reqs:
            inspection_costs_map = qc_factors.get('inspection_costs', {})
            # Default to $10 if specific type not found
            total_qc_cost = sum(Decimal(str(inspection_costs_map.get(req, 10.0))) for req in inspection_reqs)
            qc_cost_per_unit = total_qc_cost

        # 8. PACKAGING
        pkg_type = getattr(design, 'packaging_requirements', 'standard')
        # Look for keys like 'standard_cost_unit', 'custom_cost_unit', 'export_cost_unit'
        pkg_cost_per_unit = Decimal(str(packaging_factors.get(f'{pkg_type}_cost_unit', 2.0)))

        # 9. TRANSPORTATION & LOGISTICS
        base_logistics_fee = Decimal(str(logistics_factors.get('base_fee_usd', 0.0)))
        cost_per_kg = Decimal(str(logistics_factors.get('cost_per_kg', 5.0)))
        
        # Amortize base fee, add weight-based cost
        logistics_cost_per_unit = (base_logistics_fee / Decimal(quantity)) + (mass_kg * cost_per_kg)
        
        # 10. OVERHEADS
        direct_cost = material_cost_per_unit + labor_cost_per_unit + run_cost_per_unit + setup_cost_per_unit
        overhead_rate = Decimal(str(overhead_factors.get('rate_percent', 0.20)))
        overhead_cost_per_unit = direct_cost * overhead_rate

        # --- SUBTOTAL (Factory Cost) ---
        subtotal_cost = direct_cost + overhead_cost_per_unit + tooling_cost_per_unit + engineering_cost_per_unit + qc_cost_per_unit + pkg_cost_per_unit + logistics_cost_per_unit
        
        # 11. LEAD TIME & URGENCY
        urgency_premium = Decimal("0.0")
        if getattr(design, 'urgency', 'standard') == 'urgent':
            urgency_rate = Decimal(str(urgency_factors.get('rate_percent', 0.20)))
            urgency_premium = subtotal_cost * urgency_rate

        # 12. PROFIT MARGIN
        margin_rate = Decimal(str(margin_factors.get('rate_percent', 0.25)))
        profit_margin = subtotal_cost * margin_rate

        # 13. RISK FACTORS
        risk_rate = Decimal(str(risk_factors.get('rate_percent', 0.05)))
        
        # Add DFM Risk Premium
        if dfm_risks:
            # 5% extra risk per identified DFM issue
            dfm_risk_rate = Decimal("0.05") * len(dfm_risks)
            risk_rate += dfm_risk_rate
            details.calculation_details['dfm_risks'] = ", ".join(dfm_risks)
            
        risk_cost = subtotal_cost * risk_rate

        # --- FINAL PRICE ---
        final_unit_price = subtotal_cost + urgency_premium + profit_margin + risk_cost
        total_price = final_unit_price * quantity

        # 14. TERMS & CONDITIONS
        details.calculation_details['terms_validity'] = f"{terms_factors.get('validity_days', 30)} Days"
        details.calculation_details['terms_payment'] = terms_factors.get('payment_terms', "Standard")

        # Standardize
        details.price_usd = total_price.quantize(Decimal("0.01"))
        details.calculation_details['final_price'] = f"{details.price_usd:.2f}"
        details.calculation_details['unit_price'] = f"{final_unit_price:.2f}"
        
        # Detailed Breakdown for UI
        details.calculation_details['breakdown'] = (
            f"Mat: {material_cost_per_unit:.2f}, Lab: {labor_cost_per_unit:.2f}, "
            f"Mach: {run_cost_per_unit:.2f}, Setup: {setup_cost_per_unit:.2f}, "
            f"Overhead: {overhead_cost_per_unit:.2f}, Pkg/Log: {(pkg_cost_per_unit+logistics_cost_per_unit):.2f}, "
            f"Risk/Margin: {(risk_cost+profit_margin):.2f}, Urgency: {urgency_premium:.2f}"
        )

    except Exception as e:
        logger.error(f"Error during 14-point pricing: {e}")
        details.errors.append(f"Pricing error: {e}")
        return details

    # --- Estimate Lead Time ---
    base_days = pricing_factors.get('estimated_lead_time_base_days', 7)
    if getattr(design, 'urgency', 'standard') == 'urgent':
        details.estimated_lead_time_days = max(1, int(base_days) // 2)
    else:
        details.estimated_lead_time_days = int(base_days)
    
    return details