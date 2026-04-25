import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useFileViewer } from './contexts/FileViewerContext';
import { api, setTokens, getTokens, clearTokens, resolveMediaUrl } from './utils/api';
import { useCurrency, CurrencyProvider } from './utils/currency';
import { styles, bg_deep_space, text_primary, text_secondary, border_color, border_color_strong, neon_cyan, neon_magenta, neon_orange } from './types/theme';
import CtaButton from './components/CtaButton';
import Notification from './components/Notification';
import CheckboxGroup from './components/CheckboxGroup';
import ManufacturerSettingsPage from './components/ManufacturerSettings';
import Viewer, { ErrorBoundary } from './components/Viewer';
import { ViewPreset } from './types/types';
import { ManufacturerProfileView } from './pages/ManufacturerProfilePage';
import {
    ArrowLeftIcon, UploadIcon, QuoteIcon, ManufactureIcon, FileIcon, ShieldCheckIcon,
    GlobeAltIcon, ScaleIcon, LightningBoltIcon, ZapIcon, SparklesIcon, CodeBracketIcon,
    WrenchScrewdriverIcon, CubeIcon, GithubIcon, LinkedInIcon, TwitterIcon,
    SearchIcon, LocationMarkerIcon, StarIcon, BuildingOfficeIcon, XMarkIcon,
    ChartPieIcon, UserCircleIcon, CogIcon, ArchiveBoxIcon, DocumentTextIcon,
    VideoCameraIcon, DownloadIcon, EyeIcon, TrendingUpIcon, AlertTriangleIcon,
    NutIcon, DrillIcon, CircleDotIcon, CylinderIcon, CogWheelIcon, DollarSignIcon,
    iconStyle
} from "./components/icons";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api';
export const MEDIA_BASE_URL = 'https://api.quotanic.com';

/**
 * Standardizes how MEDIA_BASE_URL and /media/ paths are joined
 * to prevent double-media paths or missing slashes.
 */


import {
    PRODUCTION_VOLUMES, CERTIFICATIONS, MACHINING_PROCESSES, SHEET_METAL_PROCESSES, CASTING_PROCESSES, FORGING_PROCESSES,
    INJECTION_MOLDING_PROCESSES, ADDITIVE_PROCESSES, WELDING_JOINING_PROCESSES, MATERIALS_METALS, MATERIALS_PLASTICS,
    MATERIALS_COMPOSITES, MATERIALS_OTHERS, SURFACE_FINISHES, POST_PROCESSING_ASSEMBLY, FILE_FORMATS, INCOTERMS,
    SPECIAL_CAPABILITIES, ORDER_STATUSES, ALL_CAPABILITIES_GROUPS, ALL_CAPABILITIES_FLAT
} from './utils/constants';

