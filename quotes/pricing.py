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

        # 2. LABOR COSTS
        # Estimate hours based on complexity and volume removal
        # Heuristic: Base 0.5hr + (Removal Vol / 100) * Complexity
        removed_volume = Decimal(str(stock_volume)) - Decimal(str(volume_cm3))
        if removed_volume < 0: removed_volume = Decimal("0")
        
        comp_score = Decimal(str(complexity_score or 0.5))
        estimated_hours = Decimal("0.5") + (removed_volume / Decimal("100")) * comp_score
        
        skilled_rate = Decimal(str(labor_factors.get('skilled_rate_hourly', 25.0)))
        efficiency = Decimal(str(labor_factors.get('efficiency_factor', 1.0)))
        
        # Adjusted hours for efficiency
        actual_hours = estimated_hours / efficiency
        labor_cost_per_unit = actual_hours * skilled_rate
        details.calculation_details['labor_cost_per_unit'] = f"{labor_cost_per_unit:.4f} ({actual_hours:.2f} hrs)"

        # 3. MACHINE / PROCESSING COSTS
        setup_fee = Decimal(str(machining_factors.get('setup_fee_usd', 50.0)))
        base_run_cost = Decimal(str(machining_factors.get('base_run_cost_unit', 5.0)))
        
        # Machine Selection (3-Axis vs 5-Axis)
        # Use prismatic_score to determine complexity. Low score (< 0.6) implies organic/curved geometry.
        is_complex = comp_score > 0.7 or Decimal(str(prismatic_score)) < Decimal("0.6")
        machining_rate_per_min = Decimal(str(machining_factors.get('machining_rate_usd_min', 1.5)))
        if is_complex:
            machining_rate_per_min *= Decimal(str(machining_factors.get('5_axis_multiplier', 2.0)))
            details.calculation_details['machine_type'] = "5-Axis CNC"
        else:
            details.calculation_details['machine_type'] = "3-Axis CNC"

        mrr = Decimal(str(machining_factors.get('material_removal_rate_cm3_min', 20.0)))
        machining_time_min = removed_volume / mrr if mrr > 0 else Decimal("0")
        
        # Feature Costs
        num_holes = int(geometric_data.get('num_holes', 0))
        drilling_cost = Decimal(str(machining_factors.get('drilling_cost_per_hole', 2.0))) * num_holes
        contouring_cost = Decimal(str(geometric_data.get('curved_surface_area_cm2', 0))) * Decimal(str(machining_factors.get('contouring_cost_per_cm2', 0.5)))

        run_cost_per_unit = base_run_cost + (machining_time_min * machining_rate_per_min) + drilling_cost + contouring_cost
        
        # 4. TOOLING (Amortized)
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