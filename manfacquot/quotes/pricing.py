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
    estimated_lead_time_days: int = 14
    errors: List[str] = field(default_factory=list)
    calculation_details: Dict[str, str] = field(default_factory=dict)

from designs.fbm_manufacturing_intelligence import fbm_manufacturing_intelligence, ManufacturingProcess


def calculate_quote_price(design: Design, manufacturer: Manufacturer) -> PricingDetails:
    """
    Comprehensive 14-Point Pricing Engine
    Fully integrated with dynamic Manufacturer Settings and FBM Analysis.
    """
    details = PricingDetails()
    capabilities = manufacturer.capabilities or {}
    pf = capabilities.get('pricing_factors', {})
    geometric_data = design.geometric_data or {}

    # --- 1. Inputs & Validation ---
    volume_cm3 = geometric_data.get('volume_cm3')
    surface_area_cm2 = geometric_data.get('surface_area_cm2', 100.0)
    dfm_risks = geometric_data.get('dfm_risks', [])
    
    if not volume_cm3 or volume_cm3 <= 0:
        details.errors.append("Design volume is missing or invalid.")
        return details
    
    try:
        quantity = int(design.quantity)
        if quantity <= 0: raise ValueError()
        details.calculation_details['quantity'] = str(quantity)
    except (ValueError, TypeError):
        details.errors.append("Invalid quantity.")
        return details

    # --- 2. Material Validation & Costing ---
    design_material = design.material
    selected_materials = capabilities.get('selected_materials', [])
    material_properties = pf.get('material_properties', {})

    # Check if manufacturer supports this material
    supported = False
    matched_mat_key = None
    for m in selected_materials:
        if design_material.lower() in m.lower() or m.lower() in design_material.lower():
            supported = True
            matched_mat_key = m
            break
    
    if not supported or matched_mat_key not in material_properties:
        details.errors.append(f"Manufacturer does not support material: {design_material}")
        return details

    mat_props = material_properties[matched_mat_key]
    
    # Material Calculation
    stock_vol = Decimal(str(geometric_data.get('optimal_stock_volume_cm3', volume_cm3 * 1.5)))
    density = Decimal(str(mat_props.get('density_g_cm3', 2.7)))
    cost_per_kg = Decimal(str(mat_props.get('cost_usd_kg', 5.0)))
    
    mass_kg = (Decimal(str(stock_vol)) * density) / Decimal("1000")
    
    mat_factors = pf.get('material_factors', {})
    scrap = Decimal(str(mat_factors.get('scrap_rate_percent', 0.05)))
    yield_rate = Decimal(str(mat_factors.get('yield_rate_percent', 0.95)))
    
    gross_mass_kg = (mass_kg / yield_rate) * (1 + scrap)
    material_cost_unit = gross_mass_kg * cost_per_kg
    details.calculation_details['material_cost_per_unit'] = f"{material_cost_unit:.2f}"

    # --- 3. Machining & FBM Integration ---
    requirements = fbm_manufacturing_intelligence.determine_manufacturing_requirements(
        geometric_data, design_material, quantity
    )
    primary_process = requirements.get('primary_process')
    details.calculation_details['ai_process_selected'] = str(primary_process)

    # Match Primary Process to Specific Machine Rate
    machine_rates = pf.get('machining', {}).get('rates', {})
    hourly_rate = Decimal("90.00") # Default fallback
    found_machine = "Standard CNC"

    for m_name, m_rate in machine_rates.items():
        if str(primary_process).lower() in m_name.lower() or m_name.lower() in str(primary_process).lower():
            hourly_rate = Decimal(str(m_rate)) * Decimal("60")
            found_machine = m_name
            break
    
    details.calculation_details['machine_selected'] = found_machine
    details.calculation_details['applied_hourly_rate'] = f"${hourly_rate:.2f}/hr"

    # Process Flow Generation
    fbm_ops = geometric_data.get('fbm_operations') or geometric_data.get('operations', [])
    fbm_feats = geometric_data.get('fbm_features') or geometric_data.get('features', [])
    
    run_cost_per_unit = Decimal("0.0")
    total_estimated_min = Decimal("0.0")
    process_steps = []
    feature_sequences = {}

    if fbm_ops:
        total_machining_cost = Decimal("0.0")
        ops_by_feat = {}
        for op in fbm_ops:
            t_min = Decimal(str(op.get('estimated_time', 1.0)))
            total_estimated_min += t_min
            op_cost = (t_min / Decimal("60")) * hourly_rate
            
            f_type = op.get('feature_type', op.get('operation_name', 'Machining'))
            f_id = str(op.get('feature_id', 'unknown'))
            
            if 'Thread' in f_type or 'Tap' in f_type: op_cost += Decimal("2.0")
            
            total_machining_cost += op_cost
            process_steps.append({
                'step': op.get('operation_name', 'Step'),
                'tool': op.get('tool_type', 'Tool') + (f" Ø{op.get('tool_diameter')}mm" if op.get('tool_diameter') else ""),
                'time': f"{t_min:.1f} min",
                'cost': f"${op_cost:.2f}"
            })
            if f_id not in ops_by_feat: ops_by_feat[f_id] = []
            ops_by_feat[f_id].append(op.get('operation_name', 'Step'))

        for fid, ops in ops_by_feat.items():
            fname = "Feature"
            for f in fbm_feats:
                if str(f.get('feature_id')) == fid:
                    fname = f.get('feature_type', 'Feature')
                    break
            feature_sequences[f"{fname} #{fid}"] = " -> ".join(ops)

        run_cost_per_unit = total_machining_cost
        details.calculation_details['process_flow'] = json.dumps(process_steps)
        details.calculation_details['feature_sequences'] = json.dumps(feature_sequences)
    else:
        # Fallback to MRR
        mrr = Decimal(str(pf.get('machining', {}).get('material_removal_rate_cm3_min', 20.0)))
        removed_vol = max(Decimal("0.1"), stock_vol - Decimal(str(volume_cm3)))
        total_estimated_min = removed_vol / mrr
        run_cost_per_unit = (total_estimated_min / Decimal("60")) * hourly_rate

    # --- 4. Labor Costing ---
    labor_factors = pf.get('labor', {})
    skilled_rate = Decimal(str(labor_factors.get('skilled_rate_hourly', 35.0)))
    efficiency = Decimal(str(labor_factors.get('efficiency_factor', 0.85)))
    
    # Labor hours = (Machine Time * Ratio) + Setup/Handling
    labor_hours = ((total_estimated_min / Decimal("60")) * Decimal("0.5")) + Decimal("0.5")
    effective_labor_hours = labor_hours / efficiency
    labor_cost_per_unit = effective_labor_hours * skilled_rate
    details.calculation_details['labor_cost_per_unit'] = f"{labor_cost_per_unit:.2f} ({effective_labor_hours:.2f} hrs)"

    # --- 5. Secondary Operations & Finishing ---
    finishing_prices = pf.get('finishing', {})
    total_finishing_cost = Decimal("0.0")
    fin_details = []
    
    selected_finishes = requirements.get('secondary_operations', [])
    for finish in selected_finishes:
        rate_card = finishing_prices.get(finish)
        if rate_card:
            min_lot = Decimal(str(rate_card.get('min_lot_usd', 100.0)))
            sq_cm_rate = Decimal(str(rate_card.get('cost_sq_cm', 0.05)))
            
            area_cost = Decimal(str(surface_area_cm2)) * sq_cm_rate
            op_cost = (min_lot / Decimal(quantity)) + area_cost
            total_finishing_cost += op_cost
            fin_details.append(f"{finish}: ${op_cost:.2f}")
    
    details.calculation_details['finishing_cost_per_unit'] = f"{total_finishing_cost:.2f}"
    details.calculation_details['finishing_details'] = ", ".join(fin_details)

    # --- 6. Overheads, Margins & QC ---
    setup_fee = Decimal(str(pf.get('machining', {}).get('setup_fee_usd', 100.0)))
    setup_cost_unit = setup_fee / Decimal(quantity)
    
    # QC
    qc_factors = pf.get('qc', {})
    inspection_costs = qc_factors.get('inspection_costs', {})
    qc_cost_unit = sum(Decimal(str(inspection_costs.get(req, 0))) for req in getattr(design, 'inspection_requirements', []))
    # Add custom QC services
    custom_qc = qc_factors.get('custom_sections', {})
    qc_cost_unit += sum(Decimal(str(v)) for v in custom_qc.values())

    # Logistics & Packaging
    log_factors = pf.get('logistics', {})
    pkg_factors = pf.get('packaging', {})
    pkg_cost_unit = Decimal(str(pkg_factors.get('standard_cost_unit', 2.0)))
    pkg_cost_unit += sum(Decimal(str(v)) for v in pkg_factors.get('custom_sections', {}).values())
    
    logistics_cost_unit = (Decimal(str(log_factors.get('base_fee_usd', 0))) / Decimal(quantity)) + (mass_kg * Decimal(str(log_factors.get('cost_per_kg', 5.0))))

    # Total Direct Cost
    direct_cost = material_cost_unit + labor_cost_per_unit + run_cost_per_unit + setup_cost_unit + total_finishing_cost
    
    # Overhead
    overhead_factors = pf.get('overheads', {})
    overhead_rate = Decimal(str(overhead_factors.get('rate_percent', 0.20)))
    overhead_rate += sum(Decimal(str(v)) for v in overhead_factors.get('custom_sections', {}).values())
    overhead_cost_unit = direct_cost * overhead_rate

    # Subtotal
    subtotal = direct_cost + overhead_cost_unit + qc_cost_unit + pkg_cost_unit + logistics_cost_unit
    
    # Margin & Risk
    margin_rate = Decimal(str(pf.get('profit_margin', {}).get('rate_percent', 0.25)))
    profit_margin = subtotal * margin_rate
    
    risk_rate = Decimal(str(pf.get('risk_contingency', {}).get('rate_percent', 0.05))) + (Decimal("0.05") * len(dfm_risks))
    risk_cost = subtotal * risk_rate
    
    # Urgency
    urgency_prem = (subtotal * Decimal("0.20")) if getattr(design, 'urgency', 'standard') == 'urgent' else Decimal("0")

    # --- Final Price ---
    final_unit_price = subtotal + profit_margin + risk_cost + urgency_prem
    details.price_usd = (final_unit_price * Decimal(quantity)).quantize(Decimal("0.01"))
    
    # Terms
    terms_factors = pf.get('terms', {})
    validity = f"{terms_factors.get('validity_days', 30)} Days"
    payment = terms_factors.get('payment_terms', 'Standard')
    custom_terms = terms_factors.get('custom_sections', {})
    if custom_terms:
        payment += " (" + ", ".join(f"{k}: {v}" for k, v in custom_terms.items()) + ")"

    details.calculation_details.update({
        'final_price': f"{details.price_usd:.2f}",
        'unit_price': f"{final_unit_price:.2f}",
        'terms_validity': validity,
        'terms_payment': payment,
        'breakdown': f"Mat: {material_cost_unit:.2f}, Lab: {labor_cost_unit:.2f}, Mach: {run_cost_per_unit:.2f}, Setup: {setup_cost_unit:.2f}, Overhead: {overhead_cost_unit:.2f}, Pkg/Log: {(pkg_cost_unit+logistics_cost_unit):.2f}, Risk/Margin: {(risk_cost+profit_margin):.2f}, Urgency: {urgency_prem:.2f}"
    })

    details.estimated_lead_time_days = int(pf.get('estimated_lead_time_base_days', 7) // (2 if getattr(design, 'urgency', 'standard') == 'urgent' else 1))
    
    return details
