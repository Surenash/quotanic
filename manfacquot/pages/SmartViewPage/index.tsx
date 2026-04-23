import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useCurrency } from '../../utils/currency';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import Viewer from '../../components/Viewer';
import { resolveMediaUrl } from '../../components';

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
    Info as LucideInfo,
    Box as LucideBox,
    Tool as LucideTool,
    Maximize as LucideMaximize,
    ChevronRight as LucideChevronRight,
    ChevronDown as LucideChevronDown,
    Activity as LucideActivity
} from 'lucide-react';

const SmartViewPage = ({ designId, onNavigate }: { designId: string, onNavigate: (page: string, params?: any) => void }) => {
    const [design, setDesign] = useState<any>(null);
    const [fbmAnalysis, setFbmAnalysis] = useState<any>(null);
    const [quotes, setQuotes] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [allDesigns, setAllDesigns] = useState<any[]>([]); 
    const [error, setError] = useState('');
    const [activeTabLeft, setActiveTabLeft] = useState('tree'); // 'tree', 'designs', 'assemblies', 'drawings'
    const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(null);
    const [expandedSetups, setExpandedSetups] = useState<Record<number, boolean>>({ 0: true });

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

                // Fetch all designs for explorer
                try {
                    const designsList = await api.getDesigns();
                    setAllDesigns(designsList);
                } catch (e) {
                    console.log("Failed to fetch designs list.");
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
    const DFM_THRESHOLD = 0.7;
    const dfmWarnings = features.filter((f: any) => f.complexity_score > DFM_THRESHOLD);

    // UI Interactions
    const handleFeatureClick = (index: number) => {
        setActiveFeatureIndex(index);
    };

    const toggleSetup = (idx: number) => {
        setExpandedSetups(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#050508' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ color: '#3b82f6', fontWeight: 600, letterSpacing: '1px' }}>INITIALIZING SMART VIEW ENGINE...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !design) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'white', backgroundColor: '#050508', height: '100vh' }}>
                <LucideAlertTriangle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#ef4444' }}>Engine Error</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{error || "Design session not found"}</p>
                <CtaButton text="Return to Dashboard" onClick={() => onNavigate('/dashboard')} />
            </div>
        );
    }

    const modelUrl = resolveMediaUrl(design.view_url || design.s3_file_key);
    const fileExt = modelUrl ? modelUrl.split('.').pop()?.split('?')[0].toLowerCase() as any : 'step';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0a0f', color: '#e2e8f0', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* --- TOP BAR (Engineering Console Style) --- */}
            <header style={{
                height: '50px',
                backgroundColor: '#161821',
                borderBottom: '1px solid #2d2d3a',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                justifyContent: 'space-between',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => onNavigate('/dashboard')}
                        style={{ background: '#2d2d3a', border: 'none', color: 'white', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                    >
                        <LucideArrowLeft size={14} /> EXIT
                    </button>
                    <div style={{ width: '1px', height: '20px', backgroundColor: '#2d2d3a', margin: '0 4px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manufacturing Analysis Workspace</span>
                        <span style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>
                            {design.design_name || 'Unnamed Design'}
                        </span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>STATUS</div>
                        <div style={{ color: '#34d399', fontSize: '12px', fontWeight: 700 }}>{design.status.replace('_', ' ').toUpperCase()}</div>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#2d2d3a' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LucideActivity size={14} color="#3b82f6" />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>FBM ENGINE v2.4</span>
                    </div>
                </div>
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* 1. LEFT EXPLORER (VS Code Style) */}
                <aside style={{ width: '320px', backgroundColor: '#0d0f17', borderRight: '1px solid #2d2d3a', display: 'flex', flexDirection: 'column' }}>
                    {/* Activity Bar Tabs */}
                    <div style={{ display: 'flex', backgroundColor: '#161821', borderBottom: '1px solid #2d2d3a' }}>
                        {[
                            { id: 'tree', label: 'CAM TREE', icon: LucideLayers },
                            { id: 'designs', label: 'EXPLORER', icon: LucideFolder },
                            { id: 'warnings', label: 'WARNINGS', icon: LucideAlertTriangle, count: dfmWarnings.length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTabLeft(tab.id)}
                                style={{
                                    flex: 1, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    backgroundColor: activeTabLeft === tab.id ? '#0d0f17' : 'transparent',
                                    border: 'none', borderBottom: activeTabLeft === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                                    color: activeTabLeft === tab.id ? 'white' : '#64748b',
                                    fontSize: '10px', fontWeight: 800, cursor: 'pointer', transition: '0.2s', position: 'relative'
                                }}
                            >
                                <tab.icon size={12} color={activeTabLeft === tab.id ? '#3b82f6' : '#64748b'} /> 
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span style={{ position: 'absolute', top: '6px', right: '10px', width: '14px', height: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Left Panel Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
                        {activeTabLeft === 'tree' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                {/* Setup 1 */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div 
                                        onClick={() => toggleSetup(0)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}
                                    >
                                        {expandedSetups[0] ? <LucideChevronDown size={14} /> : <LucideChevronRight size={14} />}
                                        <LucideSettings size={14} color="#3b82f6" /> 
                                        SETUP 1 [Primary Orientation]
                                    </div>
                                    
                                    {expandedSetups[0] && (
                                        <div style={{ paddingLeft: '20px', marginTop: '4px', borderLeft: '1px dashed #2d2d3a', marginLeft: '12px' }}>
                                            {operations.length > 0 ? operations.map((op: any, index: number) => (
                                                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #161821' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#e2e8f0', marginBottom: '4px' }}>
                                                        <LucideTool size={12} color="#a855f7" /> 
                                                        <span style={{ fontWeight: 600 }}>{op.operation_name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px', color: '#94a3b8' }}>
                                                        <div style={{ background: '#161821', padding: '2px 6px', borderRadius: '3px' }}>Ø{op.tool_diameter?.toFixed(1)}mm {op.tool_type}</div>
                                                        <div style={{ background: '#161821', padding: '2px 6px', borderRadius: '3px' }}>{op.strategy}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div style={{ padding: '12px', color: '#475569', fontSize: '11px', fontStyle: 'italic' }}>No operations mapped yet.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Features List */}
                                <div style={{ marginTop: '24px' }}>
                                    <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px', letterSpacing: '1px', fontWeight: 800 }}>Extracted Features</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {features.map((f: any, i: number) => (
                                            <div 
                                                key={i}
                                                onClick={() => handleFeatureClick(i)}
                                                style={{ 
                                                    padding: '8px 10px', 
                                                    fontSize: '11px', 
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: activeFeatureIndex === i ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                    border: activeFeatureIndex === i ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                                    color: activeFeatureIndex === i ? 'white' : '#94a3b8',
                                                    transition: '0.1s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: f.complexity_score > DFM_THRESHOLD ? '#ef4444' : '#3b82f6' }} />
                                                    {f.feature_type.replace('_', ' ')} #{i + 1}
                                                </div>
                                                {f.complexity_score > DFM_THRESHOLD && <LucideAlertTriangle size={10} color="#f59e0b" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTabLeft === 'designs' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '11px', fontWeight: 800, marginBottom: '12px' }}>
                                    <LucideFolder size={12} /> PROJECT FILES
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {allDesigns.map((d) => (
                                        <div 
                                            key={d.id}
                                            onClick={() => onNavigate(`/smart-view/${d.id}`)}
                                            style={{ 
                                                padding: '6px 8px', 
                                                fontSize: '12px', 
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                backgroundColor: d.id === designId ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                color: d.id === designId ? 'white' : '#94a3b8'
                                            }}
                                        >
                                            <LucideFile size={14} color={d.id === designId ? '#3b82f6' : '#475569'} />
                                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.design_name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '24px', opacity: 0.5 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
                                        <LucideChevronRight size={12} /> ASSEMBLIES
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: 800 }}>
                                        <LucideChevronRight size={12} /> DRAWINGS (PDF)
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTabLeft === 'warnings' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <h3 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#ef4444', marginBottom: '16px', letterSpacing: '1px', fontWeight: 800 }}>Manufacturing Warnings</h3>
                                {dfmWarnings.length > 0 ? dfmWarnings.map((f: any, i: number) => (
                                    <div 
                                        key={i} 
                                        onClick={() => handleFeatureIndex(features.indexOf(f))}
                                        style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', marginBottom: '12px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <LucideAlertTriangle size={14} color="#ef4444" style={{ marginTop: '2px' }} />
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{f.feature_type} Optimization</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>
                                                    High complexity score ({f.complexity_score?.toFixed(2)}). May require special tooling or multi-axis setup.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <LucideCheckCircle size={32} color="#34d399" style={{ marginBottom: '12px' }} />
                                        <div style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>NO ISSUES FOUND</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Part is highly manufacturable with standard tooling.</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* 2. CENTRAL VIEWER & BOTTOM INTELLIGENCE */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Central 3D Viewer */}
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#050508' }}>
                        {modelUrl ? (
                            <Viewer
                                modelUrl={modelUrl}
                                fileExtension={fileExt}
                                view="iso"
                                isViewLocked={false}
                                hideToolbar={false}
                                hideSidebar={true}
                                activeFeatureIndex={activeFeatureIndex}
                                onFeatureClick={(index) => setActiveFeatureIndex(index)}
                            />
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569' }}>
                                <LucideBox size={48} style={{ opacity: 0.1 }} />
                            </div>
                        )}

                        {/* Orientation Widget */}
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#ef4444', fontWeight: 800 }}>
                                <div style={{ width: '15px', height: '3px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div> X
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#22c55e', fontWeight: 800 }}>
                                <div style={{ width: '15px', height: '3px', backgroundColor: '#22c55e', borderRadius: '2px' }}></div> Y
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#3b82f6', fontWeight: 800 }}>
                                <div style={{ width: '15px', height: '3px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div> Z
                            </div>
                        </div>
                    </div>

                    {/* Bottom Panel - Feature Intelligence (TABS) */}
                    <div style={{ height: '300px', backgroundColor: '#0d0f17', borderTop: '1px solid #2d2d3a', display: 'flex', flexDirection: 'column' }}>
                        {/* Feature Selection Tabs */}
                        <div style={{ padding: '0 12px', borderBottom: '1px solid #2d2d3a', display: 'flex', gap: '2px', overflowX: 'auto', backgroundColor: '#161821' }} className="no-scrollbar">
                            {features.map((feature: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleFeatureClick(index)}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: activeFeatureIndex === index ? '#0d0f17' : 'transparent',
                                        border: 'none',
                                        borderBottom: activeFeatureIndex === index ? '2px solid #3b82f6' : '2px solid transparent',
                                        color: activeFeatureIndex === index ? 'white' : '#64748b',
                                        fontSize: '11px',
                                        fontWeight: activeFeatureIndex === index ? 700 : 500,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: '0.2s'
                                    }}
                                >
                                    {feature.feature_type.split('_')[0]} #{index + 1}
                                </button>
                            ))}
                            {features.length === 0 && <span style={{ fontSize: '11px', color: '#475569', padding: '10px' }}>No features analyzed.</span>}
                        </div>

                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }} className="custom-scrollbar">
                            {activeFeatureIndex !== null && features[activeFeatureIndex] ? (
                                (() => {
                                    const f = features[activeFeatureIndex];
                                    return (
                                        <div style={{ display: 'flex', gap: '40px', animation: 'fadeIn 0.3s' }}>
                                            <div style={{ flex: 1.5 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <LucideCpu size={18} color="#3b82f6" />
                                                    </div>
                                                    <h4 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 700 }}>{f.feature_type.replace('_', ' ')} Intelligence</h4>
                                                </div>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                                    <DetailMetric label="DIMENSION Ø" value={f.diameter ? `Ø${f.diameter.toFixed(2)}mm` : 'N/A'} />
                                                    <DetailMetric label="DEPTH" value={f.depth ? `${f.depth.toFixed(2)}mm` : 'N/A'} />
                                                    <DetailMetric label="COMPLEXITY" value={f.complexity_score?.toFixed(3) || '0.000'} color={f.complexity_score > DFM_THRESHOLD ? '#ef4444' : '#34d399'} />
                                                    <DetailMetric label="EST. TIME" value={`~${(f.volume / 800).toFixed(1)} mins`} />
                                                    <DetailMetric label="VOLUME" value={`${(f.volume).toFixed(1)} mm³`} />
                                                    <DetailMetric label="S3_REF" value={`OBJ_${activeFeatureIndex}`} />
                                                </div>
                                            </div>

                                            <div style={{ flex: 1, borderLeft: '1px solid #2d2d3a', paddingLeft: '40px' }}>
                                                <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                                    <LucideSettings size={16} color="#a855f7" /> TOOL SELECTION & PROCESS
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Primary Process</div>
                                                        <div style={{ fontSize: '13px', color: 'white', fontWeight: 600, marginTop: '4px' }}>
                                                            {f.feature_type.includes('HOLE') ? 'DRILLING / COUNTERBORE' : 'CNC MILLING (3-AXIS)'}
                                                        </div>
                                                    </div>
                                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Recommended Tool</div>
                                                        <div style={{ fontSize: '13px', color: '#a855f7', fontWeight: 700, marginTop: '4px' }}>
                                                            {f.diameter ? `Ø${Math.floor(f.diameter)}mm Carbide End Mill` : 'Flat End Mill'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569', flexDirection: 'column', gap: '12px' }}>
                                    <LucideInfo size={32} style={{ opacity: 0.5 }} />
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>SELECT A FEATURE IN THE VIEWER OR TAB LIST TO BEGIN ANALYSIS</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT PANEL - MANUFACTURING INSIGHTS */}
                <aside style={{ width: '340px', backgroundColor: '#0d0f17', borderLeft: '1px solid #2d2d3a', padding: '24px', overflowY: 'auto' }} className="custom-scrollbar">
                    <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <LucideDollarSign size={18} color="#3b82f6" /> Production Insights
                    </h2>

                    {/* Cost Card */}
                    {quotes && quotes.length > 0 ? (
                        <div style={{ backgroundColor: '#161821', border: '1px solid #3b82f6', borderRadius: '12px', padding: '20px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Calculated Unit Cost</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>{formatPrice(quotes[0].price_usd)}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <InsightRow label="Lead Time" value={`${quotes[0].estimated_lead_time_days} Days`} />
                                <InsightRow label="Batch Qty" value={`${design.quantity} Units`} />
                                <InsightRow label="Tax Est." value={formatPrice(quotes[0].price_usd * 0.18)} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed #2d2d3a', borderRadius: '12px', padding: '20px', marginBottom: '32px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Quotation metrics not yet synchronized.</div>
                        </div>
                    )}

                    {/* Production Specifications */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', marginBottom: '16px', borderBottom: '1px solid #2d2d3a', paddingBottom: '8px', fontWeight: 800, letterSpacing: '1px' }}>Manufacturing Specs</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <InsightRow label="Material" value={design.material} bold />
                            <InsightRow label="Process" value={design.manufacturing_process || 'CNC Machining'} bold />
                            <InsightRow label="Surface" value={design.surface_finish || 'As Machined'} bold />
                            <InsightRow label="Allocation" value="MGM-INDIA-01" />
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {summary.total_features !== undefined && (
                        <div>
                            <h3 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', marginBottom: '16px', borderBottom: '1px solid #2d2d3a', paddingBottom: '8px', fontWeight: 800, letterSpacing: '1px' }}>Complexity Report</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <StatBox label="Features" value={summary.total_features} />
                                <StatBox label="Setups" value={summary.number_of_setups || 1} />
                            </div>
                            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 700 }}>
                                    <LucideClock size={14} color="#3b82f6" /> MACHINE TIME
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
                                    {summary.estimated_total_time_hours ? `${summary.estimated_total_time_hours.toFixed(2)}h` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Global Workspace Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2d3a; borderRadius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- HELPER UI COMPONENTS ---

const DetailMetric = ({ label, value, color = 'white' }: any) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color }}>{value}</div>
    </div>
);

const InsightRow = ({ label, value, bold = false }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span style={{ color: '#64748b' }}>{label}</span>
        <span style={{ color: bold ? 'white' : '#e2e8f0', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
);

const StatBox = ({ label, value }: any) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{value}</div>
        <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginTop: '4px', fontWeight: 800 }}>{label}</div>
    </div>
);

export default SmartViewPage;