export const FileViewerModal = ({ design: initialDesign, onClose }) => {
    const [view, setView] = useState(ViewPreset.ISO);
    const [isViewLocked, setIsViewLocked] = useState(true);
    const [activeTab, setActiveTab] = useState('viewer'); // 'viewer' or 'details'
    const [design, setDesign] = useState<any>(typeof initialDesign === 'string' ? null : initialDesign);
    const [loading, setLoading] = useState(typeof initialDesign === 'string');

    useEffect(() => {
        if (typeof initialDesign === 'string') {
            setLoading(true);
            api.getDesignById(initialDesign)
                .then(res => {
                    console.log("[FileViewerModal] Loaded design:", res);
                    setDesign(res);
                })
                .catch(err => {
                    console.error("[FileViewerModal] Error fetching design:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setDesign(initialDesign);
            setLoading(false);
        }
    }, [initialDesign]);

    if (loading) {
        return (
            <div style={styles.modalBackdrop}>
                <div style={{ ...styles.modalContent, maxWidth: '400px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(10, 240, 240, 0.1)', borderTopColor: neon_cyan, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                    <p style={{ color: text_secondary }}>Loading Design Details...</p>
                </div>
            </div>
        );
    }

    if (!design) return null;

    const fileExtension = design.s3_file_key?.split('.').pop()?.toLowerCase() || 'stl';
    const isSupported = ['stl', 'obj', 'gltf', 'glb', 'step', 'stp', 'iges', 'igs'].includes(fileExtension);
    
    // Improved model URL resolution with fallback
    const viewUrl = design.view_url || (['stl', 'obj', 'glb', 'gltf'].includes(fileExtension) ? design.s3_file_key : null);
    const modelUrl = resolveMediaUrl(viewUrl);

    return (
        <div style={styles.modalBackdrop}>
            <div style={{ ...styles.modalContent, maxWidth: '1000px', width: '95vw', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{ ...styles.modalHeader, padding: '16px 24px', borderBottom: `1px solid ${border_color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(10, 240, 240, 0.1)', color: neon_cyan }}>
                            <CubeIcon style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div>
                            <h3 style={{ ...styles.modalTitle, margin: 0 }}>{design.design_name}</h3>
                            <p style={{ fontSize: '12px', color: text_secondary, margin: 0 }}>{fileExtension.toUpperCase()} • {design.material} • Qty: {design.quantity}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setActiveTab('viewer')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'viewer' ? 'rgba(10, 240, 240, 0.1)' : 'transparent',
                                color: activeTab === 'viewer' ? neon_cyan : text_secondary,
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            3D Viewer
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'details' ? 'rgba(10, 240, 240, 0.1)' : 'transparent',
                                color: activeTab === 'details' ? neon_cyan : text_secondary,
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            Details
                        </button>
                        <div style={{ width: '1px', background: border_color, margin: '0 8px' }} />
                        <button onClick={onClose} style={styles.modalCloseButton}><XMarkIcon style={{ width: '24px', height: '24px' }} /></button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', minWidth: 0, minHeight: 0 }}>
                    {activeTab === 'viewer' ? (
                        <>
                            <div style={{ flex: 1, background: '#0a0a0f', position: 'relative', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
                                {isSupported && modelUrl ? (
                                    <ErrorBoundary fallback={(error) => (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--status-error)', padding: '24px', textAlign: 'center' }}>
                                            <AlertTriangleIcon style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
                                            <p>Failed to load 3D preview.</p>
                                            <p style={{ fontSize: '12px', color: text_secondary, marginTop: '8px' }}>{error.message}</p>
                                            <CtaButton text="Download to View Externally" onClick={() => window.open(modelUrl, '_blank')} style={{ marginTop: '16px' }} />
                                        </div>
                                    )}>
                                        <Viewer
                                            modelUrl={modelUrl}
                                            fileExtension={(modelUrl.split('.').pop().toLowerCase()) as any}
                                            view={view}
                                            isViewLocked={isViewLocked}
                                            onUserInteraction={() => setIsViewLocked(false)}
                                            design={design}
                                        >
                                            {/* Viewer Controls Overlay */}
                                            <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: `1px solid ${border_color}`, backdropFilter: 'blur(8px)', zIndex: 10 }}>
                                                {[
                                                    { id: ViewPreset.ISO, label: 'ISO' },
                                                    { id: ViewPreset.TOP, label: 'Top' },
                                                    { id: ViewPreset.FRONT, label: 'Front' },
                                                    { id: ViewPreset.RIGHT, label: 'Right' },
                                                    { id: ViewPreset.LEFT, label: 'Left' },
                                                ].map(preset => (
                                                    <button
                                                        key={preset.id}
                                                        onClick={() => { setView(preset.id); setIsViewLocked(true); }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: view === preset.id && isViewLocked ? neon_cyan : 'transparent',
                                                            color: view === preset.id && isViewLocked ? '#000' : '#fff',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Info Badge */}
                                            <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 16px', borderRadius: '20px', border: `1px solid ${border_color}`, backdropFilter: 'blur(4px)', pointerEvents: 'none', zIndex: 10 }}>
                                                <span style={{ fontSize: '12px', fontWeight: 600, color: neon_cyan, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: neon_cyan, boxShadow: `0 0 8px ${neon_cyan}` }} />
                                                    LIVE 3D INSPECTION
                                                </span>
                                            </div>
                                        </Viewer>
                                    </ErrorBoundary>
                                ) : isSupported && !modelUrl ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: text_secondary, gap: '16px', padding: '24px', textAlign: 'center' }}>
                                        <div className="w-16 h-16 border-4 border-t-brand-primary border-brand-secondary rounded-full animate-spin"></div>
                                        <p style={{ marginTop: '24px', fontSize: '18px', color: neon_cyan }}>Preparing 3D Preview...</p>
                                        <p style={{ maxWidth: '400px', fontSize: '14px' }}>Our AI is currently tessellating your .{fileExtension} file for browser inspection. This typically takes 30-60 seconds.</p>
                                        <CtaButton text="Download Original" onClick={() => window.open(`${MEDIA_BASE_URL}/media/${design.s3_file_key}`, '_blank')} style={{ marginTop: '16px' }} />
                                    </div>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: text_secondary, gap: '16px' }}>
                                        <FileIcon />
                                        <p>3D Preview not available for .{fileExtension} files</p>
                                        <CtaButton text="Download to View" onClick={() => window.open(`${MEDIA_BASE_URL}/media/${design.s3_file_key}`, '_blank')} />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-panel)' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <h4 style={{ ...styles.subLegend, marginTop: 0 }}>Design Specifications</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                                    <div><p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Material</p><p style={{ fontWeight: 600, margin: 0 }}>{design.material}</p></div>
                                    <div><p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Quantity</p><p style={{ fontWeight: 600, margin: 0 }}>{design.quantity} pcs</p></div>
                                    <div><p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Process</p><p style={{ fontWeight: 600, margin: 0 }}>{design.manufacturing_process || 'CNC Machining'}</p></div>
                                    <div><p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Finish</p><p style={{ fontWeight: 600, margin: 0 }}>{design.surface_finish}</p></div>
                                </div>

                                <h4 style={styles.subLegend}>Geometric Analysis</h4>
                                {design.geometric_data ? (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${border_color}`, padding: '24px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                            <div>
                                                <p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Volume</p>
                                                <p style={{ fontWeight: 700, fontSize: '18px', color: neon_magenta, margin: 0 }}>{design.geometric_data.volume_cm3} <span style={{ fontSize: '12px', fontWeight: 400 }}>cm³</span></p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Surface Area</p>
                                                <p style={{ fontWeight: 700, fontSize: '18px', color: neon_cyan, margin: 0 }}>{design.geometric_data.surface_area_cm2} <span style={{ fontSize: '12px', fontWeight: 400 }}>cm²</span></p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 4px 0' }}>Complexity</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${design.geometric_data.complexity_score * 100}%`, height: '100%', background: neon_orange }} />
                                                    </div>
                                                    <span style={{ fontWeight: 700, color: neon_orange }}>{(design.geometric_data.complexity_score * 10).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {design.geometric_data.bbox_mm && (
                                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${border_color}` }}>
                                                <p style={{ fontSize: '13px', color: text_secondary, margin: '0 0 8px 0' }}>Bounding Box (L x W x H)</p>
                                                <p style={{ fontWeight: 600, fontSize: '16px', margin: 0, fontFamily: 'monospace' }}>
                                                    {design.geometric_data.bbox_mm[0]} x {design.geometric_data.bbox_mm[1]} x {design.geometric_data.bbox_mm[2]} mm
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: text_secondary, background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px dashed ${border_color}` }}>
                                        Analysis data will appear once processing is complete.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ ...styles.modalFooter, padding: '16px 24px', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <CtaButton text="Download Original" onClick={() => window.open(modelUrl, '_blank')}>
                            <DownloadIcon style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                        </CtaButton>
                    </div>
                    <CtaButton text="Close Window" primary onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

export const ImageUpload = ({ label, currentImageUrl, onImageSelected, onImageRemoved }) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(currentImageUrl);

    useEffect(() => {
        setPreview(currentImageUrl);
    }, [currentImageUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            onImageSelected(file);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onImageRemoved();
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}</label>
            <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <div style={styles.imageUploadBox} onClick={() => inputRef.current?.click()}>
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" style={styles.imageUploadPreview} />
                        <button type="button" onClick={handleRemove} style={styles.imageUploadRemoveBtn} aria-label="Remove image">
                            <XMarkIcon style={{ width: '16px', height: '16px' }} />
                        </button>
                    </>
                ) : (
                    <div style={styles.imageUploadPlaceholder}>
                        <UploadIcon style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Click to upload</span>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Page Sections ---

type HeaderProps = { isAuthenticated: boolean; onLogout: () => void; navigate: (page: string, params?: any) => void; };
export const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const onLogout = logout;

    const [hoveredLink, setHoveredLink] = useState('');
    const { currency, setCurrency } = useCurrency();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currencies = [
        { code: 'USD', symbol: '$' },
        { code: 'EUR', symbol: '€' },
        { code: 'GBP', symbol: '£' },
        { code: 'INR', symbol: '₹' },
        { code: 'JPY', symbol: '¥' },
    ];

    const navLinks = [
        { id: 'how-it-works', text: 'How It Works', path: '/how-it-works' },
        { id: 'directory', text: 'Manufacturers', path: '/directory' },
        { id: 'trust', text: 'Trust & Security', path: '/trust-and-security' },
    ];

    return (
        <header style={{ 
            ...styles.header, 
            background: scrolled ? 'rgba(10, 12, 16, 0.85)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? `1px solid ${border_color}` : '1px solid transparent',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: scrolled ? '16px 0' : '24px 0',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            <div style={styles.container}>
                <div style={styles.headerContent}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <div style={{ position: 'relative' }}>
                            <img src="/quotanic-logo.png" alt="Quotanic Logo" style={{ height: '32px', width: 'auto', filter: `drop-shadow(0 0 10px ${neon_cyan})` }} />
                            <div style={{ position: 'absolute', inset: -4, background: neon_cyan, borderRadius: '50%', filter: 'blur(15px)', opacity: 0.2 }}></div>
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            QUOTA<span style={{ color: neon_cyan }}>NIC</span>
                        </span>
                    </Link>

                    <nav style={{ ...styles.nav, gap: '32px' }}>
                        {navLinks.map(link => (
                            <Link 
                                key={link.id} 
                                to={link.path}
                                style={{ 
                                    ...styles.navLink, 
                                    color: location.pathname === link.path ? neon_cyan : (hoveredLink === link.id ? '#fff' : 'rgba(255,255,255,0.6)'),
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    position: 'relative'
                                }} 
                                onMouseEnter={() => setHoveredLink(link.id)} 
                                onMouseLeave={() => setHoveredLink('')}
                            >
                                {link.text}
                                {location.pathname === link.path && (
                                    <div style={{ position: 'absolute', bottom: '-8px', left: 0, right: 0, height: '2px', background: neon_cyan, boxShadow: `0 0 10px ${neon_cyan}` }}></div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div style={{ ...styles.headerActions, gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px 12px', border: `1px solid ${border_color}` }}>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                style={{
                                    background: 'none',
                                    color: '#fff',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    padding: '8px 0'
                                }}
                            >
                                {currencies.map(c => (
                                    <option key={c.code} value={c.code} style={{ background: '#0B0C10' }}>
                                        {c.code} {c.symbol}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {isAuthenticated ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <CtaButton text="Dashboard" onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', fontSize: '14px' }} />
                                <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Log Out</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>LOG IN</Link>
                                <CtaButton text="Get Started" primary onClick={() => navigate('/signup')} style={{ padding: '12px 24px', fontSize: '14px' }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export const Hero = () => {
    const navigate = useNavigate();
    return (
        <section style={{ ...styles.hero, position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
            {/* Mesh Gradient Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(at 0% 0%, rgba(10, 240, 240, 0.15) 0px, transparent 50%),
                             radial-gradient(at 100% 0%, rgba(255, 0, 255, 0.1) 0px, transparent 50%),
                             radial-gradient(at 50% 100%, rgba(255, 165, 0, 0.05) 0px, transparent 50%)`,
                zIndex: 0
            }}></div>

            <div style={{ ...styles.container, position: 'relative', zIndex: 1 }}>
                {/* Previous Hero Elements restored above */}
                <div style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="animate-slide-up">
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 10vw, 6rem)', 
                        fontWeight: '900', 
                        margin: 0, 
                        background: `linear-gradient(to right, ${neon_cyan}, #fff, ${neon_magenta})`, 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent', 
                        textShadow: `0 0 30px rgba(10, 240, 240, 0.5)`, 
                        letterSpacing: '-4px',
                        lineHeight: 1
                    }}>QUOTANIC</h1>
                    <div style={{ width: '100px', height: '4px', background: `linear-gradient(90deg, transparent, ${neon_cyan}, transparent)`, marginTop: '16px' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '64px', alignItems: 'center' }} className="hero-grid">
                    <div style={{ textAlign: 'left' }} className="animate-slide-up">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: 'rgba(10, 240, 240, 0.1)', border: `1px solid ${neon_cyan}`, borderRadius: '20px', marginBottom: '32px' }}>
                            <ZapIcon style={{ width: '16px', height: '16px', color: neon_cyan }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: neon_cyan, letterSpacing: '1px', textTransform: 'uppercase' }}>Now in Beta: AI-Powered Sourcing</span>
                        </div>
                        <h1 style={{ ...styles.heroTitle, textAlign: 'left', fontSize: 'clamp(3rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '24px' }}>
                            From Design to Production, <span style={{ color: neon_cyan, textShadow: `0 0 20px rgba(10, 240, 240, 0.3)` }}>Faster</span> Than Ever.
                        </h1>
                        <p style={{ ...styles.heroSubtitle, textAlign: 'left', fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: '48px', maxWidth: '600px' }}>
                            Get instant quotes from a global network of vetted manufacturers. Upload your design and compare prices, lead times, and quality in one place.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <CtaButton text="Get an Instant Quote" primary onClick={() => navigate('/upload')} style={{ padding: '18px 36px', fontSize: '18px' }} />
                            <CtaButton text="Explore Directory" onClick={() => navigate('/directory')} style={{ padding: '18px 36px', fontSize: '18px' }} />
                        </div>
                    </div>

                    {/* Platform Mockup Visual */}
                    <div className="hero-mockup animate-fade-in" style={{ position: 'relative', display: 'none' }}> {/* Hidden on small screens via CSS */}
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: `1px solid ${border_color}`,
                            borderRadius: '24px',
                            padding: '24px',
                            backdropFilter: 'blur(20px)',
                            boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(10, 240, 240, 0.1)`,
                            transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <CubeIcon style={{ width: '60px', height: '60px', color: neon_cyan, animation: 'float 4s infinite' }} />
                            </div>
                            <div style={{ spaceY: '12px' }}>
                                <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                <div style={{ height: '8px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '12px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                    <div style={{ height: '32px', width: '80px', background: 'rgba(255, 0, 255, 0.2)', borderRadius: '8px' }}></div>
                                    <div style={{ height: '32px', width: '80px', background: 'rgba(10, 240, 240, 0.2)', borderRadius: '8px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @media (min-width: 1024px) {
                    .hero-mockup { display: block !important; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
            `}</style>
        </section>
    );
};

export const HowItWorks = () => {
    const navigate = useNavigate();
    return (
        <section style={{ ...styles.howItWorks, padding: '120px 0' }}>
            <div style={styles.container}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ ...styles.sectionTitle, fontSize: '42px', marginBottom: '16px' }}>The Future of Procurement</h2>
                    <p style={{ color: text_secondary, fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>Quotanic simplifies the entire manufacturing lifecycle into three streamlined phases.</p>
                </div>
                <div style={styles.stepsGrid}>
                    {[
                        { icon: <UploadIcon />, title: "Upload & Analyze", text: "Securely upload CAD files. Our FBM engine extracts geometric intent instantly.", color: neon_cyan },
                        { icon: <QuoteIcon />, title: "Compare & Match", text: "AI matches your design with manufacturers' real-time capabilities.", color: neon_magenta },
                        { icon: <ManufactureIcon />, title: "Launch Production", text: "Accept quotes and manage production end-to-end through our secure portal.", color: neon_orange }
                    ].map((step, i) => (
                        <div key={i} style={{ 
                            ...styles.step, 
                            padding: '48px', 
                            background: 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${border_color}`, 
                            borderRadius: '24px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }} 
                        onClick={() => navigate('/how-it-works')}
                        className="hover-glow"
                        >
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '16px', background: `rgba(${step.color === neon_cyan ? '10, 240, 240' : step.color === neon_magenta ? '255, 0, 255' : '255, 165, 0'}, 0.1)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, marginBottom: '32px'
                            }}>
                                {React.cloneElement(step.icon as React.ReactElement, { style: { width: '32px', height: '32px' } })}
                            </div>
                            <h3 style={{ ...styles.stepTitle, fontSize: '24px', marginBottom: '16px' }}>{step.title}</h3>
                            <p style={{ ...styles.stepText, color: 'rgba(255,255,255,0.6)' }}>{step.text}</p>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .hover-glow:hover {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(255,255,255,0.2) !important;
                    transform: translateY(-10px);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }
            `}</style>
        </section>
    );
};

export const ValueProposition = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const valueProps = [
        { icon: <LightningBoltIcon />, title: "Instant Estimations", text: "Stop waiting. Our automated engine provides rapid cost estimates for your designs.", color: neon_cyan },
        { icon: <GlobeAltIcon />, title: "Global Network", text: "Access a diverse, global pool of vetted manufacturers for any process.", color: neon_magenta },
        { icon: <ScaleIcon />, title: "Informed Decisions", text: "Compare suppliers side-by-side on price, lead time, MOQ, and quality ratings.", color: neon_orange },
        { icon: <ShieldCheckIcon />, title: "IP Protection", text: "Your designs are secure. We prioritize robust protection for your intellectual property.", color: neon_cyan },
    ];

    return (
        <section style={{ ...styles.features, background: 'rgba(0,0,0,0.2)', padding: '120px 0' }}>
            <div style={styles.container}>
                <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '80px' }}>Why Leading Companies Choose Quotanic</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                    {valueProps.map((prop, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                padding: '40px',
                                borderRadius: '24px',
                                background: hoveredCard === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: `1px solid ${hoveredCard === index ? prop.color : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default',
                                backdropFilter: 'blur(10px)'
                            }} 
                            onMouseEnter={() => setHoveredCard(index)} 
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={{ 
                                width: '56px', height: '56px', borderRadius: '50%', background: `rgba(${prop.color === neon_cyan ? '10, 240, 240' : prop.color === neon_magenta ? '255, 0, 255' : '255, 165, 0'}, 0.05)`,
                                border: `1px solid rgba(${prop.color === neon_cyan ? '10, 240, 240' : prop.color === neon_magenta ? '255, 0, 255' : '255, 165, 0'}, 0.1)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: prop.color, marginBottom: '24px',
                                boxShadow: hoveredCard === index ? `0 0 20px rgba(${prop.color === neon_cyan ? '10, 240, 240' : prop.color === neon_magenta ? '255, 0, 255' : '255, 165, 0'}, 0.2)` : 'none'
                            }}>
                                {React.cloneElement(prop.icon as React.ReactElement, { style: { width: '24px', height: '24px' } })}
                            </div>
                            <h3 style={{ ...styles.stepTitle, fontSize: '22px', marginBottom: '16px' }}>{prop.title}</h3>
                            <p style={{ ...styles.stepText, fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)' }}>{prop.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const ForWhom = () => {
    const navigate = useNavigate();
    return (
        <section style={{ padding: '120px 0' }}>
            <div style={styles.container}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
                    <div style={{ 
                        padding: '64px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(10, 240, 240, 0.05), transparent)', 
                        border: `1px solid rgba(10, 240, 240, 0.1)`, position: 'relative', overflow: 'hidden' 
                    }}>
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(10, 240, 240, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                        <CodeBracketIcon style={{ width: '48px', height: '48px', color: neon_cyan, marginBottom: '32px' }} />
                        <h3 style={{ ...styles.featureTitle, fontSize: '32px', marginBottom: '24px' }}>For Engineers & Designers</h3>
                        <p style={{ ...styles.forWhomText, fontSize: '18px', marginBottom: '40px', color: 'rgba(255,255,255,0.7)' }}>Streamline procurement, reduce time-to-market, and find the perfect manufacturing partner without the hassle of manual sourcing.</p>
                        <CtaButton text="Start Project" primary onClick={() => navigate('/upload')} />
                    </div>
                    <div style={{ 
                        padding: '64px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.05), transparent)', 
                        border: `1px solid rgba(255, 0, 255, 0.1)`, position: 'relative', overflow: 'hidden' 
                    }}>
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255, 0, 255, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                        <WrenchScrewdriverIcon style={{ width: '48px', height: '48px', color: neon_magenta, marginBottom: '32px' }} />
                        <h3 style={{ ...styles.featureTitle, fontSize: '32px', marginBottom: '24px' }}>For Manufacturers</h3>
                        <p style={{ ...styles.forWhomText, fontSize: '18px', marginBottom: '40px', color: 'rgba(255,255,255,0.7)' }}>Access a global customer base, automate your quoting workflow, and fill your production capacity with high-intent orders.</p>
                        <CtaButton text="Join Network" onClick={() => navigate('/signup/manufacturer')} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export const SocialProof = () => (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${border_color}` }}>
        <div style={styles.container}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={styles.sectionTitle}>Built for Scale</h2>
                <p style={{ color: text_secondary, fontSize: '18px' }}>Empowering the next generation of hardware innovation.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', textAlign: 'center' }}>
                <div className="metric-card">
                    <div style={{ fontSize: '64px', fontWeight: 900, color: neon_cyan, textShadow: `0 0 30px rgba(10, 240, 240, 0.3)` }}>50+</div>
                    <div style={{ fontSize: '16px', color: text_secondary, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '12px' }}>Verified Manufacturers</div>
                </div>
                <div className="metric-card">
                    <div style={{ fontSize: '64px', fontWeight: 900, color: neon_magenta, textShadow: `0 0 30px rgba(255, 0, 255, 0.3)` }}>1,000+</div>
                    <div style={{ fontSize: '16px', color: text_secondary, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '12px' }}>Parts Quoted</div>
                </div>
                <div className="metric-card">
                    <div style={{ fontSize: '64px', fontWeight: 900, color: neon_orange, textShadow: `0 0 30px rgba(255, 165, 0, 0.3)` }}>24/7</div>
                    <div style={{ fontSize: '16px', color: text_secondary, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '12px' }}>Automated Analysis</div>
                </div>
            </div>
        </div>
    </section>
);















type FooterProps = { navigate: (page: string, params?: any) => void; };
export const Footer = () => {
    const navigate = useNavigate();
    return (
        <footer style={{ ...styles.footer, background: 'rgba(0,0,0,0.4)', padding: '100px 0 40px', borderTop: `1px solid ${border_color}` }}>
            <div style={styles.container}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '64px', marginBottom: '80px' }}>
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '32px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '2px' }}>QUOTA<span style={{ color: neon_cyan }}>NIC</span></span>
                        </Link>
                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: '15px' }}>
                            Accelerating global hardware innovation through intelligent manufacturing orchestration and distributed resilience.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['How It Works', 'Directory', 'Trust & Security'].map(item => (
                                <Link key={item} to={`/${item.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')}`} style={footerLinkStyle}>{item}</Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Company</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['About Us', 'Contact Us', 'Blog', 'Resources'].map(item => (
                                <Link key={item} to={`/${item.toLowerCase().replace(/ /g, '-')}`} style={footerLinkStyle}>{item}</Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Newsletter</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '20px' }}>Join 5,000+ engineers for hardware insights.</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="email" placeholder="Email address" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${border_color}`, borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                            <button style={{ background: neon_cyan, border: 'none', borderRadius: '12px', padding: '0 16px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>Join</button>
                        </div>
                    </div>
                </div>
                <div style={{ paddingTop: '40px', borderTop: `1px solid ${border_color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>© {new Date().getFullYear()} Quotanic. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <Link to="/privacy" style={footerLinkStyle}>Privacy</Link>
                        <Link to="/terms" style={footerLinkStyle}>Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const footerLinkStyle = {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s'
};

// --- Login/Signup Pages ---











// --- Dashboard & Upload Components ---





// --- Manufacturer Directory & Profile Pages ---
export const ManufacturerCard = ({ manufacturer, navigate }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{ 
                ...styles.mfgCard, 
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${hover ? neon_cyan : border_color}`,
                borderRadius: '24px',
                padding: '32px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                transform: hover ? 'translateY(-10px)' : 'translateY(0)',
                boxShadow: hover ? `0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(10, 240, 240, 0.1)` : 'none',
                backdropFilter: 'blur(10px)'
            }} 
            onMouseEnter={() => setHover(true)} 
            onMouseLeave={() => setHover(false)} 
            onClick={() => navigate(`/manufacturer/${manufacturer.id}`)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ 
                    width: '64px', height: '64px', borderRadius: '16px', background: '#fff', padding: '8px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    <img src={manufacturer.logoUrl} alt={`${manufacturer.company_name} logo`} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#fff' }}>{manufacturer.company_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                        <LocationMarkerIcon style={{ width: '14px', height: '14px' }} />
                        {manufacturer.location}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 215, 0, 0.1)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                    <StarIcon style={{ width: '14px', height: '14px', color: '#FFD700' }} />
                    <span style={{ fontWeight: 800, color: '#FFD700', fontSize: '14px' }}>{(parseFloat(manufacturer.rating) || 0).toFixed(1)}</span>
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {manufacturer.capabilities.slice(0, 3).map(cap => (
                        <span key={cap} style={{ 
                            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', 
                            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: `1px solid ${border_color}`
                        }}>{cap}</span>
                    ))}
                    {manufacturer.capabilities.length > 3 && (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', color: neon_cyan }}>+{manufacturer.capabilities.length - 3} more</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: `1px solid ${border_color}` }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {manufacturer.certifications.slice(0, 2).map(cert => (
                        <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: neon_magenta, fontSize: '11px', fontWeight: 700 }}>
                            <ShieldCheckIcon style={{ width: '12px', height: '12px' }} />
                            {cert}
                        </div>
                    ))}
                </div>
                <span style={{ color: hover ? neon_cyan : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, transition: 'all 0.3s' }}>
                    View Profile →
                </span>
            </div>
        </div>
    );
};





// --- Manufacturer Dashboard Components ---

export const DashboardOverview = ({ user, onSetActiveView }: { user: any, onSetActiveView: (view: string) => void }) => {
    const { openViewer: onViewFiles } = useFileViewer();
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: '', data: null });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    api.getDashboardStats(),
                    api.getRecentActivity()
                ]);
                setStats(statsData);
                setActivity(activityData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <ManufactureIcon style={{ width: '60px', height: '60px', color: 'var(--neon-cyan)', animation: 'pulse 2s infinite' }} />
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--status-error)' }}>Error loading dashboard: {error}</p>
            </div>
        );
    }

    const completeness = stats?.profile_completeness || 0;
    const completenessColor = completeness >= 75 ? 'var(--status-success)' : completeness >= 50 ? 'var(--status-warning)' : 'var(--status-error)';

    const { formatPrice } = useCurrency();

    // Calculate max values for bar charts
    const maxRevenue = stats?.revenue_trend ? Math.max(...stats.revenue_trend.map(d => d.revenue), 100) : 100;
    const quoteFunnel = stats?.quote_funnel || { total: 0, pending: 0, accepted: 0, rejected: 0, expired: 0 };
    const maxFunnel = quoteFunnel.total || 1;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="animate-slide-up">
                <div>
                    <h2 style={styles.dashboardPageTitle}>Overview</h2>
                    <p style={{ ...styles.stepText, fontSize: '18px' }}>
                        Welcome back, {user?.company_name}!
                    </p>
                </div>
                {/* Profile Completeness mini-indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${border_color}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: text_secondary, textTransform: 'uppercase' }}>Profile</span>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: completenessColor }}>{completeness}% Complete</span>
                    </div>
                    <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${completeness}%`, height: '100%', background: completenessColor }} />
                    </div>
                </div>
            </div>

            {/* 1. Hero KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }} className="animate-slide-up stagger-child-1">

                {/* Primary KPI: Revenue */}
                <div
                    className="dashboard-hero-card-hover"
                    style={{ ...styles.dashboardHeroCard, cursor: 'pointer' }}
                    onClick={() => setModalState({ isOpen: true, type: 'revenue', data: stats })}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={styles.dashboardMetricLabel}>Revenue (This Month)</p>
                        <TrendingUpIcon style={{ width: '16px', height: '16px' }} color={neon_magenta} />
                    </div>
                    <h3 style={{ ...styles.dashboardMetricValue, color: neon_magenta, textShadow: `0 0 10px ${neon_magenta}` }}>
                        {formatPrice(stats?.monthly_revenue)}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                        <span style={styles.dashboardComparisonUp}>↑ 12% vs last month</span>
                        <span style={{ fontSize: '13px', color: text_secondary }}>
                            {formatPrice(stats?.total_revenue)} all-time
                        </span>
                    </div>
                </div>

                {/* Secondary KPIs */}
                <div
                    className="dashboard-card-hover"
                    style={{ ...styles.dashboardCard, cursor: 'pointer' }}
                    onClick={() => onSetActiveView('orders')}
                >
                    <p style={styles.dashboardMetricLabel}>Active Orders</p>
                    <h3 style={styles.dashboardMetricValue}>{stats?.active_orders || 0}</h3>
                    <span style={{ fontSize: '13px', color: text_secondary, marginTop: 'auto' }}>
                        {stats?.completed_orders || 0} completed historically
                    </span>
                </div>

                <div
                    style={{ ...styles.dashboardCard, cursor: 'pointer', borderColor: stats?.pending_quotes > 0 ? neon_cyan : border_color, boxShadow: stats?.pending_quotes > 0 ? `inset 0 0 15px rgba(var(--neon-cyan-rgb),0.1)` : 'none' }}
                    onClick={() => onSetActiveView('quotes')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={styles.dashboardMetricLabel}>Pending Quotes</p>
                        {stats?.pending_quotes > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: neon_cyan, boxShadow: `0 0 8px ${neon_cyan}` }} />}
                    </div>
                    <h3 style={styles.dashboardMetricValue}>{stats?.pending_quotes || 0}</h3>
                    <span style={{ fontSize: '13px', color: stats?.pending_quotes > 0 ? neon_cyan : text_secondary, marginTop: 'auto', fontWeight: stats?.pending_quotes > 0 ? 600 : 400 }}>
                        {stats?.pending_quotes > 0 ? 'ACTION NEEDED' : 'All caught up'}
                    </span>
                </div>

                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={styles.dashboardMetricLabel}>Acceptance Rate</p>
                        <p style={{ ...styles.dashboardMetricLabel, textAlign: 'right' }}>On-Time Rate</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                        <h3 style={{ ...styles.dashboardMetricValue, fontSize: '28px', margin: 0 }}>{stats?.acceptance_rate || 0}%</h3>
                        <h3 style={{ ...styles.dashboardMetricValue, fontSize: '28px', margin: 0, color: 'var(--status-success)' }}>{stats?.on_time_delivery_rate || 100}%</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${stats?.acceptance_rate || 0}%`, height: '100%', background: neon_cyan }} />
                        </div>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${stats?.on_time_delivery_rate || 100}%`, height: '100%', background: 'var(--status-success)' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Visualizations Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>

                {/* Revenue Trend */}
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={styles.dashboardSectionHeader}>
                        <span>Revenue Trend (6mo)</span>
                        <TrendingUpIcon style={{ width: '16px', height: '16px' }} color={neon_magenta} />
                    </div>
                    {stats?.revenue_trend && stats.revenue_trend.length > 0 ? (
                        <div style={styles.dashboardBarChartContainer}>
                            {stats.revenue_trend.map((data, i) => {
                                const heightPct = Math.max((data.revenue / maxRevenue) * 100, 2); // min 2%
                                return (
                                    <div key={i} style={styles.dashboardVerticalBarGroup}>
                                        <span style={styles.dashboardBarValueLabel}>{formatPrice(data.revenue)}</span>
                                        <div style={{ ...styles.dashboardVerticalBarFill, height: `${heightPct}%`, backgroundColor: i === stats.revenue_trend.length - 1 ? neon_magenta : neon_cyan }} />
                                        <span style={{ ...styles.dashboardBarLabel, color: i === stats.revenue_trend.length - 1 ? text_primary : text_secondary }}>{data.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: text_secondary }}>
                            No revenue data available
                        </div>
                    )}
                </div>

                {/* Quote Pipeline */}
                <div
                    className="dashboard-card-hover"
                    style={{ ...styles.dashboardCard, cursor: 'pointer' }}
                    onClick={() => setModalState({ isOpen: true, type: 'pipeline', data: quoteFunnel })}
                >
                    <div style={styles.dashboardSectionHeader}>
                        <span>Quote Pipeline</span>
                        <ChartPieIcon style={{ width: '16px', height: '16px' }} color={neon_cyan} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '16px' }}>
                        <div style={styles.dashboardHorizontalBarGroup}>
                            <span style={{ width: '80px', fontSize: '13px', color: text_secondary }}>Received</span>
                            <div style={styles.dashboardHorizontalBarTrack}>
                                <div style={{ ...styles.dashboardHorizontalBarFill, width: '100%', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                            </div>
                            <span style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{quoteFunnel.total}</span>
                        </div>
                        <div style={styles.dashboardHorizontalBarGroup}>
                            <span style={{ width: '80px', fontSize: '13px', color: text_secondary }}>Quoted</span>
                            <div style={styles.dashboardHorizontalBarTrack}>
                                <div style={{ ...styles.dashboardHorizontalBarFill, width: `${((quoteFunnel.total - quoteFunnel.pending) / maxFunnel) * 100 || 0}%`, backgroundColor: neon_cyan }} />
                            </div>
                            <span style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{quoteFunnel.total - quoteFunnel.pending}</span>
                        </div>
                        <div style={styles.dashboardHorizontalBarGroup}>
                            <span style={{ width: '80px', fontSize: '13px', color: text_secondary }}>Accepted</span>
                            <div style={styles.dashboardHorizontalBarTrack}>
                                <div style={{ ...styles.dashboardHorizontalBarFill, width: `${(quoteFunnel.accepted / maxFunnel) * 100 || 0}%`, backgroundColor: neon_magenta }} />
                            </div>
                            <span style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{quoteFunnel.accepted}</span>
                        </div>
                        <div style={{ ...styles.dashboardHorizontalBarGroup, marginBottom: 0 }}>
                            <span style={{ width: '80px', fontSize: '13px', color: text_secondary }}>Completed</span>
                            <div style={styles.dashboardHorizontalBarTrack}>
                                <div style={{ ...styles.dashboardHorizontalBarFill, width: `${(stats?.completed_orders / maxFunnel) * 100 || 0}%`, backgroundColor: 'var(--status-success)' }} />
                            </div>
                            <span style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{stats?.completed_orders || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Row: Activity Table & Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Recent Activity Table */}
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={styles.dashboardSectionHeader}>
                        <span>Recent Activity</span>
                        <button
                            onClick={(e) => { e.preventDefault(); onSetActiveView('quotes'); }}
                            style={{ background: 'none', border: 'none', fontSize: '13px', color: neon_cyan, textDecoration: 'none', cursor: 'pointer' }}
                        >
                            View All
                        </button>
                    </div>
                    {activity?.recent_quotes?.length === 0 && activity?.recent_orders?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: text_secondary }}>
                            <p style={{ fontSize: '14px' }}>No recent activity to display.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.dashboardActivityTable}>
                                <tbody>
                                    {/* Combine and sort recent activity, slice to top 5 */}
                                    {[...(activity?.recent_quotes || []).map(q => ({ ...q, type: 'quote' })), ...(activity?.recent_orders || []).map(o => ({ ...o, type: 'order' }))]
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // sort ascending to get oldest first so that later slice gives newest? Wait slice(0, 5) gives first 5... want newest first. a.created_at is newest if Date(b) - Date(a)
                                        .slice(0, 5)
                                        .map((item, idx) => (
                                            <tr
                                                key={idx}
                                                style={{ ...styles.dashboardActivityRow, cursor: 'pointer' }}
                                                onClick={() => setModalState({ isOpen: true, type: 'activity', data: item })}
                                            >
                                                <td style={{ ...styles.dashboardActivityCell, color: text_primary, fontWeight: 500 }}>
                                                    {item.type === 'quote' ? `Quote Request: ${item.design__design_name}` : `Order Update: #${String(item.id).substring(0, 8)}`}
                                                </td>
                                                <td style={styles.dashboardActivityCell}>
                                                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td style={{ ...styles.dashboardActivityCell, textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            onClick={() => onViewFiles(item.design || item.design_id)}
                                                            style={{ background: 'none', border: 'none', color: neon_cyan, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                            title="View Design"
                                                        >
                                                            <EyeIcon style={{ width: '16px', height: '16px' }} />
                                                        </button>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            backgroundColor: item.status === 'pending' ? 'rgba(var(--status-warning-rgb), 0.1)' :
                                                                item.status === 'completed' ? 'rgba(var(--status-success-rgb), 0.1)' : 'rgba(var(--neon-cyan-rgb), 0.1)',
                                                            color: item.status === 'pending' ? 'var(--status-warning)' :
                                                                item.status === 'completed' ? 'var(--status-success)' : neon_cyan,
                                                            border: `1px solid ${item.status === 'pending' ? 'rgba(var(--status-warning-rgb), 0.3)' : item.status === 'completed' ? 'rgba(var(--status-success-rgb), 0.3)' : `rgba(var(--neon-cyan-rgb), 0.3)`}`
                                                        }}>
                                                            {item.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={styles.dashboardSectionHeader}>
                        <span>Quick Actions</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            style={{
                                ...styles.buttonPrimary,
                                background: stats?.pending_quotes > 0 ? `linear-gradient(135deg, rgba(var(--neon-cyan-rgb), 0.2), rgba(var(--neon-cyan-rgb), 0.1))` : 'var(--bg-panel)',
                                border: `1px solid ${stats?.pending_quotes > 0 ? neon_cyan : 'rgba(255,255,255,0.1)'}`,
                                color: stats?.pending_quotes > 0 ? neon_cyan : text_primary,
                                padding: '16px',
                                justifyContent: 'space-between',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={() => onSetActiveView('quotes')}
                        >
                            <span>Review Pending Quotes</span>
                            {stats?.pending_quotes > 0 && <span style={{ background: neon_cyan, color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>{stats.pending_quotes}</span>}
                        </button>

                        <button
                            style={{
                                ...styles.buttonSecondary,
                                padding: '16px',
                                justifyContent: 'space-between',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={() => onSetActiveView('orders')}
                        >
                            <span>Manage Active Orders</span>
                        </button>

                        <button
                            style={{
                                ...styles.button,
                                background: 'transparent',
                                border: `1px solid ${border_color_strong}`,
                                color: text_secondary,
                                padding: '16px',
                                justifyContent: 'space-between',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={() => onSetActiveView('profile')}
                        >
                            <span>Update Profile Info</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Bottom Row: Top Customers & Upcoming Deadlines */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                {/* Top Customers */}
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={styles.dashboardSectionHeader}>
                        <span>Top Customers (All Time)</span>
                    </div>
                    {stats?.top_customers?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: text_secondary }}>
                            <p style={{ fontSize: '14px' }}>No completed orders yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {stats?.top_customers?.map((customer, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx < stats.top_customers.length - 1 ? `1px solid ${border_color}` : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: neon_magenta, fontWeight: 'bold' }}>
                                            {idx + 1}
                                        </div>
                                        <span style={{ fontWeight: 500, color: text_primary }}>{customer.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: text_primary }}>{formatPrice(customer.spend)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={styles.dashboardSectionHeader}>
                        <span>Upcoming Deadlines</span>
                        <button
                            onClick={() => onSetActiveView('orders')}
                            style={{ background: 'none', border: 'none', fontSize: '13px', color: neon_cyan, textDecoration: 'none', cursor: 'pointer' }}
                        >
                            View Orders
                        </button>
                    </div>
                    {stats?.upcoming_deadlines?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: text_secondary }}>
                            <p style={{ fontSize: '14px' }}>No upcoming deadlines.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {stats?.upcoming_deadlines?.map((order, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx < stats.upcoming_deadlines.length - 1 ? `1px solid ${border_color}` : 'none' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 500, color: text_primary }}>{order.design_name}</span>
                                        <span style={{ fontSize: '12px', color: text_secondary }}>Order #{order.id} • Due: {order.date}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {order.days_remaining < 0 ? (
                                            <span style={{ color: 'var(--status-error)', fontWeight: 600, fontSize: '14px' }}>OVERDUE by {Math.abs(order.days_remaining)}d</span>
                                        ) : order.days_remaining <= 3 ? (
                                            <span style={{ color: neon_orange, fontWeight: 600, fontSize: '14px' }}>{order.days_remaining} {order.days_remaining === 1 ? 'day' : 'days'} left</span>
                                        ) : (
                                            <span style={{ color: text_secondary, fontWeight: 500, fontSize: '14px' }}>{order.days_remaining} days left</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modals */}
            {modalState.isOpen && modalState.type === 'revenue' && (
                <RevenueDetailsModal stats={modalState.data} onClose={() => setModalState({ isOpen: false, type: '', data: null })} formatPrice={formatPrice} />
            )}
            {modalState.isOpen && modalState.type === 'pipeline' && (
                <PipelineDetailsModal data={modalState.data} stats={stats} onClose={() => setModalState({ isOpen: false, type: '', data: null })} />
            )}
            {modalState.isOpen && modalState.type === 'activity' && (
                <ActivityDetailModal item={modalState.data} onClose={() => setModalState({ isOpen: false, type: '', data: null })} onViewFiles={onViewFiles} formatPrice={formatPrice} onSetActiveView={onSetActiveView} />
            )}
        </div>
    );
};

export const ManufacturerProfileManagementPage = ({ user: initialUser }: { user?: any }) => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const portfolioFileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await api.getManufacturerProfile();
                if (profile && typeof profile === 'object') {
                    const caps = profile.capabilities || {};
                    const normalizedData = {
                        ...profile,
                        companyName: profile.company_name || profile.companyName || initialUser?.company_name || '',
                        email: profile.email || '',
                        location: profile.location || '',
                        website: profile.website_url || '',
                        about: profile.about || '',
                        logoUrl: profile.logoUrl || '',
                        backgroundUrl: profile.backgroundUrl || '',

                        // Unpack capabilities into flat fields for the form
                        supportedMaterials: caps.selected_materials || caps.materials_supported || [],
                        productionVolume: caps.production_volume || '',
                        leadTimeRange: caps.lead_time_range || '',
                        moq: caps.moq || 0,
                        otherCertifications: caps.other_certifications || '',
                        qualityControlProcesses: caps.quality_control || '',
                        materialTesting: caps.material_testing || '',

                        // Capability groups - match ALL_CAPABILITIES_GROUPS logic
                        machining: caps.machining || caps.cnc_machining || [],
                        sheetmetal: caps.sheetmetal || caps.sheet_metal_fabrication || [],
                        casting: caps.casting || [],
                        forging: caps.forging || [],
                        injectionmolding: caps.injectionmolding || caps.injection_molding || [],
                        '3dprinting': caps['3dprinting'] || caps.three_d_printing || [],
                        weldingandjoining: caps.weldingandjoining || [],

                        portfolio: profile.portfolio || [],
                        certifications: profile.certifications || [],
                    };
                    setFormData(normalizedData);
                } else {
                    setError('Failed to load profile data.');
                }
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxGroupChange = (category, value) => {
        setFormData(prev => {
            const list = prev[category] || [];
            const newList = list.includes(value) ? list.filter(item => item !== value) : [...list, value];
            return { ...prev, [category]: newList };
        });
    };

    const handleImageChange = (field, file) => {
        if (!file) {
            setFormData(prev => ({ ...prev, [field]: null }));
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [field]: reader.result }));
        };
        reader.readAsDataURL(file);
    }

    const handlePortfolioFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: any) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newItem = {
                        id: Date.now() + Math.random(),
                        type: file.type.startsWith('video') ? 'video' : 'image',
                        title: file.name.split('.')[0],
                        url: reader.result as string
                    };
                    setFormData(prev => ({ ...prev, portfolio: [...prev.portfolio, newItem] }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePortfolioItem = (id) => {
        setFormData(prev => ({ ...prev, portfolio: prev.portfolio.filter(item => item.id !== id) }));
    };

    const handlePortfolioTitleChange = (id, newTitle) => {
        setFormData(prev => ({
            ...prev,
            portfolio: prev.portfolio.map(item => item.id === id ? { ...item, title: newTitle } : item)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNotification({ show: false, message: '', type: 'success' });

        // Maintain full capabilities object while updating specific fields
        const currentCapabilities = formData.capabilities || {};

        // Sync manufacturing process groups
        // We aggregate ALL selected processes into a flat list for the matching engine
        const allProcesses = [
            ...(formData.machining || []),
            ...(formData.sheetmetal || []),
            ...(formData.casting || []),
            ...(formData.forging || []),
            ...(formData.injectionmolding || []),
            ...(formData['3dprinting'] || []),
            ...(formData.weldingandjoining || []),
        ];

        const payload = {
            companyName: formData.companyName,
            email: formData.email,
            location: formData.location,
            about: formData.about,
            website: formData.website,
            logoUrl: formData.logoUrl,
            backgroundUrl: formData.backgroundUrl,
            portfolio: formData.portfolio,
            certifications: formData.certifications,
            capabilities: {
                ...currentCapabilities,
                // Primary fields for matching and search
                selected_materials: formData.supportedMaterials || [],
                materials_supported: formData.supportedMaterials || [], // Backward compatibility
                processes: allProcesses,

                // Detailed info fields
                production_volume: formData.productionVolume,
                lead_time_range: formData.leadTimeRange,
                moq: formData.moq,
                other_certifications: formData.otherCertifications,
                quality_control: formData.qualityControlProcesses,
                material_testing: formData.materialTesting,

                // Categorized storage
                machining: formData.machining || [],
                sheetmetal: formData.sheetmetal || [],
                casting: formData.casting || [],
                forging: formData.forging || [],
                injectionmolding: formData.injectionmolding || [],
                '3dprinting': formData['3dprinting'] || [],
                weldingandjoining: formData.weldingandjoining || [],
            }
        };

        try {
            await api.updateManufacturerProfile(payload);
            setNotification({ show: true, message: 'Profile updated successfully!', type: 'success' });

            // Refresh local state with updated data from backend
            const updatedProfile = await api.getManufacturerProfile();
            if (updatedProfile) {
                const caps = updatedProfile.capabilities || {};
                const normalizedData = {
                    ...updatedProfile,
                    companyName: updatedProfile.company_name || updatedProfile.companyName || initialUser?.company_name || '',
                    email: updatedProfile.email || '',
                    location: updatedProfile.location || '',
                    website: updatedProfile.website_url || '',
                    about: updatedProfile.about || '',
                    logoUrl: updatedProfile.logoUrl || '',
                    backgroundUrl: updatedProfile.backgroundUrl || '',

                    // Unpack capabilities into flat fields for the form
                    supportedMaterials: caps.selected_materials || caps.materials_supported || [],
                    productionVolume: caps.production_volume || '',
                    leadTimeRange: caps.lead_time_range || '',
                    moq: caps.moq || 0,
                    otherCertifications: caps.other_certifications || '',
                    qualityControlProcesses: caps.quality_control || '',
                    materialTesting: caps.material_testing || '',

                    // Capability groups
                    machining: caps.machining || caps.cnc_machining || [],
                    sheetmetal: caps.sheetmetal || caps.sheet_metal_fabrication || [],
                    casting: caps.casting || [],
                    forging: caps.forging || [],
                    injectionmolding: caps.injectionmolding || caps.injection_molding || [],
                    '3dprinting': caps['3dprinting'] || caps.three_d_printing || [],
                    weldingandjoining: caps.weldingandjoining || [],

                    portfolio: updatedProfile.portfolio || [],
                    certifications: updatedProfile.certifications || [],
                };
                setFormData(normalizedData);
            }
        } catch (err) {
            setNotification({ show: true, message: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // ... (keep all existing useEffects and handlers)

    if (loading) return <div>Loading profile...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;
    if (!formData) return <p>Could not load profile data.</p>;

    // Prepare preview data by aggregating processes
    const previewData = {
        ...formData,
        company_name: formData.companyName,
        capabilities: [
            ...(formData.machining || []),
            ...(formData.sheetmetal || []),
            ...(formData.casting || []),
            ...(formData.forging || []),
            ...(formData.injectionmolding || []),
            ...(formData['3dprinting'] || []),
            ...(formData.weldingandjoining || []),
            ...(formData.supportedMaterials || []),
        ],
        rating: "5.0", // Mock rating for preview
        reviews: [],    // Mock empty reviews for preview
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={styles.dashboardPageTitle}>Profile Management</h2>
                    <p style={styles.dashboardPageSubtitle}>Keep your company profile and capabilities up to date to attract the right customers.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <CtaButton 
                        text={isPreviewMode ? "Edit Profile" : "Live Public Preview"} 
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        primary={!isPreviewMode}
                    />
                </div>
            </div>

            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isPreviewMode ? '1fr 1fr' : '1fr', 
                gap: '32px',
                transition: 'all 0.3s ease'
            }}>
                {/* Editor Column */}
                <div style={{ 
                    maxHeight: isPreviewMode ? 'calc(100vh - 200px)' : 'none', 
                    overflowY: isPreviewMode ? 'auto' : 'visible',
                    paddingRight: isPreviewMode ? '16px' : '0'
                }}>
                    <form onSubmit={handleSubmit}>
                        <fieldset style={{ ...styles.fieldset, marginTop: 0 }}><legend style={styles.legend}>Company Information</legend><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="companyName" style={styles.label}>Company Name</label><div style={{ ...styles.input, backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>{formData.companyName}</div></div><div style={styles.formGroup}><label htmlFor="email" style={styles.label}>Public Email Address</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} style={styles.input} required /></div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="location" style={styles.label}>Location (City, Country)</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} style={styles.input} required /></div><div style={styles.formGroup}><label htmlFor="website" style={styles.label}>Website URL</label><input type="url" name="website" value={formData.website} onChange={handleInputChange} style={styles.input} placeholder="https://yourcompany.com" /></div></div><div style={styles.formGroup}><label htmlFor="about" style={styles.label}>About Us</label><textarea name="about" value={formData.about || ''} onChange={handleInputChange} style={{ ...styles.input, height: '100px' }} placeholder="Tell customers about your company, history, and specialization..." /></div></fieldset>

                        <fieldset style={styles.fieldset}><legend style={styles.legend}>Branding & Appearance</legend><div style={styles.formRow}><ImageUpload label="Company Logo" currentImageUrl={formData.logoUrl} onImageSelected={(file) => handleImageChange('logoUrl', file)} onImageRemoved={() => handleImageChange('logoUrl', null)} /><ImageUpload label="Profile Background Image" currentImageUrl={formData.backgroundUrl} onImageSelected={(file) => handleImageChange('backgroundUrl', file)} onImageRemoved={() => handleImageChange('backgroundUrl', null)} /></div></fieldset>

                        <fieldset style={styles.fieldset}>
                            <legend style={styles.legend}>Portfolio Management</legend>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Portfolio Items</label>
                                <p style={styles.fieldsetDescription}>Upload images or videos of your best work. Add a title for each item.</p>
                                <input type="file" multiple accept="image/*,video/*" ref={portfolioFileInputRef} onChange={handlePortfolioFilesChange} style={{ display: 'none' }} />
                                <CtaButton text="Upload New Items" onClick={() => portfolioFileInputRef.current?.click()} type="button" />

                                <div style={styles.portfolioManagementGrid}>
                                    {(formData.portfolio || []).map(item => (
                                        <div key={item.id} style={styles.portfolioManagementItem}>
                                            {item.type === 'video' ? (
                                                <div style={styles.portfolioVideoPlaceholder}><VideoCameraIcon style={{ width: '32px', height: '32px', color: '#fff' }} /></div>
                                            ) : (
                                                <img src={item.url} alt={item.title} style={styles.portfolioManagementImage} />
                                            )}
                                            <button type="button" onClick={() => removePortfolioItem(item.id)} style={styles.imageUploadRemoveBtn} aria-label={`Remove ${item.title}`}><XMarkIcon style={{ width: '16px', height: '16px' }} /></button>
                                            <input type="text" value={item.title} onChange={(e) => handlePortfolioTitleChange(item.id, e.target.value)} style={styles.portfolioManagementTitleInput} placeholder="Enter title..." />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </fieldset>

                        <fieldset style={styles.fieldset}><legend style={styles.legend}>General Capabilities</legend><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="productionVolume" style={styles.label}>Production Volume Capacity</label><select name="productionVolume" value={formData.productionVolume} onChange={handleInputChange} style={styles.input} required><option value="">Select volume...</option>{PRODUCTION_VOLUMES.map(v => <option key={v} value={v}>{v}</option>)}</select></div><div style={styles.formGroup}><label htmlFor="leadTimeRange" style={styles.label}>Typical Lead Time Range</label><input type="text" name="leadTimeRange" value={formData.leadTimeRange} onChange={handleInputChange} style={styles.input} required placeholder="e.g., 5-10 days" /></div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="moq" style={styles.label}>Minimum Order Quantity (MOQ)</label><input type="number" name="moq" value={formData.moq} onChange={handleInputChange} style={styles.input} required min="0" /></div><div style={styles.formGroup}><label htmlFor="otherCertifications" style={styles.label}>Other Certs (comma-separated)</label><input type="text" name="otherCertifications" value={formData.otherCertifications} onChange={handleInputChange} style={styles.input} /></div></div><CheckboxGroup title="Certifications" options={CERTIFICATIONS} selected={formData.certifications || []} onChange={(v) => handleCheckboxGroupChange('certifications', v)} /><div style={styles.formGroup}><label htmlFor="qualityControlProcesses" style={styles.label}>Quality Control Processes</label><textarea name="qualityControlProcesses" value={formData.qualityControlProcesses} onChange={handleInputChange} style={styles.input} rows={3}></textarea></div><div style={styles.formGroup}><label htmlFor="materialTesting" style={styles.label}>Material Testing / Inspection Equipment</label><textarea name="materialTesting" value={formData.materialTesting} onChange={handleInputChange} style={styles.input} rows={3}></textarea></div></fieldset>
                        <fieldset style={styles.fieldset}><legend style={styles.legend}>Manufacturing Processes Supported</legend>{ALL_CAPABILITIES_GROUPS.map(group => <CheckboxGroup key={group.title} title={group.title} options={group.processes} selected={formData[group.title.toLowerCase().replace(/ & /g, 'and').replace(/ /g, '')] || []} onChange={(v) => handleCheckboxGroupChange(group.title.toLowerCase().replace(/ & /g, 'and').replace(/ /g, ''), v)} />)}</fieldset>
                        <fieldset style={styles.fieldset}><legend style={styles.legend}>Material Capabilities</legend><CheckboxGroup title="Metals" options={MATERIALS_METALS} selected={formData.supportedMaterials || []} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Plastics" options={MATERIALS_PLASTICS} selected={formData.supportedMaterials || []} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Composites" options={MATERIALS_COMPOSITES} selected={formData.supportedMaterials || []} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Others" options={MATERIALS_OTHERS} selected={formData.supportedMaterials || []} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /></fieldset>
                        <div style={{ marginTop: '24px' }}><CtaButton text={loading ? "Saving..." : "Save Changes"} primary type="submit" disabled={loading} /></div>
                    </form>
                </div>

                {/* Preview Column */}
                {isPreviewMode && (
                    <div style={{ 
                        borderLeft: `1px solid ${border_color}`, 
                        paddingLeft: '32px',
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto',
                        position: 'sticky',
                        top: '0'
                    }}>
                        <div style={{ 
                            marginBottom: '16px', 
                            padding: '12px', 
                            backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)', 
                            border: `1px solid ${neon_cyan}`,
                            borderRadius: '8px',
                            color: neon_cyan,
                            fontSize: '14px',
                            fontWeight: 600,
                            textAlign: 'center'
                        }}>
                            LIVE PUBLIC PREVIEW
                        </div>
                        <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center', pointerEvents: 'none' }}>
                            <ManufacturerProfileView manufacturer={previewData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const QuoteRequestModal = ({ request, onClose, onSubmit }) => {
    const [quoteData, setQuoteData] = useState({ price: '', leadTime: '', notes: '' });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuoteData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(request.designId, quoteData);
        setLoading(false);
        onClose();
    };

    return (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Quote Request: {request.designName}</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}><XMarkIcon style={{ width: '24px', height: '24px' }} /></button>
                </div>
                <div style={styles.modalBody}>
                    <div style={styles.quoteDetailsGrid}>
                        <div><p style={styles.quoteDetailLabel}>Customer</p><p style={styles.quoteDetailValue}>{request.customer}</p></div>
                        <div><p style={styles.quoteDetailLabel}>Material</p><p style={styles.quoteDetailValue}>{request.material}</p></div>
                        <div><p style={styles.quoteDetailLabel}>Quantity</p><p style={styles.quoteDetailValue}>{request.quantity}</p></div>
                        <div><p style={styles.quoteDetailLabel}>Surface Finish</p><p style={styles.quoteDetailValue}>{request.surfaceFinish}</p></div>
                    </div>
                    <div style={{ borderTop: `1px solid var(--border-color)`, margin: '16px 0' }}></div>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label htmlFor="price" style={styles.label}>Your Price (USD)</label>
                                <input type="number" name="price" value={quoteData.price} onChange={handleInputChange} style={styles.input} required placeholder="e.g., 150.75" />
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="leadTime" style={styles.label}>Lead Time (business days)</label>
                                <input type="number" name="leadTime" value={quoteData.leadTime} onChange={handleInputChange} style={styles.input} required placeholder="e.g., 10" />
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label htmlFor="notes" style={styles.label}>Notes (optional)</label>
                            <textarea name="notes" value={quoteData.notes} onChange={handleInputChange} style={styles.input} rows={3} placeholder="Add any notes for the customer..."></textarea>
                        </div>
                        <div style={styles.modalFooter}>
                            <CtaButton text="Cancel" onClick={onClose} />
                            <CtaButton text={loading ? "Submitting..." : "Submit Quote"} primary type="submit" disabled={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Reusable Cost Breakdown Content Component
export const CostBreakdownContent = ({ breakdown, request, formatPrice }) => {
    if (!breakdown) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Detailed cost breakdown not available for this quote.</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>Total Price: <strong style={{ color: 'var(--neon-cyan)', fontSize: '20px' }}>{formatPrice(request.price)}</strong></p>
            </div>
        );
    }

    const {
        unit_price, final_price, material_cost_per_unit, labor_cost_per_unit,
        applied_hourly_rate, finishing_cost_per_unit, setup_fee, packaging_fee,
        logistics_estimate, lead_time_estimate, ai_process_selected, ai_reasoning,
        machine_selected, process_flow, material_yield, feature_sequences,
        breakdown: summary_text, terms_validity, terms_payment
    } = breakdown;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header Summary Table */}
            <div style={{ background: 'linear-gradient(135deg, rgba(var(--neon-cyan-rgb), 0.1), rgba(var(--neon-magenta-rgb), 0.05))', borderRadius: '12px', border: '1px solid rgba(var(--neon-cyan-rgb), 0.3)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '16px 24px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', borderBottom: '1px solid rgba(var(--neon-cyan-rgb), 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DocumentTextIcon style={{ width: '20px', height: '20px' }} />
                        Comprehensive Quote Summary
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>Ref: {request.id || request.designId || 'N/A'}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(var(--neon-cyan-rgb), 0.2)', background: 'rgba(var(--neon-cyan-rgb), 0.05)' }}>
                            <th style={{ padding: '12px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--neon-cyan)', width: '25%' }}>Total Project Estimate</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--neon-cyan)', width: '25%' }}>Estimated Unit Price</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--neon-cyan)', width: '25%' }}>Production Volume</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--neon-cyan)', width: '25%' }}>Estimated Lead Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '20px 24px', fontSize: '28px', fontWeight: '800', color: 'var(--neon-cyan)' }}>{formatPrice(final_price || request.price)}</td>
                            <td style={{ padding: '20px 24px', fontSize: '24px', fontWeight: '600', color: '#fff' }}>{formatPrice(unit_price)}</td>
                            <td style={{ padding: '20px 24px', fontSize: '20px', color: 'var(--text-primary)' }}>{request.quantity} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>units</span></td>
                            <td style={{ padding: '20px 24px', fontSize: '20px', color: 'var(--neon-magenta)', fontWeight: '600' }}>{lead_time_estimate || request.leadTime || '5-7 days'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                {/* Detailed Cost Breakdown Table */}
                <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChartPieIcon style={{ width: '18px', height: '18px' }} color="var(--neon-magenta)" />
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Components Analysis</h4>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', flexGrow: 1 }}>
                        <tbody>
                            {(() => {
                                let components = [
                                    { label: 'Material Cost (per unit)', value: material_cost_per_unit, extra: material_yield ? `Calculated Yield: ${material_yield}` : null, icon: <CubeIcon style={{ width: '14px', height: '14px' }} /> },
                                    { label: 'Labor & Machining', value: labor_cost_per_unit, extra: applied_hourly_rate ? `Applied Rate: ${applied_hourly_rate}` : null, icon: <WrenchScrewdriverIcon style={{ width: '14px', height: '14px' }} /> },
                                    { label: 'Finishing & Treatments', value: finishing_cost_per_unit, icon: <SparklesIcon style={{ width: '14px', height: '14px' }} /> },
                                    { label: 'Setup & Programming', value: setup_fee, icon: <CodeBracketIcon style={{ width: '14px', height: '14px' }} /> },
                                    { label: 'Packaging & Handling', value: packaging_fee, icon: <ArchiveBoxIcon style={{ width: '14px', height: '14px' }} /> },
                                    { label: 'Logistics & Shipping', value: logistics_estimate, icon: <LocationMarkerIcon style={{ width: '14px', height: '14px' }} /> }
                                ];

                                // FBM AI Engine output parser (comma-separated string includes Overhead, Margin, Machining, etc.)
                                if (summary_text && summary_text.includes('Mat:') && summary_text.includes(',')) {
                                    const pairs = summary_text.split(',').map(p => p.trim());
                                    // Ensure it's the actual cost breakdown string before overriding
                                    if (pairs.length > 3 && pairs.some(p => p.includes('Lab:') || p.includes('Mach:'))) {
                                        components = pairs.map(pair => {
                                            const [k, v] = pair.split(/[:\t\s]+/).reduce((acc, curr, i) => i === 0 ? [curr, ''] : [acc[0], (acc[1] + ' ' + curr).trim()], ['', '']);
                                            let icon = <DocumentTextIcon style={{ width: '14px', height: '14px' }} />;
                                            let label = k;
                                            let extra = null;

                                            const keyLower = k.toLowerCase();
                                            if (keyLower.includes('mat')) { icon = <CubeIcon style={{ width: '14px', height: '14px' }} />; label = 'Material Cost'; extra = material_yield ? `Yield: ${material_yield}` : null; }
                                            else if (keyLower.includes('lab')) { icon = <WrenchScrewdriverIcon size={14} />; label = 'Labor Cost'; extra = applied_hourly_rate ? `Rate: ${applied_hourly_rate}` : null; }
                                            else if (keyLower.includes('mach')) { icon = <LightningBoltIcon style={{ width: '14px', height: '14px' }} />; label = 'Machining Cost'; }
                                            else if (keyLower.includes('setup')) { icon = <CodeBracketIcon style={{ width: '14px', height: '14px' }} />; label = 'Setup & Programming'; }
                                            else if (keyLower.includes('pkg') || keyLower.includes('log')) { icon = <LocationMarkerIcon style={{ width: '14px', height: '14px' }} />; label = 'Packaging & Logistics'; }
                                            else if (keyLower.includes('risk') || keyLower.includes('margin')) { icon = <DollarSignIcon style={{ width: '14px', height: '14px' }} />; label = 'Risk & Profit Margin'; }
                                            else if (keyLower.includes('overhead')) { icon = <BuildingOfficeIcon size={14} />; label = 'Facility Overhead'; }
                                            else if (keyLower.includes('urgency')) { icon = <DocumentTextIcon style={{ width: '14px', height: '14px' }} />; label = 'Urgency Premium'; }

                                            return { label, value: v, icon, extra };
                                        });
                                    }
                                }

                                return components.map((item, i) => item.value ? (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{item.icon}</span>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</div>
                                                    {item.extra && <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', marginTop: '4px' }}>{item.extra}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '16px', fontWeight: '600', textAlign: 'right', color: 'var(--text-primary)' }}>
                                            {formatPrice(item.value)}
                                        </td>
                                        </tr>
                                        ) : null);
                                        })()}
                                        </tbody>
                                        </table>                    {/* Dedicated Totals Calculation Table */}
                    <div style={{ borderTop: '2px solid var(--neon-cyan)', background: 'rgba(var(--neon-cyan-rgb), 0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Unit Subtotal</td>
                                    <td style={{ padding: '16px 20px', fontSize: '18px', fontWeight: '600', textAlign: 'right', color: 'var(--text-primary)' }}>{formatPrice(unit_price)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(var(--neon-cyan-rgb), 0.2)' }}>
                                    <td style={{ padding: '12px 20px 16px 20px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}><XMarkIcon style={{ width: '14px', height: '14px' }} color="var(--neon-cyan)" /> Production Volume</td>
                                    <td style={{ padding: '12px 20px 16px 20px', fontSize: '16px', fontWeight: '600', textAlign: 'right', color: 'var(--text-primary)' }}>{request.quantity} units</td>
                                </tr>
                                <tr style={{ background: 'rgba(var(--neon-cyan-rgb), 0.1)' }}>
                                    <td style={{ padding: '20px', fontSize: '16px', color: 'var(--neon-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>Final Quote Total</td>
                                    <td style={{ padding: '20px', fontSize: '24px', fontWeight: '800', textAlign: 'right', color: 'var(--neon-cyan)' }}>{formatPrice(final_price || request.price)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* AI Manufacturing Intelligence */}
                    <div style={{ backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.05)', borderRadius: '12px', border: '1px solid rgba(var(--neon-cyan-rgb), 0.2)', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ background: 'rgba(var(--neon-cyan-rgb), 0.2)', padding: '8px', borderRadius: '8px' }}>
                                <LightningBoltIcon style={{ width: '20px', height: '20px' }} color="var(--neon-cyan)" />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--neon-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Process Intelligence</h4>
                        </div>
                        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid var(--neon-cyan)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Recommended Manufacturing Process</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{machine_selected || ai_process_selected || 'Standard Machining'}</div>
                        </div>
                        {ai_reasoning && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Technical Reasoning</div>
                                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>{ai_reasoning}</p>
                            </div>
                        )}
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>FBM Confidence Score</span>
                                <span style={{ color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 700 }}>94%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '94%', height: '100%', background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary Table */}
                    {summary_text && (
                        <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <DocumentTextIcon style={{ width: '18px', height: '18px' }} color="var(--text-secondary)" />
                                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Executive Summary & Technical Overview</h4>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {(() => {
                                    // Intelligent Parser for unstructured summary data
                                    const lines = summary_text.split('\n').filter(l => l.trim());

                                    // Detect if it's a comma-separated list of metrics (common in AI output)
                                    if (lines.length === 1 && summary_text.includes(',') && (summary_text.includes(':') || summary_text.includes('\t'))) {
                                        const pairs = summary_text.split(',').map(p => p.trim());
                                        return (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                                {pairs.map((pair, idx) => {
                                                    const [k, v] = pair.split(/[:\t\s]+/).reduce((acc, curr, i) => i === 0 ? [curr, ''] : [acc[0], (acc[1] + ' ' + curr).trim()], ['', '']);
                                                    // Detect if value is numeric or currency to format it
                                                    const isNumeric = !isNaN(parseFloat(v.replace(/[^0-9.-]/g, '')));
                                                    return (
                                                        <div key={idx} style={{ background: 'var(--bg-panel)', padding: '12px 16px' }}>
                                                            <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>{k || 'Metric'}</div>
                                                            <div style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>{isNumeric ? formatPrice(v) : v}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }

                                    // Otherwise, render as a structured key-value table
                                    return (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <tbody>
                                                {lines.map((line, i) => {
                                                    const parts = line.split(':');
                                                    const isKeyValue = parts.length > 1 && parts[0].length < 45;

                                                    return (
                                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                                            {isKeyValue ? (
                                                                <>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--neon-cyan)', fontWeight: 600, width: '30%', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        {parts[0].trim().replace(/^[-•]\s*/, '')}
                                                                    </td>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                                                        {parts.slice(1).join(':').trim()}
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <td colSpan={2} style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                                        <span style={{ color: 'var(--neon-cyan)' }}>•</span>
                                                                        <span>{line.trim().replace(/^[-•]\s*/, '')}</span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* End-to-End Operational Flowchart */}
            {process_flow && (
                <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BuildingOfficeIcon size={18} color="var(--neon-cyan)" />
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End-to-End Operational Flowchart</h4>
                    </div>

                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {(() => {
                                try {
                                    const flow = typeof process_flow === 'string' ? JSON.parse(process_flow) : process_flow;
                                    return flow.map((step, idx) => (
                                        <div key={idx} style={{ display: 'flex', position: 'relative' }}>
                                            {/* Timeline Line */}
                                            {idx !== flow.length - 1 && (
                                                <div style={{ position: 'absolute', left: '23px', top: '40px', bottom: '-10px', width: '2px', background: 'rgba(var(--neon-cyan-rgb), 0.3)' }}></div>
                                            )}

                                            {/* Step Number Circle */}
                                            <div style={{ width: '48px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(var(--neon-cyan-rgb), 0.1)', border: '2px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '14px', zIndex: 2, backgroundColor: 'var(--bg-panel)' }}>
                                                    {idx + 1}
                                                </div>
                                            </div>

                                            {/* Step Content */}
                                            <div style={{ flexGrow: 1, paddingBottom: idx === flow.length - 1 ? '0' : '32px', paddingLeft: '16px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'center', transition: 'transform 0.2s' }}>
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Operation</div>
                                                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{step.step}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Tooling / Resource</div>
                                                        <div style={{ fontSize: '14px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}><NutIcon style={{ width: '14px', height: '14px' }} color="var(--text-secondary)" /> {step.tool || 'Standard'}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Est. Time & Cost</div>
                                                        <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{step.time}</div>
                                                        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--neon-cyan)', marginTop: '2px' }}>{step.cost}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                } catch (e) {
                                    return <div style={{ padding: '16px', fontSize: '14px', textAlign: 'center', color: 'var(--text-secondary)' }}>Detailed operational flowchart unavailable. Please check the raw data format.</div>;
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Manufacturing Sequences */}
            {feature_sequences && (
                <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CircleDotIcon style={{ width: '18px', height: '18px' }} color="var(--neon-magenta)" />
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feature-Specific Manufacturing Sequences</h4>
                    </div>
                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {(() => {
                            try {
                                const sequences = typeof feature_sequences === 'string' ? JSON.parse(feature_sequences) : feature_sequences;
                                return Object.entries(sequences).map(([feature, sequence], idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(var(--neon-magenta-rgb), 0.03)', borderRadius: '8px', borderLeft: '4px solid var(--neon-magenta)', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><CylinderIcon style={{ width: '14px', height: '14px' }} color="var(--neon-magenta)" /> {feature}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{sequence as string}</p>
                                    </div>
                                ));
                            } catch (e) {
                                return null;
                            }
                        })()}
                    </div>
                </div>
            )}

            {/* Commercial Terms */}
            {(terms_validity || terms_payment) && (
                <div style={{ display: 'flex', gap: '24px', padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheckIcon style={{ width: '20px', height: '20px' }} color="var(--text-secondary)" />
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Quote Validity</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{terms_validity || '30 Days'}</div>
                        </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <DollarSignIcon style={{ width: '20px', height: '20px' }} color="var(--text-secondary)" />
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Payment Terms</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{terms_payment || 'Net 30'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Updated Cost Breakdown Modal
export const CostBreakdownModal = ({ request, onClose }) => {
    const parseBreakdown = (notes) => {
        if (!notes) return null;
        try {
            const jsonStart = notes.indexOf('{');
            const jsonEnd = notes.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) return null;
            const jsonStr = notes.substring(jsonStart, jsonEnd + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                const fixedJson = jsonStr
                    .replace(/'/g, '"')
                    .replace(/None/g, 'null')
                    .replace(/True/g, 'true')
                    .replace(/False/g, 'false');
                return JSON.parse(fixedJson);
            }
        } catch (e) {
            return null;
        }
    };

    const breakdown = parseBreakdown(request.notes);
    const { formatPrice } = useCurrency();

    return (
        <div style={{ ...styles.modalBackdrop }}>
            <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
                <div style={styles.modalHeader}>
                    <h2 style={{ margin: 0, color: 'var(--neon-cyan)' }}>Cost Breakdown</h2>
                    <button onClick={onClose} style={styles.modalCloseButton}>✕</button>
                </div>

                <div style={{ padding: '24px' }}>
                    <CostBreakdownContent breakdown={breakdown} request={request} formatPrice={formatPrice} />
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <CtaButton text="Close" onClick={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3D Part Thumbnail Component ---
export const DesignThumbnail = ({ modelUrl, thumbnailUrl, designId, designName }: { modelUrl?: string | null, thumbnailUrl?: string | null, designId: string, designName: string }) => {
    const [actualUrl, setActualUrl] = useState<string | null>(modelUrl || null);
    const [actualThumbUrl, setActualThumbUrl] = useState<string | null>(thumbnailUrl || null);
    const [loading, setLoading] = useState(!modelUrl && !thumbnailUrl);
    const [isHovered, setIsHovered] = useState(false);
    const isCapturing = useRef(false);

    useEffect(() => {
        if (modelUrl && thumbnailUrl) {
            setActualUrl(resolveMediaUrl(modelUrl));
            setActualThumbUrl(resolveMediaUrl(thumbnailUrl));
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchUrl = async () => {
            try {
                console.log(`[DesignThumbnail] Fetching details for ${designId}...`);
                const design = await api.getDesignById(designId);
                if (isMounted && design) {
                    const viewUrl = design.view_url || (['stl', 'obj', 'glb', 'gltf'].includes(design.s3_file_key?.split('.').pop()?.toLowerCase()) ? design.s3_file_key : null);
                    setActualUrl(resolveMediaUrl(viewUrl));
                    setActualThumbUrl(resolveMediaUrl(design.thumbnail_url));
                }
            } catch (err) {
                console.error(`[DesignThumbnail] Failed to fetch design ${designId}:`, err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchUrl();

        return () => { isMounted = false; };
    }, [modelUrl, thumbnailUrl, designId]);

    const handleLoadComplete = async () => {
        if (actualThumbUrl || isCapturing.current) return;
        isCapturing.current = true;
        console.log(`[DesignThumbnail] 📸 Triggering thumbnail capture for ${designId}...`);
        try {
            const wrapper = document.getElementById(`thumb-wrapper-${designId}`);
            if (!wrapper) {
                console.error(`[DesignThumbnail] Wrapper not found for ${designId}`);
                return;
            }
            const canvas = wrapper.querySelector('canvas');
            if (!canvas) {
                console.error(`[DesignThumbnail] Canvas not found for ${designId}`);
                return;
            }

            // Enhanced Logging
            console.log(`[DesignThumbnail] Canvas found, capture starting... Size: ${canvas.width}x${canvas.height}`);
            const dataUrl = canvas.toDataURL('image/png');
            console.log(`[DesignThumbnail] DataURL generated, length: ${dataUrl.length}`);
            
            if (dataUrl.length < 1000) {
                console.warn(`[DesignThumbnail] DataURL seems very short (${dataUrl.length} chars). Thumbnail might be blank.`);
            }
            
            const blob = await (await fetch(dataUrl)).blob();
            const fileName = `thumb_${designId}.png`;

            console.log(`[DesignThumbnail] Getting upload URL for ${fileName}...`);
            const uploadRes = await api.getUploadUrl(fileName, 'image/png');
            const targetUploadUrl = uploadRes.uploadUrl || uploadRes.upload_url;
            const targetS3Key = uploadRes.s3Key || uploadRes.s3_file_key;

            if (!targetUploadUrl || !targetS3Key) {
                console.error('[DesignThumbnail] Invalid upload response: missing uploadUrl or s3Key', uploadRes);
                throw new Error('Failed to get valid upload URL from server');
            }

            console.log(`[DesignThumbnail] Uploading to S3/Local: ${targetS3Key}`);
            await api.uploadFileToS3(targetUploadUrl, new File([blob], fileName, { type: 'image/png' }));

            console.log(`[DesignThumbnail] Updating backend with key: ${targetS3Key}`);
            await api.updateDesignThumbnail(designId, targetS3Key);
            
            // Re-fetch the design to get the proper presigned URL from the backend
            const updatedDesign = await api.getDesignById(designId);
            if (updatedDesign && updatedDesign.thumbnail_url) {
                const finalUrl = resolveMediaUrl(updatedDesign.thumbnail_url);
                setActualThumbUrl(finalUrl);
                console.log(`[DesignThumbnail] ✅ Thumbnail successfully generated and set: ${finalUrl}`);
            }
        } catch (e) {
            console.error('[DesignThumbnail] ❌ Failed to auto-generate thumbnail', e);
        } finally {
            isCapturing.current = false;
        }
    };

    if (loading) {
        return (
            <div style={{
                width: '64px', height: '64px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', border: `1px solid ${border_color}`
            }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--neon-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    const fileExtension = actualUrl?.split('.').pop()?.split('?')[0]?.toLowerCase() || 'stl';

    return (
        <div 
            id={`thumb-wrapper-${designId}`}
            style={{
                width: '64px', height: '64px', borderRadius: '8px',
                background: '#0a0a0f', overflow: 'hidden', position: 'relative',
                border: `1px solid ${border_color}`, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Hover to rotate 3D Model"
        >
            {/* 1. Show Image if we have it and not hovered */}
            {actualThumbUrl && !isHovered && (
                <img src={actualThumbUrl} alt={designName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
            
            {/* 2. Show CubeIcon if we don't have image and not hovered, OR if hovered but no 3D model */}
            {((!actualThumbUrl && !isHovered) || (isHovered && !actualUrl)) && (
                <CubeIcon style={{ width: '24px', height: '24px', zIndex: 1 }} color="var(--neon-cyan)" />
            )}

            {/* 3. Render the Viewer if hovered (visible) OR if we need to generate thumbnail (invisible) */}
            {(isHovered || (!actualThumbUrl && actualUrl)) && actualUrl && (
                <div style={{ 
                    width: '100%', height: '100%', 
                    opacity: isHovered ? 1 : 0, 
                    position: isHovered ? 'relative' : 'absolute', 
                    pointerEvents: isHovered ? 'auto' : 'none', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                    <ErrorBoundary
                        fallback={(error) => {
                            console.error(`[DesignThumbnail] 💥 Error rendering ${designName}:`, error);
                            return <CubeIcon style={{ width: '24px', height: '24px' }} color="red" />;
                        }}
                    >
                        <Viewer
                            modelUrl={actualUrl}
                            fileExtension={fileExtension as any}
                            view={ViewPreset.ISO}
                            isViewLocked={true}
                            hideToolbar={true}
                            lowQuality={true}
                            design={{ design_name: designName } as any}
                            onUserInteraction={() => {}}
                            onLoadComplete={handleLoadComplete}
                        />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    );
};
export const QuoteRequestsPage = () => {
    const { openViewer: onViewFiles } = useFileViewer();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, request: null });
    const [breakdownModalInfo, setBreakdownModalInfo] = useState({ isOpen: false, request: null });
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { formatPrice } = useCurrency();

    const parseBreakdown = (notes) => {
        if (!notes) return null;
        try {
            const jsonStart = notes.indexOf('{');
            const jsonEnd = notes.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) return null;
            const jsonStr = notes.substring(jsonStart, jsonEnd + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                const fixedJson = jsonStr.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
                return JSON.parse(fixedJson);
            }
        } catch (e) { return null; }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.getQuoteRequests();
            console.log('[QuoteRequestsPage] Raw API Data:', data);
            const mappedData = data
                .filter(quote => !quote.is_internal)
                .map(quote => ({
                id: quote.id,
                designId: quote.design,
                designName: quote.design_name || 'Unnamed Part',
                designViewUrl: resolveMediaUrl((quote as any).design_view_url),
                designThumbnailUrl: resolveMediaUrl((quote as any).design_thumbnail_url),
                customer: quote.customer_name || quote.customer_email || 'Unknown',
                material: quote.design_material || 'N/A',
                quantity: quote.design_quantity || 0,
                dateReceived: quote.created_at,
                status: quote.status === 'pending' ? 'Pending' : (quote.status === 'rejected' ? 'Declined' : 'Quoted'),
                price: quote.price_usd,
                leadTime: quote.estimated_lead_time_days,
                notes: quote.notes || '',
            }));
            setRequests(mappedData);
        } catch (err) {
            setError('Failed to load quote requests.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (request) => {
        setModalInfo({ isOpen: true, request: request });
    };

    const handleCloseModal = () => {
        setModalInfo({ isOpen: false, request: null });
    };

    const handleQuoteSubmit = async (designId, quoteData) => {
        await api.submitQuote(designId, quoteData);
        setNotification({ show: true, message: `Quote for ${modalInfo.request.designName} submitted successfully!`, type: 'success' });
        // Refresh the list to show updated status
        const updatedRequests = requests.map(r => r.id === modalInfo.request.id ? { ...r, status: 'Quoted' } : r);
        setRequests(updatedRequests);
    };

    const handleDecline = async (request) => {
        // Using confirm for simplicity. A custom modal would be better for UX.
        if (window.confirm(`Are you sure you want to decline the quote for "${request.designName}"?`)) {
            try {
                await api.declineQuoteRequest(request.id);
                setNotification({ show: true, message: `Request for ${request.designName} declined.`, type: 'success' });
                const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: 'Declined' } : r);
                setRequests(updatedRequests);
            } catch (err) {
                setNotification({ show: true, message: `Error declining request: ${err.message}`, type: 'error' });
            }
        }
    };

    const handleOpenBreakdownModal = (request) => {
        setBreakdownModalInfo({ isOpen: true, request: request });
    };

    const handleCloseBreakdownModal = () => {
        setBreakdownModalInfo({ isOpen: false, request: null });
    };

    const getStatusStyle = (status) => {
        const baseStyle = { ...styles.statusBadge };
        switch (status) {
            case 'Pending': return { ...baseStyle, color: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' };
            case 'Quoted': return { ...baseStyle, color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' };
            case 'Declined': return { ...baseStyle, color: 'var(--status-error)', backgroundColor: 'rgba(var(--status-error-rgb), 0.1)', border: '1px solid rgba(var(--status-error-rgb), 0.3)' };
            default: return { ...baseStyle, color: 'var(--text-secondary)', backgroundColor: 'rgba(var(--text-secondary), 0.1)', border: '1px solid rgba(var(--text-secondary), 0.2)' };
        }
    };

    const { items: sortedRequests, requestSort, sortConfig } = useSortableData(requests, null, ['Pending', 'Quoted', 'Declined']);

    if (loading) return <div>Loading requests...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>Quote Requests</h2>
            <p style={styles.dashboardPageSubtitle}>Review and respond to quote requests from customers.</p>
            
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <CtaButton
                    text="Engineering Smart View Workspace"
                    primary
                    onClick={() => {
                        const requestWithDesign = requests.find(r => r.designId);
                        if (requestWithDesign && requestWithDesign.designId) {
                            navigate(`/smart-view/${requestWithDesign.designId}`);
                        } else {
                            alert("No active requests to view in workspace.");
                        }
                    }}
                />
            </div>

            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <div className="table-responsive-container">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Part</th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('designName')}>
                                Part Name <SortIcon sortConfig={sortConfig} columnKey="designName" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('customer')}>
                                Customer <SortIcon sortConfig={sortConfig} columnKey="customer" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('material')}>
                                Material <SortIcon sortConfig={sortConfig} columnKey="material" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('quantity')}>
                                Qty <SortIcon sortConfig={sortConfig} columnKey="quantity" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('dateReceived')}>
                                Date Received <SortIcon sortConfig={sortConfig} columnKey="dateReceived" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('status')}>
                                Status <SortIcon sortConfig={sortConfig} columnKey="status" />
                            </th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRequests.map(req => (
                            <React.Fragment key={req.id}>
                                <tr>
                                    <td style={styles.tableCell}>
                                        <DesignThumbnail 
                                            modelUrl={(req as any).designViewUrl} 
                                            thumbnailUrl={(req as any).designThumbnailUrl}
                                            designId={req.designId} 
                                            designName={req.designName} 
                                        />
                                    </td>
                                    <td style={styles.tableCell}>{req.designName}</td>
                                    <td style={styles.tableCell}>{req.customer}</td>
                                    <td style={styles.tableCell}>{req.material}</td>
                                    <td style={styles.tableCell}>{req.quantity}</td>
                                    <td style={styles.tableCell}>{new Date(req.dateReceived).toLocaleDateString()}</td>
                                    <td style={styles.tableCell}><span style={getStatusStyle(req.status)}>{req.status}</span></td>
                                    <td style={styles.tableCell}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <CtaButton text="View Files" onClick={() => onViewFiles(req.designId)} className="button-small" />
                                            <CtaButton
                                                text={expandedRequestId === req.id ? "Hide Details" : "View Details"}
                                                onClick={() => setExpandedRequestId(expandedRequestId === req.id ? null : req.id)}
                                                className="button-small"
                                            />
                                            {req.status === 'Pending' ? (
                                                <>
                                                    <CtaButton text="Quote" primary onClick={() => handleOpenModal(req)} className="button-small" />
                                                    <CtaButton text="Decline" onClick={() => handleDecline(req)} className="button-small-danger" />
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Completed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedRequestId === req.id && (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '0 16px 24px 16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '24px',
                                                backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)',
                                                borderRadius: '0 0 12px 12px',
                                                border: '1px solid rgba(var(--neon-cyan-rgb), 0.2)',
                                                borderTop: 'none'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <h4 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '14px', textTransform: 'uppercase' }}>In-Depth Analysis</h4>
                                                    <CtaButton text="Open in Popup" className="button-small" onClick={() => handleOpenBreakdownModal(req)} />
                                                </div>
                                                <CostBreakdownContent breakdown={parseBreakdown(req.notes)} request={req} formatPrice={formatPrice} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalInfo.isOpen && <QuoteRequestModal request={modalInfo.request} onClose={handleCloseModal} onSubmit={handleQuoteSubmit} />}
            {breakdownModalInfo.isOpen && <CostBreakdownModal request={breakdownModalInfo.request} onClose={handleCloseBreakdownModal} />}
        </div>
    );
};

export const UpdateOrderModal = ({ order, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        status: order.status || '',
        trackingNumber: order.trackingNumber || '',
        shippingCarrier: order.shippingCarrier || '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onUpdate(order.id, formData);
        setLoading(false);
        onClose();
    };

    const isShipped = formData.status === 'Shipped' || formData.status === 'Delivered';

    return (
        <div style={styles.modalBackdrop}>
            <div style={{ ...styles.modalContent, maxWidth: '700px' }}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Manage Order: {order.designName} ({order.id})</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}><XMarkIcon style={{ width: '24px', height: '24px' }} /></button>
                </div>
                <div style={styles.modalBody}>
                    <div style={styles.quoteDetailsGrid}>
                        <div><p style={styles.quoteDetailLabel}>Customer</p><p style={styles.quoteDetailValue}>{order.customer}</p></div>
                        <div><p style={styles.quoteDetailLabel}>Order Date</p><p style={styles.quoteDetailValue}>{new Date(order.dateCreated).toLocaleDateString()}</p></div>
                        <div><p style={styles.quoteDetailLabel}>Quantity</p><p style={styles.quoteDetailValue}>{order.quantity}</p></div>
                        <div><p style={styles.quoteDetailLabel}>Price</p><p style={styles.quoteDetailValue}>{formatPrice(order.quotePrice)}</p></div>
                    </div>
                    <div style={{ borderTop: `1px solid var(--border-color)`, margin: '16px 0' }}></div>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label htmlFor="status" style={styles.label}>Order Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleInputChange} style={styles.input} required>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {isShipped && (
                            <div style={{ ...styles.formRow, marginTop: '20px' }}>
                                <div style={styles.formGroup}>
                                    <label htmlFor="trackingNumber" style={styles.label}>Tracking Number</label>
                                    <input type="text" name="trackingNumber" value={formData.trackingNumber} onChange={handleInputChange} style={styles.input} placeholder="e.g., 1Z..." />
                                </div>
                                <div style={styles.formGroup}>
                                    <label htmlFor="shippingCarrier" style={styles.label}>Shipping Carrier</label>
                                    <input type="text" name="shippingCarrier" value={formData.shippingCarrier} onChange={handleInputChange} style={styles.input} placeholder="e.g., UPS, FedEx" />
                                </div>
                            </div>
                        )}
                        <div style={styles.modalFooter}>
                            <CtaButton text="Cancel" onClick={onClose} />
                            <CtaButton text={loading ? "Saving..." : "Save Changes"} primary type="submit" disabled={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const ActiveOrdersPage = () => {
    const { openViewer: onViewFiles } = useFileViewer();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, order: null });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.getActiveOrders();
            setOrders(data as any[]);
        } catch (err) {
            setError('Failed to load active orders.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (order) => {
        setModalInfo({ isOpen: true, order: order });
    };

    const handleCloseModal = () => {
        setModalInfo({ isOpen: false, order: null });
    };

    const handleOrderUpdate = async (orderId, orderData) => {
        try {
            await api.updateOrder(orderId, orderData);
            setNotification({ show: true, message: `Order ${orderId} updated successfully!`, type: 'success' });
            // Refresh the list to show updated data
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, ...orderData } : o);
            setOrders(updatedOrders);
        } catch (err) {
            setNotification({ show: true, message: `Failed to update order: ${err.message}`, type: 'error' });
        }
    };

    const getStatusStyle = (status) => {
        const baseStyle = { ...styles.statusBadge };
        switch (status) {
            case 'Awaiting Production': return { ...baseStyle, color: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' };
            case 'In Production': return { ...baseStyle, color: '#60A5FA', backgroundColor: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' };
            case 'Shipped': return { ...baseStyle, color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' };
            case 'Delivered': return { ...baseStyle, color: '#86EFAC', backgroundColor: 'rgba(134, 239, 172, 0.1)', border: '1px solid rgba(134, 239, 172, 0.3)' };
            case 'Cancelled': return { ...baseStyle, color: 'var(--status-error)', backgroundColor: 'rgba(var(--status-error-rgb), 0.1)', border: '1px solid rgba(var(--status-error-rgb), 0.3)' };
            default: return { ...baseStyle, color: 'var(--text-secondary)', backgroundColor: 'rgba(var(--text-secondary), 0.1)', border: '1px solid rgba(var(--text-secondary), 0.2)' };
        }
    };

    const { items: sortedOrders, requestSort, sortConfig } = useSortableData(orders);

    const handleDownloadInvoice = (id) => {
        alert(`Generating invoice for Order #${String(id).substring(0, 8)}...`);
    };

    if (loading) return <div>Loading orders...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>Active Orders</h2>
            <p style={styles.dashboardPageSubtitle}>Manage orders that are in production or have been recently completed.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <div className="table-responsive-container">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Part</th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('id')}>
                                Order ID <SortIcon sortConfig={sortConfig} columnKey="id" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('designName')}>
                                Part Name <SortIcon sortConfig={sortConfig} columnKey="designName" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('customer')}>
                                Customer <SortIcon sortConfig={sortConfig} columnKey="customer" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('created_at')}>
                                Date <SortIcon sortConfig={sortConfig} columnKey="created_at" />
                            </th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Tracking</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedOrders.length > 0 ? sortedOrders.map((order: any) => (
                            <tr key={order.id}>
                                <td style={styles.tableCell}>
                                    <DesignThumbnail 
                                        modelUrl={resolveMediaUrl(order.design_info?.design_view_url)} 
                                        thumbnailUrl={resolveMediaUrl(order.design_info?.design_thumbnail_url)}
                                        designId={order.design_info?.id} 
                                        designName={order.design_info?.design_name} 
                                    />
                                </td>
                                <td style={styles.tableCell}>{order.id}</td>
                                <td style={styles.tableCell}>{order.design_info?.design_name || order.designName}</td>
                                <td style={styles.tableCell}>{order.customer_info?.company_name || order.customer}</td>
                                <td style={styles.tableCell}>{new Date(order.created_at || order.dateCreated).toLocaleDateString()}</td>
                                <td style={styles.tableCell}><span style={getStatusStyle(order.status)}>{order.status_display || order.status}</span></td>
                                <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{order.tracking_number || order.trackingNumber || 'N/A'}</td>
                                <td style={styles.tableCell}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <CtaButton text="Manage" primary onClick={() => handleOpenModal(order)} className="button-small" />
                                        <CtaButton text="View Files" onClick={() => onViewFiles(order.designId)} className="button-small" />
                                        <CtaButton text="Invoice" onClick={() => handleDownloadInvoice(order.id)} className="button-small">
                                            <DownloadIcon style={{ width: '14px', height: '14px' }} />
                                        </CtaButton>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={8} style={{ ...styles.tableCell, textAlign: 'center' }}>No active orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {modalInfo.isOpen && <UpdateOrderModal order={modalInfo.order} onClose={handleCloseModal} onUpdate={handleOrderUpdate} />}
        </div>
    );
};

export const InternalQuotationsPage = () => {
    const { openViewer: onViewFiles } = useFileViewer();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [breakdownModalInfo, setBreakdownModalInfo] = useState({ isOpen: false, request: null });
    const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { formatPrice } = useCurrency();

    const parseBreakdown = (notes) => {
        if (!notes) return null;
        try {
            const jsonStart = notes.indexOf('{');
            const jsonEnd = notes.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) return null;
            const jsonStr = notes.substring(jsonStart, jsonEnd + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                const fixedJson = jsonStr.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
                return JSON.parse(fixedJson);
            }
        } catch (e) { return null; }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.getQuoteRequests();
            console.log('[InternalQuotationsPage] Raw API Data:', data);
            const mappedData = data
                .filter(quote => quote.is_internal)
                .map(quote => ({
                    id: quote.id,
                    designId: quote.design,
                    designName: quote.design_name || 'Unnamed Part',
                    designViewUrl: resolveMediaUrl((quote as any).design_view_url),
                    designThumbnailUrl: resolveMediaUrl((quote as any).design_thumbnail_url),
                    material: quote.design_material || 'N/A',
                    quantity: quote.design_quantity || 0,
                    dateReceived: quote.created_at,
                    status: quote.status === 'pending' ? 'Pending' : 'Quoted',
                    price: quote.price_usd,
                    leadTime: quote.estimated_lead_time_days,
                    notes: quote.notes || '',
                }));
            setRequests(mappedData);
        } catch (err) {
            setError('Failed to load internal quotations.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenBreakdownModal = (request) => {
        setBreakdownModalInfo({ isOpen: true, request: request });
    };

    const handleCloseBreakdownModal = () => {
        setBreakdownModalInfo({ isOpen: false, request: null });
    };

    const { items: sortedRequests, requestSort, sortConfig } = useSortableData(requests);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this internal quotation?")) {
            try {
                await api.deleteQuote(id);
                setRequests(prev => prev.filter((r: any) => r.id !== id));
                setNotification({ show: true, message: 'Internal quotation deleted successfully.', type: 'success' });
            } catch (err) {
                setNotification({ show: true, message: 'Failed to delete internal quotation.', type: 'error' });
            }
        }
    };

    if (loading) return <div>Loading records...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h2 style={{...styles.dashboardPageTitle, marginBottom: '8px'}}>Internal Quotations</h2>
                    <p style={styles.dashboardPageSubtitle}>Assess parts and generate instant 14-point manufacturing quotes.</p>
                </div>
                <CtaButton text="Upload New Design" primary onClick={() => navigate('/upload-internal')} />
            </div>

            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}

            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <CtaButton
                    text="Engineering Smart View Workspace"
                    onClick={() => {
                        if (requests.length > 0 && requests[0].designId) {
                            navigate(`/smart-view/${requests[0].designId}`);
                        } else {
                            alert("No active internal designs to view in workspace.");
                        }
                    }}
                />
            </div>

            <div className="table-responsive-container">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Part</th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('designName')}>
                                Part Name <SortIcon sortConfig={sortConfig} columnKey="designName" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('material')}>
                                Material <SortIcon sortConfig={sortConfig} columnKey="material" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('quantity')}>
                                Qty <SortIcon sortConfig={sortConfig} columnKey="quantity" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('dateReceived')}>
                                Date Uploaded <SortIcon sortConfig={sortConfig} columnKey="dateReceived" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('price')}>
                                Cost Estimate <SortIcon sortConfig={sortConfig} columnKey="price" />
                            </th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRequests.length > 0 ? sortedRequests.map((req: any) => (
                            <React.Fragment key={req.id}>
                                <tr>
                                    <td style={styles.tableCell}>
                                        <DesignThumbnail 
                                            modelUrl={(req as any).designViewUrl} 
                                            thumbnailUrl={(req as any).designThumbnailUrl}
                                            designId={req.designId} 
                                            designName={req.designName} 
                                        />
                                    </td>
                                    <td style={styles.tableCell}>{req.designName}</td>
                                    <td style={styles.tableCell}>{req.material}</td>
                                    <td style={styles.tableCell}>{req.quantity}</td>
                                    <td style={styles.tableCell}>{new Date(req.dateReceived).toLocaleDateString()}</td>
                                    <td style={styles.tableCell}><strong style={{color: 'var(--neon-cyan)', fontSize: '16px'}}>${req.price}</strong></td>
                                    <td style={styles.tableCell}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <CtaButton
                                                text={expandedRequestId === req.id ? "Hide Analysis" : "View Analysis"}
                                                onClick={() => setExpandedRequestId(expandedRequestId === req.id ? null : req.id)}
                                                className="button-small"
                                            />
                                            <CtaButton text="View Files" onClick={() => onViewFiles(req.designId)} className="button-small" />
                                            <CtaButton text="Delete" onClick={() => handleDelete(req.id)} className="button-small-danger" />
                                        </div>
                                    </td>
                                </tr>
                                {expandedRequestId === req.id && (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '0 16px 24px 16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '24px',
                                                backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)',
                                                borderRadius: '0 0 12px 12px',
                                                border: '1px solid rgba(var(--neon-magenta-rgb), 0.2)',
                                                borderTop: 'none'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <h4 style={{ margin: 0, color: 'var(--neon-magenta)', fontSize: '14px', textTransform: 'uppercase' }}>FBM Manufacturing Intelligence</h4>
                                                    <CtaButton text="Open in Popup" className="button-small" onClick={() => setBreakdownModalInfo({ isOpen: true, request: req })} />
                                                </div>
                                                <CostBreakdownContent breakdown={parseBreakdown(req.notes)} request={req} formatPrice={formatPrice} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )) : (
                            <tr><td colSpan={6} style={{...styles.tableCell, textAlign: 'center'}}>No internal quotes generated yet. Click 'Upload New Design' to calculate.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {breakdownModalInfo.isOpen && <CostBreakdownModal request={breakdownModalInfo.request} onClose={handleCloseBreakdownModal} />}
        </div>
    );
};

// --- Modal Components for Dashboard ---

export const ActivityDetailModal = ({ item, onClose, onViewFiles, formatPrice, onSetActiveView }) => {
    return (
        <div style={styles.modalBackdrop}>
            <div style={{ ...styles.modalContent, maxWidth: '600px' }}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>
                        {item.type === 'quote' ? 'Quote Request Details' : 'Order Update Details'}
                    </h3>
                    <button onClick={onClose} style={styles.modalCloseButton}><XMarkIcon style={{ width: '24px', height: '24px' }} /></button>
                </div>
                <div style={styles.modalBody}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <p style={styles.quoteDetailLabel}>Part Name</p>
                                <p style={styles.quoteDetailValue}>{item.design__design_name || item.design_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={styles.quoteDetailLabel}>Date</p>
                                <p style={styles.quoteDetailValue}>{new Date(item.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p style={styles.quoteDetailLabel}>Status</p>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)',
                                    color: neon_cyan,
                                    border: `1px solid rgba(var(--neon-cyan-rgb), 0.3)`
                                }}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>
                            {item.price_usd && (
                                <div>
                                    <p style={styles.quoteDetailLabel}>Price</p>
                                    <p style={{ ...styles.quoteDetailValue, color: neon_magenta }}>{formatPrice(item.price_usd)}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ ...styles.quoteDetailLabel, marginBottom: '8px' }}>Action Items</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <CtaButton text="View Design Files" onClick={() => { onViewFiles(item.design || item.design_id); onClose(); }} className="button-small" />
                                {item.type === 'quote' && item.status === 'pending' && (
                                    <CtaButton text="Go to Quotes" primary onClick={() => { onSetActiveView('quotes'); onClose(); }} className="button-small" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={styles.modalFooter}>
                    <CtaButton text="Close" onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

export const RevenueDetailsModal = ({ stats, onClose, formatPrice }) => {
    return (
        <div style={styles.modalBackdrop}>
            <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
                <div style={styles.modalHeader}>
                    <h3 style={{ ...styles.modalTitle, color: neon_magenta }}>Revenue Analytics</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}><XMarkIcon style={{ width: '24px', height: '24px' }} /></button>
                </div>
                <div style={styles.modalBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                        <div style={{ ...styles.dashboardCard, background: 'rgba(255,255,255,0.03)' }}>
                            <p style={styles.dashboardMetricLabel}>Total Revenue</p>
                            <h3 style={{ ...styles.dashboardMetricValue, color: neon_magenta }}>{formatPrice(stats?.total_revenue)}</h3>
                        </div>
                        <div style={{ ...styles.dashboardCard, background: 'rgba(255,255,255,0.03)' }}>
                            <p style={styles.dashboardMetricLabel}>Monthly Revenue</p>
                            <h3 style={{ ...styles.dashboardMetricValue, color: neon_cyan }}>{formatPrice(stats?.monthly_revenue)}</h3>
                        </div>
                        <div style={{ ...styles.dashboardCard, background: 'rgba(255,255,255,0.03)' }}>
                            <p style={styles.dashboardMetricLabel}>Average Order</p>
                            <h3 style={{ ...styles.dashboardMetricValue, color: 'var(--status-success)' }}>{formatPrice(stats?.total_revenue / (stats?.completed_orders || 1))}</h3>
                        </div>
                    </div>

                    <h4 style={{ color: text_primary, marginBottom: '16px', fontSize: '16px' }}>Monthly Breakdown</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stats?.revenue_trend?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <span style={{ color: text_secondary }}>{item.month}</span>
                                <span style={{ fontWeight: 600, color: text_primary }}>{formatPrice(item.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={styles.modalFooter}>
                    <CtaButton text="Close" onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

export const PipelineDetailsModal = ({ data, stats, onClose }) => {
    return (
        <div style={styles.modalBackdrop}>
            <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
                <div style={styles.modalHeader}>
                    <h3 style={{ ...styles.modalTitle, color: neon_cyan }}>Quote Pipeline Analytics</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}><XMarkIcon style={{ width: '24px', height: '24px' }} /></button>
                </div>
                <div style={styles.modalBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ ...styles.dashboardCard, textAlign: 'center' }}>
                            <p style={styles.dashboardMetricLabel}>Total Requests</p>
                            <h3 style={styles.dashboardMetricValue}>{data.total}</h3>
                        </div>
                        <div style={{ ...styles.dashboardCard, textAlign: 'center' }}>
                            <p style={styles.dashboardMetricLabel}>Pending</p>
                            <h3 style={{ ...styles.dashboardMetricValue, color: neon_orange }}>{data.pending}</h3>
                        </div>
                        <div style={{ ...styles.dashboardCard, textAlign: 'center' }}>
                            <p style={styles.dashboardMetricLabel}>Accepted</p>
                            <h3 style={{ ...styles.dashboardMetricValue, color: neon_magenta }}>{data.accepted}</h3>
                        </div>
                        <div style={{ ...styles.dashboardCard, textAlign: 'center' }}>
                            <p style={styles.dashboardMetricLabel}>Completed</p>
                            <h3 style={{ ...styles.dashboardMetricValue, color: 'var(--status-success)' }}>{stats?.completed_orders}</h3>
                        </div>
                    </div>

                    <h4 style={{ color: text_primary, marginBottom: '16px', fontSize: '16px' }}>Performance Metrics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <p style={{ color: text_secondary, fontSize: '13px' }}>Acceptance Rate</p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 800, color: neon_cyan }}>{stats?.acceptance_rate}%</span>
                                <span style={{ color: 'var(--status-success)', fontSize: '13px', paddingBottom: '8px' }}>↑ 4% this week</span>
                            </div>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <p style={{ color: text_secondary, fontSize: '13px' }}>Avg. Response Time</p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 800, color: neon_magenta }}>4.2h</span>
                                <span style={{ color: 'var(--status-success)', fontSize: '13px', paddingBottom: '8px' }}>↓ 1.5h faster</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={styles.modalFooter}>
                    <CtaButton text="Close" onClick={onClose} />
                </div>
            </div>
        </div>
    );
};



// --- FBM Analysis Components ---

export const DesignAnalysisResults = ({ designId, onContinue }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatingQuotes, setGeneratingQuotes] = useState(false);

    useEffect(() => {
        const pollAnalysis = async () => {
            try {
                const design = await api.getDesignById(designId);

                if (design.status === 'analysis_complete') {
                    try {
                        const fbmData = await api.getFBMAnalysis(designId);
                        setAnalysis(fbmData);
                        setLoading(false);

                        // Automatically generate quotes after analysis completes
                        setTimeout(async () => {
                            try {
                                await api.generateQuotes(designId);
                                console.log('Quotes auto-generated successfully');
                            } catch (quoteError) {
                                console.error('Failed to auto-generate quotes:', quoteError);
                                // Don't block the UI if quote generation fails
                            }
                        }, 1000); // Small delay to ensure UI updates first
                    } catch (fbmError) {
                        // FBM data not available, show basic success
                        setAnalysis({ basic: true, design });
                        setLoading(false);

                        // Also auto-generate quotes for basic analysis
                        setTimeout(async () => {
                            try {
                                await api.generateQuotes(designId);
                                console.log('Quotes auto-generated successfully (basic)');
                            } catch (quoteError) {
                                console.error('Failed to auto-generate quotes:', quoteError);
                            }
                        }, 1000);
                    }
                } else if (design.status === 'analysis_failed') {
                    setError('Analysis failed. Please try uploading again.');
                    setLoading(false);
                } else {
                    // Still analyzing, poll again
                    setTimeout(pollAnalysis, 2000);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        pollAnalysis();
    }, [designId]);

    const handleGenerateQuotes = async () => {
        setGeneratingQuotes(true);
        try {
            await api.generateQuotes(designId);
            onContinue();
        } catch (err) {
            setError(err.message);
            setGeneratingQuotes(false);
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.uploadPageContainer, textAlign: 'center', paddingTop: '120px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <ManufactureIcon style={{ ...iconStyle, width: '80px', height: '80px', color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 15px var(--neon-cyan))' }} />
                </div>
                <h2 style={styles.dashboardPageTitle}>Analyzing Your Design with FBM AI...</h2>
                <p style={{ ...styles.dashboardPageSubtitle, maxWidth: '600px', margin: '16px auto 0' }}>
                    Our advanced Feature-Based Machining system is detecting features, planning operations, and calculating accurate time estimates.
                </p>
                <div style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
                    <p>⚙️ Detecting features...</p>
                    <p>🔧 Planning machining operations...</p>
                    <p>📊 Analyzing manufacturability...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.uploadPageContainer}>
                <div style={styles.warningBox}>
                    <h3>Analysis Error</h3>
                    <p>{error}</p>
                    <CtaButton text="Return to Dashboard" onClick={onContinue} />
                </div>
            </div>
        );
    }

    // Display basic success if FBM data not available
    if (analysis?.basic) {
        return (
            <div style={styles.uploadPageContainer}>
                <h2 style={styles.dashboardPageTitle}>✅ Upload Complete!</h2>
                <p style={styles.dashboardPageSubtitle}>Your design has been uploaded successfully.</p>
                <div style={{ marginTop: '32px' }}>
                    <CtaButton text="Request Quotes from Manufacturers" primary onClick={handleGenerateQuotes} disabled={generatingQuotes} />
                    <CtaButton text="Go to Dashboard" onClick={onContinue} />
                </div>
            </div>
        );
    }

    // Display full FBM analysis
    const { fbm_summary, feature_types_detected, manufacturing_risks, machinability_assessment } = analysis;

    return (
        <div style={styles.uploadPageContainer}>
            <h2 style={styles.dashboardPageTitle}>✅ FBM Analysis Complete!</h2>
            <p style={styles.dashboardPageSubtitle}>
                Our AI has detected {fbm_summary?.total_features || 0} features and planned {fbm_summary?.total_operations || 0} machining operations.
            </p>

            {/* Summary Cards */}
            <div style={styles.analysisSummary}>
                <div style={styles.statCard} className="hover-lift">
                    <h4 style={styles.statValue}>{fbm_summary?.total_features || 0}</h4>
                    <p style={styles.statLabel}>Features Detected</p>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <h4 style={styles.statValue}>{fbm_summary?.total_operations || 0}</h4>
                    <p style={styles.statLabel}>Machining Operations</p>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <h4 style={styles.statValue}>{fbm_summary?.estimated_machining_time_hours?.toFixed(1) || '0'}h</h4>
                    <p style={styles.statLabel}>Estimated Time</p>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <h4 style={styles.statValue}>{fbm_summary?.number_of_setups || 1}</h4>
                    <p style={styles.statLabel}>Setup{fbm_summary?.number_of_setups > 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Feature Types */}
            {feature_types_detected && feature_types_detected.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ ...styles.profileSectionTitle, textAlign: 'left' }}>Features Recognized</h3>
                    <div style={styles.featureGrid}>
                        {feature_types_detected.map((type, i) => (
                            <div key={i} style={styles.featureBadge}>{type}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Manufacturing Risks */}
            {manufacturing_risks && manufacturing_risks.length > 0 && (
                <div style={styles.warningBox}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>⚠️ Manufacturing Considerations</h4>
                    {manufacturing_risks.map((risk, i) => (
                        <p key={i} style={{ margin: '4px 0', fontSize: '14px' }}>• {risk}</p>
                    ))}
                </div>
            )}

            {/* Machinability Info */}
            {machinability_assessment && (
                <div style={styles.fbmBadge}>
                    {machinability_assessment.has_undercuts && <span>🔄 Undercuts Detected (5-axis recommended)</span>}
                    {machinability_assessment.has_thin_walls && <span>⚠️ Thin Walls (min {machinability_assessment.min_wall_thickness}mm)</span>}
                    <span>📊 Complexity: {machinability_assessment.complexity_score?.toFixed(1) || 'N/A'}/10</span>
                    <span>🎯 Accessibility: {((machinability_assessment.accessibility_score || 0) * 100).toFixed(0)}%</span>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '48px', display: 'flex', gap: '16px' }}>
                <CtaButton
                    text={generatingQuotes ? "Generating Quotes..." : "Request Quotes from Manufacturers"}
                    primary
                    onClick={handleGenerateQuotes}
                    disabled={generatingQuotes}
                />
                <CtaButton text="Go to Dashboard" onClick={onContinue} />
            </div>
        </div>
    );
};

// --- Quotation Viewing Page ---



export const ManufacturingIntelligencePanel = ({ designId, onClose }) => {
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOperations, setShowOperations] = useState(false);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchIntelligence = async () => {
            try {
                const data = await api.getFBMIntelligence(designId);
                setIntelligence(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load manufacturing intelligence:', err);
                setLoading(false);
            }
        };

        fetchIntelligence();
    }, [designId]);

    if (loading) {
        return (
            <div style={styles.modalBackdrop}>
                <div style={styles.modalContent}>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading manufacturing intelligence...</p>
                </div>
            </div>
        );
    }

    if (!intelligence || !intelligence.intelligence_report?.available) {
        return (
            <div style={styles.modalBackdrop}>
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <h3 style={styles.modalTitle}>Manufacturing Intelligence</h3>
                        <button onClick={onClose} style={styles.modalCloseButton}>
                            <XMarkIcon style={{ width: '24px', height: '24px' }} />
                        </button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Manufacturing intelligence not available for this design.</p>
                    <div style={styles.modalFooter}>
                        <CtaButton text="Close" onClick={onClose} />
                    </div>
                </div>
            </div>
        );
    }

    const { summary, intelligence_report } = intelligence;
    const report = intelligence_report;

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={{ ...styles.modalContent, maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>🤖 Manufacturing Intelligence</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}>
                        <XMarkIcon style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>

                <div style={styles.modalBody}>
                    {/* Quick Summary */}
                    <div style={styles.intelligenceCards}>
                        <div style={styles.intelCard}>
                            <h4 style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Difficulty</h4>
                            <p style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                margin: 0,
                                color: summary.manufacturing_difficulty === 'Easy' ? 'var(--status-success)' :
                                    summary.manufacturing_difficulty === 'Moderate' ? 'var(--status-warning)' : 'var(--status-error)'
                            }}>
                                {summary.manufacturing_difficulty}
                            </p>
                        </div>

                        <div style={styles.intelCard}>
                            <h4 style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Tool Cost</h4>
                            <p style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--neon-cyan)' }}>
                                {formatPrice(summary.total_tool_cost_estimate || 0)}
                            </p>
                        </div>

                        <div style={styles.intelCard}>
                            <h4 style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Time Savings</h4>
                            <p style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--status-success)' }}>
                                {summary.estimated_time_savings_percent || 0}%
                            </p>
                        </div>

                        <div style={styles.intelCard}>
                            <h4 style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Critical Dims</h4>
                            <p style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--neon-magenta)' }}>
                                {summary.critical_dimensions_count || 0}
                            </p>
                        </div>
                    </div>

                    {/* Tool Analysis */}
                    {report.tool_analysis?.required_tools?.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={{ ...styles.profileSectionTitle, textAlign: 'left' }}>🔧 Required Tooling</h3>
                            {report.tool_analysis.required_tools.map((tool, i) => (
                                <div key={i} style={styles.toolCard}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>
                                            {tool.type} Ø{tool.diameter_mm}mm
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{tool.recommendation}</p>
                                    </div>
                                    <div style={styles.toolCost}>
                                        <span>Cost: {formatPrice(tool.cost_usd)}</span>
                                        <span>Wear: {formatPrice(tool.estimated_wear_cost || 0)}</span>
                                        <span>Used: {tool.usage_time_minutes?.toFixed(1)}min</span>
                                    </div>
                                </div>
                            ))}

                            {report.tool_analysis.specialty_tools_needed?.length > 0 && (
                                <div style={styles.alertBox}>
                                    <strong>⚠️ Specialty Tools Required:</strong>
                                    {report.tool_analysis.specialty_tools_needed.map((t, i) => (
                                        <p key={i} style={{ margin: '8px 0', fontSize: '14px' }}>{t.type} - {t.note}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Optimization Suggestions */}
                    {report.optimization_suggestions?.toolpath_optimizations?.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={{ ...styles.profileSectionTitle, textAlign: 'left' }}>💡 Optimization Opportunities</h3>
                            {report.optimization_suggestions.toolpath_optimizations.map((opt, i) => (
                                <div key={i} style={styles.optimizationCard}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                                        {opt.type}
                                        <span style={styles.savingsBadge}>Save {opt.time_savings_percent}%</span>
                                    </h4>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{opt.description}</p>
                                    {opt.benefits && (
                                        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {opt.benefits.map((b, j) => <li key={j}>{b}</li>)}
                                        </ul>
                                    )}
                                    {opt.implementation && (
                                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                            💡 {opt.implementation}
                                        </p>
                                    )}
                                </div>
                            ))}
                            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--status-success)', marginTop: '16px' }}>
                                Total Estimated Time Savings: {report.optimization_suggestions.estimated_total_time_savings_percent}%
                            </p>
                        </div>
                    )}

                    {/* Quality Planning */}
                    {report.quality_planning && (
                        <div style={styles.section}>
                            <h3 style={{ ...styles.profileSectionTitle, textAlign: 'left' }}>✓ Quality Control Plan</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Recommended Method</p>
                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                                        {report.quality_planning.recommended_inspection_methods?.primary || 'Standard'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Inspection Time</p>
                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                                        {report.quality_planning.estimated_inspection_time_hours || 0}h
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Quality Level</p>
                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                                        {report.quality_planning.quality_level_requirements?.level || 'Standard'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Cpk Target</p>
                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                                        {report.quality_planning.quality_level_requirements?.cpk_target || '1.33'}
                                    </p>
                                </div>
                            </div>

                            {report.quality_planning.critical_dimensions?.length > 0 && (
                                <>
                                    <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '16px 0 8px 0' }}>
                                        Critical Dimensions ({report.quality_planning.critical_dimensions.length})
                                    </h4>
                                    {report.quality_planning.critical_dimensions.slice(0, 5).map((dim, i) => (
                                        <div key={i} style={styles.dimCard}>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dim.type}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{dim.dimension}: {dim.nominal}</span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{dim.inspection_method}</span>
                                        </div>
                                    ))}
                                    {report.quality_planning.critical_dimensions.length > 5 && (
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                            + {report.quality_planning.critical_dimensions.length - 5} more dimensions
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Cost Opportunities */}
                    {report.cost_opportunities?.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={{ ...styles.profileSectionTitle, textAlign: 'left' }}>💰 Cost Saving Opportunities</h3>
                            {report.cost_opportunities.map((opp, i) => (
                                <div key={i} style={styles.opportunityCard}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--text-primary)' }}>{opp.type}</h4>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{opp.description}</p>
                                    <div style={styles.oppStats}>
                                        <span>Per Part: {formatPrice(opp.estimated_savings_per_part)}</span>
                                        <span>Total: {formatPrice(opp.total_savings_for_batch)}</span>
                                        <span>Effort: {opp.implementation_effort}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.modalFooter}>
                    <CtaButton text="Close" primary onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

// --- Customer Dashboard Components ---


export const CustomerDashboardOverview = ({ user, navigate, onViewFiles }: { user: any, navigate: (page: string, params?: any) => void, onViewFiles: (id: string) => void }) => {
    const [stats, setStats] = useState({ designs: 0, orders: 0, totalSpent: 0, newQuotes: 0 });
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [designs, orders] = await Promise.all([
                    api.getCustomerDesigns(),
                    api.getCustomerOrders()
                ]);

                const designCount = designs?.length || 0;
                const orderCount = orders?.length || 0;
                const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total_cost) || 0), 0) || 0;
                const newQuotes = 0; // TODO: implement when quotes endpoint is ready

                setStats({ designs: designCount, orders: orderCount, totalSpent, newQuotes });
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                setStats({ designs: 0, orders: 0, totalSpent: 0, newQuotes: 0 });
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="animate-slide-up">
                <div>
                    <h2 style={styles.dashboardPageTitle}>Overview</h2>
                    <p style={{ ...styles.stepText, fontSize: '18px' }}>Welcome back, {user?.company_name}!</p>
                </div>
                <CtaButton
                    text="Upload New Design"
                    primary
                    onClick={() => navigate('/upload')}
                >
                    <UploadIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                </CtaButton>
            </div>
            <div style={styles.statsGrid} className="animate-slide-up stagger-child-1">
                <div style={styles.statCard} className="hover-lift">
                    <h3 style={styles.statValue}>{loading ? '...' : stats.designs}</h3>
                    <p style={styles.statLabel}>Active Designs</p>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <h3 style={styles.statValue}>{loading ? '...' : stats.orders}</h3>
                    <p style={styles.statLabel}>Open Orders</p>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <h3 style={styles.statValue}>{loading ? '...' : formatPrice(stats.totalSpent)}</h3>
                    <p style={styles.statLabel}>Total Spent</p>
                </div>
                <div style={styles.statCard} className="hover-lift">
                    <h3 style={styles.statValue}>{loading ? '...' : stats.newQuotes}</h3>
                    <p style={styles.statLabel}>New Quote Received</p>
                </div>
            </div>
        </div>
    );
};

export const CustomerProfilePage = () => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const profile = await api.getCustomerProfile();
                // Normalize data from backend (company_name) to frontend (companyName)
                setFormData({
                    ...profile,
                    companyName: profile.company_name || '',
                    email: profile.email || ''
                });
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ show: false, message: '', type: 'success' });
        try {
            // Map frontend fields back to backend expected names
            const payload = {
                ...formData,
                company_name: formData.companyName
            };
            await api.updateCustomerProfile(payload);
            setNotification({ show: true, message: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setNotification({ show: true, message: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;
    if (!formData) return <p>Could not load profile data.</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>My Profile</h2>
            <p style={styles.dashboardPageSubtitle}>Update your company and contact information.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                <fieldset style={{ ...styles.fieldset, marginTop: 0 }}>
                    <legend style={styles.legend}>Profile Information</legend>
                    <div style={styles.formGroup}>
                        <label htmlFor="companyName" style={styles.label}>Company Name</label>
                        <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} style={styles.input} required />
                    </div>
                    <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                        <label htmlFor="email" style={styles.label}>Contact Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={styles.input} required />
                    </div>


                </fieldset>
                <div style={{ marginTop: '24px' }}>
                    <CtaButton text={loading ? "Saving..." : "Save Changes"} primary type="submit" disabled={loading} />
                </div>
            </form>
        </div>
    );
};

export const CustomerDesignsPage = () => {
    const { openViewer: onViewFiles } = useFileViewer();
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchDesigns();
    }, []);

    const fetchDesigns = async () => {
        setLoading(true);
        try {
            const data = await api.getCustomerDesigns();
            setDesigns(data);
        } catch (err) {
            setError('Failed to load your designs.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (design) => {
        if (window.confirm(`Are you sure you want to delete the design "${design.design_name}"?`)) {
            try {
                await api.deleteCustomerDesign(design.id);
                setNotification({ show: true, message: `Design "${design.design_name}" deleted successfully.`, type: 'success' });
                setDesigns(prev => prev.filter(d => (d as any).id !== design.id));
            } catch (err) {
                setNotification({ show: true, message: `Error deleting design: ${err.message}`, type: 'error' });
            }
        }
    };

    if (loading) return <div>Loading designs...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>My Designs</h2>
            <p style={styles.dashboardPageSubtitle}>Manage your uploaded designs and check their quoting status.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <div className="table-responsive-container">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Part</th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('design_name')}>
                                Design Name <SortIcon sortConfig={sortConfig} columnKey="design_name" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('material')}>
                                Material <SortIcon sortConfig={sortConfig} columnKey="material" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('quantity')}>
                                Quantity <SortIcon sortConfig={sortConfig} columnKey="quantity" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('created_at')}>
                                Date Uploaded <SortIcon sortConfig={sortConfig} columnKey="created_at" />
                            </th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDesigns.length > 0 ? sortedDesigns.map((design: any) => (
                            <tr key={design.id}>
                                <td style={styles.tableCell}>
                                    <DesignThumbnail 
                                        modelUrl={resolveMediaUrl(design.design_view_url)} 
                                        thumbnailUrl={resolveMediaUrl(design.design_thumbnail_url)}
                                        designId={design.id} 
                                        designName={design.design_name} 
                                    />
                                </td>
                                <td style={styles.tableCell}>{design.design_name}</td>
                                <td style={styles.tableCell}>{design.material}</td>
                                <td style={styles.tableCell}>{design.quantity}</td>
                                <td style={styles.tableCell}>{design.created_at ? new Date(design.created_at).toLocaleDateString() : 'N/A'}</td>
                                <td style={styles.tableCell}><span style={getStatusStyle(design.status)}>{design.status_display || design.status}</span></td>
                                <td style={styles.tableCell}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {design.status === 'analysis_complete' && (
                                            <CtaButton
                                                text="View Quotes"
                                                onClick={() => navigate(`/view-quotes/${design.id}`)}
                                                className="button-small"
                                                primary
                                            />
                                        )}
                                        <CtaButton text="View Files" onClick={() => onViewFiles(design.id)} className="button-small" />
                                        <CtaButton text="Copy" onClick={() => handleDuplicate(design)} className="button-small" />
                                        <CtaButton text="Delete" onClick={() => handleDelete(design)} className="button-small-danger" />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} style={{ ...styles.tableCell, textAlign: 'center' }}>You haven't uploaded any designs yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const CustomerOrdersPage = () => {
    const { openViewer: onViewFiles } = useFileViewer();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await api.getCustomerOrders();
                setOrders(data);
            } catch (err) {
                setError('Failed to load your orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusStyle = (status) => {
        const baseStyle = { ...styles.statusBadge };
        switch (status) {
            case 'Awaiting Production': return { ...baseStyle, color: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' };
            case 'In Production': return { ...baseStyle, color: '#60A5FA', backgroundColor: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' };
            case 'Shipped': return { ...baseStyle, color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' };
            case 'Delivered': return { ...baseStyle, color: '#86EFAC', backgroundColor: 'rgba(134, 239, 172, 0.1)', border: '1px solid rgba(134, 239, 172, 0.3)' };
            case 'Cancelled': return { ...baseStyle, color: 'var(--status-error)', backgroundColor: 'rgba(var(--status-error-rgb), 0.1)', border: '1px solid rgba(var(--status-error-rgb), 0.3)' };
            default: return { ...baseStyle, color: 'var(--text-secondary)', backgroundColor: 'rgba(var(--text-secondary), 0.1)', border: '1px solid rgba(var(--text-secondary), 0.2)' };
        }
    };

    const { items: sortedOrders, requestSort, sortConfig } = useSortableData(orders);

    if (loading) return <div>Loading orders...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>My Orders</h2>
            <p style={styles.dashboardPageSubtitle}>Track your active and completed orders.</p>
            <div className="table-responsive-container">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Part</th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('id')}>
                                Order ID <SortIcon sortConfig={sortConfig} columnKey="id" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('design_name')}>
                                Part Name <SortIcon sortConfig={sortConfig} columnKey="design_name" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('manufacturer')}>
                                Manufacturer <SortIcon sortConfig={sortConfig} columnKey="manufacturer" />
                            </th>
                            <th style={styles.tableHeader} className="sortable-header" onClick={() => requestSort('price')}>
                                Price <SortIcon sortConfig={sortConfig} columnKey="price" />
                            </th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Tracking</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedOrders.length > 0 ? sortedOrders.map((order: any) => (
                            <tr key={order.id}>
                                <td style={styles.tableCell}>
                                    <DesignThumbnail 
                                        modelUrl={resolveMediaUrl(order.design_info?.design_view_url)} 
                                        thumbnailUrl={resolveMediaUrl(order.design_info?.design_thumbnail_url)}
                                        designId={order.design_info?.id} 
                                        designName={order.design_info?.design_name} 
                                    />
                                </td>
                                <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{order.id}</td>
                                <td style={styles.tableCell}>{order.design_info?.design_name || order.designName}</td>
                                <td style={styles.tableCell}>{order.manufacturer_info?.company_name || order.manufacturer}</td>
                                <td style={styles.tableCell}>{formatPrice(order.order_total_price_usd || order.price)}</td>
                                <td style={styles.tableCell}><span style={getStatusStyle(order.status)}>{order.status_display || order.status}</span></td>
                                <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>
                                    {order.tracking_number || order.trackingNumber ? (
                                        <a href={`https://www.google.com/search?q=${order.tracking_number || order.trackingNumber}`} target="_blank" rel="noopener noreferrer" style={styles.loginLink}>
                                            {order.tracking_number || order.trackingNumber}
                                        </a>
                                    ) : 'N/A'}
                                </td>
                                <td style={styles.tableCell}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <CtaButton text="Quote" onClick={() => alert('Viewing Quotation PDF...')} className="button-small" />
                                        <CtaButton text="Files" onClick={() => onViewFiles(order.designId)} className="button-small" />
                                        <CtaButton text="Receipt" onClick={() => alert('Downloading Receipt...')} className="button-small">
                                            <DownloadIcon style={{ width: '14px', height: '14px' }} />
                                        </CtaButton>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={8} style={{ ...styles.tableCell, textAlign: 'center' }}>You have no orders.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};





// --- Styles ---


// --- Background Animation ---

const backgroundParts = [
    { id: 1, initialTop: '10%', initialLeft: '10%', initialRotate: { x: 20, y: -30, z: 45 }, size: 250, depth: -300, icon: WrenchScrewdriverIcon, color: neon_cyan, factors: { y: -0.4, x: 0.3, rotateX: 0.01, rotateY: 0.02, rotateZ: 0.05 } },
    { id: 2, initialTop: '40%', initialLeft: '80%', initialRotate: { x: 0, y: 0, z: 10 }, size: 200, depth: 200, icon: ManufactureIcon, color: neon_magenta, factors: { y: 0.2, x: -0.5, rotateX: -0.02, rotateY: -0.01, rotateZ: -0.08 } },
    { id: 3, initialTop: '70%', initialLeft: '20%', initialRotate: { x: 45, y: 45, z: 0 }, size: 180, depth: -100, icon: DollarSignIcon, color: neon_orange, factors: { y: 0.6, x: 0.2, rotateX: 0.05, rotateY: 0.05, rotateZ: 0.1 } },
    { id: 4, initialTop: '80%', initialLeft: '85%', initialRotate: { x: -20, y: 0, z: 0 }, size: 220, depth: 300, icon: LightningBoltIcon, color: neon_cyan, factors: { y: -0.2, x: 0.6, rotateX: 0.03, rotateY: -0.04, rotateZ: -0.03 } },
    { id: 5, initialTop: '20%', initialLeft: '60%', initialRotate: { x: 0, y: 60, z: -30 }, size: 150, depth: 50, icon: ShieldCheckIcon, color: neon_magenta, factors: { y: 0.5, x: -0.3, rotateX: -0.01, rotateY: -0.05, rotateZ: 0.15 } },
    { id: 6, initialTop: '60%', initialLeft: '50%', initialRotate: { x: -60, y: 0, z: 120 }, size: 160, depth: -250, icon: DocumentTextIcon, color: neon_cyan, factors: { y: -0.6, x: -0.4, rotateX: 0.1, rotateY: -0.1, rotateZ: 0.2 } },
    { id: 10, initialTop: '50%', initialLeft: '15%', initialRotate: { x: 0, y: 0, z: 90 }, size: 190, depth: 150, icon: BuildingOfficeIcon, color: neon_cyan, factors: { y: -0.1, x: 0.5, rotateX: 0.02, rotateY: -0.06, rotateZ: -0.02 } },
    { id: 14, initialTop: '65%', initialLeft: '95%', initialRotate: { x: 90, y: 0, z: 0 }, size: 100, depth: 80, icon: NutIcon, color: neon_magenta, factors: { y: -0.2, x: -0.3, rotateX: 0.1, rotateY: 0.0, rotateZ: 0.05 } },
    { id: 15, initialTop: '45%', initialLeft: '5%', initialRotate: { x: 0, y: 45, z: 45 }, size: 120, depth: -120, icon: DrillIcon, color: neon_orange, factors: { y: 0.5, x: 0.4, rotateX: -0.05, rotateY: 0.08, rotateZ: 0.02 } },
    { id: 16, initialTop: '95%', initialLeft: '30%', initialRotate: { x: 0, y: 90, z: 0 }, size: 150, depth: 100, icon: CylinderIcon, color: neon_cyan, factors: { y: -0.4, x: -0.1, rotateX: 0.02, rotateY: 0.1, rotateZ: 0.01 } },
    // Adding 3 more items (filling gaps)
    { id: 17, initialTop: '15%', initialLeft: '40%', initialRotate: { x: 30, y: 30, z: 0 }, size: 140, depth: 20, icon: ManufactureIcon, color: neon_magenta, factors: { y: 0.3, x: 0.2, rotateX: 0.04, rotateY: -0.02, rotateZ: 0.1 } },
    { id: 18, initialTop: '85%', initialLeft: '55%', initialRotate: { x: -15, y: -15, z: 15 }, size: 110, depth: -80, icon: CircleDotIcon, color: neon_orange, factors: { y: -0.3, x: -0.2, rotateX: -0.03, rotateY: 0.05, rotateZ: -0.04 } },
    { id: 19, initialTop: '10%', initialLeft: '85%', initialRotate: { x: 0, y: 45, z: -45 }, size: 130, depth: 120, icon: WrenchScrewdriverIcon, color: neon_cyan, factors: { y: 0.1, x: -0.4, rotateX: 0.02, rotateY: -0.06, rotateZ: 0.03 } },
];

export const BackgroundAnimation = () => {
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        let scrollTicking = false;
        const handleScroll = () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    setScrollY(window.scrollY);
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            animationFrameId.current = requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };

        let resizeTicking = false;
        const handleResize = () => {
            if (!resizeTicking) {
                window.requestAnimationFrame(() => {
                    setDimensions({ width: window.innerWidth, height: window.innerHeight });
                    resizeTicking = false;
                });
                resizeTicking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return (
        <div style={styles.backgroundAnimationContainer}>
            {backgroundParts.map(part => {
                const scrollTranslateX = part.factors.x * scrollY;
                const scrollTranslateY = part.factors.y * scrollY;

                // Mouse interaction
                const partCenterX = (parseFloat(part.initialLeft) / 100) * dimensions.width + scrollTranslateX;
                const partCenterY = (parseFloat(part.initialTop) / 100) * dimensions.height + scrollTranslateY;
                const dx = partCenterX - mousePos.x;
                const dy = partCenterY - mousePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 250;
                const maxPush = 30;

                let mousePushX = 0;
                let mousePushY = 0;

                if (distance < interactionRadius) {
                    const force = 1 - (distance / interactionRadius);
                    const pushAmount = force * maxPush;
                    const angle = Math.atan2(dy, dx);
                    mousePushX = Math.cos(angle) * pushAmount;
                    mousePushY = Math.sin(angle) * pushAmount;
                }

                const transform = `
                    translate3d(-50%, -50%, 0)
                    translateX(${scrollTranslateX + mousePushX}px)
                    translateY(${scrollTranslateY + mousePushY}px)
                    translateZ(${part.depth}px)
                    rotateX(${part.initialRotate.x + part.factors.rotateX * scrollY}deg)
                    rotateY(${part.initialRotate.y + part.factors.rotateY * scrollY}deg)
                    rotateZ(${part.initialRotate.z + part.factors.rotateZ * scrollY}deg)
                `;

                const opacity = Math.max(0, 0.15 - (scrollY / 3000)); // Lower opacity for icons as they are filled/outlined
                const Icon = part.icon;

                return (
                    <div
                        key={part.id}
                        style={{
                            ...styles.animatedPart,
                            width: `${part.size}px`,
                            height: `${part.size}px`,
                            top: part.initialTop,
                            left: part.initialLeft,
                            transform: transform,
                            opacity: opacity,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: part.color,
                            transformStyle: 'preserve-3d', // Enable 3D children
                        }}
                    >
                        {/* Layer 1 - Back (Depth) */}
                        <div style={{ position: 'absolute', transform: 'translateZ(-20px)', opacity: 0.3, filter: `blur(1px)` }}>
                            <Icon strokeWidth={0.12} style={{ width: `${part.size}px`, height: `${part.size}px` }} />
                        </div>
                        {/* Layer 2 - Middle (Body) */}
                        <div style={{ position: 'absolute', transform: 'translateZ(0px)', opacity: 0.6 }}>
                            <Icon strokeWidth={0.12} style={{ width: `${part.size}px`, height: `${part.size}px` }} />
                        </div>
                        {/* Layer 3 - Front (Highlight) */}
                        <div style={{ position: 'absolute', transform: 'translateZ(20px)', opacity: 1, filter: `drop-shadow(0 0 15px ${part.color})` }}>
                            <Icon strokeWidth={0.18} style={{ width: `${part.size}px`, height: `${part.size}px` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


// --- Main App Component ---

export const CurrencyRatesWarning = () => {
    const { ratesError } = useCurrency();
    if (!ratesError) return null;

    return (
        <div style={{
            background: 'rgba(var(--status-error-rgb), 0.1)',
            borderBottom: '1px solid var(--status-error)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--status-error)',
            fontSize: '14px',
            fontWeight: 500,
            animation: 'slideDown 0.3s ease-out'
        }}>
            <AlertTriangleIcon style={{ width: '18px', height: '18px' }} />
            <p style={{ margin: 0 }}>{ratesError}</p>
        </div>
    );
};
/**
 * Reusable hook for sorting table data
 */
export const useSortableData = (items, config = null, statusOrder = []) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                // Handle custom status ordering
                if (sortConfig.key === 'status' && statusOrder.length > 0) {
                    const indexA = statusOrder.indexOf(aValue);
                    const indexB = statusOrder.indexOf(bValue);
                    if (indexA !== -1 && indexB !== -1) {
                        return sortConfig.direction === 'ascending' ? indexA - indexB : indexB - indexA;
                    }
                }

                // Handle different types (dates, numbers, strings)
                if (aValue instanceof Date && bValue instanceof Date) {
                    return sortConfig.direction === 'ascending' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
                }
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                
                const aString = String(aValue || '').toLowerCase();
                const bString = String(bValue || '').toLowerCase();
                
                if (aString < bString) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aString > bString) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

/**
 * Reusable Sort Icon component
 */
export const SortIcon = ({ sortConfig, columnKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
        return <span style={{ marginLeft: '8px', opacity: 0.3 }}>↕</span>;
    }
    return (
        <span style={{ marginLeft: '8px', color: neon_cyan }}>
            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
        </span>
    );
};

// --- Add global table overflow style ---
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        .table-responsive-container {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-bottom: 1rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }
        .table-responsive-container::-webkit-scrollbar {
            height: 6px;
        }
        .table-responsive-container::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.02);
        }
        .table-responsive-container::-webkit-scrollbar-thumb {
            background: rgba(10, 240, 240, 0.2);
            border-radius: 10px;
        }
        .table-responsive-container::-webkit-scrollbar-thumb:hover {
            background: var(--neon-cyan);
        }
        .sortable-header {
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
        }
        .sortable-header:hover {
            background: rgba(255,255,255,0.05) !important;
        }
    `;
    document.head.appendChild(style);
}
