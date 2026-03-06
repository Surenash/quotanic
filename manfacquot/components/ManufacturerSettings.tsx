import React, { useState, useEffect } from 'react';
import { Diamond, DollarSign, BarChart2, Wrench, Sparkles, CheckSquare, Package, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../utils/api';
import { styles } from '../types/theme';
import { ALL_CAPABILITIES_GROUPS, SURFACE_FINISHES, POST_PROCESSING_ASSEMBLY } from '../utils/constants';
import CtaButton from './CtaButton';
import Notification from './Notification';

const ManufacturerSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('materials');
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
            await api.updateManufacturerSettings({ capabilities: settings });
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

    const getSetting = (path: string[]) => {
        let current = settings;
        for (const key of path) {
            if (!current || !current[key]) return undefined;
            current = current[key];
        }
        return current;
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
    if (!settings) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--status-error)' }}>Failed to load settings</div>;

    const pf = settings.pricing_factors || {};

    const tabs = [
        { id: 'materials', label: 'Materials & Costs', icon: <Diamond size={16} /> },
        { id: 'pricing', label: 'Pricing Rates', icon: <DollarSign size={16} /> },
        { id: 'overhead', label: 'Overhead & Margins', icon: <BarChart2 size={16} /> },
        { id: 'processes', label: 'Manufacturing Processes', icon: <Wrench size={16} /> },
        { id: 'secondary', label: 'Secondary Operations', icon: <Sparkles size={16} /> },
        { id: 'qc', label: 'Engineering & QC', icon: <CheckSquare size={16} /> },
        { id: 'logistics', label: 'Logistics & Packaging', icon: <Package size={16} /> },
        { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={16} /> }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={styles.dashboardPageTitle}>Quote Configuration Settings</h2>
                    <p style={styles.dashboardPageSubtitle}>Configure all parameters used for automated quote generation</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <CtaButton text="Reset to Defaults" onClick={handleReset} />
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

            {/* Layout Wrapper */}
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginTop: '24px' }}>

                {/* Vertical Tabs Sidebar */}
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

                {/* Tab Content */}
                <div style={{ flex: 1, background: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', minHeight: '600px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>

                    {/* TAB 1: Materials & Costs */}
                    {activeTab === 'materials' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Material Properties & Costs</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Configure density and cost per kg for each material</p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                {Object.entries(pf.material_properties || {}).map(([material, props]: [string, any]) => (
                                    <div key={material} style={{ padding: '16px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', color: '#CBD5E1' }}>{material}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Density (g/cm³)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={props.density_g_cm3 || ''}
                                                    onChange={(e) => updateSetting(['pricing_factors', 'material_properties', material, 'density_g_cm3'], parseFloat(e.target.value))}
                                                    style={{ ...styles.input, width: '100%' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost (USD/kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={props.cost_usd_kg || ''}
                                                    onChange={(e) => updateSetting(['pricing_factors', 'material_properties', material, 'cost_usd_kg'], parseFloat(e.target.value))}
                                                    style={{ ...styles.input, width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Pricing Rates */}
                    {activeTab === 'pricing' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Pricing Rates</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Set machining rates, labor costs, and base fees</p>

                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <h4 style={{ color: '#CBD5E1', marginBottom: '12px' }}>Machining Rates</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Rate (USD/min)</label>
                                            <input type="number" step="0.1" value={pf.machining?.machining_rate_usd_min || ''} onChange={(e) => updateSetting(['pricing_factors', 'machining', 'machining_rate_usd_min'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Setup Fee (USD)</label>
                                            <input type="number" step="1" value={pf.machining?.setup_fee_usd || ''} onChange={(e) => updateSetting(['pricing_factors', 'machining', 'setup_fee_usd'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Run Cost/Unit (USD)</label>
                                            <input type="number" step="0.1" value={pf.machining?.base_run_cost_unit || ''} onChange={(e) => updateSetting(['pricing_factors', 'machining', 'base_run_cost_unit'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Material Removal Rate (cm³/min)</label>
                                            <input type="number" step="1" value={pf.machining?.material_removal_rate_cm3_min || ''} onChange={(e) => updateSetting(['pricing_factors', 'machining', 'material_removal_rate_cm3_min'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>5-Axis Multiplier</label>
                                            <input type="number" step="0.1" value={pf.machining?.['5_axis_multiplier'] || ''} onChange={(e) => updateSetting(['pricing_factors', 'machining', '5_axis_multiplier'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#CBD5E1', marginBottom: '12px' }}>Labor Costs</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Skilled Rate (USD/hour)</label>
                                            <input type="number" step="0.5" value={pf.labor?.skilled_rate_hourly || ''} onChange={(e) => updateSetting(['pricing_factors', 'labor', 'skilled_rate_hourly'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Efficiency Factor</label>
                                            <input type="number" step="0.01" value={pf.labor?.efficiency_factor || ''} onChange={(e) => updateSetting(['pricing_factors', 'labor', 'efficiency_factor'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#CBD5E1', marginBottom: '12px' }}>Material Factors</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Scrap Rate (%)</label>
                                            <input type="number" step="0.01" value={(pf.material_factors?.scrap_rate_percent || 0) * 100} onChange={(e) => updateSetting(['pricing_factors', 'material_factors', 'scrap_rate_percent'], parseFloat(e.target.value) / 100)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Yield Rate (%)</label>
                                            <input type="number" step="0.01" value={(pf.material_factors?.yield_rate_percent || 0) * 100} onChange={(e) => updateSetting(['pricing_factors', 'material_factors', 'yield_rate_percent'], parseFloat(e.target.value) / 100)} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Overhead & Margins */}
                    {activeTab === 'overhead' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Overhead & Profit Margins</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Configure percentage-based cost additions</p>

                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Overhead Rate (%)</label>
                                    <input type="number" step="1" value={(pf.overheads?.rate_percent || 0) * 100} onChange={(e) => updateSetting(['pricing_factors', 'overheads', 'rate_percent'], parseFloat(e.target.value) / 100)} style={{ ...styles.input, width: '100%' }} />
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Applied to direct costs (material + labor + machining)</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Profit Margin (%)</label>
                                    <input type="number" step="1" value={(pf.profit_margin?.rate_percent || 0) * 100} onChange={(e) => updateSetting(['pricing_factors', 'profit_margin', 'rate_percent'], parseFloat(e.target.value) / 100)} style={{ ...styles.input, width: '100%' }} />
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Your profit margin on total cost</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Risk Contingency (%)</label>
                                    <input type="number" step="0.5" value={(pf.risk_contingency?.rate_percent || 0) * 100} onChange={(e) => updateSetting(['pricing_factors', 'risk_contingency', 'rate_percent'], parseFloat(e.target.value) / 100)} style={{ ...styles.input, width: '100%' }} />
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Additional buffer for risk management</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Urgency Premium (%)</label>
                                    <input type="number" step="1" value={(pf.urgency_premium?.rate_percent || 0) * 100} onChange={(e) => updateSetting(['pricing_factors', 'urgency_premium', 'rate_percent'], parseFloat(e.target.value) / 100)} style={{ ...styles.input, width: '100%' }} />
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Extra charge for rush orders</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Manufacturing Processes */}
                    {activeTab === 'processes' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Manufacturing Processes</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Select all processes your facility is capable of performing.</p>

                            <div style={{ display: 'grid', gap: '24px' }}>
                                {ALL_CAPABILITIES_GROUPS.map((group) => (
                                    <div key={group.title}>
                                        <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{group.title}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                            {group.processes.map(process => (
                                                <label key={process} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
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

                    {/* TAB 5: Secondary Operations */}
                    {activeTab === 'secondary' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Secondary Operations & Finishing</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Configure secondary process capabilities and finishing options.</p>

                            <div style={{ display: 'grid', gap: '32px' }}>
                                {/* Surface Finishes */}
                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Surface Finishes</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                        {SURFACE_FINISHES.map(finish => (
                                            <label key={finish} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings.secondary_ops || []).includes(finish)}
                                                    onChange={(e) => {
                                                        const currentOps = settings.secondary_ops || [];
                                                        if (e.target.checked) {
                                                            updateSetting(['secondary_ops'], [...currentOps, finish]);
                                                        } else {
                                                            updateSetting(['secondary_ops'], currentOps.filter((p: string) => p !== finish));
                                                        }
                                                    }}
                                                    style={{ marginRight: '10px', accentColor: 'var(--neon-cyan)' }}
                                                />
                                                <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{finish}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Post-Processing */}
                                <div>
                                    <h4 style={{ color: '#E2E8F0', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Post-Processing & Assembly</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                                        {POST_PROCESSING_ASSEMBLY.map(process => (
                                            <label key={process} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-panel)', borderRadius: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings.secondary_ops || []).includes(process)}
                                                    onChange={(e) => {
                                                        const currentOps = settings.secondary_ops || [];
                                                        if (e.target.checked) {
                                                            updateSetting(['secondary_ops'], [...currentOps, process]);
                                                        } else {
                                                            updateSetting(['secondary_ops'], currentOps.filter((p: string) => p !== process));
                                                        }
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

                    {/* TAB 6: Engineering & QC */}
                    {activeTab === 'qc' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Engineering & Quality Control</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Set fees for engineering review and inspection services</p>

                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Engineering Review Fee (USD)</label>
                                    <input type="number" step="5" value={pf.engineering?.review_fee_usd || ''} onChange={(e) => updateSetting(['pricing_factors', 'engineering', 'review_fee_usd'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                </div>

                                <div>
                                    <h4 style={{ color: '#CBD5E1', marginBottom: '12px', fontSize: '14px' }}>Inspection Costs (USD)</h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {Object.entries(pf.qc?.inspection_costs || {}).map(([type, cost]: [string, any]) => (
                                            <div key={type} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '12px' }}>{type}</span>
                                                <input type="number" step="5" value={cost} onChange={(e) => updateSetting(['pricing_factors', 'qc', 'inspection_costs', type], parseFloat(e.target.value))} style={{ ...styles.input }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: Logistics & Packaging */}
                    {activeTab === 'logistics' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Logistics & Packaging</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Configure shipping and packaging costs</p>

                            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                                <div>
                                    <h4 style={{ color: '#CBD5E1', marginBottom: '12px' }}>Packaging Costs (USD/unit)</h4>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Standard Packaging</label>
                                            <input type="number" step="0.1" value={pf.packaging?.standard_cost_unit || ''} onChange={(e) => updateSetting(['pricing_factors', 'packaging', 'standard_cost_unit'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Custom Packaging</label>
                                            <input type="number" step="0.1" value={pf.packaging?.custom_cost_unit || ''} onChange={(e) => updateSetting(['pricing_factors', 'packaging', 'custom_cost_unit'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Export Packaging</label>
                                            <input type="number" step="0.1" value={pf.packaging?.export_cost_unit || ''} onChange={(e) => updateSetting(['pricing_factors', 'packaging', 'export_cost_unit'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#CBD5E1', marginBottom: '12px' }}>Logistics</h4>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Logistics Fee (USD)</label>
                                            <input type="number" step="1" value={pf.logistics?.base_fee_usd || ''} onChange={(e) => updateSetting(['pricing_factors', 'logistics', 'base_fee_usd'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cost per kg (USD)</label>
                                            <input type="number" step="0.1" value={pf.logistics?.cost_per_kg || ''} onChange={(e) => updateSetting(['pricing_factors', 'logistics', 'cost_per_kg'], parseFloat(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: Terms & Conditions */}
                    {activeTab === 'terms' && (
                        <div>
                            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '16px' }}>Terms & Conditions</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Set quote validity and payment terms</p>

                            <div style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Quote Validity (days)</label>
                                    <input type="number" value={pf.terms?.validity_days || ''} onChange={(e) => updateSetting(['pricing_factors', 'terms', 'validity_days'], parseInt(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>How long quotes remain valid</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Payment Terms</label>
                                    <input type="text" value={pf.terms?.payment_terms || ''} onChange={(e) => updateSetting(['pricing_factors', 'terms', 'payment_terms'], e.target.value)} style={{ ...styles.input, width: '100%' }} placeholder="e.g., Net 30, 50% upfront" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>Base Lead Time (days)</label>
                                    <input type="number" value={pf.estimated_lead_time_base_days || ''} onChange={(e) => updateSetting(['pricing_factors', 'estimated_lead_time_base_days'], parseInt(e.target.value))} style={{ ...styles.input, width: '100%' }} />
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Standard production lead time</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManufacturerSettingsPage;
