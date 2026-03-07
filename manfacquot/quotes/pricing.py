import logging
import json
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
    complexity_score = geometric_data.get('complexity_score')
    prismatic_score = geometric_data.get('prismatic_score', 1.0)
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

    # Match material (handling variations in names)
    matched_mat = None
    for m_key in material_properties.keys():
        if material.lower() in m_key.lower() or m_key.lower() in material.lower():
            matched_mat = m_key
            break
    
    if not matched_mat:
        details.errors.append(f"Manufacturer does not provide pricing for material: {material}")
        return details

    mat_props = material_properties[matched_mat]

    # --- 2. Calculate Costs ---
    try:
        # 1. RAW MATERIAL COSTS
        stock_volume = geometric_data.get('optimal_stock_volume_cm3', geometric_data.get('stock_volume_cm3', volume_cm3))
        density = Decimal(str(mat_props.get('density_g_cm3', 2.7)))
        cost_per_kg = Decimal(str(mat_props.get('cost_usd_kg', 5.0)))
        scrap_rate = Decimal(str(material_factors.get('scrap_rate_percent', 0.05)))
        yield_rate = Decimal(str(material_factors.get('yield_rate_percent', 0.95)))
        
        mass_g = Decimal(str(stock_volume)) * density
        mass_kg = mass_g / Decimal("1000")
        
        gross_mass_kg = (mass_kg / yield_rate) * (1 + scrap_rate)
        material_cost_per_unit = gross_mass_kg * cost_per_kg
        
        details.calculation_details['material_cost_per_unit'] = f"{material_cost_per_unit:.4f}"

        # Determine Process
        requirements = fbm_manufacturing_intelligence.determine_manufacturing_requirements(
            geometric_data, material, quantity
        )
        primary_process = requirements.get('primary_process')
        
        details.calculation_details['ai_process_selected'] = str(primary_process)
        details.calculation_details['ai_reasoning'] = "; ".join(requirements.get('reasoning', []))

        # Select Machine Rate from the new synchronized rates
        # Try to find a rate for the specific primary process
        machine_rates = machining_factors.get('rates', {})
        hourly_rate = Decimal("90.00") # Default
        
        process_str = str(primary_process)
        found_rate = False
        for m_name, m_rate in machine_rates.items():
            if process_str.lower() in m_name.lower():
                hourly_rate = Decimal(str(m_rate)) * Decimal("60")
                details.calculation_details['machine_selected'] = m_name
                found_rate = True
                break
        
        if not found_rate:
            # Fallback to general machining rate if specific one not found
            hourly_rate = Decimal(str(machining_factors.get('machining_rate_usd_min', 1.5))) * Decimal("60")
            details.calculation_details['machine_selected'] = "Standard 3-Axis CNC"

        details.calculation_details['applied_hourly_rate'] = f"${hourly_rate:.2f}/hr"

        # 3. Feature-Based Costing
        run_cost_per_unit = Decimal("0.0")
        feature_costs_breakdown = []
        process_steps = []
        feature_sequences = {}

        fbm_ops = geometric_data.get('fbm_operations') or geometric_data.get('operations', [])
        fbm_feats = geometric_data.get('fbm_features') or geometric_data.get('features', [])

        total_estimated_min = Decimal("0.0")

        if fbm_ops:
            total_machining_cost = Decimal("0.0")
            ops_by_feature = {}
            
            for op in fbm_ops:
                op_time_min = Decimal(str(op.get('estimated_time', 0)))
                total_estimated_min += op_time_min
                op_cost = (op_time_min / Decimal("60")) * hourly_rate
                
                feature_type = op.get('feature_type', op.get('operation_name', 'Generic Machining'))
                feature_id = op.get('feature_id', 'unknown')
                
                if 'Thread' in feature_type or 'Tap' in feature_type: 
                    op_cost += Decimal("2.0")
                
                total_machining_cost += op_cost
                feature_costs_breakdown.append(f"{feature_type}: ${op_cost:.2f}")
                
                process_steps.append({
                    'step': op.get('operation_name', 'Machining Step'),
                    'tool': op.get('tool_type', 'Standard Tool') + (f" Ø{op.get('tool_diameter')}mm" if op.get('tool_diameter') else ""),
                    'time': f"{op_time_min:.1f} min",
                    'cost': f"${op_cost:.2f}"
                })
                
                if feature_id not in ops_by_feature:
                    ops_by_feature[feature_id] = []
                ops_by_feature[feature_id].append(op.get('operation_name', 'Machining Step'))

            for fid, ops in ops_by_feature.items():
                feature_name = "Unknown Feature"
                for f in fbm_feats:
                    if str(f.get('feature_id')) == str(fid):
                        feature_name = f.get('feature_type', 'Feature')
                        break
                feature_sequences[f"{feature_name} #{fid}"] = " -> ".join(ops)

            run_cost_per_unit = total_machining_cost
            details.calculation_details['feature_costs'] = ", ".join(feature_costs_breakdown[:10]) + ("..." if len(feature_costs_breakdown)>10 else "")
            details.calculation_details['process_flow'] = json.dumps(process_steps)
            details.calculation_details['feature_sequences'] = json.dumps(feature_sequences)
        else:
            stock_vol = Decimal(str(stock_volume))
            part_vol = Decimal(str(volume_cm3))
            removed_vol = max(Decimal("0"), stock_vol - part_vol)
            mrr = Decimal(str(machining_factors.get('material_removal_rate_cm3_min', 20.0)))
            total_estimated_min = removed_vol / max(mrr, Decimal("1.0"))
            run_cost_per_unit = (total_estimated_min / Decimal("60")) * hourly_rate

        # Labor
        labor_ratio = Decimal("0.5")
        skilled_rate = Decimal(str(labor_factors.get('skilled_rate_hourly', 35.0)))
        efficiency = Decimal(str(labor_factors.get('efficiency_factor', 0.85)))
        labor_hours = ((total_estimated_min / Decimal("60")) * labor_ratio) + Decimal("0.5")
        effective_hours = labor_hours / efficiency
        labor_cost_per_unit = effective_hours * skilled_rate
        details.calculation_details['labor_cost_per_unit'] = f"{labor_cost_per_unit:.2f} ({effective_hours:.2f} hrs)"

        # Setups & Runs
        setup_fee = Decimal(str(machining_factors.get('setup_fee_usd', 50.0)))
        setup_cost_per_unit = setup_fee / Decimal(quantity)
        run_cost_per_unit += Decimal(str(machining_factors.get('base_run_cost_unit', 5.0)))

        # Finishing
        secondary_ops = requirements.get('secondary_operations', [])
        finishing_factors = pricing_factors.get('finishing', {})
        total_finishing_cost_per_unit = Decimal("0.0")
        if secondary_ops:
            fin_breakdown = []
            for op in secondary_ops:
                rate_card = finishing_factors.get(op)
                if not rate_card:
                    if "anodize" in str(op): rate_card = finishing_factors.get("anodize_type_ii_sulfuric")
                if rate_card:
                    min_lot = Decimal(str(rate_card.get('min_lot_usd', 100.0)))
                    unit_metric_cost = Decimal(str(rate_card.get('cost_sq_cm', 0.05))) * Decimal(str(geometric_data.get('surface_area_cm2', 100.0)))
                    op_cost = (min_lot / Decimal(quantity)) + unit_metric_cost
                    total_finishing_cost_per_unit += op_cost
                    fin_breakdown.append(f"{op}: ${op_cost:.2f}")
            details.calculation_details['finishing_cost_per_unit'] = f"{total_finishing_cost_per_unit:.2f}"
            details.calculation_details['finishing_details'] = ", ".join(fin_breakdown)
        run_cost_per_unit += total_finishing_cost_per_unit

        # Tooling & Engineering
        tooling_cost_per_unit = Decimal(str(tooling_factors.get('custom_tooling_cost_usd', 0.0))) / Decimal(quantity)
        engineering_cost_per_unit = (Decimal(str(engineering_factors.get('review_fee_usd', 50.0))) / Decimal(quantity)) if getattr(design, 'requires_engineering_review', False) else Decimal("0")

        # QC & Packaging & Logistics
        qc_cost_per_unit = sum(Decimal(str(qc_factors.get('inspection_costs', {}).get(req, 10.0))) for req in getattr(design, 'inspection_requirements', []))
        # Add custom QC services
        custom_qc = qc_factors.get('custom_sections', {})
        qc_cost_per_unit += sum(Decimal(str(v)) for v in custom_qc.values())

        logistics_cost_per_unit = (Decimal(str(logistics_factors.get('base_fee_usd', 0.0))) / Decimal(quantity)) + (Decimal(str(mass_kg)) * Decimal(str(logistics_factors.get('cost_per_kg', 5.0))))
        
        pkg_cost_per_unit = Decimal(str(packaging_factors.get('standard_cost_unit', 2.0)))
        # Add custom packaging
        custom_pkg = packaging_factors.get('custom_sections', {})
        pkg_cost_per_unit += sum(Decimal(str(v)) for v in custom_pkg.values())

        # Overheads & Subtotal
        direct_cost = material_cost_per_unit + labor_cost_per_unit + run_cost_per_unit + setup_cost_per_unit
        
        overhead_rate = Decimal(str(overhead_factors.get('rate_percent', 0.20)))
        # Add custom overhead surcharges
        custom_overheads = overhead_factors.get('custom_sections', {})
        overhead_rate += sum(Decimal(str(v)) for v in custom_overheads.values())
        
        overhead_cost_per_unit = direct_cost * overhead_rate
        subtotal_cost = direct_cost + overhead_cost_per_unit + tooling_cost_per_unit + engineering_cost_per_unit + qc_cost_per_unit + pkg_cost_per_unit + logistics_cost_per_unit
        
        # Urgency & Margin & Risk
        urgency_premium = (subtotal_cost * Decimal(str(urgency_factors.get('rate_percent', 0.20)))) if getattr(design, 'urgency', 'standard') == 'urgent' else Decimal("0")
        profit_margin = subtotal_cost * Decimal(str(margin_factors.get('rate_percent', 0.25)))
        risk_rate = Decimal(str(risk_factors.get('rate_percent', 0.05))) + (Decimal("0.05") * len(dfm_risks))
        risk_cost = subtotal_cost * risk_rate

        # Final Price
        final_unit_price = subtotal_cost + urgency_premium + profit_margin + risk_cost
        details.price_usd = (final_unit_price * quantity).quantize(Decimal("0.01"))
        
        # Terms custom sections
        custom_terms = terms_factors.get('custom_sections', {})
        terms_payment = terms_factors.get('payment_terms', "Standard")
        if custom_terms:
            terms_payment += " (" + ", ".join(f"{k}: {v}" for k, v in custom_terms.items()) + ")"

        details.calculation_details.update({
            'final_price': f"{details.price_usd:.2f}",
            'unit_price': f"{final_unit_price:.2f}",
            'terms_validity': f"{terms_factors.get('validity_days', 30)} Days",
            'terms_payment': terms_payment,
            'breakdown': f"Mat: {material_cost_per_unit:.2f}, Lab: {labor_cost_per_unit:.2f}, Mach: {run_cost_per_unit:.2f}, Setup: {setup_cost_per_unit:.2f}, Overhead: {overhead_cost_per_unit:.2f}, Pkg/Log: {(pkg_cost_per_unit+logistics_cost_per_unit):.2f}, Risk/Margin: {(risk_cost+profit_margin):.2f}, Urgency: {urgency_premium:.2f}"
        })

    except Exception as e:
        logger.error(f"Pricing error: {e}")
        details.errors.append(f"Pricing error: {e}")
    
    details.estimated_lead_time_days = int(pricing_factors.get('estimated_lead_time_base_days', 7) // (2 if getattr(design, 'urgency', 'standard') == 'urgent' else 1))
    return details
