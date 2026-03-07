import React, { useState, useEffect } from 'react';
import { Diamond, DollarSign, BarChart2, Wrench, Sparkles, CheckSquare, Package, FileText, Plus, Trash2, Link, Save, RotateCcw, ListChecks, Coins } from 'lucide-react';
import { api } from '../utils/api';
import { styles } from '../types/theme';
import { 
    ALL_CAPABILITIES_GROUPS, 
    SURFACE_FINISHES, 
    POST_PROCESSING_ASSEMBLY,
    MATERIALS_METALS,
    MATERIALS_PLASTICS,
    MATERIALS_COMPOSITES,
    MATERIALS_OTHERS
} from '../utils/constants';
import CtaButton from './CtaButton';
import Notification from './Notification';

const ManufacturerSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('material-selection');
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.getManufacturerSettings();
            setSettings(data.capabilities || {});
        } catch (err) {
            setNotification({ show: true, message: 'Failed to load settings', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateManufacturerSettings({ 
                capabilities: settings
            });
            setNotification({ show: true, message: 'Settings saved successfully!', type: 'success' });
        } catch (err) {
            setNotification({ show: true, message: 'Failed to save settings', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset all settings to defaults? This cannot be undone.')) return;

        try {
            const data = await api.resetManufacturerSettings();
            setSettings(data.capabilities);
            setNotification({ show: true, message: 'Settings reset to defaults', type: 'success' });
        } catch (err) {
            setNotification({ show: true, message: 'Failed to reset settings', type: 'error' });
        }
    };

    const [rateUnit, setRateUnit] = useState<'min' | 'hour'>('min');

    const updateSetting = (path: string[], value: any) => {
        const newSettings = JSON.parse(JSON.stringify(settings));
        let current = newSettings;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) current[path[i]] = {};
            current = current[path[i]];
        }

        current[path[path.length - 1]] = value;
        setSettings(newSettings);
    };

    // Robust Input Handler: Supports backspace, manual typing, AND arrow keys
    const handleSmartInput = (path: string[], e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>, isPercentage: boolean = false, unitScale: number = 1) => {
        const value = (e.target as HTMLInputElement).value;
        
        // Handle Keyboard Arrows for increment/decrement
        if (e.type === 'keydown') {
            const key = (e as React.KeyboardEvent).key;
            if (key === 'ArrowUp' || key === 'ArrowDown') {
                e.preventDefault();
                let currentVal = getSetting(path) || 0;
                const step = isPercentage ? 0.01 : 1;
                const nextVal = key === 'ArrowUp' ? currentVal + (step / unitScale) : currentVal - (step / unitScale);
                updateSetting(path, Math.max(0, nextVal));
                return;
            }
            return;
        }

        // Handle typing/clearing
        if (value === '') {
            updateSetting(path, null);
            return;
        }
        
        if (value === '.' || value === '-') {
            updateSetting(path, value);
            return;
        }

        if (!isNaN(parseFloat(value)) && /^-?\d*\.?\d*$/.test(value)) {
            let num = parseFloat(value);
            if (isPercentage) num = num / 100;
            if (unitScale !== 1) num = num / unitScale;
            updateSetting(path, num);
        }
    };

    const getSetting = (path: string[]) => {
        let current = settings;
        for (const key of path) {
            if (!current || current[key] === undefined) return undefined;
            current = current[key];
        }
        return current;
    };

    const deleteSetting = (path: string[]) => {
        const newSettings = JSON.parse(JSON.stringify(settings));
        let current = newSettings;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) return;
            current = current[path[i]];
        }

        delete current[path[path.length - 1]];
        setSettings(newSettings);
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
    if (!settings) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--status-error)' }}>Failed to load settings</div>;

    const pf = settings.pricing_factors || {};

    const tabs = [
        { id: 'material-selection', label: 'Material Selection', icon: <ListChecks size={16} /> },
        { id: 'materials', label: 'Material Pricing', icon: <Diamond size={16} /> },
        { id: 'processes', label: 'Manufacturing Capabilities', icon: <Wrench size={16} /> },
        { id: 'pricing', label: 'Pricing Rates', icon: <DollarSign size={16} /> },
        { id: 'secondary', label: 'Secondary Operations', icon: <Sparkles size={16} /> },
        { id: 'secondary-pricing', label: 'Secondary Pricing', icon: <Coins size={16} /> },
        { id: 'overhead', label: 'Overhead & Margins', icon: <BarChart2 size={16} /> },
        { id: 'qc', label: 'Engineering & QC', icon: <CheckSquare size={16} /> },
        { id: 'logistics', label: 'Logistics & Packaging', icon: <Package size={16} /> },
        { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={16} /> }
    ];

    const MATERIAL_GROUPS = [
        { title: 'Metals & Alloys', items: MATERIALS_METALS },
        { title: 'Plastics & Polymers', items: MATERIALS_PLASTICS },
        { title: 'Composites', items: MATERIALS_COMPOSITES },
        { title: 'Other Materials', items: MATERIALS_OTHERS }
    ];

    // Ensure QC has default sections if empty
    const DEFAULT_QC = {
        "Standard Dimensional Inspection": 0,
        "Full AS9102 First Article (FAI)": 150,
        "Material Certification (CoC)": 15,
        "CMM Inspection Report": 75,
        "Surface Roughness Measurement": 25
    };

    const addCustomMaterial = () => {
        const name = window.prompt('Enter material name:');
        if (name) {
            const currentSelected = settings.selected_materials || [];
            updateSetting(['selected_materials'], [...currentSelected, name]);
            updateSetting(['pricing_factors', 'material_properties', name], { density_g_cm3: 2.7, cost_usd_kg: 5.0 });
        }
    };

    const addCustomSection = (category: string, subPath?: string) => {
        const name = window.prompt('Enter name:');
        if (name) {
            const path = subPath ? ['pricing_factors', category, subPath, name] : ['pricing_factors', category, 'custom_sections', name];
            updateSetting(path, 0);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={styles.dashboardPageTitle}>Manufacturer Settings</h2>
                    <p style={styles.dashboardPageSubtitle}>Configure your global manufacturing and pricing parameters</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#CBD5E1', cursor: 'pointer' }}>
                        <RotateCcw size={16} /> Reset
                    </button>
                    <CtaButton text={saving ? 'Saving...' : 'Save Changes'} primary onClick={handleSave} disabled={saving} />
                </div>
            </div>

            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onDismiss={() => setNotification({ ...notification, show: false })}
                />
            )}

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginTop: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '240px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '14px 16px',
                                background: activeTab === tab.id ? 'rgba(var(--neon-cyan-rgb), 0.1)' : 'transparent',
                                border: 'none',
                                borderLeft: `3px solid ${activeTab === tab.id ? 'var(--neon-cyan)' : 'transparent'}`,
                                color: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                borderRadius: '0 8px 8px 0'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, background: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', minHeight: '600px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>

                    {/* 1. MATERIAL SELECTION */}
                    {activeTab === 'material-selection' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Select Supported Materials</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Choose the materials your facility is capable of processing.</p>

                            <div style={{ display: 'grid', gap: '24px' }}>
                                {MATERIAL_GROUPS.map((group) => (
                                    <div key={group.title}>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{group.title}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                                            {group.items.map(material => (
                                                <label key={material} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(settings.selected_materials || []).includes(material)}
                                                        onChange={(e) => {
                                                            const current = settings.selected_materials || [];
                                                            if (e.target.checked) {
                                                                updateSetting(['selected_materials'], [...current, material]);
                                                                if (!pf.material_properties?.[material]) {
                                                                    updateSetting(['pricing_factors', 'material_properties', material], { density_g_cm3: 2.7, cost_usd_kg: 5.0 });
                                                                }
                                                            } else {
                                                                updateSetting(['selected_materials'], current.filter((m: string) => m !== material));
                                                            }
                                                        }}
                                                        style={{ marginRight: '10px', accentColor: 'var(--neon-cyan)' }}
                                                    />
                                                    <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{material}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. MATERIAL PRICING */}
                    {activeTab === 'materials' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Material Pricing</h3>
                                <button onClick={addCustomMaterial} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Unlisted Material
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {(settings.selected_materials || []).map((material: string) => {
                                    const props = pf.material_properties?.[material] || {};
                                    return (
                                        <div key={material} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 12px 0', color: '#E2E8F0', fontSize: '15px' }}>{material}</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Density (g/cm³)</label>
                                                    <input type="text" value={props.density_g_cm3 ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'material_properties', material, 'density_g_cm3'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'material_properties', material, 'density_g_cm3'], e)} style={{ ...styles.input, width: '100%', padding: '8px' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost (USD/kg)</label>
                                                    <input type="text" value={props.cost_usd_kg ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'material_properties', material, 'cost_usd_kg'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'material_properties', material, 'cost_usd_kg'], e)} style={{ ...styles.input, width: '100%', padding: '8px' }} />
                                                </div>
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Supplier API <Link size={10} /></label>
                                                    <input type="text" placeholder="https://..." value={props.supplier_link || ''} onChange={(e) => updateSetting(['pricing_factors', 'material_properties', material, 'supplier_link'], e.target.value)} style={{ ...styles.input, width: '100%', padding: '8px' }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 3. MANUFACTURING CAPABILITIES */}
                    {activeTab === 'processes' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Manufacturing Capabilities</h3>
                            <div style={{ display: 'grid', gap: '24px' }}>
                                {ALL_CAPABILITIES_GROUPS.map((group) => (
                                    <div key={group.title}>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{group.title}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                            {group.processes.map(process => (
                                                <label key={process} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <input type="checkbox" checked={(settings.processes || []).includes(process)} onChange={(e) => {
                                                        const current = settings.processes || [];
                                                        updateSetting(['processes'], e.target.checked ? [...current, process] : current.filter((p: string) => p !== process));
                                                    }} style={{ marginRight: '10px' }} />
                                                    <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{process}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. PRICING RATES */}
                    {activeTab === 'pricing' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Machine & Labor Rates</h3>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                                    <button onClick={() => setRateUnit('min')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', background: rateUnit === 'min' ? 'var(--neon-cyan)' : 'transparent', color: rateUnit === 'min' ? 'black' : '#CBD5E1' }}>USD/Min</button>
                                    <button onClick={() => setRateUnit('hour')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', background: rateUnit === 'hour' ? 'var(--neon-cyan)' : 'transparent', color: rateUnit === 'hour' ? 'black' : '#CBD5E1' }}>USD/Hour</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '32px' }}>
                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase' }}>Machining Rates</h4>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {(settings.processes || []).map((machine: string) => {
                                            const minRate = pf.machining?.rates?.[machine] ?? 1.5;
                                            const displayValue = rateUnit === 'hour' ? (typeof minRate === 'number' ? (minRate * 60).toFixed(2) : '') : minRate;
                                            return (
                                                <div key={machine} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 150px', gap: '16px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                    <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{machine}</span>
                                                    <input type="text" value={displayValue ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'machining', 'rates', machine], e, false, rateUnit === 'hour' ? 60 : 1)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'machining', 'rates', machine], e, false, rateUnit === 'hour' ? 60 : 1)} style={{ ...styles.input, width: '100%', padding: '6px' }} />
                                                    <div style={{ color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold' }}>
                                                        {rateUnit === 'hour' ? `≈ $${(parseFloat(displayValue || "0") / 60).toFixed(3)}/min` : `≈ $${(parseFloat(displayValue || "0") * 60).toFixed(2)}/hr`}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Labor</h4>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <input type="text" placeholder="USD/Hour" value={pf.labor?.skilled_rate_hourly ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'labor', 'skilled_rate_hourly'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'labor', 'skilled_rate_hourly'], e)} style={{ ...styles.input, width: '100%' }} />
                                            <input type="text" placeholder="Efficiency (0.1 - 1.0)" value={pf.labor?.efficiency_factor ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'labor', 'efficiency_factor'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'labor', 'efficiency_factor'], e)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Material Factors</h4>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <input type="text" placeholder="Scrap Rate %" value={pf.material_factors?.scrap_rate_percent !== undefined ? (pf.material_factors.scrap_rate_percent * 100).toFixed(2) : ''} onChange={(e) => handleSmartInput(['pricing_factors', 'material_factors', 'scrap_rate_percent'], e, true)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'material_factors', 'scrap_rate_percent'], e, true)} style={{ ...styles.input, width: '100%' }} />
                                            <input type="text" placeholder="Yield Rate %" value={pf.material_factors?.yield_rate_percent !== undefined ? (pf.material_factors.yield_rate_percent * 100).toFixed(2) : ''} onChange={(e) => handleSmartInput(['pricing_factors', 'material_factors', 'yield_rate_percent'], e, true)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'material_factors', 'yield_rate_percent'], e, true)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. SECONDARY OPERATIONS SELECTION */}
                    {activeTab === 'secondary' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div>
                                <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Secondary & Finishing Capabilities</h3>
                                <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Surface Finishes</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                    {SURFACE_FINISHES.map(finish => (
                                        <label key={finish} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <input type="checkbox" checked={(settings.secondary_ops || []).includes(finish)} onChange={(e) => {
                                                const current = settings.secondary_ops || [];
                                                updateSetting(['secondary_ops'], e.target.checked ? [...current, finish] : current.filter((p: string) => p !== finish));
                                            }} style={{ marginRight: '10px' }} />
                                            <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{finish}</span>
                                        </label>
                                    ))}
                                </div>
                                <h4 style={{ color: '#E2E8F0', margin: '24px 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Post-Processing & Assembly</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                    {POST_PROCESSING_ASSEMBLY.map(process => (
                                        <label key={process} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <input type="checkbox" checked={(settings.secondary_ops || []).includes(process)} onChange={(e) => {
                                                const current = settings.secondary_ops || [];
                                                updateSetting(['secondary_ops'], e.target.checked ? [...current, process] : current.filter((p: string) => p !== process));
                                            }} style={{ marginRight: '10px' }} />
                                            <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{process}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. SECONDARY PRICING */}
                    {activeTab === 'secondary-pricing' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Secondary Pricing</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Set min lot charges and area-based costs for finishes.</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {(settings.secondary_ops || []).map((op: string) => {
                                    const props = pf.finishing?.[op] || { min_lot_usd: 100, cost_sq_cm: 0.05 };
                                    return (
                                        <div key={op} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 12px 0', color: '#E2E8F0', fontSize: '15px' }}>{op}</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Min Lot Charge (USD)</label>
                                                    <input type="text" value={props.min_lot_usd ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'finishing', op, 'min_lot_usd'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'finishing', op, 'min_lot_usd'], e)} style={{ ...styles.input, width: '100%' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost / sq cm (USD)</label>
                                                    <input type="text" value={props.cost_sq_cm ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'finishing', op, 'cost_sq_cm'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'finishing', op, 'cost_sq_cm'], e)} style={{ ...styles.input, width: '100%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'overhead' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Overhead & Margins</h3>
                                <button onClick={() => addCustomSection('overheads')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Surcharge
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Global Overhead (%)</label>
                                    <input type="text" value={pf.overheads?.rate_percent !== undefined ? (pf.overheads.rate_percent * 100).toFixed(2) : ''} onChange={(e) => handleSmartInput(['pricing_factors', 'overheads', 'rate_percent'], e, true)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'overheads', 'rate_percent'], e, true)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Target Margin (%)</label>
                                    <input type="text" value={pf.profit_margin?.rate_percent !== undefined ? (pf.profit_margin.rate_percent * 100).toFixed(2) : ''} onChange={(e) => handleSmartInput(['pricing_factors', 'profit_margin', 'rate_percent'], e, true)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'profit_margin', 'rate_percent'], e, true)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                {Object.entries(pf.overheads?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                    <div key={name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--neon-cyan)' }}>{name} (%)</label>
                                            <button onClick={() => deleteSetting(['pricing_factors', 'overheads', 'custom_sections', name])} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                        <input type="text" value={value !== undefined ? (value * 100).toFixed(2) : ''} onChange={(e) => handleSmartInput(['pricing_factors', 'overheads', 'custom_sections', name], e, true)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'overheads', 'custom_sections', name], e, true)} style={{ ...styles.input, width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'qc' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Engineering & QC</h3>
                                <button onClick={() => addCustomSection('qc', 'inspection_costs')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Service
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Eng. Review Fee (USD)</label>
                                    <input type="text" value={pf.engineering?.review_fee_usd ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'engineering', 'review_fee_usd'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'engineering', 'review_fee_usd'], e)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                <h4 style={{ color: '#E2E8F0', margin: '12px 0 4px 0', fontSize: '14px' }}>Inspection Costs (USD)</h4>
                                {Object.entries(pf.qc?.inspection_costs || DEFAULT_QC).map(([type, cost]: [string, any]) => (
                                    <div key={type} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                        <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '12px' }}>{type}</span>
                                        <input type="text" value={cost ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'qc', 'inspection_costs', type], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'qc', 'inspection_costs', type], e)} style={{ ...styles.input }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'logistics' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Logistics & Packaging</h3>
                                <button onClick={() => addCustomSection('packaging')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Packaging
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Standard Packaging (USD/unit)</label>
                                    <input type="text" value={pf.packaging?.standard_cost_unit ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'packaging', 'standard_cost_unit'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'packaging', 'standard_cost_unit'], e)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Custom Packaging (USD/unit)</label>
                                    <input type="text" value={pf.packaging?.custom_cost_unit ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'packaging', 'custom_cost_unit'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'packaging', 'custom_cost_unit'], e)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                {Object.entries(pf.packaging?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                    <div key={name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--neon-cyan)' }}>{name} (USD)</label>
                                            <button onClick={() => deleteSetting(['pricing_factors', 'packaging', 'custom_sections', name])} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                        </div>
                                        <input type="text" value={value ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'packaging', 'custom_sections', name], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'packaging', 'custom_sections', name], e)} style={{ ...styles.input, width: '100%' }} />
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Logistics Fees</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Fee (USD)</label>
                                            <input type="text" value={pf.logistics?.base_fee_usd ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'logistics', 'base_fee_usd'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'logistics', 'base_fee_usd'], e)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost per kg (USD)</label>
                                            <input type="text" value={pf.logistics?.cost_per_kg ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'logistics', 'cost_per_kg'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'logistics', 'cost_per_kg'], e)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Terms & Conditions</h3>
                                <button onClick={() => addCustomSection('terms')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Term
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Quote Validity (days)</label>
                                    <input type="text" value={pf.terms?.validity_days ?? ''} onChange={(e) => handleSmartInput(['pricing_factors', 'terms', 'validity_days'], e)} onKeyDown={(e) => handleSmartInput(['pricing_factors', 'terms', 'validity_days'], e)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Payment Terms</label>
                                    <input type="text" placeholder="e.g. Net 30" value={pf.terms?.payment_terms || ''} onChange={(e) => updateSetting(['pricing_factors', 'terms', 'payment_terms'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                {Object.entries(pf.terms?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                    <div key={name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--neon-cyan)' }}>{name}</label>
                                            <button onClick={() => deleteSetting(['pricing_factors', 'terms', 'custom_sections', name])} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                        <input type="text" value={value || ''} onChange={(e) => updateSetting(['pricing_factors', 'terms', 'custom_sections', name], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManufacturerSettingsPage;
