import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../utils/api';
import { useCurrency } from '../../utils/currency';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import Viewer from '../../components/Viewer';
import { resolveMediaUrl } from '../../utils/api';
import { ViewPreset, SupportedExtensions } from '../../types/types';

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
    Wrench as LucideWrench,
    Maximize as LucideMaximize,
    ChevronRight as LucideChevronRight,
    ChevronDown as LucideChevronDown,
    Activity as LucideActivity,
    FileText as LucideFileText,
    TrendingUp as LucideTrendingUp,
    ShieldAlert as LucideShieldAlert,
    BarChart3 as LucideBarChart
} from 'lucide-react';

const SmartViewPage = ({ designId, onNavigate }: { designId: string, onNavigate: (page: string, params?: any) => void }) => {
    // --- DATA STATE ---
    const [activeDesignId, setActiveDesignId] = useState(designId);
    const [design, setDesign] = useState<any>(null);
    const [fbmAnalysis, setFbmAnalysis] = useState<any>(null);
    const [quotes, setQuotes] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [internalDesigns, setInternalDesigns] = useState<any[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
    const [error, setError] = useState('');

    // --- UI STATE ---
    const [activeTabLeft, setActiveTabLeft] = useState('tree'); // 'tree', 'explorer', 'warnings'
    const [activeTabRight, setActiveTabRight] = useState('specs'); // 'specs', 'tooling', 'cost', 'timeline', 'analysis', 'dfm'
    const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
        'internal': true,
        'requests': true,
        [`internal-parts-${designId}`]: true,
        [`requests-parts-${designId}`]: true
    });
    const [expandedSetups, setExpandedSetups] = useState<Record<number, boolean>>({ 0: true });

    const { formatPrice } = useCurrency();

    // --- DATA FETCHING ---
    const latestRequestRef = useRef(0);

    const fetchExplorerData = useCallback(async () => {
        try {
            const [internal, requests] = await Promise.all([
                api.getDesigns(),
                api.getQuoteRequests()
            ]);
            setInternalDesigns(internal || []);
            setQuoteRequests(requests || []);
        } catch (e) {
            console.error("Failed to fetch explorer data", e);
        }
    }, []);

    const fetchDesignData = useCallback(async (id: string) => {
        latestRequestRef.current += 1;
        const currentRequest = latestRequestRef.current;

        setLoading(true);
        setActiveDesignId(id);
        setActiveFeatureIndex(null);
        try {
            const [designData, fbmData, quoteData] = await Promise.all([
                api.getDesignById(id),
                api.getFBMAnalysis(id).catch(() => null),
                api.getDesignQuotes(id).catch(() => [])
            ]);

            // Only update state if this is still the latest request
            if (currentRequest === latestRequestRef.current) {
                setDesign(designData);
                // The FBMAnalysisView returns { design_id, design_name, status, fbm_analysis: { ... } }
                // We need to extract the inner fbm_analysis or fallback to geometric_data
                setFbmAnalysis(fbmData?.fbm_analysis || designData?.geometric_data || null);
                setQuotes(quoteData);
                setError('');
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to fetch design details:", err);
            if (currentRequest === latestRequestRef.current) {
                setError('Failed to load manufacturing analysis data.');
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchExplorerData();
    }, [fetchExplorerData]);

    useEffect(() => {
        if (activeDesignId) fetchDesignData(activeDesignId);
    }, [activeDesignId, fetchDesignData]);

    // --- DERIVED DATA ---
    const features = fbmAnalysis?.fbm_features || [];
    const operations = fbmAnalysis?.fbm_operations || [];
    const summary = fbmAnalysis?.fbm_summary || fbmAnalysis?.summary || {};
    const patterns = fbmAnalysis?.fbm_patterns || [];
    const intelligence = fbmAnalysis?.manufacturing_intelligence || {};
    const processRec = intelligence?.manufacturing_process_recommendation || {};
    
    const DFM_THRESHOLD = 0.85;
    const dfmWarnings = features.filter((f: any) => f.complexity_score > DFM_THRESHOLD && f.complexity_rating >= 4);

    // --- HANDLERS ---
    const toggleFolder = (path: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const toggleSetup = (index: number) => {
        setExpandedSetups(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleFeatureClick = (index: number) => {
        setActiveFeatureIndex(index);
    };

    if (loading && !design) {
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

    if (error && !design) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'white', backgroundColor: '#050508', height: '100vh' }}>
                <LucideAlertTriangle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#ef4444' }}>Engine Error</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{error}</p>
                <CtaButton text="Return to Dashboard" onClick={() => onNavigate('/dashboard')} />
            </div>
        );
    }

    const modelUrl = resolveMediaUrl(design?.view_url || design?.s3_file_key);
    const fileExt: SupportedExtensions = (() => {
        if (!modelUrl) return 'stl';
        const ext = modelUrl.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase();
        if (ext === 'stl' || ext === 'obj' || ext === 'gltf' || ext === 'glb') {
            return ext;
        }
        return 'stl';
    })();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0a0f', color: '#e2e8f0', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* --- TOP BAR --- */}
            <header style={{ height: '50px', backgroundColor: '#161821', borderBottom: '1px solid #2d2d3a', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => onNavigate('/dashboard')} style={{ background: '#2d2d3a', border: 'none', color: 'white', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <LucideArrowLeft size={14} /> EXIT
                    </button>
                    <div style={{ width: '1px', height: '20px', backgroundColor: '#2d2d3a', margin: '0 4px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Engineering Workspace</span>
                        <span style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{design?.design_name || 'Loading...'}</span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {design && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>STATUS</div>
                            <div style={{ color: '#34d399', fontSize: '12px', fontWeight: 700 }}>{(design.status?.replace('_', ' ') || 'UNKNOWN').toUpperCase()}</div>
                        </div>
                    )}
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#2d2d3a' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LucideActivity size={14} color="#3b82f6" />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>FBM ENGINE v2.4</span>
                    </div>
                </div>
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                {/* 1. LEFT EXPLORER */}
                <aside style={{ width: '320px', flexShrink: 0, backgroundColor: '#0d0f17', borderRight: '1px solid #2d2d3a', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', backgroundColor: '#161821', borderBottom: '1px solid #2d2d3a' }}>
                        {[
                            { id: 'tree', label: 'CAM TREE', icon: LucideLayers },
                            { id: 'explorer', label: 'FILES', icon: LucideFolder },
                            { id: 'warnings', label: 'WARNINGS', icon: LucideAlertTriangle, count: dfmWarnings.length },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTabLeft(tab.id)} style={{ flex: 1, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: activeTabLeft === tab.id ? '#0d0f17' : 'transparent', border: 'none', borderBottom: activeTabLeft === tab.id ? '2px solid #3b82f6' : '2px solid transparent', color: activeTabLeft === tab.id ? 'white' : '#64748b', fontSize: '10px', fontWeight: 800, cursor: 'pointer', transition: '0.2s', position: 'relative' }}>
                                <tab.icon size={12} color={activeTabLeft === tab.id ? '#3b82f6' : '#64748b'} /> {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span style={{ position: 'absolute', top: '6px', right: '10px', width: '14px', height: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
                        {activeTabLeft === 'tree' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div onClick={() => toggleSetup(0)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                        {expandedSetups[0] ? <LucideChevronDown size={14} /> : <LucideChevronRight size={14} />}
                                        <LucideSettings size={14} color="#3b82f6" /> SETUP 1 [OP 01]
                                    </div>
                                    {expandedSetups[0] && (
                                        <div style={{ paddingLeft: '20px', marginTop: '4px', borderLeft: '1px dashed #2d2d3a', marginLeft: '12px' }}>
                                            {operations.length > 0 ? operations.map((op: any, index: number) => (
                                                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #161821' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#e2e8f0', marginBottom: '4px' }}>
                                                        <LucideWrench size={12} color="#a855f7" /> <span style={{ fontWeight: 600 }}>{op.operation_name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px', color: '#94a3b8' }}>
                                                        <div style={{ background: '#161821', padding: '2px 6px', borderRadius: '3px' }}>Ø{op.tool_diameter?.toFixed(1)}mm {op.tool_type}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div style={{ padding: '12px', color: '#475569', fontSize: '11px', fontStyle: 'italic' }}>No operations generated.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '24px' }}>
                                    <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px', letterSpacing: '1px', fontWeight: 800 }}>Features List</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {features.map((f: any, i: number) => (
                                            <div key={i} onClick={() => handleFeatureClick(i)} style={{ padding: '8px 10px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: activeFeatureIndex === i ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: activeFeatureIndex === i ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent', color: activeFeatureIndex === i ? 'white' : '#94a3b8', transition: '0.1s' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (f.complexity_score > DFM_THRESHOLD && f.complexity_rating >= 4) ? '#ef4444' : '#3b82f6' }} />
                                                    {(typeof f.feature_type === 'string' ? f.feature_type : 'Feature')} #{i + 1}
                                                </div>
                                                {(f.complexity_score > DFM_THRESHOLD && f.complexity_rating >= 4) && <LucideAlertTriangle size={10} color="#f59e0b" />}
                                            </div>
                                        ))}
                                        {features.length === 0 && <div style={{ color: '#475569', fontSize: '11px', padding: '10px' }}>No features extracted.</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTabLeft === 'explorer' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                {/* QUOTE REQUESTS FOLDER */}
                                <div style={{ marginBottom: '4px' }}>
                                    <div onClick={() => toggleFolder('requests')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 4px', color: expandedFolders['requests'] ? 'white' : '#94a3b8', fontSize: '12px', fontWeight: 700 }}>
                                        {expandedFolders['requests'] ? <LucideChevronDown size={14} /> : <LucideChevronRight size={14} />}
                                        <LucideFolder size={14} color="#facc15" fill={expandedFolders['requests'] ? "#facc15" : "none"} />
                                        QUOTE REQUESTS
                                    </div>
                                    {expandedFolders['requests'] && (
                                        <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
                                            {quoteRequests.map((quote: any) => (
                                                <div key={quote.id}>
                                                    <div onClick={() => toggleFolder(`req-${quote.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                                        {expandedFolders[`req-${quote.id}`] ? <LucideChevronDown size={12} /> : <LucideChevronRight size={12} />}
                                                        <LucideFolder size={12} color="#3b82f6" />
                                                        {quote.design_name || 'Design'}
                                                    </div>
                                                    {expandedFolders[`req-${quote.id}`] && (
                                                        <div style={{ paddingLeft: '16px' }}>
                                                            <div onClick={() => fetchDesignData(quote.design)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: activeDesignId === quote.design ? 'white' : '#64748b', backgroundColor: activeDesignId === quote.design ? 'rgba(59, 130, 246, 0.1)' : 'transparent', borderRadius: '4px' }}>
                                                                <LucideFile size={12} color={activeDesignId === quote.design ? '#3b82f6' : '#475569'} />
                                                                Part File
                                                            </div>
                                                            
                                                            {/* Drawings Folder */}
                                                            {quote.supporting_files?.some((f: string) => f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)) && (
                                                                <>
                                                                    <div onClick={() => toggleFolder(`req-drawings-${quote.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                                                        {expandedFolders[`req-drawings-${quote.id}`] ? <LucideChevronDown size={12} /> : <LucideChevronRight size={12} />}
                                                                        <LucideFolder size={12} color="#3b82f6" />
                                                                        Drawings
                                                                    </div>
                                                                    {expandedFolders[`req-drawings-${quote.id}`] && (
                                                                        <div style={{ paddingLeft: '16px' }}>
                                                                            {quote.supporting_files.filter((f: string) => f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)).map((fileUrl: string, idx: number) => {
                                                                                const fileName = fileUrl.split('/').pop()?.split('_').slice(1).join('_') || 'Drawing';
                                                                                return (
                                                                                    <div key={idx} onClick={() => window.open(resolveMediaUrl(fileUrl), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#64748b' }}>
                                                                                        <LucideFileText size={12} color="#ef4444" />
                                                                                        {fileName}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Documents Folder */}
                                                            {quote.supporting_files?.some((f: string) => !f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)) && (
                                                                <>
                                                                    <div onClick={() => toggleFolder(`req-docs-${quote.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                                                        {expandedFolders[`req-docs-${quote.id}`] ? <LucideChevronDown size={12} /> : <LucideChevronRight size={12} />}
                                                                        <LucideFolder size={12} color="#3b82f6" />
                                                                        Documents
                                                                    </div>
                                                                    {expandedFolders[`req-docs-${quote.id}`] && (
                                                                        <div style={{ paddingLeft: '16px' }}>
                                                                            {quote.supporting_files.filter((f: string) => !f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)).map((fileUrl: string, idx: number) => {
                                                                                const fileName = fileUrl.split('/').pop()?.split('_').slice(1).join('_') || 'Doc';
                                                                                return (
                                                                                    <div key={idx} onClick={() => window.open(resolveMediaUrl(fileUrl), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#64748b' }}>
                                                                                        <LucideFile size={12} />
                                                                                        {fileName}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* INTERNAL QUOTATIONS FOLDER */}
                                <div style={{ marginBottom: '4px' }}>
                                    <div onClick={() => toggleFolder('internal')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 4px', color: expandedFolders['internal'] ? 'white' : '#94a3b8', fontSize: '12px', fontWeight: 700 }}>
                                        {expandedFolders['internal'] ? <LucideChevronDown size={14} /> : <LucideChevronRight size={14} />}
                                        <LucideFolder size={14} color="#facc15" fill={expandedFolders['internal'] ? "#facc15" : "none"} />
                                        INTERNAL QUOTATIONS
                                    </div>
                                    {expandedFolders['internal'] && (
                                        <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
                                            {internalDesigns.map((d: any) => (
                                                <div key={d.id}>
                                                    <div onClick={() => toggleFolder(`int-${d.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                                        {expandedFolders[`int-${d.id}`] ? <LucideChevronDown size={12} /> : <LucideChevronRight size={12} />}
                                                        <LucideFolder size={12} color="#3b82f6" />
                                                        {d.design_name}
                                                    </div>
                                                    {expandedFolders[`int-${d.id}`] && (
                                                        <div style={{ paddingLeft: '16px' }}>
                                                            <div onClick={() => fetchDesignData(d.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: activeDesignId === d.id ? 'white' : '#64748b', backgroundColor: activeDesignId === d.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent', borderRadius: '4px' }}>
                                                                <LucideFile size={12} color={activeDesignId === d.id ? '#3b82f6' : '#475569'} />
                                                                Part File
                                                            </div>

                                                            {/* Drawings Folder */}
                                                            {d.supporting_files?.some((f: string) => f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)) && (
                                                                <>
                                                                    <div onClick={() => toggleFolder(`int-drawings-${d.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                                                        {expandedFolders[`int-drawings-${d.id}`] ? <LucideChevronDown size={12} /> : <LucideChevronRight size={12} />}
                                                                        <LucideFolder size={12} color="#3b82f6" />
                                                                        Drawings
                                                                    </div>
                                                                    {expandedFolders[`int-drawings-${d.id}`] && (
                                                                        <div style={{ paddingLeft: '16px' }}>
                                                                            {d.supporting_files.filter((f: string) => f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)).map((fileUrl: string, idx: number) => {
                                                                                const fileName = fileUrl.split('/').pop()?.split('_').slice(1).join('_') || 'Drawing';
                                                                                return (
                                                                                    <div key={idx} onClick={() => window.open(resolveMediaUrl(fileUrl), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#64748b' }}>
                                                                                        <LucideFileText size={12} color="#ef4444" />
                                                                                        {fileName}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Documents Folder */}
                                                            {d.supporting_files?.some((f: string) => !f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)) && (
                                                                <>
                                                                    <div onClick={() => toggleFolder(`int-docs-${d.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                                                        {expandedFolders[`int-docs-${d.id}`] ? <LucideChevronDown size={12} /> : <LucideChevronRight size={12} />}
                                                                        <LucideFolder size={12} color="#3b82f6" />
                                                                        Documents
                                                                    </div>
                                                                    {expandedFolders[`int-docs-${d.id}`] && (
                                                                        <div style={{ paddingLeft: '16px' }}>
                                                                            {d.supporting_files.filter((f: string) => !f.toLowerCase().match(/\.(pdf|dwg|dxf)$/)).map((fileUrl: string, idx: number) => {
                                                                                const fileName = fileUrl.split('/').pop()?.split('_').slice(1).join('_') || 'Doc';
                                                                                return (
                                                                                    <div key={idx} onClick={() => window.open(resolveMediaUrl(fileUrl), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#64748b' }}>
                                                                                        <LucideFile size={12} />
                                                                                        {fileName}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTabLeft === 'warnings' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <h3 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#ef4444', marginBottom: '16px', letterSpacing: '1px', fontWeight: 800 }}>Manufacturing Warnings</h3>
                                {dfmWarnings.length > 0 ? dfmWarnings.map((f: any, i: number) => (
                                    <div key={i} onClick={() => handleFeatureClick(features.indexOf(f))} style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', marginBottom: '12px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <LucideAlertTriangle size={14} color="#ef4444" style={{ marginTop: '2px' }} />
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{f.feature_type} Issue</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>{f.risk_factors?.[0] || `Complexity score is high (${f.complexity_score?.toFixed(2)}).`}</div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <LucideCheckCircle size={32} color="#34d399" style={{ marginBottom: '12px' }} />
                                        <div style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>NO SIGNIFICANT ISSUES</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Standard manufacturing rules apply.</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* 2. CENTRAL VIEWER */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#050508', minHeight: 0 }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#3b82f6' }}>
                                <div style={{ width: '30px', height: '30px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : modelUrl ? (
                            <Viewer
                                modelUrl={modelUrl}
                                fileExtension={fileExt}
                                view={ViewPreset.ISO}
                                isViewLocked={false}
                                hideToolbar={false}
                                hideSidebar={true}
                                activeFeatureIndex={activeFeatureIndex}
                                activeFeatureType={activeFeatureIndex !== null ? features[activeFeatureIndex]?.feature_type : undefined}
                                onFeatureClick={(index) => setActiveFeatureIndex(index)}
                            />
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569' }}>
                                <LucideBox size={48} style={{ opacity: 0.1 }} />
                            </div>
                        )}

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

                    {/* Bottom Intelligence Panel */}
                    <div style={{ height: '300px', backgroundColor: '#0d0f17', borderTop: '1px solid #2d2d3a', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '0 12px', borderBottom: '1px solid #2d2d3a', display: 'flex', gap: '2px', overflowX: 'auto', backgroundColor: '#161821' }} className="no-scrollbar">
                            {features.map((feature: any, index: number) => (
                                <button key={index} onClick={() => handleFeatureClick(index)} style={{ padding: '10px 16px', backgroundColor: activeFeatureIndex === index ? '#0d0f17' : 'transparent', border: 'none', borderBottom: activeFeatureIndex === index ? '2px solid #3b82f6' : '2px solid transparent', color: activeFeatureIndex === index ? 'white' : '#64748b', fontSize: '11px', fontWeight: activeFeatureIndex === index ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s' }}>
                                    {(typeof feature.feature_type === 'string' && feature.feature_type.includes(' ') ? feature.feature_type.split(' ')[0] : (feature.feature_type || 'Feature'))} #{index + 1}
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
                                                    <LucideCpu size={18} color="#3b82f6" />
                                                    <h4 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 700 }}>{(typeof f.feature_type === 'string' ? f.feature_type : 'Feature')} Intelligence</h4>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                                    <DetailMetric label="AREA" value={Number.isFinite(f.area) ? `${f.area.toFixed(2)} mm²` : 'N/A'} />
                                                    <DetailMetric label="DIMENSION" value={Number.isFinite(f.diameter) ? `Ø${f.diameter.toFixed(2)}mm` : (Number.isFinite(f.width) && Number.isFinite(f.length)) ? `${f.width.toFixed(1)}x${f.length.toFixed(1)}` : 'N/A'} />
                                                    <DetailMetric label="COMPLEXITY" value={typeof f.complexity_rating === 'number' ? String(f.complexity_rating) : '3'} color={(typeof f.complexity_rating === 'number' && f.complexity_rating > 3) ? '#ef4444' : '#34d399'} />
                                                    <DetailMetric label="ACCESSIBILITY" value={f.accessibility || 'Top'} />
                                                    <DetailMetric label="CONFIDENCE" value={Number.isFinite(f.confidence_score) ? `${(f.confidence_score * 100).toFixed(0)}%` : 'N/A'} />
                                                    <DetailMetric label="ID" value={`F-${f.feature_id || 'N/A'}`} />
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, borderLeft: '1px solid #2d2d3a', paddingLeft: '40px' }}>
                                                <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700 }}>PROCESS & TOOLING</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Assigned Strategy</div>
                                                        <div style={{ fontSize: '13px', color: 'white', fontWeight: 600, marginTop: '4px' }}>{(typeof f.feature_type === 'string' && f.feature_type.includes('Surface')) ? '3D Profile Milling' : 'Drilling Cycle'}</div>
                                                    </div>
                                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Surface Finish</div>
                                                        <div style={{ fontSize: '13px', color: '#a855f7', fontWeight: 700, marginTop: '4px' }}>{f.surface_finish_required || 'As Machined'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569', flexDirection: 'column', gap: '12px' }}>
                                    <LucideInfo size={32} style={{ opacity: 0.5 }} />
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>SELECT A FEATURE TO BEGIN ANALYSIS</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT PANEL - MANUFACTURING INSIGHTS */}
                <aside style={{ width: '360px', flexShrink: 0, backgroundColor: '#0d0f17', borderLeft: '1px solid #2d2d3a', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', backgroundColor: '#161821', borderBottom: '1px solid #2d2d3a', overflowX: 'auto' }} className="no-scrollbar">
                        {[
                            { id: 'specs', label: 'SPECS', icon: LucideSettings },
                            { id: 'tooling', label: 'TOOLING', icon: LucideWrench },
                            { id: 'cost', label: 'COST', icon: LucideDollarSign },
                            { id: 'analysis', label: 'FBM', icon: LucideBarChart },
                            { id: 'dfm', label: 'DFM', icon: LucideShieldAlert },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTabRight(tab.id)} style={{ flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: activeTabRight === tab.id ? '#0d0f17' : 'transparent', border: 'none', borderBottom: activeTabRight === tab.id ? '2px solid #3b82f6' : '2px solid transparent', color: activeTabRight === tab.id ? 'white' : '#64748b', cursor: 'pointer' }}>
                                <tab.icon size={14} />
                                <span style={{ fontSize: '8px', fontWeight: 800 }}>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scrollbar">
                        {activeTabRight === 'specs' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <h3 style={sectionTitleStyle}>Production Specifications</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <InsightRow label="Material" value={design?.material} bold />
                                    <InsightRow label="Process" value={design?.manufacturing_process || 'CNC Machining'} bold />
                                    <InsightRow label="Surface Finish" value={design?.surface_finish || 'As Machined'} bold />
                                    <InsightRow label="Tolerances" value={design?.tolerances || 'Standard'} />
                                    <InsightRow label="Batch Quantity" value={design?.additional_instructions?.startsWith('[Qty:') ? design.additional_instructions.split(']')[0].replace('[Qty: ', '') : `${design?.quantity} Units`} />
                                    <InsightRow label="Dimensions (mm)" value={design?.bbox_mm ? `${design.bbox_mm[0].toFixed(1)} x ${design.bbox_mm[1].toFixed(1)} x ${design.bbox_mm[2].toFixed(1)}` : (summary?.bbox_mm ? `${summary.bbox_mm[0]}x${summary.bbox_mm[1]}x${summary.bbox_mm[2]}` : (design?.geometric_data?.bbox_mm ? `${design.geometric_data.bbox_mm[0]}x${design.geometric_data.bbox_mm[1]}x${design.geometric_data.bbox_mm[2]}` : 'N/A'))} />
                                    <InsightRow label="Volume" value={fbmAnalysis?.volume_cm3 ? `${fbmAnalysis.volume_cm3.toFixed(2)} cm³` : (design?.volume_cm3 ? `${design.volume_cm3} cm³` : (design?.geometric_data?.volume_cm3 ? `${design.geometric_data.volume_cm3} cm³` : 'N/A'))} />
                                </div>
                            </div>
                        )}

                        {activeTabRight === 'tooling' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <h3 style={sectionTitleStyle}>Tooling Analysis</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {operations.length > 0 ? operations.slice(0, 5).map((op: any, idx: number) => (
                                        <div key={idx} style={toolCardStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{op.tool_type} Ø{op.tool_diameter?.toFixed(1)}</span>
                                                <span style={{ color: '#3b82f6', fontSize: '10px' }}>{op.operation_name?.toUpperCase()}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{op.strategy || 'Standard machining path.'}</div>
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>S: <span style={{ color: '#e2e8f0' }}>{op.spindle_speed} RPM</span></div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>F: <span style={{ color: '#e2e8f0' }}>{op.feed_rate} mm/min</span></div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#475569', fontSize: '12px', border: '1px dashed #2d2d3a', borderRadius: '8px' }}>
                                            No tooling data generated for this geometry.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTabRight === 'cost' && (() => {
                            const parseBreakdown = (notes: string) => {
                                try {
                                    const jsonStart = notes.indexOf('{');
                                    if (jsonStart === -1) return null;
                                    const jsonStr = notes.substring(jsonStart);
                                    const data = JSON.parse(jsonStr.replace(/'/g, '"'));
                                    return data;
                                } catch (e) {
                                    return null;
                                }
                            };

                            const breakdown = (quotes?.[0]?.notes ? parseBreakdown(quotes[0].notes) : null) || intelligence?.cost_estimation;

                            const getMaterialCost = () => {
                                const val = breakdown?.material_cost_per_unit || breakdown?.material_cost || 0;
                                return val > 0 ? formatPrice(val) : 'N/A';
                            };

                            const getMachiningCost = () => {
                                const val = breakdown?.labor_cost_per_unit || breakdown?.machining_cost || 0;
                                return val > 0 ? formatPrice(val) : 'N/A';
                            };

                            const getToolingCost = () => {
                                const val = breakdown?.tool_cost_per_unit || breakdown?.tooling_cost || 0;
                                return val > 0 ? formatPrice(val) : 'N/A';
                            };

                            return (
                                <div style={{ animation: 'fadeIn 0.2s' }}>
                                    <h3 style={sectionTitleStyle}>Commercial Analysis</h3>
                                    {quotes?.[0] ? (
                                        <div style={{ backgroundColor: '#161821', border: '1px solid #3b82f6', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Quoted Unit Price</div>
                                            <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>{formatPrice(quotes[0].price_usd)}</div>
                                            <div style={{ fontSize: '10px', color: '#34d399', marginTop: '4px' }}>ESTIMATED LEAD TIME: {quotes[0].estimated_lead_time_days} DAYS</div>
                                        </div>
                                    ) : (
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px dashed #2d2d3a' }}>
                                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Internal Cost Estimate</div>
                                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#94a3b8' }}>{breakdown?.total_cost ? formatPrice(breakdown.total_cost) : 'Pending...'}</div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <InsightRow label="Material" value={getMaterialCost()} />
                                        <InsightRow label="Machining" value={getMachiningCost()} />
                                        <InsightRow label="Tooling" value={getToolingCost()} />
                                        <InsightRow label="Setup Fee" value={breakdown?.setup_cost ? formatPrice(breakdown.setup_cost) : 'N/A'} />
                                    </div>
                                </div>
                            );
                        })()}

                        {activeTabRight === 'analysis' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <h3 style={sectionTitleStyle}>FBM Geometric Intelligence</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                    <StatBox label="Features" value={features.length > 0 ? features.length : (intelligence?.feature_breakdown?.total_features || 0)} />
                                    <StatBox label="Patterns" value={patterns.length || 0} />
                                </div>
                                
                                {intelligence?.feature_breakdown?.features_by_type && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Feature Breakdown</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {Object.entries(intelligence.feature_breakdown.features_by_type).map(([type, count]: [string, any]) => (
                                                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                                                    <span style={{ color: '#94a3b8' }}>{type}</span>
                                                    <span style={{ color: 'white', fontWeight: 600 }}>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>COMPLEXITY SCORE</div>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginTop: '4px' }}>{(fbmAnalysis?.complexity_score || intelligence?.complexity_rating || 0.3).toFixed(2)} / 1.0</div>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                        <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 700 }}>MACHINABILITY INDEX</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', marginTop: '4px' }}>{((intelligence?.machinability_assessment?.accessibility_score || 0.85) * 100).toFixed(0)}%</div>
                                        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Based on tool access & setup requirements</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTabRight === 'dfm' && (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <h3 style={sectionTitleStyle}>Manufacturing Constraints</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>ACCESSIBILITY SCORE</div>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{((intelligence?.machinability_assessment?.accessibility_score || 0.85) * 100).toFixed(0)}%</div>
                                    </div>
                                    
                                    {(intelligence?.manufacturing_risks?.length > 0 || intelligence?.dfm_analysis?.warnings?.length > 0) ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Detected Risks</div>
                                            {(intelligence.manufacturing_risks || []).concat(intelligence.dfm_analysis?.warnings || []).slice(0, 8).map((risk: string, idx: number) => (
                                                <div key={idx} style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '2px solid #ef4444', borderRadius: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <LucideAlertTriangle size={12} color="#ef4444" />
                                                    <div style={{ fontSize: '10px', color: '#e2e8f0' }}>{risk}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: 'rgba(52, 211, 153, 0.05)', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.1)' }}>
                                            <LucideCheckCircle size={24} color="#34d399" style={{ marginBottom: '10px' }} />
                                            <div style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>HIGH MACHINABILITY</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>No major DFM constraints detected.</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2d3a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- STYLES & COMPONENTS ---

const sectionTitleStyle: React.CSSProperties = { fontSize: '10px', textTransform: 'uppercase', color: '#64748b', marginBottom: '16px', borderBottom: '1px solid #2d2d3a', paddingBottom: '8px', fontWeight: 800, letterSpacing: '1px' };

const toolCardStyle: React.CSSProperties = { backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' };

const DetailMetric = ({ label, value, color = 'white' }: any) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color }}>{value}</div>
    </div>
);

const InsightRow = ({ label, value, bold = false }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
        <span style={{ color: '#64748b' }}>{label}</span>
        <span style={{ color: bold ? 'white' : '#e2e8f0', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
);

const StatBox = ({ label, value }: any) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{value}</div>
        <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', marginTop: '4px', fontWeight: 800 }}>{label}</div>
    </div>
);

export default SmartViewPage;