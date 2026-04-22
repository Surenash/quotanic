import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useCurrency } from '../../utils/currency';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import Viewer from '../../components/Viewer';

// Icons
import {
    ArrowLeft as LucideArrowLeft,
    Folder as LucideFolder,
    File as LucideFile,
    Layers as LucideLayers,
    Cpu as LucideCpu,
    Settings as LucideSettings,
    Clock as LucideClock,
    DollarSign as LucideDollarSign,
    AlertTriangle as LucideAlertTriangle,
    CheckCircle as LucideCheckCircle,
    Info as LucideInfo
} from 'lucide-react';

const SmartViewPage = ({ designId, onNavigate }: { designId: string, onNavigate: (page: string, params?: any) => void }) => {
    const [design, setDesign] = useState<any>(null);
    const [fbmAnalysis, setFbmAnalysis] = useState<any>(null);
    const [quotes, setQuotes] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [allDesigns, setAllDesigns] = useState<any[]>([]); // Added for file explorer
    const [error, setError] = useState('');
    const [activeTabLeft, setActiveTabLeft] = useState('tree'); // 'tree', 'designs', 'assemblies', 'drawings'
    const [activeFeatureTab, setActiveFeatureTab] = useState<string | null>(null);

    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch design details
                const designData = await api.getDesignById(designId);
                setDesign(designData);

                // Fetch FBM data
                try {
                    const fbmData = await api.getFBMAnalysis(designId);
                    setFbmAnalysis(fbmData);
                } catch (e) {
                    console.log("FBM Data not available or basic analysis used.");
                }

                // Fetch Quotes
                try {
                    const quoteData = await api.getDesignQuotes(designId);
                    setQuotes(quoteData);
                } catch(e) {
                    console.log("No quotes available yet.");
                }

            } catch (err) {
                console.error("Failed to fetch Smart View data:", err);
                setError('Failed to load manufacturing analysis data.');
            } finally {
                setLoading(false);
            }
        };

        if (designId) fetchAllData();
    }, [designId]);

    // Derived variables for UI
    const features = fbmAnalysis?.fbm_features || [];
    const operations = fbmAnalysis?.fbm_operations || [];
    const summary = fbmAnalysis?.fbm_summary || {};

    // UI Interactions
    const handleFeatureClick = (featureId: string) => {
        setActiveFeatureTab(featureId);
        // Additional logic could pass this to the Viewer component for highlighting
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-deep-space)' }}>
                <div style={{ color: 'var(--neon-cyan)' }}>Loading Smart View Engine...</div>
            </div>
        );
    }

    if (error || !design) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                <h2 style={{ color: 'var(--status-error)' }}>Error</h2>
                <p>{error || "Design not found"}</p>
                <CtaButton text="Return to Dashboard" onClick={() => onNavigate('dashboard')} />
            </div>
        );
    }

    // Prepare Model URL
    const modelUrl = design.s3_file_key
        ? (design.s3_file_key.startsWith('http') ? design.s3_file_key : `https://api.quotanic.com${design.s3_file_key}`)
        : null;
    const fileExt = modelUrl ? modelUrl.split('.').pop()?.toLowerCase() as any : 'step';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f111a', color: '#e2e8f0', overflow: 'hidden' }}>

            {/* Top Navigation Bar */}
            <header style={{
                height: '50px',
                backgroundColor: '#1e212b',
                borderBottom: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <LucideArrowLeft size={16} /> Back
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#333' }}></div>
                    <span style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LucideCpu size={18} color="var(--neon-cyan)" />
                        Smart View: {design.design_name || 'Unnamed Design'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {design.id.substring(0, 8)}</span>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '12px', fontWeight: 600 }}>
                        {design.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
            </header>

            {/* Main Layout Workspace */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* LEFT PANEL - Explorer & Process Tree */}
                <aside style={{ width: '300px', backgroundColor: '#161821', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                        {[
                            { id: 'tree', label: 'CAM Tree', icon: LucideLayers },
                            { id: 'designs', label: 'Files', icon: LucideFolder },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTabLeft(tab.id)}
                                style={{
                                    flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    backgroundColor: activeTabLeft === tab.id ? '#1e212b' : 'transparent',
                                    border: 'none', borderBottom: activeTabLeft === tab.id ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                                    color: activeTabLeft === tab.id ? 'white' : '#94a3b8',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Left Panel Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {activeTabLeft === 'tree' && (
                            <div>
                                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', letterSpacing: '1px' }}>Process Tree</h3>
                                {operations.length > 0 ? operations.map((op: any, index: number) => (
                                    <div key={index} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                                            <LucideSettings size={14} color="var(--neon-magenta)" /> Setup {index + 1}: {op.operation_name}
                                        </div>
                                        <div style={{ paddingLeft: '22px', borderLeft: '1px solid #333', marginLeft: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                                                <span>Tool: {op.tool_type}</span>
                                                <span>Ø{op.tool_diameter?.toFixed(1)}mm</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                                                <span>Time: {op.estimated_time?.toFixed(1)} min</span>
                                                <span>{op.strategy}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>No operations generated.</div>
                                )}

                                <div style={{ marginTop: '32px' }}>
                                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', letterSpacing: '1px' }}>DFM Warnings</h3>
                                    {features.filter((f: any) => f.complexity_score > 0.7).map((f: any, i: number) => (
                                        <div key={i} style={{ padding: '8px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', marginBottom: '8px', borderRadius: '0 4px 4px 0' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <LucideAlertTriangle size={14} color="#f59e0b" style={{ marginTop: '2px' }} />
                                                <div>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fcd34d' }}>Complex Feature: {f.feature_type}</div>
                                                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>High complexity score ({f.complexity_score?.toFixed(2)}). May require special tooling or 5-axis.</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {features.filter((f: any) => f.complexity_score > 0.7).length === 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '13px' }}>
                                            <LucideCheckCircle size={14} /> No significant DFM issues found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTabLeft === 'designs' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '13px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                    <LucideFile size={14} color="var(--neon-cyan)" /> {design.design_name}
                                </div>
                                <div style={{ paddingLeft: '22px', marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                    <div>Format: {fileExt.toUpperCase()}</div>
                                    <div>Material: {design.material}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* CENTRAL CONSOLE & BOTTOM PANEL */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Central 3D Viewer */}
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#0a0a0f' }}>
                        {modelUrl ? (
                            <Viewer
                                modelUrl={modelUrl}
                                fileExtension={fileExt}
                                view="iso"
                                isViewLocked={false}
                                hideToolbar={false}
                                hideSidebar={true}
                                activeFeatureIndex={activeFeatureTab ? parseInt(activeFeatureTab.split('_')[1]) : null}
                                onFeatureClick={(index) => setActiveFeatureTab(`feat_${index}`)}
                            />
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                                No 3D model available to view.
                            </div>
                        )}

                        {/* Overlay Orientation Helper (Top Right) */}
                        <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                                <div style={{ width: '12px', height: '2px', backgroundColor: '#ef4444' }}></div> X
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>
                                <div style={{ width: '12px', height: '2px', backgroundColor: '#22c55e' }}></div> Y
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>
                                <div style={{ width: '12px', height: '2px', backgroundColor: '#3b82f6' }}></div> Z
                            </div>
                        </div>
                    </div>

                    {/* Bottom Panel - Feature Intelligence */}
                    <div style={{ height: '250px', backgroundColor: '#161821', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 16px', borderBottom: '1px solid #333', display: 'flex', gap: '16px', overflowX: 'auto', backgroundColor: '#1e212b' }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', display: 'flex', alignItems: 'center', fontWeight: 600 }}>Features</span>
                            {features.map((feature: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleFeatureClick(`feat_${index}`)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: activeFeatureTab === `feat_${index}` ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                        border: activeFeatureTab === `feat_${index}` ? '1px solid #3b82f6' : '1px solid #333',
                                        color: activeFeatureTab === `feat_${index}` ? 'white' : '#94a3b8',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {feature.feature_type} #{index + 1}
                                </button>
                            ))}
                            {features.length === 0 && <span style={{ fontSize: '12px', color: '#64748b', padding: '6px' }}>No features extracted.</span>}
                        </div>

                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                            {activeFeatureTab ? (
                                (() => {
                                    const fIdx = parseInt(activeFeatureTab.split('_')[1]);
                                    const f = features[fIdx];
                                    if (!f) return null;
                                    return (
                                        <div style={{ display: 'flex', gap: '32px' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>{f.feature_type} Details</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                                    <div><span style={{ color: '#94a3b8', fontSize: '12px' }}>Diameter:</span> <span style={{ color: 'white', fontSize: '13px' }}>{f.diameter ? `Ø${f.diameter.toFixed(2)}mm` : 'N/A'}</span></div>
                                                    <div><span style={{ color: '#94a3b8', fontSize: '12px' }}>Depth:</span> <span style={{ color: 'white', fontSize: '13px' }}>{f.depth ? `${f.depth.toFixed(2)}mm` : 'N/A'}</span></div>
                                                    <div><span style={{ color: '#94a3b8', fontSize: '12px' }}>Complexity:</span> <span style={{ color: 'white', fontSize: '13px' }}>{f.complexity_score?.toFixed(2) || 'N/A'}</span></div>
                                                    <div><span style={{ color: '#94a3b8', fontSize: '12px' }}>Est. Machine Time:</span> <span style={{ color: 'white', fontSize: '13px' }}>~{(f.volume / 1000).toFixed(1)} mins</span></div>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, borderLeft: '1px solid #333', paddingLeft: '32px' }}>
                                                <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <LucideSettings size={16} color="var(--neon-cyan)" /> Process Mapping
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Recommended Machine</div>
                                                        <div style={{ fontSize: '14px', color: 'white', fontWeight: 500, marginTop: '4px' }}>CNC {f.feature_type.includes('HOLE') ? 'Drill / 3-Axis Mill' : '3-Axis Mill'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', flexDirection: 'column', gap: '8px' }}>
                                    <LucideInfo size={24} />
                                    <span>Select a feature tab above to view detailed intelligence.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Insights & Quotation */}
                <aside style={{ width: '320px', backgroundColor: '#161821', borderLeft: '1px solid #333', padding: '20px', overflowY: 'auto' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LucideDollarSign size={18} color="var(--neon-cyan)" /> Manufacturing Insights
                    </h2>

                    {/* Quote Summary Box */}
                    {quotes && quotes.length > 0 ? (
                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated Cost</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#60a5fa', marginBottom: '12px' }}>{formatPrice(quotes[0].price_usd)}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0' }}>
                                <span>Lead Time:</span>
                                <span>{quotes[0].estimated_lead_time_days} Days</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', marginTop: '4px' }}>
                                <span>Quantity:</span>
                                <span>{design.quantity} Units</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Quotation pending or unavailable.</div>
                        </div>
                    )}

                    {/* Production Info */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Production Specs</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Material</span>
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{design.material}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Process</span>
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{design.manufacturing_process || 'CNC Machining'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Finish</span>
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{design.surface_finish || 'As Machined'}</span>
                            </div>
                        </div>
                    </div>

                    {/* FBM Summary Stats */}
                    {summary.total_features !== undefined && (
                        <div>
                            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Analysis Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{summary.total_features}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' }}>Features</div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{summary.number_of_setups || 1}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' }}>Setups</div>
                                </div>
                                <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12px' }}>
                                        <LucideClock size={14} /> Est. Time
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
                                        {summary.estimated_total_time_hours ? `${summary.estimated_total_time_hours.toFixed(2)} hrs` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default SmartViewPage;
