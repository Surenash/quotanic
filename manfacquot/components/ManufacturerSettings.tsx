import React, { useState, useEffect } from 'react';
import { Diamond, DollarSign, BarChart2, Wrench, Sparkles, CheckSquare, Package, FileText, Plus, Trash2, Link, Save, RotateCcw, ListChecks } from 'lucide-react';
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

    const handleNumberInput = (path: string[], value: string, isPercentage: boolean = false) => {
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
            updateSetting(path, num);
        }
    };

    const handleRateInput = (machine: string, value: string) => {
        if (value === '') {
            updateSetting(['pricing_factors', 'machining', 'rates', machine], null);
            return;
        }

        if (value === '.' || value === '-') {
            updateSetting(['pricing_factors', 'machining', 'rates', machine], value);
            return;
        }

        if (!isNaN(parseFloat(value)) && /^-?\d*\.?\d*$/.test(value)) {
            const num = parseFloat(value);
            const minRate = rateUnit === 'hour' ? num / 60 : num;
            updateSetting(['pricing_factors', 'machining', 'rates', machine], minRate);
        }
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

    const addCustomMaterial = () => {
        const name = window.prompt('Enter material name:');
        if (name) {
            // Add to selection list automatically if it's custom
            const currentSelected = settings.selected_materials || [];
            updateSetting(['selected_materials'], [...currentSelected, name]);
            // Add default properties
            updateSetting(['pricing_factors', 'material_properties', name], { density_g_cm3: 2.7, cost_usd_kg: 5.0, supplier_link: '' });
        }
    };

    const addCustomSection = (category: string) => {
        const name = window.prompt('Enter section name:');
        if (name) {
            updateSetting(['pricing_factors', category, 'custom_sections', name], 0);
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
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Choose the materials your facility is capable of processing. You will set prices for these in the next tab.</p>

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
                                                                // Initialize pricing if doesn't exist
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
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Material Pricing & Properties</h3>
                                <button onClick={addCustomMaterial} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Unlisted Material
                                </button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Configure costs only for the materials selected in the previous tab.</p>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {(settings.selected_materials || []).map((material: string) => {
                                    const props = pf.material_properties?.[material] || {};
                                    return (
                                        <div key={material} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h4 style={{ margin: '0 0 12px 0', color: '#E2E8F0', fontSize: '15px' }}>{material}</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Density (g/cm³)</label>
                                                    <input type="text" value={props.density_g_cm3 ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'material_properties', material, 'density_g_cm3'], e.target.value)} style={{ ...styles.input, width: '100%', padding: '8px' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost (USD/kg)</label>
                                                    <input type="text" value={props.cost_usd_kg ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'material_properties', material, 'cost_usd_kg'], e.target.value)} style={{ ...styles.input, width: '100%', padding: '8px' }} />
                                                </div>
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Supplier Link / API <Link size={10} /></label>
                                                    <input type="text" placeholder="Auto-update from supplier..." value={props.supplier_link || ''} onChange={(e) => updateSetting(['pricing_factors', 'material_properties', material, 'supplier_link'], e.target.value)} style={{ ...styles.input, width: '100%', padding: '8px', fontSize: '12px' }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(settings.selected_materials || []).length === 0 && (
                                    <p style={{ color: '#EF4444', fontSize: '13px', fontStyle: 'italic' }}>No materials selected. Please go to the "Material Selection" tab.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. MANUFACTURING CAPABILITIES */}
                    {activeTab === 'processes' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Manufacturing Capabilities</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Selecting processes here will automatically update your machine list in Pricing Rates.</p>

                            <div style={{ display: 'grid', gap: '24px' }}>
                                {ALL_CAPABILITIES_GROUPS.map((group) => (
                                    <div key={group.title}>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{group.title}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                            {group.processes.map(process => (
                                                <label key={process} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(settings.processes || []).includes(process)}
                                                        onChange={(e) => {
                                                            const currentProcesses = settings.processes || [];
                                                            if (e.target.checked) {
                                                                updateSetting(['processes'], [...currentProcesses, process]);
                                                            } else {
                                                                updateSetting(['processes'], currentProcesses.filter((p: string) => p !== process));
                                                            }
                                                        }}
                                                        style={{ marginRight: '10px', accentColor: 'var(--neon-cyan)' }}
                                                    />
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
                                            const displayValue = rateUnit === 'hour' ? (typeof minRate === 'number' ? (minRate * 60).toFixed(2) : minRate) : minRate;
                                            return (
                                                <div key={machine} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 150px', gap: '16px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                    <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{machine}</span>
                                                    <input type="text" value={displayValue ?? ''} onChange={(e) => handleRateInput(machine, e.target.value)} style={{ ...styles.input, width: '100%', padding: '6px' }} />
                                                    <div style={{ color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold' }}>
                                                        {rateUnit === 'hour' ? `≈ $${(parseFloat(displayValue) / 60).toFixed(3)}/min` : `≈ $${(parseFloat(displayValue) * 60).toFixed(2)}/hr`}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(settings.processes || []).length === 0 && (
                                            <p style={{ color: '#EF4444', fontSize: '13px', fontStyle: 'italic' }}>No processes selected. Please go to the "Manufacturing Capabilities" tab.</p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Labor & Efficiency</h4>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Skilled Rate (USD/hour)</label>
                                                <input type="text" value={pf.labor?.skilled_rate_hourly ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'labor', 'skilled_rate_hourly'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Efficiency Factor (0.1 - 1.0)</label>
                                                <input type="text" value={pf.labor?.efficiency_factor ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'labor', 'efficiency_factor'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Material Factors</h4>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Scrap Rate (%)</label>
                                                <input type="text" value={pf.material_factors?.scrap_rate_percent !== undefined ? (typeof pf.material_factors.scrap_rate_percent === 'number' ? (pf.material_factors.scrap_rate_percent * 100).toFixed(2) : pf.material_factors.scrap_rate_percent) : ''} onChange={(e) => handleNumberInput(['pricing_factors', 'material_factors', 'scrap_rate_percent'], e.target.value, true)} style={{ ...styles.input, width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Yield Rate (%)</label>
                                                <input type="text" value={pf.material_factors?.yield_rate_percent !== undefined ? (typeof pf.material_factors.yield_rate_percent === 'number' ? (pf.material_factors.yield_rate_percent * 100).toFixed(2) : pf.material_factors.yield_rate_percent) : ''} onChange={(e) => handleNumberInput(['pricing_factors', 'material_factors', 'yield_rate_percent'], e.target.value, true)} style={{ ...styles.input, width: '100%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. SECONDARY OPERATIONS */}
                    {activeTab === 'secondary' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Secondary & Finishing Capabilities</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>These options will be available for customers to select during the request process.</p>

                            <div style={{ display: 'grid', gap: '32px' }}>
                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Surface Finishes</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                        {SURFACE_FINISHES.map(finish => (
                                            <label key={finish} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings.secondary_ops || []).includes(finish)}
                                                    onChange={(e) => {
                                                        const currentOps = settings.secondary_ops || [];
                                                        updateSetting(['secondary_ops'], e.target.checked ? [...currentOps, finish] : currentOps.filter((p: string) => p !== finish));
                                                    }}
                                                    style={{ marginRight: '10px', accentColor: 'var(--neon-cyan)' }}
                                                />
                                                <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{finish}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Post-Processing</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                        {POST_PROCESSING_ASSEMBLY.map(process => (
                                            <label key={process} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings.secondary_ops || []).includes(process)}
                                                    onChange={(e) => {
                                                        const currentOps = settings.secondary_ops || [];
                                                        updateSetting(['secondary_ops'], e.target.checked ? [...currentOps, process] : currentOps.filter((p: string) => p !== process));
                                                    }}
                                                    style={{ marginRight: '10px', accentColor: 'var(--neon-cyan)' }}
                                                />
                                                <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{process}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. OVERHEAD & MARGINS */}
                    {activeTab === 'overhead' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Overhead & Profit Margins</h3>
                                <button onClick={() => addCustomSection('overheads')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Custom Surcharge
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Global Overhead Rate (%)</label>
                                    <input type="text" value={pf.overheads?.rate_percent !== undefined ? (typeof pf.overheads.rate_percent === 'number' ? (pf.overheads.rate_percent * 100).toFixed(2) : pf.overheads.rate_percent) : ''} onChange={(e) => handleNumberInput(['pricing_factors', 'overheads', 'rate_percent'], e.target.value, true)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Target Profit Margin (%)</label>
                                    <input type="text" value={pf.profit_margin?.rate_percent !== undefined ? (typeof pf.profit_margin.rate_percent === 'number' ? (pf.profit_margin.rate_percent * 100).toFixed(2) : pf.profit_margin.rate_percent) : ''} onChange={(e) => handleNumberInput(['pricing_factors', 'profit_margin', 'rate_percent'], e.target.value, true)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                
                                {Object.entries(pf.overheads?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                    <div key={name} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--neon-cyan)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--neon-cyan)', display: 'block' }}>{name} (%)</label>
                                            <button onClick={() => deleteSetting(['pricing_factors', 'overheads', 'custom_sections', name])} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                        <input type="text" value={value !== undefined ? (typeof value === 'number' ? (value * 100).toFixed(2) : value) : ''} onChange={(e) => handleNumberInput(['pricing_factors', 'overheads', 'custom_sections', name], e.target.value, true)} style={{ ...styles.input, width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 7. ENGINEERING & QC */}
                    {activeTab === 'qc' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Engineering & Quality Control</h3>
                                <button onClick={() => addCustomSection('qc')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Custom Service
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Standard Engineering Review Fee (USD)</label>
                                    <input type="text" value={pf.engineering?.review_fee_usd ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'engineering', 'review_fee_usd'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                </div>

                                <h4 style={{ color: '#E2E8F0', margin: '12px 0 4px 0', fontSize: '14px' }}>Inspection Services</h4>
                                {Object.entries(pf.qc?.inspection_costs || {}).map(([type, cost]: [string, any]) => (
                                    <div key={type} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                        <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '12px' }}>{type}</span>
                                        <input type="text" value={cost ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'qc', 'inspection_costs', type], e.target.value)} style={{ ...styles.input }} />
                                    </div>
                                ))}

                                {Object.entries(pf.qc?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                    <div key={name} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--neon-cyan)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--neon-cyan)', display: 'block' }}>{name} Fee (USD)</label>
                                            <button onClick={() => deleteSetting(['pricing_factors', 'qc', 'custom_sections', name])} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                        <input type="text" value={value ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'qc', 'custom_sections', name], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 8. LOGISTICS & PACKAGING */}
                    {activeTab === 'logistics' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Logistics & Packaging</h3>
                                <button onClick={() => addCustomSection('packaging')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Packaging Type
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Unit Packaging Costs (USD)</h4>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px' }}>Standard Packaging</span>
                                            <input type="text" value={pf.packaging?.standard_cost_unit ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'packaging', 'standard_cost_unit'], e.target.value)} style={{ ...styles.input, width: '100px' }} />
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px' }}>Custom Packaging</span>
                                            <input type="text" value={pf.packaging?.custom_cost_unit ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'packaging', 'custom_cost_unit'], e.target.value)} style={{ ...styles.input, width: '100px' }} />
                                        </div>
                                        {Object.entries(pf.packaging?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                            <div key={name} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--neon-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button onClick={() => deleteSetting(['pricing_factors', 'packaging', 'custom_sections', name])} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                                    <span style={{ fontSize: '13px', color: 'var(--neon-cyan)' }}>{name}</span>
                                                </div>
                                                <input type="text" value={value ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'packaging', 'custom_sections', name], e.target.value)} style={{ ...styles.input, width: '100px' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', fontSize: '14px' }}>Logistics Fees</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Fee (USD)</label>
                                            <input type="text" value={pf.logistics?.base_fee_usd ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'logistics', 'base_fee_usd'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost per kg (USD)</label>
                                            <input type="text" value={pf.logistics?.cost_per_kg ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'logistics', 'cost_per_kg'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 9. TERMS & CONDITIONS */}
                    {activeTab === 'terms' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--neon-cyan)', margin: 0 }}>Terms & Conditions</h3>
                                <button onClick={() => addCustomSection('terms')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '1px solid var(--neon-cyan)', borderRadius: '6px', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Plus size={14} /> Add Custom Term
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Quote Validity (days)</label>
                                    <input type="text" value={pf.terms?.validity_days ?? ''} onChange={(e) => handleNumberInput(['pricing_factors', 'terms', 'validity_days'], e.target.value)} style={{ ...styles.input, width: '100%' }} />
                                </div>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Payment Terms</label>
                                    <input type="text" value={pf.terms?.payment_terms || ''} onChange={(e) => updateSetting(['pricing_factors', 'terms', 'payment_terms'], e.target.value)} style={{ ...styles.input, width: '100%' }} placeholder="e.g., Net 30" />
                                </div>
                                
                                {Object.entries(pf.terms?.custom_sections || {}).map(([name, value]: [string, any]) => (
                                    <div key={name} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--neon-cyan)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--neon-cyan)', display: 'block' }}>{name}</label>
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
