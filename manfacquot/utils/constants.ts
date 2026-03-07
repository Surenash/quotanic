
export const PRODUCTION_VOLUMES = ['Prototyping', 'Low Volume', 'Medium Volume', 'High Volume'];
export const CERTIFICATIONS = ['ISO 9001', 'AS9100', 'IATF 16949', 'ISO 13485 (Medical)', 'RoHS Compliant'];

export const MACHINING_PROCESSES = [
  'CNC Milling (3-axis)', 
  'CNC Milling (4-axis)', 
  'CNC Milling (5-axis)', 
  'CNC Turning (Lathe)',
  'CNC Lathe with Live Tooling',
  'Swiss Machining', 
  'Vertical Boring',
  'Horizontal Boring',
  'Gear Hobbing',
  'EDM (Electrical Discharge Machining)', 
  'Wire EDM',
  'Grinding (Surface, Cylindrical)', 
  'Lapping / Honing',
  'Drilling / Tapping',
  'Broaching'
];

export const SHEET_METAL_PROCESSES = [
  'Laser Cutting', 
  'Waterjet Cutting', 
  'Plasma Cutting', 
  'Bending (Press Brake)', 
  'Punching', 
  'Sheet Metal Welding',
  'Stamping',
  'Deep Drawing',
  'Tube Bending',
  'Roll Forming'
];

export const CASTING_PROCESSES = ['Sand Casting', 'Die Casting', 'Investment Casting', 'Gravity Casting', 'Centrifugal Casting', 'Continuous Casting'];
export const FORGING_PROCESSES = ['Open Die Forging', 'Closed Die Forging', 'Cold Forging', 'Upside Forging', 'Roll Forging'];
export const INJECTION_MOLDING_PROCESSES = ['Thermoplastics', 'Thermosets', 'Insert Molding / Overmolding', 'Blow Molding', 'Compression Molding'];
export const ADDITIVE_PROCESSES = ['FDM', 'SLA', 'SLS', 'DMLS / SLM (Metal)', 'Multi Jet Fusion (MJF)', 'PolyJet', 'Binder Jetting'];
export const WELDING_JOINING_PROCESSES = ['MIG Welding', 'TIG Welding', 'Spot Welding', 'Laser Welding', 'Electron Beam Welding', 'Brazing / Soldering', 'Riveting / Adhesives', 'Ultrasonic Welding'];

export const MATERIALS_METALS = [
  'Aluminum 6061', 'Aluminum 7075', 'Aluminum 5052', 'Aluminum 2024',
  'Stainless Steel 304', 'Stainless Steel 316', 'Stainless Steel 17-4 PH', 'Stainless Steel 410',
  'Steel (Mild / Low Carbon)', 'Steel (Alloy 4140, 4340)', 'Tool Steel (D2, A2, O1, H13)',
  'Titanium (Grade 2, Grade 5 / Ti-6Al-4V)', 'Inconel 625 / 718',
  'Brass (C360)', 'Bronze', 'Copper (C101, C110)', 'Monel', 'Hastelloy'
];

export const MATERIALS_PLASTICS = [
  'ABS', 'Nylon 6', 'Nylon 6/6', 'POM (Delrin)', 'Polycarbonate (PC)', 'PEEK', 'Ultem (PEI)',
  'Polyethylene (HDPE, LDPE)', 'Polypropylene (PP)', 'Acrylic (PMMA)', 'PVC', 'PTFE (Teflon)', 'PET'
];

export const MATERIALS_COMPOSITES = ['CFRP (Carbon Fiber)', 'GFRP (Glass Fiber)', 'G10 / FR4'];
export const MATERIALS_OTHERS = ['Rubber (EPDM, Nitrile, Silicone)', 'Foam', 'Ceramics (Alumina, Zirconia)', 'Wood', 'Carbon / Graphite'];

export const SURFACE_FINISHES = [
  'As-Machined', 
  'Sandblasting / Bead Blasting', 
  'Anodizing Type II (Sulfuric)', 
  'Anodizing Type III (Hardcoat)',
  'Chem Film (Alodine / Chromate Conversion)',
  'Passivation',
  'Powder Coating', 
  'Electroplating (Zinc, Nickel, Chrome, Silver, Gold)', 
  'Electroless Nickel Plating',
  'Polishing (Mirror, Brushed)', 
  'Heat Treatment (Quench, Temper, Annealing)',
  'Nitriting / Carburizing',
  'Painting',
  'Black Oxide'
];

export const POST_PROCESSING_ASSEMBLY = [
  'Threading / Tapping', 
  'Helicoil Inserts Installation',
  'Press-fitting (Bearings, Pins)', 
  'Assembly Welding', 
  'Fastening / Hardware Installation', 
  'Full Product Assembly', 
  'Kitting',
  'Custom Packaging'
];

export const FILE_FORMATS = ['STEP (.stp, .step)', 'IGES (.igs, .iges)', 'SolidWorks (.sldprt)', 'PDF (Drawings)', 'DXF', 'STL', 'DWG'];
export const INCOTERMS = ['EXW (Ex Works)', 'FOB (Free On Board)', 'DDP (Delivered Duty Paid)', 'CIF (Cost, Insurance and Freight)', 'DAP (Delivered At Place)'];
export const SPECIAL_CAPABILITIES = [
  'Clean Room Manufacturing (ISO Class)', 
  'Aerospace Grade (AS9100)', 
  'Medical Grade (ISO 13485)', 
  'Defense / ITAR Registered',
  'Nuclear Grade',
  'Supply Chain Integration', 
  'Custom Tooling / Mold Making', 
  'Rapid Prototyping', 
  'Lights-Out Manufacturing',
  'DFM Assistance'
];

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
