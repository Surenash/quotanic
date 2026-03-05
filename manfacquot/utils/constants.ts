
export const PRODUCTION_VOLUMES = ['Prototyping', 'Low Volume', 'Medium Volume', 'High Volume'];
export const CERTIFICATIONS = ['ISO 9001', 'AS9100', 'IATF 16949', 'ISO 13485 (Medical)', 'RoHS Compliant'];
export const MACHINING_PROCESSES = ['CNC Milling (3-axis)', 'CNC Milling (4-axis)', 'CNC Milling (5-axis)', 'CNC Turning', 'Swiss Machining', 'EDM (Electrical Discharge Machining)', 'Grinding / Lapping'];
export const SHEET_METAL_PROCESSES = ['Laser Cutting', 'Waterjet Cutting', 'Plasma Cutting', 'Bending (Press Brake)', 'Punching', 'Sheet Metal Welding'];
export const CASTING_PROCESSES = ['Sand Casting', 'Die Casting', 'Investment Casting', 'Gravity Casting'];
export const FORGING_PROCESSES = ['Open Die Forging', 'Closed Die Forging', 'Cold Forging'];
export const INJECTION_MOLDING_PROCESSES = ['Thermoplastics', 'Thermosets', 'Insert Molding / Overmolding'];
export const ADDITIVE_PROCESSES = ['FDM', 'SLA', 'SLS', 'DMLS / SLM (Metal)', 'Multi Jet Fusion (MJF)'];
export const WELDING_JOINING_PROCESSES = ['MIG Welding', 'TIG Welding', 'Spot Welding', 'Laser Welding', 'Brazing / Soldering', 'Riveting / Adhesives'];
export const MATERIALS_METALS = ['Aluminum', 'Steel (Mild, Stainless, Tool)', 'Titanium', 'Brass', 'Copper'];
export const MATERIALS_PLASTICS = ['ABS', 'Nylon', 'POM', 'Polycarbonate', 'PEEK', 'PE', 'PP', 'Acrylic (PMMA)'];
export const MATERIALS_COMPOSITES = ['CFRP (Carbon Fiber)', 'GFRP (Glass Fiber)'];
export const MATERIALS_OTHERS = ['Rubber', 'Silicone', 'Foam', 'Ceramics'];
export const SURFACE_FINISHES = ['Sandblasting', 'Anodizing (Type I, II, III)', 'Powder Coating', 'Electroplating (Chrome, Nickel, Zinc)', 'Polishing', 'Heat Treatment'];
export const POST_PROCESSING_ASSEMBLY = ['Threading / Tapping', 'Press-fitting', 'Assembly Welding', 'Fastening', 'Full Product Assembly', 'Custom Packaging'];
export const FILE_FORMATS = ['STEP (.stp, .step)', 'IGES (.igs, .iges)', 'SolidWorks (.sldprt)', 'PDF (Drawings)', 'DXF'];
export const INCOTERMS = ['EXW (Ex Works)', 'FOB (Free On Board)', 'DDP (Delivered Duty Paid)'];
export const SPECIAL_CAPABILITIES = ['Clean Room Manufacturing', 'Aerospace Grade', 'Medical Grade', 'Supply Chain Integration', 'Custom Tooling / Mold Making', 'Rapid Prototyping', 'Lights-Out Manufacturing'];
export const ORDER_STATUSES = ['Awaiting Production', 'In Production', 'Shipped', 'Delivered', 'Cancelled'];

export const ALL_CAPABILITIES_GROUPS = [
  { title: 'Machining', processes: MACHINING_PROCESSES },
  { title: 'Sheet Metal', processes: SHEET_METAL_PROCESSES },
  { title: 'Casting', processes: CASTING_PROCESSES },
  { title: 'Forging', processes: FORGING_PROCESSES },
  { title: 'Injection Molding', processes: INJECTION_MOLDING_PROCESSES },
  { title: '3D Printing', processes: ADDITIVE_PROCESSES },
  { title: 'Welding & Joining', processes: WELDING_JOINING_PROCESSES },
];

export const ALL_CAPABILITIES_FLAT = ALL_CAPABILITIES_GROUPS.flatMap(g => g.processes);
