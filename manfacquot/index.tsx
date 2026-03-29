import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
    ArrowLeft as LucideArrowLeft,
    Upload as LucideUpload,
    FileText as LucideFileText,
    Settings as LucideSettings,
    File as LucideFile,
    ShieldCheck as LucideShieldCheck,
    Globe as LucideGlobe,
    Scale as LucideScale,
    Zap as LucideZap,
    Code2 as LucideCode2,
    Wrench as LucideWrench,
    Twitter as LucideTwitter,
    Github as LucideGithub,
    Linkedin as LucideLinkedin,
    Search as LucideSearch,
    MapPin as LucideMapPin,
    Star as LucideStar,
    Download as LucideDownload,
    Eye as LucideEye,
    Building as LucideBuilding,
    X as LucideX,
    UserCircle2 as LucideUserCircle,
    Box as LucideBox,
    Archive as LucideArchive,
    Video as LucideVideo,
    DollarSign as LucideDollarSign,
    Cog as LucideCog,
    Nut as LucideNut,
    Drill as LucideDrill,
    CircleDot as LucideCircleDot,
    Cylinder as LucideCylinder,
    Factory as LucideFactory,
    PieChart as LucidePieChart,
    Sparkles as LucideSparkles,
    AlertTriangle as LucideAlertTriangle
} from 'lucide-react';

// --- API Client ---
import { api, setTokens, getTokens, clearTokens } from './utils/api';
import { useCurrency, CurrencyProvider } from './utils/currency';
import { styles, bg_deep_space, text_primary, text_secondary, border_color, border_color_strong, neon_cyan, neon_magenta, neon_orange } from './types/theme';
import CtaButton from './components/CtaButton';
import Notification from './components/Notification';
import CheckboxGroup from './components/CheckboxGroup';
import ManufacturerSettingsPage from './components/ManufacturerSettings';
import Viewer, { ErrorBoundary } from './components/Viewer';
import { ViewPreset } from './types/types';

import './index.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api'; // Uses env var in production
const MEDIA_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
// --- Constants for Manufacturer Signup & Directory ---
import {
    PRODUCTION_VOLUMES, CERTIFICATIONS, MACHINING_PROCESSES, SHEET_METAL_PROCESSES, CASTING_PROCESSES, FORGING_PROCESSES,
    INJECTION_MOLDING_PROCESSES, ADDITIVE_PROCESSES, WELDING_JOINING_PROCESSES, MATERIALS_METALS, MATERIALS_PLASTICS,
    MATERIALS_COMPOSITES, MATERIALS_OTHERS, SURFACE_FINISHES, POST_PROCESSING_ASSEMBLY, FILE_FORMATS, INCOTERMS,
    SPECIAL_CAPABILITIES, ORDER_STATUSES, ALL_CAPABILITIES_GROUPS, ALL_CAPABILITIES_FLAT
} from './utils/constants';

// Mock data removed. Using real API.





// --- Icon Configuration ---
// Using Lucide React icons for consistent, accessible icon system
// Wrapper components maintain backward compatibility with existing code

// Icon wrapper components - map old names to Lucide icons
const ArrowLeftIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideArrowLeft style={{ width: '24px', height: '24px', ...style }} />
);

const UploadIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideUpload style={{ width: '48px', height: '48px', ...style }} />
);

const QuoteIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideFileText style={{ width: '48px', height: '48px', ...style }} />
);

const ManufactureIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideSettings style={{ width: '48px', height: '48px', ...style }} />
);

const FileIcon = () => (
    <LucideFile style={{ width: '48px', height: '48px' }} />
);

const ShieldCheckIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideShieldCheck style={{ width: '48px', height: '48px', ...style }} />
);

const GlobeAltIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideGlobe style={{ width: '48px', height: '48px', ...style }} />
);

const ScaleIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideScale style={{ width: '48px', height: '48px', ...style }} />
);

const LightningBoltIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideZap style={{ width: '48px', height: '48px', ...style }} />
);

const SparklesIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideSparkles style={{ width: '48px', height: '48px', ...style }} />
);

const CodeBracketIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCode2 style={{ width: '32px', height: '32px', ...style }} />
);

const WrenchScrewdriverIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideWrench style={{ width: '32px', height: '32px', ...style }} />
);

const CubeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideBox style={{ width: '24px', height: '24px', ...style }} />
);

const GithubIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideGithub style={{ width: '24px', height: '24px', ...style }} />
);

const LinkedInIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideLinkedin style={{ width: '24px', height: '24px', ...style }} />
);

const TwitterIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideTwitter style={{ width: '24px', height: '24px', ...style }} />
);

const SearchIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideSearch style={style} />
);

const LocationMarkerIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideMapPin style={style} />
);

const StarIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideStar style={style} fill="currentColor" />
);

const BuildingOfficeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideBuilding style={style} />
);

const XMarkIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideX style={style} />
);

const ChartPieIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucidePieChart style={style} />
);

const UserCircleIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideUserCircle style={style} />
);

const CogIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCog style={style} />
);

const ArchiveBoxIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideArchive style={style} />
);

const DocumentTextIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideFileText style={style} />
);

const VideoCameraIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideVideo style={style} />
);

const DownloadIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideDownload style={style} />
);

const EyeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideEye style={style} />
);

// Default icon style for components that use iconStyle
const iconStyle = { width: '48px', height: '48px', color: 'currentColor', marginBottom: '16px' };


// --- Reusable Components ---



const FileViewerModal = ({ design, onClose }) => {
    const [view, setView] = useState(ViewPreset.ISO);
    const [isViewLocked, setIsViewLocked] = useState(true);
    const [activeTab, setActiveTab] = useState('viewer'); // 'viewer' or 'details'

    if (!design) return null;

    const fileExtension = design.s3_file_key?.split('.').pop()?.toLowerCase() || 'stl';
    const isSupported = ['stl', 'obj', 'gltf', 'glb', 'step', 'stp', 'iges', 'igs'].includes(fileExtension);
    const modelUrl = design.view_url?.startsWith('http') ? design.view_url : (design.view_url ? `${MEDIA_BASE_URL}${design.view_url}` : null);

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
                        <button onClick={onClose} style={styles.modalCloseButton}><LucideX style={{ width: '24px', height: '24px' }} /></button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                    {activeTab === 'viewer' ? (
                        <>
                            <div style={{ flex: 1, background: '#0a0a0f', position: 'relative' }}>
                                {isSupported && modelUrl ? (
                                    <ErrorBoundary fallback={(error) => (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--status-error)', padding: '24px', textAlign: 'center' }}>
                                            <LucideAlertTriangle style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
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
                                        />
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
                                        <LucideFile style={{ width: '64px', height: '64px', opacity: 0.5 }} />
                                        <p>3D Preview not available for .{fileExtension} files</p>
                                        <CtaButton text="Download to View" onClick={() => window.open(`${MEDIA_BASE_URL}/media/${design.s3_file_key}`, '_blank')} />
                                    </div>
                                )}

                                {/* Viewer Controls Overlay */}
                                {isSupported && (
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
                                )}
                                
                                {/* Info Badge */}
                                <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 16px', borderRadius: '20px', border: `1px solid ${border_color}`, backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: neon_cyan, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: neon_cyan, boxShadow: `0 0 8px ${neon_cyan}` }} />
                                        LIVE 3D INSPECTION
                                    </span>
                                </div>
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

const ImageUpload = ({ label, currentImageUrl, onImageSelected, onImageRemoved }) => {
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

type HeaderProps = { isAuthenticated: boolean; onLogout: () => void; onNavigate: (page: string, params?: any) => void; };
const Header = ({ isAuthenticated, onLogout, onNavigate }: HeaderProps) => {
    const [hoveredLink, setHoveredLink] = useState('');
    const { currency, setCurrency } = useCurrency();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    ];

    return (
        <header style={styles.header} role="banner">
            <div style={styles.container}>
                <div style={styles.headerContent}>
                    <a href="#" style={{ ...styles.logo, display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
                        <img src="/media/quotanic-logo.png" alt="Quotanic Logo" style={{ height: '32px', width: 'auto' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: text_primary, letterSpacing: '2px' }}>
                            QUOTA<span style={{ color: neon_cyan }}>NIC</span>
                        </span>
                    </a>
                    <nav style={styles.nav} role="navigation" aria-label="Main Navigation">
                        {[{ id: 'how-it-works-detailed', text: 'How It Works' }, { id: 'directory', text: 'Manufacturer Directory' }].map(page => (
                            <a key={page.id} href="#" style={{ ...styles.navLink, ...(hoveredLink === page.id && styles.navLinkHover) }} onClick={(e) => { e.preventDefault(); onNavigate(page.id); }} onMouseEnter={() => setHoveredLink(page.id)} onMouseLeave={() => setHoveredLink('')}>
                                {page.text}
                            </a>
                        ))}
                    </nav>
                    <div style={{ ...styles.headerActions, gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LucideDollarSign style={{ width: '16px', height: '16px', color: neon_cyan }} />
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                {currencies.map(c => (
                                    <option key={c.code} value={c.code} style={{ background: bg_deep_space }}>
                                        {c.code} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-primary)',
                                transition: 'color 0.3s'
                            }}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>
                        {isAuthenticated ? (
                            <>
                                <a href="#" style={{ ...styles.navLink, ...(hoveredLink === 'dashboard' && styles.navLinkHover) }} onMouseEnter={() => setHoveredLink('dashboard')} onMouseLeave={() => setHoveredLink('')} onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>My Dashboard</a>
                                <CtaButton text="Log Out" onClick={onLogout} />
                            </>
                        ) : (
                            <>
                                <a href="#" style={{ ...styles.navLink, ...(hoveredLink === 'login' && styles.navLinkHover) }} onMouseEnter={() => setHoveredLink('login')} onMouseLeave={() => setHoveredLink('')} onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Log In</a>
                                <CtaButton text="Get Started" primary onClick={() => onNavigate('signup')} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const Hero = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => (
    <section style={styles.hero} className="animate-fade-in">
        <div style={{ ...styles.container, position: 'relative', zIndex: 1 }}>
            <div style={styles.heroContent}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }} className="animate-slide-up">
                    <img src="/media/quotanic-logo.png" alt="Quotanic Logo" style={{ height: '300px', width: 'auto', marginBottom: '1px', filter: `drop-shadow(0 0 20px ${neon_cyan})` }} className="animate-float" />
                    <h1 style={{ fontSize: '76px', fontWeight: '900', margin: 0, background: `linear-gradient(to right, ${neon_cyan}, var(--logo-center, var(--text-primary)), ${neon_magenta})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 30px rgba(var(--neon-cyan-rgb), 0.5)', letterSpacing: '-2px' }}>QUOTANIC</h1>
                </div>
                <h1 style={styles.heroTitle} className="animate-slide-up stagger-child-1">From Design to Production, Faster Than Ever.</h1>
                <p style={styles.heroSubtitle} className="animate-slide-up stagger-child-2">Get instant quotes from a global network of vetted manufacturers. Upload your design and compare prices, lead times, and quality in one place.</p>
                <div style={styles.heroActions} className="animate-slide-up stagger-child-3">
                    <CtaButton text="Get an Instant Quote" primary onClick={() => onNavigate('upload')} />
                    <CtaButton text="Join as a Manufacturer" onClick={() => onNavigate('signup-manufacturer')} />
                </div>
            </div>
        </div>
    </section>
);

const HowItWorks = () => (
    <section style={styles.howItWorks}>
        <div style={styles.container}>
            <h2 style={styles.sectionTitle} className="animate-slide-up">Get Your Parts Made in 3 Simple Steps</h2>
            <div style={styles.stepsGrid}>
                <div style={styles.step} className="animate-slide-up stagger-child-1 hover-lift"><UploadIcon style={{ ...iconStyle, color: 'var(--neon-cyan)' }} /><h3 style={styles.stepTitle}>1. Upload Your Design</h3><p style={styles.stepText}>Securely upload your CAD files (STEP, IGES, STL, etc.) and specify your requirements.</p></div>
                <div style={styles.step} className="animate-slide-up stagger-child-2 hover-lift"><QuoteIcon style={{ ...iconStyle, color: 'var(--neon-cyan)' }} /><h3 style={styles.stepTitle}>2. Compare Instant Quotes</h3><p style={styles.stepText}>Our AI engine provides instant pricing. Compare quotes from suppliers based on cost, lead time, and ratings.</p></div>
                <div style={styles.step} className="animate-slide-up stagger-child-3 hover-lift"><ManufactureIcon style={{ ...iconStyle, color: 'var(--neon-cyan)' }} /><h3 style={styles.stepTitle}>3. Order and Manufacture</h3><p style={styles.stepText}>Accept your preferred quote to start production. Track your order until it's delivered to your door.</p></div>
            </div>
        </div>
    </section>
);

const ValueProposition = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const valueProps = [
        { icon: <LightningBoltIcon />, title: "Instant Estimations", text: "Stop waiting. Our automated engine provides rapid cost estimates for your designs." },
        { icon: <GlobeAltIcon />, title: "Global Network", text: "Access a diverse, global pool of vetted manufacturers for any process." },
        { icon: <ScaleIcon />, title: "Informed Decisions", text: "Compare suppliers side-by-side on price, lead time, MOQ, and quality ratings." },
        { icon: <ShieldCheckIcon />, title: "IP Protection", text: "Your designs are secure. We prioritize robust protection for your intellectual property." },
    ];

    return (
        <section style={styles.features}>
            <div style={styles.container}>
                <h2 style={styles.sectionTitle} className="animate-slide-up">The Smartest Way to Manufacture</h2>
                <div style={styles.valueGrid}>
                    {valueProps.map((prop, index) => (
                        <div key={index} style={{ ...styles.valueCard, ...(hoveredCard === index && styles.valueCardHover) }} onMouseEnter={() => setHoveredCard(index)} onMouseLeave={() => setHoveredCard(null)} className={`animate-slide-up stagger-child-${index + 1} hover-lift`}>
                            {React.cloneElement(prop.icon as React.ReactElement, { style: { ...iconStyle, color: hoveredCard === index ? 'var(--neon-cyan)' : 'var(--neon-magenta)' } })}
                            <h3 style={styles.stepTitle}>{prop.title}</h3>
                            <p style={styles.stepText}>{prop.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ForWhom = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => (
    <section style={styles.howItWorks}>
        <div style={styles.container}>
            <div style={styles.forWhomGrid}>
                <div style={styles.forWhomCard} className="animate-slide-up hover-lift">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><CodeBracketIcon style={{ ...styles.forWhomIcon, color: 'var(--neon-cyan)' }} /><h3 style={styles.featureTitle}>For Engineers & Designers</h3></div>
                    <p style={styles.forWhomText}>Tired of manual searches and slow quote turnaround? Streamline your procurement process, reduce time-to-market, and find the perfect manufacturing partner without the hassle.</p>
                    <ul style={styles.featureList}><li>✓ Fast & Competitive Quotes</li><li>✓ Global Network of Suppliers</li><li>✓ Secure IP Protection</li><li>✓ Streamlined Ordering</li></ul>
                    <CtaButton text="Get an Instant Quote" primary onClick={() => onNavigate('upload')} />
                </div>
                <div style={styles.forWhomCard} className="animate-slide-up stagger-child-1 hover-lift">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><WrenchScrewdriverIcon style={{ ...styles.forWhomIcon, color: 'var(--neon-magenta)' }} /><h3 style={styles.featureTitle}>For Manufacturers</h3></div>
                    <p style={styles.forWhomText}>Access a global customer base, streamline your quoting workflow, and fill your production capacity. Let us bring the jobs to you so you can focus on what you do best: making things.</p>
                    <ul style={styles.featureList}><li>✓ Access a New Stream of Orders</li><li>✓ Automate Your Quoting Process</li><li>✓ Reduce Administrative Overhead</li><li>✓ Grow Your Business</li></ul>
                    <CtaButton text="Join Our Network" onClick={() => onNavigate('signup-manufacturer')} />
                </div>
            </div>
        </div>
    </section>
);

const SocialProof = () => (
    <section style={styles.features}>
        <div style={styles.container}>
            <h2 style={styles.sectionTitle} className="animate-slide-up">Built for the Future of Manufacturing</h2>
            <div style={styles.socialProofGrid}>
                <div style={{ ...styles.testimonialCard, gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto' }} className="animate-slide-up hover-lift">
                    <p style={styles.testimonialText}>"Quotanic was built to bridge the gap between complex engineering designs and efficient manufacturing. Our mission is to make custom part sourcing as instant and transparent as possible through intelligent matching and live conversion."</p>
                    <p style={styles.testimonialAuthor}>- Surena, Creator of Quotanic</p>
                </div>
            </div>
            <div style={styles.metricsContainer}>
                <div style={styles.metricItem} className="animate-slide-up stagger-child-1"><span style={styles.metricValue}>50+</span><span style={styles.metricLabel}>Manufacturers on Platform</span></div>
                <div style={styles.metricItem} className="animate-slide-up stagger-child-2"><span style={styles.metricValue}>1,000+</span><span style={styles.metricLabel}>Parts Quoted</span></div>
                <div style={styles.metricItem} className="animate-slide-up stagger-child-3"><span style={styles.metricValue}>24/7</span><span style={styles.metricLabel}>AI Analysis</span></div>
            </div>
        </div>
    </section>
);

const AboutUsPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <SparklesIcon style={{ width: '64px', height: '64px', color: 'var(--neon-magenta)', marginBottom: '24px', filter: 'drop-shadow(0 0 10px var(--neon-magenta))' }} />
            <h1 style={styles.heroTitle}>About Quotanic</h1>
            <p style={styles.heroSubtitle}>Revolutionizing custom manufacturing through artificial intelligence and global connectivity.</p>
        </div>
        <div style={{ maxWidth: '800px', margin: '48px auto 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <section>
                <h3 style={{ ...styles.featureTitle, color: 'var(--neon-cyan)' }}>Our Mission</h3>
                <p style={{ ...styles.stepText, fontSize: '18px', lineHeight: '1.6' }}>
                    Quotanic was founded with a single goal: to make the procurement of custom manufactured parts as easy as buying something off a shelf. 
                    We believe that the future of manufacturing lies in the seamless integration of engineering intelligence and production capacity.
                </p>
            </section>
            <div style={styles.socialProofGrid}>
                <div className="hover-lift">
                    <h4 style={{ color: 'var(--neon-magenta)', marginBottom: '12px' }}>Intelligent Matching</h4>
                    <p style={styles.testimonialText}>Our proprietary AI analyzes 3D geometry in real-time to find the perfect manufacturer for every project, regardless of complexity.</p>
                </div>
                <div className="hover-lift">
                    <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '12px' }}>Global Network</h4>
                    <p style={styles.testimonialText}>We connect engineers with a vetted network of specialized manufacturers, from local machine shops to high-volume production facilities.</p>
                </div>
            </div>
            <section style={{ background: 'rgba(255,255,255,0.03)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={styles.featureTitle}>The Surena Vision</h3>
                <p style={styles.stepText}>
                    Quotanic is the result of years of experience in both software engineering and industrial manufacturing. 
                    Created by Surena, the platform represents a commitment to transparency, speed, and technical excellence. 
                    We are not just a marketplace; we are an OS for the physical world.
                </p>
            </section>
        </div>
    </div>
);

const HowItWorksDetailedPage = ({ onNavigate }: { onNavigate: (p: string) => void }) => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={styles.heroTitle}>How It Works</h1>
            <p style={styles.heroSubtitle}>A deeper dive into the Quotanic ecosystem.</p>
        </div>
        <div style={{ maxWidth: '900px', margin: '64px auto 0', display: 'grid', gap: '48px' }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                <div style={{ ...styles.stepIcon, minWidth: '64px', height: '64px', fontSize: '24px' }}>1</div>
                <div>
                    <h3 style={styles.featureTitle}>Upload & AI Analysis</h3>
                    <p style={styles.stepText}>When you upload an STL or STEP file, our Feature-Based Manufacturing (FBM) engine immediately goes to work. It calculates volume, surface area, detects undercuts, and assesses machinability. This data forms the basis of your instant quote.</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                <div style={{ ...styles.stepIcon, minWidth: '64px', height: '64px', fontSize: '24px', background: 'var(--neon-magenta)' }}>2</div>
                <div>
                    <h3 style={styles.featureTitle}>Smart Matching</h3>
                    <p style={styles.stepText}>We don't just broadcast your design to everyone. Our system matches your part's requirements (material, tolerances, volume) against our manufacturers' verified capabilities. You only receive quotes from shops that can actually deliver.</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                <div style={{ ...styles.stepIcon, minWidth: '64px', height: '64px', fontSize: '24px', background: 'var(--neon-orange)' }}>3</div>
                <div>
                    <h3 style={styles.featureTitle}>Secure Production</h3>
                    <p style={styles.stepText}>Once you accept a quote, the manufacturer receives the production files. All communication, status updates, and shipping tracking happen through your dashboard. Your payment is held securely until the project milestones are met.</p>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <CtaButton text="Get Started Now" onClick={() => onNavigate('upload')} primary />
            </div>
        </div>
    </div>
);

const FAQPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={styles.heroTitle}>Frequently Asked Questions</h1>
            <p style={styles.heroSubtitle}>Everything you need to know about Quotanic.</p>
        </div>
        <div style={{ maxWidth: '800px', margin: '48px auto 0', display: 'grid', gap: '24px' }}>
            {[
                { q: "What file formats do you support?", a: "We currently support STL and STEP files for automated analysis. For 2D drawings or other formats, you can upload them as supporting documentation." },
                { q: "How are shipping costs calculated?", a: "Shipping is calculated based on the weight/dimensions of your part and the distance between you and the manufacturer. You will see the total cost before placing your order." },
                { q: "Can I use my own material?", a: "Yes, you can specify custom materials during the upload process. Manufacturers will review these requests and provide quotes based on their ability to source or handle your material." },
                { q: "Is my data secure?", a: "Absolutely. We use end-to-end encryption and restrict file access to only the manufacturers you engage with. Check our Trust & Security page for more details." }
            ].map((faq, i) => (
                <div key={i} style={{ ...styles.featureCard, textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '8px', fontSize: '18px' }}>{faq.q}</h4>
                    <p style={styles.stepText}>{faq.a}</p>
                </div>
            ))}
        </div>
    </div>
);

const ContactPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={styles.heroTitle}>Contact Us</h1>
            <p style={styles.heroSubtitle}>Have a question or feedback? We'd love to hear from you.</p>
            <div style={{ ...styles.featureCard, marginTop: '48px', textAlign: 'left' }}>
                <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will get back to you shortly.'); }}>
                    <div style={styles.formGroup}><label style={styles.label}>Name</label><input type="text" style={styles.input} required /></div>
                    <div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" style={styles.input} required /></div>
                    <div style={styles.formGroup}><label style={styles.label}>Message</label><textarea style={{ ...styles.input, height: '120px' }} required></textarea></div>
                    <CtaButton text="Send Message" type="submit" primary />
                </form>
            </div>
            <div style={{ marginTop: '48px', color: 'var(--text-secondary)' }}>
                <p>Direct Email: support@quotanic.com</p>
                <p>Office: Mumbai, India</p>
            </div>
        </div>
    </div>
);

const LegalPage = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <h1 style={{ ...styles.heroTitle, textAlign: 'center', marginBottom: '48px' }}>{title}</h1>
            <div style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}>{content}</div>
        </div>
    </div>
);

const TrustAndSecurityPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <ShieldCheckIcon style={{ width: '64px', height: '64px', color: 'var(--neon-cyan)', marginBottom: '24px', filter: 'drop-shadow(0 0 10px var(--neon-cyan))' }} />
            <h1 style={styles.heroTitle}>Trust & Security</h1>
            <p style={styles.heroSubtitle}>Your intellectual property and data are our top priority. Learn about the measures we take to keep you secure.</p>
        </div>
        <div style={{ maxWidth: '800px', margin: '48px auto 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="hover-lift"><h3 style={styles.featureTitle}>Intellectual Property (IP) Protection</h3><p style={styles.stepText}>We understand that your designs are your most valuable asset. Our platform is built with multiple layers of security to ensure your IP is protected from the moment you upload it.</p><ul style={{ ...styles.featureList, marginTop: '16px', listStyle: 'disc', paddingLeft: '20px', gap: '8px' }}><li><strong>Secure Uploads:</strong> All file transfers are encrypted using industry-standard SSL/TLS protocols.</li><li><strong>Access Control:</strong> Your design files are only accessible to you and the manufacturers you choose to request quotes from.</li><li><strong>In-Browser 3D Viewer:</strong> Manufacturers can inspect your 3D models securely in their browser without downloading the source file, preventing unauthorized distribution.</li><li><strong>Integrated NDAs:</strong> We facilitate standardized Non-Disclosure Agreements that you can execute with manufacturers directly on the platform before sharing sensitive details.</li></ul></div>
            <div className="hover-lift"><h3 style={styles.featureTitle}>Manufacturer Vetting & Quality Assurance</h3><p style={styles.stepText}>We maintain a high-quality network by carefully vetting every manufacturer who joins our platform. This ensures you're working with professional and reliable partners.</p><ul style={{ ...styles.featureList, marginTop: '16px', listStyle: 'disc', paddingLeft: '20px', gap: '8px' }}><li><strong>Verification Process:</strong> We verify the business information and operational history of all manufacturers.</li><li><strong>Capability Audits:</strong> We review manufacturer-submitted information about their equipment, processes, and certifications.</li><li><strong>Community Reviews:</strong> Our transparent review system allows you to see ratings and feedback from other customers before placing an order.</li></ul></div>
            <div className="hover-lift"><h3 style={styles.featureTitle}>Secure Payments & Transactions</h3><p style={styles.stepText}>Our platform ensures that financial transactions are secure and transparent, protecting both customers and manufacturers.</p><ul style={{ ...styles.featureList, marginTop: '16px', listStyle: 'disc', paddingLeft: '20px', gap: '8px' }}><li><strong>Secure Payment Gateway:</strong> We partner with leading payment processors to handle all transactions securely. Your financial data is never stored on our servers.</li><li><strong>Escrow System (Coming Soon):</strong> We plan to implement an escrow system where payments are held securely and released to the manufacturer upon reaching agreed-upon project milestones.</li><li><strong>Clear Dispute Resolution:</strong> We provide a structured process to mediate and resolve any disputes related to payments or order fulfillment.</li></ul></div>
        </div>
    </div>
);

const LandingPageContent = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <><Hero onNavigate={onNavigate} /><HowItWorks /><ValueProposition /><ForWhom onNavigate={onNavigate} /><SocialProof /></>
);

type FooterProps = { onNavigate: (page: string, params?: any) => void; };
const Footer = ({ onNavigate }: FooterProps) => (
    <footer style={styles.footer} role="contentinfo">
        <div style={styles.container}>
            <div style={styles.footerGrid}>
                <div style={styles.footerColumn}><h3 style={styles.footerHeading}>Platform</h3><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('how-it-works-detailed'); }}>How It Works</a><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('directory'); }}>Manufacturer Directory</a><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('trust-and-security'); }}>Trust & Security</a></div>
                <div style={styles.footerColumn}><h3 style={styles.footerHeading}>Company</h3><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About Us</a><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('blog'); }}>Blog</a><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>Contact Us</a></div>
                <div style={styles.footerColumn}><h3 style={styles.footerHeading}>Resources</h3><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('faq'); }}>FAQ</a><a href="#" style={styles.footerLink}>Help Center</a></div>
                <div style={styles.footerColumn}><h3 style={styles.footerHeading}>Legal</h3><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>Privacy Policy</a><a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>Terms of Service</a></div>
            </div>
            <div style={styles.footerBottom}>
                <p style={styles.footerCopyright}>© {new Date().getFullYear()} Quotanic. All rights reserved.</p>
                <div style={styles.footerSocials}><a href="#" style={styles.footerSocialLink} aria-label="Twitter"><TwitterIcon /></a><a href="#" style={styles.footerSocialLink} aria-label="GitHub"><GithubIcon /></a><a href="#" style={styles.footerSocialLink} aria-label="LinkedIn"><LinkedInIcon /></a></div>
            </div>
        </div>
    </footer>
);

// --- Login/Signup Pages ---

const SignupRoleSelector = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => (
    <div style={styles.loginPage}><div style={styles.loginContainer}><h2 style={styles.loginTitle}>Join Quotanic</h2><p style={styles.loginSubtitle}>Select your account type to get started.</p><div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}><CtaButton text="Sign Up as a Customer" primary onClick={() => onNavigate('signup-customer')} /><CtaButton text="Sign Up as a Manufacturer" onClick={() => onNavigate('signup-manufacturer')} /></div><div style={{ textAlign: 'center', marginTop: '24px' }}><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Already have an account? <a href="#" style={{ ...styles.loginLink, fontSize: '14px' }} onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Log In</a></p></div></div></div>
);

const CustomerSignupPage = ({ onLogin, onNavigate }: { onLogin: (credentials: object, role: string) => Promise<void>, onNavigate: (page: string) => void }) => {
    const [companyName, setCompanyName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [password2, setPassword2] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== password2) { setError('Passwords do not match.'); return; }
        setError(''); setLoading(true);
        try {
            await api.register({ email, password, password2, company_name: companyName, role: 'customer' });
            await onLogin({ email, password }, 'customer');
        } catch (err) { setError(err.message); setLoading(false); }
    };
    return (
        <div style={styles.loginPage}><div style={styles.loginContainer}><h2 style={styles.loginTitle}>Create Customer Account</h2><p style={styles.loginSubtitle}>Get instant quotes from top manufacturers.</p><form onSubmit={handleSubmit} style={styles.loginForm}>{error && <p style={styles.loginError}>{error}</p>}<div style={styles.formGroup}><label htmlFor="companyName" style={styles.label}>Company Name</label><input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={styles.input} required /></div><div style={styles.formGroup}><label htmlFor="email" style={styles.label}>Email Address</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required autoComplete="email" /></div><div style={styles.formGroup}><label htmlFor="password" style={styles.label}>Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required autoComplete="new-password" /></div><div style={styles.formGroup}><label htmlFor="password2" style={styles.label}>Confirm Password</label><input type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)} style={styles.input} required autoComplete="new-password" /></div><CtaButton text={loading ? "Creating Account..." : "Create Account"} primary type="submit" disabled={loading} /></form><div style={styles.loginLinks}><a href="#" style={styles.loginLink} onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}>Back to role selection</a></div></div></div>
    );
};

const ManufacturerSignupPage = ({ onLogin, onNavigate }: { onLogin: (credentials: object, role: string) => Promise<void>, onNavigate: (page: string) => void }) => {
    const [formData, setFormData] = useState({ companyName: '', email: '', password: '', password2: '', location: '', website: '', productionVolume: '', leadTimeRange: '', certifications: [], otherCertifications: '', qualityControlProcesses: '', materialTesting: '', moq: '', machining: [], sheetMetal: [], casting: [], forging: [], injectionMolding: { processes: [], cavityCount: '', moldClass: '' }, threeDPrinting: [], weldingJoining: [], supportedMaterials: [], generalTolerance: '', specificTolerances: '', gdtSupport: false, minSizeX: '', minSizeY: '', minSizeZ: '', maxSizeX: '', maxSizeY: '', maxSizeZ: '', maxWeightKg: '', thinWallCapabilityMm: '', surfaceFinishes: [], postProcessing: [], acceptedFileFormats: [], incoterms: [], specialCapabilities: [], });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // Validation helper - scrolls to field and shows error
    const validateAndScroll = (fieldId: string, errorMessage: string) => {
        setFieldErrors(prev => ({ ...prev, [fieldId]: errorMessage }));
        setError(errorMessage); // Also show general error
        setTimeout(() => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }, 100);
        return false;
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (type === 'checkbox') { const { checked } = e.target as HTMLInputElement; setFormData(prev => ({ ...prev, [name]: checked })); } else { setFormData(prev => ({ ...prev, [name]: value })); }
    };
    const handleInjectionMoldingChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, injectionMolding: { ...prev.injectionMolding, [name]: value } })); };
    const handleCheckboxGroupChange = (category, value) => {
        if (category === 'injectionMoldingProcesses') {
            setFormData(prev => { const list = prev.injectionMolding.processes || []; const newList = list.includes(value) ? list.filter(item => item !== value) : [...list, value]; return { ...prev, injectionMolding: { ...prev.injectionMolding, processes: newList } }; });
        } else { setFormData(prev => { const list = (prev[category] as string[]) || []; const newList = list.includes(value) ? list.filter(item => item !== value) : [...list, value]; return { ...prev, [category]: newList }; }); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        const { password, password2, companyName, email, location, productionVolume, leadTimeRange, moq, machining, sheetMetal, casting, forging, injectionMolding, threeDPrinting, weldingJoining, supportedMaterials } = formData;

        // Field-by-field validation with auto-scroll
        if (!companyName) { setLoading(false); return validateAndScroll('companyName', 'Company name is required'); }
        if (!email) { setLoading(false); return validateAndScroll('email', 'Email address is required'); }
        if (!password) { setLoading(false); return validateAndScroll('password', 'Password is required'); }
        if (!password2) { setLoading(false); return validateAndScroll('password2', 'Please confirm your password'); }
        if (password !== password2) { setLoading(false); return validateAndScroll('password2', 'Passwords do not match'); }
        if (!location) { setLoading(false); return validateAndScroll('location', 'Location is required'); }
        if (!productionVolume) { setLoading(false); return validateAndScroll('productionVolume', 'Production volume is required'); }
        if (!leadTimeRange) { setLoading(false); return validateAndScroll('leadTimeRange', 'Lead time range is required'); }
        if (!moq) { setLoading(false); return validateAndScroll('moq', 'Minimum order quantity is required'); }

        const totalProcesses = [...machining, ...sheetMetal, ...casting, ...forging, ...injectionMolding.processes, ...threeDPrinting, ...weldingJoining].length;
        if (totalProcesses === 0) { setLoading(false); setError('Please select at least one Manufacturing Process.'); return; }
        if (supportedMaterials.length === 0) { setLoading(false); setError('Please select at least one supported Material.'); return; }
        try {
            await api.register({ email, password, password2, company_name: companyName, role: 'manufacturer' });
            const { access, refresh } = await api.login({ email, password });
            setTokens(access, refresh);

            // Prepare complete profile data matching backend expectations
            const allProcesses = [
                ...formData.machining,
                ...formData.sheetMetal,
                ...formData.casting,
                ...formData.forging,
                ...formData.injectionMolding.processes,
                ...formData.threeDPrinting,
                ...formData.weldingJoining
            ];

            const profileData = {
                location: formData.location,
                website_url: formData.website || null,
                certifications: [
                    ...formData.certifications,
                    ...formData.otherCertifications.split(',').map(s => s.trim()).filter(Boolean)
                ],
                capabilities: {
                    manufacturing_processes: allProcesses,
                    materials_supported: formData.supportedMaterials,
                    production_volume: formData.productionVolume,
                    lead_time_range: formData.leadTimeRange,
                    moq: parseInt(formData.moq) || 1,
                    max_size_mm: [
                        formData.maxSizeX ? Number(formData.maxSizeX) : null,
                        formData.maxSizeY ? Number(formData.maxSizeY) : null,
                        formData.maxSizeZ ? Number(formData.maxSizeZ) : null
                    ],
                    quality_control: formData.qualityControlProcesses || '',
                    material_testing: formData.materialTesting || ''
                }
            };

            await api.updateManufacturerProfile(profileData);
            await onLogin({ email, password }, 'manufacturer');
        } catch (err) { setError(err.message); setLoading(false); }
    };

    // Helper to get input style with error highlighting
    const getInputStyle = (fieldName: string) => ({
        ...styles.input,
        borderColor: fieldErrors[fieldName] ? 'var(--status-error)' : styles.input.borderColor,
        borderWidth: fieldErrors[fieldName] ? '2px' : '1px'
    });

    const manufacturerSignupContainerStyle = { ...styles.loginContainer, maxWidth: '900px' };

    return (
        <div style={styles.loginPage}><div style={manufacturerSignupContainerStyle}><h2 style={styles.loginTitle}>Create Manufacturer Account</h2><p style={styles.loginSubtitle}>Join our network and start receiving orders. Fields marked with * are required.</p><form onSubmit={handleSubmit}>{error && <p style={styles.loginError}>{error}</p>}<fieldset style={styles.fieldset}><legend style={styles.legend}>Account & Profile</legend><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="companyName" style={styles.label}>Company Name *</label><input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} style={getInputStyle('companyName')} required />{fieldErrors.companyName && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.companyName}</p>}</div><div style={styles.formGroup}><label htmlFor="email" style={styles.label}>Email Address *</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} style={getInputStyle('email')} required autoComplete="email" />{fieldErrors.email && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.email}</p>}</div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="password" style={styles.label}>Password *</label><input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} style={getInputStyle('password')} required autoComplete="new-password" />{fieldErrors.password && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.password}</p>}</div><div style={styles.formGroup}><label htmlFor="password2" style={styles.label}>Confirm Password *</label><input type="password" id="password2" name="password2" value={formData.password2} onChange={handleInputChange} style={getInputStyle('password2')} required autoComplete="new-password" />{fieldErrors.password2 && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.password2}</p>}</div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="location" style={styles.label}>Location (City, Country) *</label><input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} style={getInputStyle('location')} required />{fieldErrors.location && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.location}</p>}</div><div style={styles.formGroup}><label htmlFor="website" style={styles.label}>Website URL</label><input type="url" name="website" value={formData.website} onChange={handleInputChange} style={styles.input} placeholder="https://yourcompany.com" /></div></div></fieldset><fieldset style={styles.fieldset}><legend style={styles.legend}>1. General Capabilities *</legend><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="productionVolume" style={styles.label}>Production Volume Capacity *</label><select id="productionVolume" name="productionVolume" value={formData.productionVolume} onChange={handleInputChange} style={getInputStyle('productionVolume')} required><option value="">Select volume...</option>{PRODUCTION_VOLUMES.map(v => <option key={v} value={v}>{v}</option>)}</select>{fieldErrors.productionVolume && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.productionVolume}</p>}</div><div style={styles.formGroup}><label htmlFor="leadTimeRange" style={styles.label}>Typical Lead Time Range *</label><input type="text" id="leadTimeRange" name="leadTimeRange" value={formData.leadTimeRange} onChange={handleInputChange} style={getInputStyle('leadTimeRange')} required placeholder="e.g., 5-10 days" />{fieldErrors.leadTimeRange && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.leadTimeRange}</p>}</div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="moq" style={styles.label}>Minimum Order Quantity (MOQ) *</label><input type="number" id="moq" name="moq" value={formData.moq} onChange={handleInputChange} style={getInputStyle('moq')} required min="0" />{fieldErrors.moq && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.moq}</p>}</div><div style={styles.formGroup}><label htmlFor="otherCertifications" style={styles.label}>Other Certs (comma-separated)</label><input type="text" name="otherCertifications" value={formData.otherCertifications} onChange={handleInputChange} style={styles.input} /></div></div><CheckboxGroup title="Certifications" options={CERTIFICATIONS} selected={formData.certifications} onChange={(v) => handleCheckboxGroupChange('certifications', v)} /><div style={styles.formGroup}><label htmlFor="qualityControlProcesses" style={styles.label}>Quality Control Processes</label><textarea name="qualityControlProcesses" value={formData.qualityControlProcesses} onChange={handleInputChange} style={styles.input} rows={3}></textarea></div><div style={styles.formGroup}><label htmlFor="materialTesting" style={styles.label}>Material Testing / Inspection Equipment</label><textarea name="materialTesting" value={formData.materialTesting} onChange={handleInputChange} style={styles.input} rows={3}></textarea></div></fieldset><fieldset style={styles.fieldset}><legend style={styles.legend}>2. Manufacturing Processes Supported *</legend><p style={styles.fieldsetDescription}>Select all that apply. You must select at least one process.</p>{ALL_CAPABILITIES_GROUPS.map(group => <CheckboxGroup key={group.title} title={group.title} options={group.processes} selected={formData[group.title.toLowerCase().replace(/ & /g, 'and').replace(/ /g, '')] || []} onChange={(v) => handleCheckboxGroupChange(group.title.toLowerCase().replace(/ & /g, 'and').replace(/ /g, ''), v)} />)}</fieldset><fieldset style={styles.fieldset}><legend style={styles.legend}>3. Material Capabilities *</legend><p style={styles.fieldsetDescription}>You must select at least one material.</p><CheckboxGroup title="Metals" options={MATERIALS_METALS} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Plastics" options={MATERIALS_PLASTICS} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Composites" options={MATERIALS_COMPOSITES} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Others" options={MATERIALS_OTHERS} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /></fieldset><div style={{ marginTop: '24px' }}><CtaButton text={loading ? "Creating Account..." : "Create Account & Go to Dashboard"} primary type="submit" disabled={loading} /></div></form><div style={styles.loginLinks}><a href="#" style={styles.loginLink} onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}>Back to role selection</a></div></div></div>
    );
};

const LoginPage = ({ onLogin, onNavigate, role }) => {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
    const isCustomer = role === 'customer';
    const title = isCustomer ? "Customer Sign In" : "Manufacturer Sign In";
    const subtitle = isCustomer ? "Access your account to manage your designs and orders." : "Access your dashboard to manage quotes and production.";
    const signupText = isCustomer ? "Don't have an account? Sign Up" : "Want to join our network? Apply here";
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try { await onLogin({ email, password }, role); } catch (err) { setError(err.message); setLoading(false); }
    };
    return (<div style={styles.loginPage}><div style={styles.loginContainer}><h2 style={styles.loginTitle}>{title}</h2><p style={styles.loginSubtitle}>{subtitle}</p><form onSubmit={handleSubmit} style={styles.loginForm}>{error && <p style={styles.loginError}>{error}</p>}<div style={styles.formGroup}><label htmlFor="email" style={styles.label}>Email Address</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required autoComplete="email" /></div><div style={styles.formGroup}><label htmlFor="password" style={styles.label}>Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required autoComplete="current-password" /></div><CtaButton text={loading ? "Signing In..." : "Sign In"} primary type="submit" disabled={loading} /></form><div style={styles.loginLinks}><a href="#" style={{ ...styles.loginLink }} onClick={(e) => { e.preventDefault(); }}>Forgot password?</a><a href="#" style={styles.loginLink} onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}>{signupText}</a></div></div></div>);
};

const LoginRoleSelector = ({ onNavigate, reasonMessage }: { onNavigate: (page: string) => void, reasonMessage?: string }) => (
    <div style={styles.loginPage}><div style={styles.loginContainer}>{reasonMessage && <p style={styles.loginReasonMessage}>{reasonMessage}</p>}<h2 style={styles.loginTitle}>Sign In</h2><p style={styles.loginSubtitle}>Please select your role to continue.</p><div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}><CtaButton text="I'm a Customer" primary onClick={() => onNavigate('login-customer')} /><CtaButton text="I'm a Manufacturer" onClick={() => onNavigate('login-manufacturer')} /></div><div style={{ textAlign: 'center', marginTop: '24px' }}><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>New to Quotanic? <a href="#" style={{ ...styles.loginLink, fontSize: '14px' }} onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}>Create an account</a></p><p style={{ marginTop: '16px' }}><a href="#" style={{ ...styles.loginLink, color: 'var(--text-secondary)', fontSize: '14px' }} onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>← Back to Homepage</a></p></div></div></div>
);

// --- Dashboard & Upload Components ---

type UploadPageProps = {
    onProceedToLogin: (data: any) => void;
    onNavigate: (page: string) => void;
    isAuthenticated: boolean;
    user: any;
    pendingData?: any;
    targetManufacturerId?: string;
};

const UploadPage = ({ onProceedToLogin, onNavigate, isAuthenticated, user, pendingData = null, targetManufacturerId }: UploadPageProps) => {
    const [formData, setFormData] = useState({
        designName: '',
        material: '',
        quantity: '',
        manufacturingProcess: '',
        surfaceFinish: 'None',
        tolerances: '',
        postProcessing: [],
        additionalInstructions: '',
        requiredCertifications: '',
        shippingDestination: '',
        targetPrice: '',
        urgency: 'standard',
        packaging: 'standard',
        inspectionRequirements: [] as string[],
        requiresEngineeringReview: false,
    });
    const [file, setFile] = useState<File | null>(null);
    const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supportingFilesInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePostProcessingChange = (option: string) => {
        setFormData(prev => {
            const { postProcessing } = prev;
            const newPostProcessing = postProcessing.includes(option)
                ? postProcessing.filter(item => item !== option)
                : [...postProcessing, option];
            return { ...prev, postProcessing: newPostProcessing };
        });
    };

    const handleInspectionChange = (option: string) => {
        setFormData(prev => {
            const { inspectionRequirements } = prev;
            const newReqs = inspectionRequirements.includes(option)
                ? inspectionRequirements.filter(item => item !== option)
                : [...inspectionRequirements, option];
            return { ...prev, inspectionRequirements: newReqs };
        });
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { setFile(e.dataTransfer.files[0]); setError(''); e.dataTransfer.clearData(); } };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) { setFile(e.target.files[0]); setError(''); } };

    const handleSupportingFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSupportingFiles(prev => [...prev, ...Array.from(e.target.files)]);
            if (e.target) e.target.value = null; // Allow selecting the same file again
        }
    };

    const removeSupportingFile = (indexToRemove: number) => {
        setSupportingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleDirectUpload = async () => {
        try {
            // Get upload URL (or local storage flag)
            const uploadUrlResponse = await api.getUploadUrl(file.name, file.type);
            const { upload_url, s3_file_key, use_local } = uploadUrlResponse;

            // Handle local storage differently
            if (use_local) {
                // For local storage, convert file to base64 and send directly
                const reader = new FileReader();
                const fileData = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // Create design with file data embedded
                const designData = {
                    design_name: formData.designName,
                    s3_file_key,
                    file_data: fileData, // Base64 encoded file
                    file_name: file.name,
                    material: formData.material,
                    quantity: parseInt(formData.quantity) || 1,
                    manufacturing_process: formData.manufacturingProcess,
                    surface_finish: formData.surfaceFinish,
                    tolerances: formData.tolerances,
                    post_processing: formData.postProcessing,
                    additional_instructions: formData.additionalInstructions,
                    required_certifications: formData.requiredCertifications,
                    shipping_destination: formData.shippingDestination,
                    target_price: formData.targetPrice,
                    urgency: formData.urgency,
                    packaging: formData.packaging,
                    inspection_requirements: formData.inspectionRequirements,
                    requires_engineering_review: formData.requiresEngineeringReview,
                    use_local_storage: true
                };

                await api.createDesign(designData);
                onNavigate('dashboard');
                return;
            }

            // Otherwise use S3 flow
            const uploadResponse = await fetch(upload_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadResponse.ok) {
                throw new Error('File upload to S3 failed');
            }

            // Create design with all form data
            const designData = {
                design_name: formData.designName,
                s3_file_key,
                material: formData.material,
                quantity: parseInt(formData.quantity) || 1,
                manufacturing_process: formData.manufacturingProcess,
                surface_finish: formData.surfaceFinish,
                tolerances: formData.tolerances,
                post_processing: formData.postProcessing,
                additional_instructions: formData.additionalInstructions,
                required_certifications: formData.requiredCertifications,
                shipping_destination: formData.shippingDestination,
                target_price: formData.targetPrice,
                urgency: formData.urgency,
                packaging: formData.packaging,
                inspection_requirements: formData.inspectionRequirements,
                requires_engineering_review: formData.requiresEngineeringReview
            };

            const newDesign = await api.createDesign(designData);

            if (targetManufacturerId) {
                try {
                    // Attempt to generate a quote for this specific manufacturer
                    await api.generateQuotes(newDesign.id, targetManufacturerId);
                    alert("Design uploaded and quote requested from manufacturer.");
                } catch (quoteErr) {
                    console.error("Failed to generate targeted quote:", quoteErr);
                    // Don't block success navigation, but maybe warn
                    alert("Design uploaded, but failed to request quote immediately. Please try again from dashboard.");
                }
            } else {
                // Trigger general generation or let user do it?
                // For now, keep existing flow (which didn't seem to trigger it automatically), 
                // or maybe we should trigger general if no target? 
                // The requirement was specific to targeted.

                // If the backend requires ANALYSIS_COMPLETE, this subsequent call might fail 
                // if analysis isn't instant. We'll attempt it anyway if that's the desired flow.
            }

            // Success! Navigate to dashboard
            onNavigate('dashboard');
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError('Please select a primary CAD file to upload.');
            return;
        }
        if (!formData.designName || !formData.manufacturingProcess || !formData.material || !formData.quantity) {
            setError('Please fill all required fields (*).');
            return;
        }
        setLoading(true);

        // If user is already authenticated, upload directly
        if (isAuthenticated && user) {
            await handleDirectUpload();
        } else {
            // Otherwise, proceed to login flow
            onProceedToLogin({ file, supportingFiles, ...formData });
        }

    };

    const dropzoneStyle = { ...styles.uploadDropzone, ...(isDragging ? styles.uploadDropzoneActive : {}), };

    return (<div style={styles.uploadPageContainer}><div style={styles.dashboardHeader}><h1 style={styles.dashboardTitle}>Get an Instant Quote</h1></div><p style={{ ...styles.loginSubtitle, textAlign: 'left', marginTop: '-16px', marginBottom: '32px' }}>Step 1 of 2: Specify design details and upload your CAD file.</p><form onSubmit={handleSubmit}>{error && <p style={styles.loginError}>{error}</p>}<div style={styles.uploadLayout}><div style={styles.uploadDropzoneWrapper}><label style={styles.label}>Primary CAD File (.stl, .step, .iges, .igs, .stp) *</label><div style={dropzoneStyle} onDragEnter={e => e.stopPropagation()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}><input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".stl,.step,.iges,.igs,.stp" />{file ? (<div style={styles.uploadFileInfo}><FileIcon /><p style={styles.uploadFileName}>{file.name}</p><p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(2)} KB</p><CtaButton text="Clear" onClick={(e) => { e.stopPropagation(); setFile(null); }} type="button" /></div>) : (<><UploadIcon style={{ ...iconStyle, width: '64px', height: '64px', color: 'var(--text-secondary)' }} /><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Drag & drop file here</p><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>or click to browse</p></>)}</div></div><div style={styles.uploadFormFields}><div style={styles.formGroup}><label htmlFor="designName" style={styles.label}>Design Name *</label><input type="text" id="designName" name="designName" value={formData.designName} onChange={handleInputChange} style={styles.input} required placeholder="e.g., Main Housing Unit" /></div><div style={styles.formGroup}><label htmlFor="quantity" style={styles.label}>Quantity *</label><input type="text" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} style={styles.input} required list="quantity-options" placeholder="e.g., 25 or select a range" /><datalist id="quantity-options"><option value="1-10 (Prototypes)"></option><option value="11-50 (Small Batch)"></option><option value="51-250 (Low Volume)"></option><option value="251-1000 (Medium Volume)"></option><option value="1000+ (High Volume)"></option></datalist></div><div style={styles.formGroup}><label htmlFor="manufacturingProcess" style={styles.label}>Manufacturing Process *</label><select id="manufacturingProcess" name="manufacturingProcess" value={formData.manufacturingProcess} onChange={handleInputChange} style={styles.input} required><option value="">Select a process...</option>{ALL_CAPABILITIES_GROUPS.map(group => (<optgroup label={group.title} key={group.title}>{group.processes.map(process => <option key={process} value={process}>{process}</option>)}</optgroup>))}</select></div><div style={styles.formGroup}><label htmlFor="material" style={styles.label}>Material *</label><select id="material" name="material" value={formData.material} onChange={handleInputChange} style={styles.input} required><option value="">Select a material...</option><optgroup label="Plastics">{MATERIALS_PLASTICS.map(m => <option key={m} value={m}>{m}</option>)}</optgroup><optgroup label="Metals">{MATERIALS_METALS.map(m => <option key={m} value={m}>{m}</option>)}</optgroup><optgroup label="Composites">{MATERIALS_COMPOSITES.map(m => <option key={m} value={m}>{m}</option>)}</optgroup><optgroup label="Other">{MATERIALS_OTHERS.map(m => <option key={m} value={m}>{m}</option>)}</optgroup></select></div><div style={styles.formGroup}><label htmlFor="surfaceFinish" style={styles.label}>Surface Finish</label><select id="surfaceFinish" name="surfaceFinish" value={formData.surfaceFinish} onChange={handleInputChange} style={styles.input}><option value="None">None</option>{SURFACE_FINISHES.map(f => <option key={f} value={f}>{f}</option>)}</select></div><div style={styles.formGroup}><label htmlFor="tolerances" style={styles.label}>Tolerances (if any)</label><input type="text" id="tolerances" name="tolerances" value={formData.tolerances} onChange={handleInputChange} style={styles.input} placeholder="e.g., +/- 0.05mm on critical features" /></div><CheckboxGroup title="Post-Processing (Optional)" options={POST_PROCESSING_ASSEMBLY} selected={formData.postProcessing} onChange={handlePostProcessingChange} columns={2} />

        <fieldset style={{ ...styles.fieldset, marginTop: '24px', padding: '24px', backgroundColor: 'transparent', border: `1px solid var(--border-color)` }}>
            <legend style={{ ...styles.legend, padding: '0 8px' }}>Supporting Information (Optional)</legend>

            <div style={styles.formGroup}>
                <label style={styles.label}>Supporting Documents & Models</label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '-4px 0 8px 0' }}>Add technical drawings (PDF, DXF), secondary models, or other relevant files.</p>
                <input type="file" multiple ref={supportingFilesInputRef} onChange={handleSupportingFilesChange} style={{ display: 'none' }} accept=".pdf,.dxf,.step,.stp,.iges,.igs,.zip,.rar,.sldprt,.dwg" />
                <CtaButton text="Add Files" onClick={() => supportingFilesInputRef.current?.click()} type="button" />
                {supportingFiles.length > 0 && (
                    <div style={styles.supportingFileList}>
                        {supportingFiles.map((f, index) => (
                            <div key={`${f.name}-${index}`} style={styles.supportingFileItem}>
                                <DocumentTextIcon style={{ width: '20px', height: '20px', color: 'var(--text-secondary)', flexShrink: 0, marginRight: '8px' }} />
                                <span style={styles.supportingFileName} title={f.name}>{f.name}</span>
                                <button type="button" onClick={() => removeSupportingFile(index)} style={styles.supportingFileRemoveBtn} aria-label={`Remove ${f.name}`}>
                                    <XMarkIcon style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={styles.formGroup}>
                <label htmlFor="urgency" style={styles.label}>Urgency</label>
                <select id="urgency" name="urgency" value={formData.urgency} onChange={handleInputChange} style={styles.input}>
                    <option value="standard">Standard Lead Time</option>
                    <option value="urgent">Urgent (Premium)</option>
                </select>
            </div>

            <div style={styles.formGroup}>
                <label htmlFor="packaging" style={styles.label}>Packaging</label>
                <select id="packaging" name="packaging" value={formData.packaging} onChange={handleInputChange} style={styles.input}>
                    <option value="standard">Standard Packaging</option>
                    <option value="custom">Custom / Branded</option>
                    <option value="export">Export Crate (Fumigated)</option>
                </select>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Quality Control & Inspection</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['Standard Inspection', 'CMM Report', 'Material Certificate', 'Hardness Test'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleInspectionChange(opt)}
                            style={{
                                ...styles.chip,
                                backgroundColor: formData.inspectionRequirements.includes(opt) ? styles.chipActive.backgroundColor : styles.chip.backgroundColor,
                                color: formData.inspectionRequirements.includes(opt) ? styles.chipActive.color : styles.chip.color,
                                border: formData.inspectionRequirements.includes(opt) ? styles.chipActive.border : styles.chip.border
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ ...styles.formGroup, marginTop: '16px' }}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={formData.requiresEngineeringReview}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiresEngineeringReview: e.target.checked }))}
                        style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Requires Engineering Review
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 26px' }}>
                    Check if design has complex geometries, tight tolerances (&lt;±0.05mm), or critical applications
                </p>
            </div>

            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                <label htmlFor="additionalInstructions" style={styles.label}>Additional Instructions</label>
                <textarea id="additionalInstructions" name="additionalInstructions" value={formData.additionalInstructions} onChange={handleInputChange} style={{ ...styles.input, height: '100px', resize: 'vertical' }} placeholder="Any specific requirements..." />
            </div>
            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                <label htmlFor="requiredCertifications" style={styles.label}>Required Certifications</label>
                <input type="text" id="requiredCertifications" name="requiredCertifications" value={formData.requiredCertifications} onChange={handleInputChange} style={styles.input} placeholder="e.g., ISO 9001, Material Certs" />
            </div>
            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                <label htmlFor="shippingDestination" style={styles.label}>Shipping Destination</label>
                <input type="text" id="shippingDestination" name="shippingDestination" value={formData.shippingDestination} onChange={handleInputChange} style={styles.input} placeholder="e.g., Austin, TX, USA" />
            </div>
            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                <label htmlFor="targetPrice" style={styles.label}>Target Price per Part</label>
                <input type="text" id="targetPrice" name="targetPrice" value={formData.targetPrice} onChange={handleInputChange} style={styles.input} placeholder="e.g., $15.50 (optional)" />
            </div>
        </fieldset>

        <div style={{ marginTop: '32px' }}>
            <CtaButton
                text={loading ? "Processing..." : (isAuthenticated ? (targetManufacturerId ? "Request Quote" : "Upload Design") : "Proceed to Login")}
                primary
                type="submit"
                disabled={loading}
            />
        </div>
    </div></div></form></div>);
};

// --- Manufacturer Directory & Profile Pages ---
const ManufacturerCard = ({ manufacturer, onNavigate }) => {
    const [hover, setHover] = useState(false);
    return (
        <div style={{ ...styles.mfgCard, ...(hover && styles.mfgCardHover) }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onNavigate('manufacturer-profile', manufacturer.id)} className="hover-lift">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <img src={manufacturer.logoUrl} alt={`${manufacturer.company_name} logo`} style={styles.mfgCardLogo} />
                <div style={{ flex: 1 }}>
                    <h3 style={styles.mfgCardTitle}>{manufacturer.company_name}</h3>
                    <p style={styles.mfgCardLocation}>
                        <LocationMarkerIcon style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--text-secondary)', flexShrink: 0 }} />
                        {manufacturer.location}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFD700' }}>
                    <StarIcon style={{ width: '16px', height: '16px', filter: 'drop-shadow(0 0 3px #FFD700)' }} />
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{(parseFloat(manufacturer.rating) || 0).toFixed(1)}</span>
                </div>
            </div>

            <div style={{ marginTop: '16px' }}>
                <h4 style={styles.mfgCardSectionTitle}>Key Capabilities</h4>
                <div style={styles.mfgCardTagContainer}>
                    {manufacturer.capabilities.slice(0, 3).map(cap => <span key={cap} style={styles.mfgCardTag}>{cap}</span>)}
                    {manufacturer.capabilities.length > 3 && <span style={styles.mfgCardTag}>+{manufacturer.capabilities.length - 3} more</span>}
                </div>
            </div>
            <div style={{ marginTop: '16px' }}>
                <h4 style={styles.mfgCardSectionTitle}>Certifications</h4>
                <div style={styles.mfgCardTagContainer}>
                    {manufacturer.certifications.length > 0 ? (
                        manufacturer.certifications.map(cert => <span key={cert} style={{ ...styles.mfgCardTag, ...styles.mfgCardCertTag }}>{cert}</span>)
                    ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>None listed</span>
                    )}
                </div>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <span style={{ ...styles.mfgCardViewProfileLink, ...(hover && styles.mfgCardViewProfileLinkHover) }}>View Profile →</span>
            </div>
        </div>
    );
};

const ManufacturerDirectoryPage = ({ onNavigate }) => {
    const [manufacturers, setManufacturers] = useState([]);
    const [filteredManufacturers, setFilteredManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCapabilities, setSelectedCapabilities] = useState([]);
    const [selectedCertifications, setSelectedCertifications] = useState([]);

    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const data = await api.getManufacturers();
                if (Array.isArray(data)) {
                    setManufacturers(data);
                    setFilteredManufacturers(data);
                } else {
                    setError('Received invalid data for manufacturers.');
                }
            } catch (err) {
                setError('Failed to load manufacturers.');
            } finally {
                setLoading(false);
            }
        };
        fetchManufacturers();
    }, []);

    useEffect(() => {
        let results = manufacturers;
        if (searchTerm) {
            results = results.filter(m => m.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCapabilities.length > 0) {
            results = results.filter(m => selectedCapabilities.every(cap => m.capabilities.includes(cap)));
        }
        if (selectedCertifications.length > 0) {
            results = results.filter(m => selectedCertifications.every(cert => m.certifications.includes(cert)));
        }
        setFilteredManufacturers(results);
    }, [searchTerm, selectedCapabilities, selectedCertifications, manufacturers]);

    const handleCapabilityChange = (capability) => {
        setSelectedCapabilities(prev => prev.includes(capability) ? prev.filter(c => c !== capability) : [...prev, capability]);
    };

    const handleCertificationChange = (certification) => {
        setSelectedCertifications(prev => prev.includes(certification) ? prev.filter(c => c !== certification) : [...prev, certification]);
    };

    return (
        <div style={{ ...styles.container, padding: '64px 24px' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={styles.heroTitle}>Manufacturer Directory</h1>
                <p style={styles.heroSubtitle}>Find the perfect partner for your manufacturing needs.</p>
            </div>
            <div style={styles.directoryLayout}>
                <aside style={styles.directoryFilters}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Filters</h2>
                    <div style={styles.searchContainer}>
                        <SearchIcon style={{ position: 'absolute', left: '12px', top: '12px', width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <CheckboxGroup title="Capabilities" options={ALL_CAPABILITIES_FLAT.slice(0, 9)} selected={selectedCapabilities} onChange={handleCapabilityChange} columns={1} />
                        {ALL_CAPABILITIES_FLAT.length > 9 && <a href="#" style={{ ...styles.loginLink, fontSize: '14px' }}>Show all...</a>}
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <CheckboxGroup title="Certifications" options={CERTIFICATIONS} selected={selectedCertifications} onChange={handleCertificationChange} columns={1} />
                    </div>
                </aside>
                <main style={styles.directoryResults}>
                    {loading ? (
                        <p>Loading manufacturers...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : filteredManufacturers.length > 0 ? (
                        <div style={styles.mfgGrid}>
                            {filteredManufacturers.map(mfg => <ManufacturerCard key={mfg.id} manufacturer={mfg} onNavigate={onNavigate} />)}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '64px', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
                            <h3 style={{ color: 'var(--text-primary)' }}>No Manufacturers Found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const ManufacturerProfilePage = ({ manufacturerId, onNavigate }) => {
    const [manufacturer, setManufacturer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!manufacturerId) {
            setError('No manufacturer ID provided.');
            setLoading(false);
            return;
        }
        const fetchManufacturer = async () => {
            setLoading(true);
            try {
                const data = await api.getManufacturerById(manufacturerId);
                if (data) {
                    setManufacturer(data);
                } else {
                    setError('Manufacturer not found.');
                }
            } catch (err) {
                setError('Failed to load manufacturer details.');
            } finally {
                setLoading(false);
            }
        };
        fetchManufacturer();
    }, [manufacturerId]);

    const getCapabilitiesByGroup = () => {
        if (!manufacturer?.capabilities) return [];
        return ALL_CAPABILITIES_GROUPS.map(group => ({
            title: group.title,
            processes: group.processes.filter(p => manufacturer.capabilities.includes(p))
        })).filter(g => g.processes.length > 0);
    };

    if (loading) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!manufacturer) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Manufacturer profile could not be loaded.</div>;

    const capabilityGroups = getCapabilitiesByGroup();
    const materials = manufacturer.capabilities.filter(c => [...MATERIALS_METALS, ...MATERIALS_PLASTICS, ...MATERIALS_COMPOSITES, ...MATERIALS_OTHERS].includes(c));

    const profileHeaderStyle: React.CSSProperties = {
        ...styles.profileHeader,
        backgroundImage: `linear-gradient(rgba(var(--bg-deep-space-rgb), 0.7), rgba(var(--bg-deep-space-rgb), 0.7)), url(${manufacturer.backgroundUrl})`,
    };

    return (
        <div style={styles.profilePageContainer}>
            <header style={profileHeaderStyle}>
                <div style={styles.container}>
                    <button onClick={() => onNavigate('directory')} style={styles.backButton}>
                        <ArrowLeftIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                        Back to Directory
                    </button>
                    <div style={styles.profileHeaderContent}>
                        <img src={manufacturer.logoUrl} alt={`${manufacturer.company_name} logo`} style={styles.profileHeaderLogo} />
                        <div style={{ flex: 1 }}>
                            <h1 style={styles.profileTitle}>{manufacturer.company_name}</h1>
                            <p style={styles.profileLocation}>
                                <LocationMarkerIcon style={{ width: '18px', height: '18px', marginRight: '6px' }} />
                                {manufacturer.location}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <StarIcon style={{ width: '28px', height: '28px', color: '#FFD700', filter: 'drop-shadow(0 0 5px #FFD700)' }} />
                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{(parseFloat(manufacturer.rating) || 0).toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </header>
            <div style={styles.container}>
                <div style={styles.profileContentGrid}>
                    <main style={styles.profileMainContent}>
                        <section style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>About {manufacturer.company_name}</h2>
                            <p style={styles.stepText}>{manufacturer.about}</p>
                        </section>
                        <section style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Project Portfolio</h2>
                            <div style={styles.profilePortfolioGrid}>
                                {manufacturer.portfolio.map(item => (
                                    <div key={item.id} style={styles.portfolioItem}>
                                        {item.type === 'video' ? (
                                            <div style={styles.portfolioVideoPlaceholder}>
                                                <VideoCameraIcon style={{ width: '48px', height: '48px', color: '#fff' }} />
                                            </div>
                                        ) : (
                                            <img src={item.url} alt={item.title} style={styles.profilePortfolioImage} />
                                        )}
                                        <div style={styles.portfolioItemOverlay}>
                                            <p style={styles.portfolioItemTitle}>{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Customer Reviews</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {manufacturer.reviews.map(review => (
                                    <div key={review.id} style={{ border: `1px solid var(--border-color)`, backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)', borderRadius: '8px', padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{review.author}</p>
                                            <div style={{ display: 'flex', gap: '2px', color: '#FFD700' }}>
                                                {[...Array(review.rating)].map((_, i) => <StarIcon key={i} style={{ width: '16px', height: '16px', filter: 'drop-shadow(0 0 2px #FFD700)' }} />)}
                                                {[...Array(5 - review.rating)].map((_, i) => <StarIcon key={i} style={{ width: '16px', height: '16px', color: 'rgba(175, 200, 255, 0.2)' }} />)}
                                            </div>
                                        </div>
                                        <p style={{ ...styles.stepText, fontSize: '14px' }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                    <aside style={styles.profileSidebar}>
                        <div style={{ ...styles.profileSection, border: '1px solid var(--neon-cyan)', padding: '24px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', textAlign: 'center', boxShadow: '0 0 15px rgba(var(--neon-cyan-rgb), 0.3)' }}>
                            <CtaButton text="Request Quote" primary onClick={() => onNavigate('upload', manufacturer.id)} className="button-full-width" />
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Capabilities</h2>
                            {capabilityGroups.map(group => (
                                <div key={group.title} style={{ marginBottom: '16px' }}>
                                    <h3 style={styles.mfgCardSectionTitle}>{group.title}</h3>
                                    <div style={styles.mfgCardTagContainer}>
                                        {group.processes.map(p => <span key={p} style={styles.mfgCardTag}>{p}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Certifications</h2>
                            <div style={styles.mfgCardTagContainer}>
                                {manufacturer.certifications.length > 0 ?
                                    manufacturer.certifications.map(c => <span key={c} style={{ ...styles.mfgCardTag, ...styles.mfgCardCertTag }}>{c}</span>)
                                    : <p style={styles.stepText}>No certifications listed.</p>}
                            </div>
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Materials</h2>
                            <div style={styles.mfgCardTagContainer}>
                                {materials.length > 0 ?
                                    materials.map(m => <span key={m} style={{ ...styles.mfgCardTag, ...styles.mfgCardMaterialTag }}>{m}</span>)
                                    : <p style={styles.stepText}>No materials specified.</p>}
                            </div>
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Equipment List</h2>
                            <ul style={{ ...styles.featureList, listStyle: 'disc', paddingLeft: '20px', gap: '8px', margin: 0 }}>
                                {manufacturer.equipment.map(e => <li key={e}>{e}</li>)}
                            </ul>
                        </div>
                        {manufacturer.qualityControl && (
                            <div style={styles.profileSection}>
                                <h2 style={styles.profileSectionTitle}>Quality Control</h2>
                                <p style={styles.stepText}>{manufacturer.qualityControl}</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

// --- Manufacturer Dashboard Components ---

const DashboardOverview = ({ user, onViewFiles }: { user: any, onViewFiles: (id: string) => void }) => {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                <div className="dashboard-hero-card-hover" style={styles.dashboardHeroCard}>
                    <p style={styles.dashboardMetricLabel}>Revenue (This Month)</p>
                    <h3 style={{ ...styles.dashboardMetricValue, color: neon_magenta, textShadow: `0 0 10px ${neon_magenta}` }}>
                        {formatPrice(stats?.monthly_revenue)}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                        {/* Mock comparison for demonstration */}
                        <span style={styles.dashboardComparisonUp}>↑ 12% vs last month</span>
                        <span style={{ fontSize: '13px', color: text_secondary }}>
                            {formatPrice(stats?.total_revenue)} all-time
                        </span>
                    </div>
                </div>

                {/* Secondary KPIs */}
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <p style={styles.dashboardMetricLabel}>Active Orders</p>
                    <h3 style={styles.dashboardMetricValue}>{stats?.active_orders || 0}</h3>
                    <span style={{ fontSize: '13px', color: text_secondary, marginTop: 'auto' }}>
                        {stats?.completed_orders || 0} completed historically
                    </span>
                </div>

                <div style={{ ...styles.dashboardCard, borderColor: stats?.pending_quotes > 0 ? neon_cyan : border_color, boxShadow: stats?.pending_quotes > 0 ? `inset 0 0 15px rgba(var(--neon-cyan-rgb),0.1)` : 'none' }}>
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
                <div className="dashboard-card-hover" style={styles.dashboardCard}>
                    <div style={styles.dashboardSectionHeader}>
                        <span>Quote Pipeline</span>
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
                        <a href="#quotes" style={{ fontSize: '13px', color: neon_cyan, textDecoration: 'none' }}>View All</a>
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
                                            <tr key={idx} style={styles.dashboardActivityRow}>
                                                <td style={{ ...styles.dashboardActivityCell, color: text_primary, fontWeight: 500 }}>
                                                    {item.type === 'quote' ? `Quote Request: ${item.design__design_name}` : `Order Update: #${item.id.substring(0, 8)}`}
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
                                width: '100%'
                            }}
                            onClick={() => window.location.hash = '#quotes'}
                        >
                            <span>Review Pending Quotes</span>
                            {stats?.pending_quotes > 0 && <span style={{ background: neon_cyan, color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>{stats.pending_quotes}</span>}
                        </button>

                        <button
                            style={{
                                ...styles.buttonSecondary,
                                padding: '16px',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}
                            onClick={() => window.location.hash = '#orders'}
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
                                width: '100%'
                            }}
                            onClick={() => window.location.hash = '#profile'}
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
                        <a href="#orders" style={{ fontSize: '13px', color: neon_cyan, textDecoration: 'none' }}>View Orders</a>
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
        </div>
    );
};

const ManufacturerProfileManagementPage = ({ user: initialUser }: { user?: any }) => {
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

    if (loading) return <div>Loading profile...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;
    if (!formData) return <p>Could not load profile data.</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>Profile Management</h2>
            <p style={styles.dashboardPageSubtitle}>Keep your company profile and capabilities up to date to attract the right customers.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
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
    );
};

const QuoteRequestModal = ({ request, onClose, onSubmit }) => {
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

// Cost Breakdown Modal Component
const CostBreakdownModal = ({ request, onClose }) => {
    // Parse the notes field to extract breakdown data
    const parseBreakdown = (notes) => {
        if (!notes) return null;
        try {
            // Notes format: "Match Score: ... Process: ... {JSON}"
            // We want to find the first '{' and the last '}' to extract the JSON body
            const jsonStart = notes.indexOf('{');
            const jsonEnd = notes.lastIndexOf('}');
            
            if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) return null;

            const jsonStr = notes.substring(jsonStart, jsonEnd + 1);
            
            // Try standard JSON parse first
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                // Fallback for Python-style dictionaries (single quotes)
                // Only replace single quotes that are not preceded by a backslash
                const fixedJson = jsonStr
                    .replace(/'/g, '"')
                    .replace(/None/g, 'null')
                    .replace(/True/g, 'true')
                    .replace(/False/g, 'false');
                return JSON.parse(fixedJson);
            }
        } catch (e) {
            console.error('Failed to parse breakdown:', e);
            return null;
        }
    };

    const breakdown = parseBreakdown(request.notes);

    const { formatPrice } = useCurrency();

    return (
        <div style={{ ...styles.modalOverlay }}>
            <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
                <div style={styles.modalHeader}>
                    <h2 style={{ margin: 0, color: 'var(--neon-cyan)' }}>Cost Breakdown</h2>
                    <button onClick={onClose} style={styles.modalCloseButton}>✕</button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Part Info */}
                    <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(var(--neon-cyan-rgb), 0.05)', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--neon-cyan)', fontSize: '18px' }}>{request.designName}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Customer</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{request.customer}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Material</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{request.material}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Quantity</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{request.quantity} units</p>
                            </div>
                        </div>
                    </div>

                    {breakdown ? (
                        <>
                            {/* Summary */}
                            <div style={{ marginBottom: '24px', padding: '16px', background: 'linear-gradient(135deg, rgba(var(--neon-cyan-rgb), 0.1), rgba(var(--neon-cyan-rgb), 0.05))', borderRadius: '8px', border: '1px solid rgba(var(--neon-cyan-rgb), 0.2)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Price</p>
                                        <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--neon-cyan)', margin: 0 }}>{formatPrice(breakdown.final_price)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Unit Price</p>
                                        <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{formatPrice(breakdown.unit_price)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#CBD5E1', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Components</h4>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {breakdown.material_cost_per_unit && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Material Cost</span>
                                            <span style={{ fontWeight: '600' }}>{formatPrice(breakdown.material_cost_per_unit)}</span>
                                        </div>
                                    )}
                                    {breakdown.labor_cost_per_unit && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Labor Cost <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>({breakdown.labor_cost_per_unit.split('(')[1]?.replace(')', '')})</span></span>
                                            <span style={{ fontWeight: '600' }}>{formatPrice(breakdown.labor_cost_per_unit.split(' ')[0].replace('$', ''))}</span>
                                        </div>
                                    )}
                                    {breakdown.applied_hourly_rate && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Machining Rate</span>
                                            <span style={{ fontWeight: '600' }}>{breakdown.applied_hourly_rate}</span>
                                        </div>
                                    )}
                                    {breakdown.finishing_cost_per_unit && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Finishing <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>({breakdown.finishing_details ? `(${breakdown.finishing_details.substring(0, 30)}...)` : ''}</span></span>
                                            <span style={{ fontWeight: '600' }}>{formatPrice(breakdown.finishing_cost_per_unit)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step-by-Step Process Flow */}
                            {breakdown.process_flow && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--neon-cyan)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manufacturing Process Flow</h4>
                                    <div style={{ display: 'grid', gap: '4px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 80px 80px', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                            <span>#</span>
                                            <span>Operation</span>
                                            <span>Tooling</span>
                                            <span>Time</span>
                                            <span style={{ textAlign: 'right' }}>Cost</span>
                                        </div>
                                        {(() => {
                                            try {
                                                const flow = typeof breakdown.process_flow === 'string' ? JSON.parse(breakdown.process_flow) : breakdown.process_flow;
                                                return flow.map((step, idx) => (
                                                    <div key={idx} style={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: '40px 1fr 1fr 80px 80px', 
                                                        padding: '10px 12px', 
                                                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                                        fontSize: '12px',
                                                        alignItems: 'center',
                                                        borderBottom: idx === flow.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{idx + 1}</span>
                                                        <span style={{ color: '#E2E8F0', fontWeight: '500' }}>{step.step}</span>
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{step.tool}</span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{step.time}</span>
                                                        <span style={{ color: 'var(--neon-cyan)', fontWeight: '600', textAlign: 'right' }}>{step.cost}</span>
                                                    </div>
                                                ));
                                            } catch (e) {
                                                return <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{breakdown.feature_costs || 'Flow data format error'}</div>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Feature Manufacturing Sequences */}
                            {breakdown.feature_sequences && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--neon-cyan)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feature Manufacturing Sequences</h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {(() => {
                                            try {
                                                const sequences = typeof breakdown.feature_sequences === 'string' ? JSON.parse(breakdown.feature_sequences) : breakdown.feature_sequences;
                                                return Object.entries(sequences).map(([feature, sequence], idx) => (
                                                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--neon-cyan)' }}>
                                                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--neon-cyan)', margin: '0 0 4px 0' }}>{feature}</p>
                                                        <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0, fontStyle: 'italic' }}>{sequence as string}</p>
                                                    </div>
                                                ));
                                            } catch (e) {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Process Info */}
                            {breakdown.ai_process_selected && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(var(--neon-cyan-rgb), 0.05)', borderRadius: '6px', border: '1px solid rgba(var(--neon-cyan-rgb), 0.1)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Manufacturing Process</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--neon-cyan)' }}>{breakdown.machine_selected || breakdown.ai_process_selected}</p>
                                    {breakdown.ai_reasoning && (
                                        <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>{breakdown.ai_reasoning}</p>
                                    )}
                                </div>
                            )}

                            {/* Summary Breakdown */}
                            {breakdown.breakdown && (
                                <div style={{ padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Summary</p>
                                    <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#CBD5E1', margin: 0, lineHeight: '1.6' }}>{breakdown.breakdown}</p>
                                </div>
                            )}

                            {/* Terms */}
                            {(breakdown.terms_validity || breakdown.terms_payment) && (
                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(var(--text-secondary), 0.05)', borderRadius: '6px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Terms & Conditions</p>
                                    <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                                        {breakdown.terms_validity && <span>Valid for: <strong>{breakdown.terms_validity}</strong></span>}
                                        {breakdown.terms_payment && <span>Payment: <strong>{breakdown.terms_payment}</strong></span>}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>Detailed cost breakdown not available for this quote.</p>
                            <p style={{ fontSize: '14px', marginTop: '8px' }}>Total Price: <strong style={{ color: 'var(--neon-cyan)', fontSize: '20px' }}>{formatPrice(request.price)}</strong></p>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <CtaButton text="Close" onClick={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuoteRequestsPage = ({ onViewFiles }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, request: null });
    const [breakdownModalInfo, setBreakdownModalInfo] = useState({ isOpen: false, request: null });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.getQuoteRequests();
            // Map API response to expected format
            const mappedData = data.map(quote => ({
                id: quote.id,
                designId: quote.design,
                designName: quote.design_name || 'Unnamed Part',
                customer: quote.customer_name || quote.customer_email || 'Unknown',
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
                await api.declineQuoteRequest(request.designId);
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

    if (loading) return <div>Loading requests...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>Quote Requests</h2>
            <p style={styles.dashboardPageSubtitle}>Review and respond to quote requests from customers.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Part Name</th>
                            <th style={styles.tableHeader}>Customer</th>
                            <th style={styles.tableHeader}>Material</th>
                            <th style={styles.tableHeader}>Qty</th>
                            <th style={styles.tableHeader}>Date Received</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td style={styles.tableCell}>{req.designName}</td>
                                <td style={styles.tableCell}>{req.customer}</td>
                                <td style={styles.tableCell}>{req.material}</td>
                                <td style={styles.tableCell}>{req.quantity}</td>
                                <td style={styles.tableCell}>{new Date(req.dateReceived).toLocaleDateString()}</td>
                                <td style={styles.tableCell}><span style={getStatusStyle(req.status)}>{req.status}</span></td>
                                <td style={styles.tableCell}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <CtaButton text="View Files" onClick={() => onViewFiles(req.designId)} className="button-small" />
                                        <CtaButton text="View Details" onClick={() => handleOpenBreakdownModal(req)} className="button-small" />
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
                        ))}
                    </tbody>
                </table>
            </div>
            {modalInfo.isOpen && <QuoteRequestModal request={modalInfo.request} onClose={handleCloseModal} onSubmit={handleQuoteSubmit} />}
            {breakdownModalInfo.isOpen && <CostBreakdownModal request={breakdownModalInfo.request} onClose={handleCloseBreakdownModal} />}
        </div>
    );
};

const UpdateOrderModal = ({ order, onClose, onUpdate }) => {
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

const ActiveOrdersPage = ({ onViewFiles }) => {
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

    if (loading) return <div>Loading orders...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>Active Orders</h2>
            <p style={styles.dashboardPageSubtitle}>Manage orders that are in production or have been recently completed.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Order ID</th>
                            <th style={styles.tableHeader}>Part Name</th>
                            <th style={styles.tableHeader}>Customer</th>
                            <th style={styles.tableHeader}>Date</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Tracking</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map((order: any) => (
                            <tr key={order.id}>
                                <td style={styles.tableCell}>{order.id}</td>
                                <td style={styles.tableCell}>{order.designName}</td>
                                <td style={styles.tableCell}>{order.customer}</td>
                                <td style={styles.tableCell}>{new Date(order.dateCreated).toLocaleDateString()}</td>
                                <td style={styles.tableCell}><span style={getStatusStyle(order.status)}>{order.status}</span></td>
                                <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{order.trackingNumber || 'N/A'}</td>
                                <td style={styles.tableCell}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <CtaButton text="Manage" primary onClick={() => handleOpenModal(order)} className="button-small" />
                                        <CtaButton text="View Files" onClick={() => onViewFiles(order.designId)} className="button-small" />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} style={{ ...styles.tableCell, textAlign: 'center' }}>No active orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {modalInfo.isOpen && <UpdateOrderModal order={modalInfo.order} onClose={handleCloseModal} onUpdate={handleOrderUpdate} />}
        </div>
    );
};

const ManufacturerDashboard = ({ user, onViewFiles }) => {
    const [activeView, setActiveView] = useState('overview'); // overview, profile, quotes, orders, settings
    const navItems = [
        { id: 'overview', label: 'Overview', icon: ChartPieIcon },
        { id: 'quotes', label: 'Quote Requests', icon: DocumentTextIcon },
        { id: 'orders', label: 'Active Orders', icon: CubeIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
        { id: 'profile', label: 'Profile Management', icon: UserCircleIcon },
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'settings': return <ManufacturerSettingsPage />;
            case 'profile': return <ManufacturerProfileManagementPage user={user} />;
            case 'quotes': return <QuoteRequestsPage onViewFiles={onViewFiles} />;
            case 'orders': return <ActiveOrdersPage onViewFiles={onViewFiles} />;
            case 'overview':
            default:
                return <DashboardOverview user={user} onViewFiles={onViewFiles} />;
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            <aside style={styles.dashboardSidebar}>
                <h2 style={styles.dashboardSidebarTitle}>Manufacturer<br />Dashboard</h2>
                <nav style={styles.dashboardNav}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
                                style={{ ...styles.dashboardNavLink, ...(isActive && styles.dashboardNavLinkActive) }}
                            >
                                <Icon style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                                {item.label}
                            </a>
                        );
                    })}
                </nav>
            </aside>
            <main style={styles.dashboardMainContent}>
                {renderActiveView()}
            </main>
        </div>
    );
};

// --- FBM Analysis Components ---

const DesignAnalysisResults = ({ designId, onContinue }) => {
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

const DesignQuotationsPage = ({ designId, onNavigate, onViewFiles }: { designId: string, onNavigate: (page: string, params?: any) => void, onViewFiles: (id: string) => void }) => {
    const [quotes, setQuotes] = useState([]);
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('price'); // 'price' or 'lead_time'
    const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);

    const { formatPrice } = useCurrency();
    const [breakdownModalInfo, setBreakdownModalInfo] = useState({ isOpen: false, request: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [designData, quotesData] = await Promise.all([
                    api.getDesignById(designId),
                    api.getDesignQuotes(designId)
                ]);
                setDesign(designData);
                setQuotes(quotesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [designId]);

    const handleAcceptQuote = async (quoteId) => {
        if (!confirm('Are you sure you want to accept this quote? This will create an order.')) {
            return;
        }
        setAcceptingQuoteId(quoteId);
        try {
            await api.updateQuoteStatus(quoteId, 'accepted');
            alert('Quote accepted! Order created successfully.');
            onNavigate('dashboard'); // Redirect to dashboard/orders
        } catch (err) {
            alert(`Failed to accept quote: ${err.message}`);
        } finally {
            setAcceptingQuoteId(null);
        }
    };

    const sortedQuotes = [...quotes].sort((a, b) => {
        if (sortBy === 'price') {
            return parseFloat(a.price_usd || 0) - parseFloat(b.price_usd || 0);
        } else {
            return (a.estimated_lead_time_days || 0) - (b.estimated_lead_time_days || 0);
        }
    });

    if (loading) {
        return (
            <div style={{ ...styles.uploadPageContainer, textAlign: 'center', paddingTop: '120px' }}>
                <p>Loading quotations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.uploadPageContainer}>
                <div style={styles.warningBox}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <CtaButton text="Back to Dashboard" onClick={() => onNavigate('dashboard')} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.uploadPageContainer}>
            {/* Back Button */}
            <button
                onClick={() => onNavigate('dashboard')}
                style={{ ...styles.backButton, marginBottom: '32px' }}
            >
                <ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
                Back to My Designs
            </button>

            {/* Design Summary */}
            <div style={{ ...styles.featureCard, marginBottom: '32px' }}>
                <h2 style={styles.dashboardPageTitle}>Quotations for: {design?.design_name || 'Design'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Material</p>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{design?.material}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quantity</p>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{design?.quantity} units</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quotes Received</p>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{quotes.length}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <CtaButton 
                            text="View 3D Design" 
                            onClick={() => onViewFiles(designId)} 
                            className="button-small"
                        >
                            <EyeIcon style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                        </CtaButton>
                    </div>
                </div>
            </div>

            {quotes.length === 0 ? (
                <div style={styles.warningBox}>
                    <h3>No Quotations Yet</h3>
                    <p>No manufacturers have provided quotes for this design yet. Please check back later.</p>
                    <CtaButton text="Back to Dashboard" onClick={() => onNavigate('dashboard')} primary />
                </div>
            ) : (
                <>
                    {/* Sort Controls */}
                    <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sort by:</span>
                        <button
                            onClick={() => setSortBy('price')}
                            style={{
                                ...styles.button,
                                ...(sortBy === 'price' ? styles.buttonPrimary : styles.buttonSecondary),
                                padding: '8px 16px',
                                fontSize: '14px'
                            }}>
                            💰 Price (Low to High)
                        </button>
                        <button
                            onClick={() => setSortBy('lead_time')}
                            style={{
                                ...styles.button,
                                ...(sortBy === 'lead_time' ? styles.buttonPrimary : styles.buttonSecondary),
                                padding: '8px 16px',
                                fontSize: '14px'
                            }}>
                            ⚡ Lead Time (Fast to Slow)
                        </button>
                    </div>

                    {/* Quotes Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Manufacturer</th>
                                    <th style={styles.tableHeader}>Company</th>
                                    <th style={styles.tableHeader}>Price (USD)</th>
                                    <th style={styles.tableHeader}>Lead Time</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedQuotes.map(quote => {
                                    const isAccepted = quote.status === 'accepted';
                                    const isPending = quote.status === 'pending';
                                    const hasAcceptedQuote = quotes.some(q => q.status === 'accepted');

                                    return (
                                        <tr key={quote.id}>
                                            <td style={styles.tableCell}>
                                                {quote.manufacturer_name || 'Unknown'}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {quote.manufacturer_company || 'N/A'}
                                            </td>
                                            <td style={styles.tableCell}>
                                                <strong style={{ color: 'var(--neon-cyan)', fontSize: '16px' }}>
                                                    {formatPrice(quote.price_usd || 0)}
                                                </strong>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {quote.estimated_lead_time_days || 'N/A'} days
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    color: isAccepted ? 'var(--status-success)' : '#FBBF24',
                                                    backgroundColor: isAccepted ? 'rgba(var(--status-success-rgb), 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                                    border: `1px solid ${isAccepted ? 'rgba(var(--status-success-rgb), 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
                                                }}>
                                                    {isAccepted ? '✓ Accepted' : isPending ? '⏳ Pending' : quote.status}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    {isPending && !hasAcceptedQuote && (
                                                        <CtaButton
                                                            text={acceptingQuoteId === quote.id ? 'Accepting...' : 'Accept Quote'}
                                                            onClick={() => handleAcceptQuote(quote.id)}
                                                            primary
                                                            disabled={acceptingQuoteId !== null}
                                                            className="button-small"
                                                        />
                                                    )}
                                                    <CtaButton 
                                                        text="View Details" 
                                                        onClick={() => {
                                                            const request = {
                                                                id: quote.id,
                                                                designId: quote.design,
                                                                designName: design?.design_name || 'Design',
                                                                customer: quote.manufacturer_name || 'Manufacturer',
                                                                material: design?.material || 'N/A',
                                                                quantity: design?.quantity || 0,
                                                                price: quote.price_usd,
                                                                leadTime: quote.estimated_lead_time_days,
                                                                notes: quote.notes || '',
                                                            };
                                                            setBreakdownModalInfo({ isOpen: true, request });
                                                        }} 
                                                        className="button-small" 
                                                    />
                                                    {isAccepted && (
                                                        <span style={{ ...styles.statusBadge, color: 'var(--status-success)' }}>✓ Order Created</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {breakdownModalInfo.isOpen && <CostBreakdownModal request={breakdownModalInfo.request} onClose={() => setBreakdownModalInfo({ isOpen: false, request: null })} />}
        </div>
    );
};

const ManufacturingIntelligencePanel = ({ designId, onClose }) => {
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


const CustomerDashboardOverview = ({ user, onNavigate, onViewFiles }: { user: any, onNavigate: (page: string, params?: any) => void, onViewFiles: (id: string) => void }) => {
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
                    onClick={() => onNavigate('upload')}
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

const CustomerProfilePage = () => {
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

const CustomerDesignsPage = ({ onViewFiles, onNavigate }) => {
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
                setDesigns(prev => prev.filter(d => d.id !== design.id));
            } catch (err) {
                setNotification({ show: true, message: `Error deleting design: ${err.message}`, type: 'error' });
            }
        }
    };

    const getStatusStyle = (status) => {
        const baseStyle = { ...styles.statusBadge };
        switch (status) {
            case 'Analysis Complete': return { ...baseStyle, color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' };
            case 'Quoting': return { ...baseStyle, color: '#60A5FA', backgroundColor: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' };
            case 'Ordered': return { ...baseStyle, color: '#86EFAC', backgroundColor: 'rgba(134, 239, 172, 0.1)', border: '1px solid rgba(134, 239, 172, 0.3)' };
            case 'Analysis Failed': return { ...baseStyle, color: 'var(--status-error)', backgroundColor: 'rgba(var(--status-error-rgb), 0.1)', border: '1px solid rgba(var(--status-error-rgb), 0.3)' };
            default: return { ...baseStyle, color: 'var(--text-secondary)', backgroundColor: 'rgba(var(--text-secondary), 0.1)', border: '1px solid rgba(var(--text-secondary), 0.2)' };
        }
    };

    if (loading) return <div>Loading designs...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>My Designs</h2>
            <p style={styles.dashboardPageSubtitle}>Manage your uploaded designs and check their quoting status.</p>
            {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'success' })} />}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Design Name</th>
                            <th style={styles.tableHeader}>Material</th>
                            <th style={styles.tableHeader}>Quantity</th>
                            <th style={styles.tableHeader}>Date Uploaded</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {designs.length > 0 ? designs.map(design => (
                            <tr key={design.id}>
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
                                                onClick={() => onNavigate('view-quotes', { designId: design.id })}
                                                className="button-small"
                                                primary
                                            />
                                        )}
                                        <CtaButton text="View Files" onClick={() => onViewFiles(design.id)} className="button-small" />
                                        <CtaButton text="Delete" onClick={() => handleDelete(design)} className="button-small-danger" />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={{ ...styles.tableCell, textAlign: 'center' }}>You haven't uploaded any designs yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CustomerOrdersPage = ({ onViewFiles }) => {
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

    if (loading) return <div>Loading orders...</div>;
    if (error) return <p style={styles.loginError}>{error}</p>;

    return (
        <div>
            <h2 style={styles.dashboardPageTitle}>My Orders</h2>
            <p style={styles.dashboardPageSubtitle}>Track your active and completed orders.</p>
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Order ID</th>
                            <th style={styles.tableHeader}>Design Name</th>
                            <th style={styles.tableHeader}>Manufacturer</th>
                            <th style={styles.tableHeader}>Price</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Tracking</th>
                            <th style={styles.tableHeader}>Files</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map(order => (
                            <tr key={order.id}>
                                <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{order.id}</td>
                                <td style={styles.tableCell}>{order.designName}</td>
                                <td style={styles.tableCell}>{order.manufacturer}</td>
                                <td style={styles.tableCell}>{formatPrice(order.price)}</td>
                                <td style={styles.tableCell}><span style={getStatusStyle(order.status)}>{order.status}</span></td>
                                <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>
                                    {order.trackingNumber ? (
                                        <a href={`https://www.google.com/search?q=${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" style={styles.loginLink}>
                                            {order.trackingNumber} ({order.shippingCarrier})
                                        </a>
                                    ) : 'N/A'}
                                </td>
                                <td style={styles.tableCell}>
                                    <CtaButton text="View Files" onClick={() => onViewFiles(order.designId)} className="button-small" />
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} style={{ ...styles.tableCell, textAlign: 'center' }}>You have no orders.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const CustomerDashboard = ({ user, onViewFiles, onNavigate }) => {
    const [activeView, setActiveView] = useState('overview');
    const navItems = [
        { id: 'overview', label: 'Overview', icon: ChartPieIcon },
        { id: 'designs', label: 'My Designs', icon: CubeIcon },
        { id: 'orders', label: 'My Orders', icon: ArchiveBoxIcon },
        { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'designs': return <CustomerDesignsPage onViewFiles={onViewFiles} onNavigate={onNavigate} />;
            case 'orders': return <CustomerOrdersPage onViewFiles={onViewFiles} />;
            case 'profile': return <CustomerProfilePage />;
            case 'overview':
            default:
                return <CustomerDashboardOverview user={user} onNavigate={onNavigate} onViewFiles={onViewFiles} />;
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            <aside style={styles.dashboardSidebar}>
                <h2 style={styles.dashboardSidebarTitle}>Customer<br />Dashboard</h2>
                <nav style={styles.dashboardNav}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
                                style={{ ...styles.dashboardNavLink, ...(isActive && styles.dashboardNavLinkActive) }}
                            >
                                <Icon style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                                {item.label}
                            </a>
                        );
                    })}
                </nav>
            </aside>
            <main style={styles.dashboardMainContent}>
                {renderActiveView()}
            </main>
        </div>
    );
};


// --- Styles ---


// --- Background Animation ---

const backgroundParts = [
    { id: 1, initialTop: '10%', initialLeft: '10%', initialRotate: { x: 20, y: -30, z: 45 }, size: 250, depth: -300, icon: LucideWrench, color: neon_cyan, factors: { y: -0.4, x: 0.3, rotateX: 0.01, rotateY: 0.02, rotateZ: 0.05 } },
    { id: 2, initialTop: '40%', initialLeft: '80%', initialRotate: { x: 0, y: 0, z: 10 }, size: 200, depth: 200, icon: LucideSettings, color: neon_magenta, factors: { y: 0.2, x: -0.5, rotateX: -0.02, rotateY: -0.01, rotateZ: -0.08 } },
    { id: 3, initialTop: '70%', initialLeft: '20%', initialRotate: { x: 45, y: 45, z: 0 }, size: 180, depth: -100, icon: LucideDollarSign, color: neon_orange, factors: { y: 0.6, x: 0.2, rotateX: 0.05, rotateY: 0.05, rotateZ: 0.1 } },
    { id: 4, initialTop: '80%', initialLeft: '85%', initialRotate: { x: -20, y: 0, z: 0 }, size: 220, depth: 300, icon: LucideZap, color: neon_cyan, factors: { y: -0.2, x: 0.6, rotateX: 0.03, rotateY: -0.04, rotateZ: -0.03 } },
    { id: 5, initialTop: '20%', initialLeft: '60%', initialRotate: { x: 0, y: 60, z: -30 }, size: 150, depth: 50, icon: LucideShieldCheck, color: neon_magenta, factors: { y: 0.5, x: -0.3, rotateX: -0.01, rotateY: -0.05, rotateZ: 0.15 } },
    { id: 6, initialTop: '60%', initialLeft: '50%', initialRotate: { x: -60, y: 0, z: 120 }, size: 160, depth: -250, icon: LucideFileText, color: neon_cyan, factors: { y: -0.6, x: -0.4, rotateX: 0.1, rotateY: -0.1, rotateZ: 0.2 } },
    { id: 10, initialTop: '50%', initialLeft: '15%', initialRotate: { x: 0, y: 0, z: 90 }, size: 190, depth: 150, icon: LucideFactory, color: neon_cyan, factors: { y: -0.1, x: 0.5, rotateX: 0.02, rotateY: -0.06, rotateZ: -0.02 } },
    { id: 14, initialTop: '65%', initialLeft: '95%', initialRotate: { x: 90, y: 0, z: 0 }, size: 100, depth: 80, icon: LucideNut, color: neon_magenta, factors: { y: -0.2, x: -0.3, rotateX: 0.1, rotateY: 0.0, rotateZ: 0.05 } },
    { id: 15, initialTop: '45%', initialLeft: '5%', initialRotate: { x: 0, y: 45, z: 45 }, size: 120, depth: -120, icon: LucideDrill, color: neon_orange, factors: { y: 0.5, x: 0.4, rotateX: -0.05, rotateY: 0.08, rotateZ: 0.02 } },
    { id: 16, initialTop: '95%', initialLeft: '30%', initialRotate: { x: 0, y: 90, z: 0 }, size: 150, depth: 100, icon: LucideCylinder, color: neon_cyan, factors: { y: -0.4, x: -0.1, rotateX: 0.02, rotateY: 0.1, rotateZ: 0.01 } },
    // Adding 3 more items (filling gaps)
    { id: 17, initialTop: '15%', initialLeft: '40%', initialRotate: { x: 30, y: 30, z: 0 }, size: 140, depth: 20, icon: LucideSettings, color: neon_magenta, factors: { y: 0.3, x: 0.2, rotateX: 0.04, rotateY: -0.02, rotateZ: 0.1 } },
    { id: 18, initialTop: '85%', initialLeft: '55%', initialRotate: { x: -15, y: -15, z: 15 }, size: 110, depth: -80, icon: LucideCircleDot, color: neon_orange, factors: { y: -0.3, x: -0.2, rotateX: -0.03, rotateY: 0.05, rotateZ: -0.04 } },
    { id: 19, initialTop: '10%', initialLeft: '85%', initialRotate: { x: 0, y: 45, z: -45 }, size: 130, depth: 120, icon: LucideWrench, color: neon_cyan, factors: { y: 0.1, x: -0.4, rotateX: 0.02, rotateY: -0.06, rotateZ: 0.03 } },
];

const BackgroundAnimation = () => {
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

const App = () => {
    const [page, setPage] = useState('landing');
    const [pageParams, setPageParams] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginReasonMessage, setLoginReasonMessage] = useState('');
    const [pendingUploadData, setPendingUploadData] = useState(null);
    const [fileViewerState, setFileViewerState] = useState({ isOpen: false, design: null });

    // --- Routing Logic ---
    const getPageFromPath = (path: string) => {
        if (path === '/' || path === '/landing') return 'landing';
        if (path === '/directory') return 'directory';
        if (path === '/signup') return 'signup';
        if (path === '/signup/customer') return 'signup-customer';
        if (path === '/signup/manufacturer') return 'signup-manufacturer';
        if (path === '/login') return 'login';
        if (path === '/login/customer') return 'login-customer';
        if (path === '/login/manufacturer') return 'login-manufacturer';
        if (path === '/dashboard') return 'dashboard';
        if (path === '/how-it-works') return 'how-it-works-detailed';
        if (path === '/trust-and-security') return 'trust-and-security';
        if (path === '/about') return 'about';
        if (path === '/contact') return 'contact';
        if (path === '/faq') return 'faq';
        if (path === '/privacy') return 'privacy';
        if (path === '/terms') return 'terms';
        if (path === '/upload') return 'upload';
        if (path.startsWith('/manufacturer/')) return 'manufacturer-profile';
        return 'landing';
    };

    const getParamsFromPath = (path: string) => {
        if (path.startsWith('/manufacturer/')) {
            return path.split('/manufacturer/')[1];
        }
        return null;
    };

    const getPathFromPage = (page: string, params: any) => {
        switch (page) {
            case 'landing': return '/';
            case 'directory': return '/directory';
            case 'signup': return '/signup';
            case 'signup-customer': return '/signup/customer';
            case 'signup-manufacturer': return '/signup/manufacturer';
            case 'login': return '/login';
            case 'login-customer': return '/login/customer';
            case 'login-manufacturer': return '/login/manufacturer';
            case 'dashboard': return '/dashboard';
            case 'how-it-works-detailed': return '/how-it-works';
            case 'trust-and-security': return '/trust-and-security';
            case 'about': return '/about';
            case 'contact': return '/contact';
            case 'faq': return '/faq';
            case 'privacy': return '/privacy';
            case 'terms': return '/terms';
            case 'upload': return '/upload';
            case 'manufacturer-profile': return `/manufacturer/${params}`;
            default: return '/';
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { access } = getTokens();
            if (access) {
                try {
                    const user = await api.getMe();
                    setUser(user);
                    setIsAuthenticated(true);
                    
                    // If user is authenticated and on landing/login, redirect to dashboard
                    const path = window.location.pathname;
                    if (path === '/' || path === '/login' || path === '/landing') {
                        handleNavigate('dashboard');
                    }
                } catch (error) {
                    console.error("Auth check failed", error);
                    clearTokens();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setAuthLoading(false);
        };
        checkAuth();
    }, []);

    // Handle initial routing and back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            setPage(getPageFromPath(path));
            setPageParams(getParamsFromPath(path));
        };

        window.addEventListener('popstate', handlePopState);
        
        // Set initial page based on URL
        const initialPath = window.location.pathname;
        setPage(getPageFromPath(initialPath));
        setPageParams(getParamsFromPath(initialPath));

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavigate = (newPage, params = null) => {
        const path = getPathFromPage(newPage, params);
        if (window.location.pathname !== path) {
            window.history.pushState({ page: newPage, params }, '', path);
        }
        setPage(newPage);
        setPageParams(params);
        window.scrollTo(0, 0);
    };

    const handleLogin = async (credentials: { email: string }, role: string) => {
        try {
            const { access, refresh } = await api.login(credentials);
            setTokens(access, refresh);

            const user = await api.getMe();
            setUser(user);
            setIsAuthenticated(true);

            if (pendingUploadData) {
                console.log("User logged in, proceeding with upload for:", (pendingUploadData as any).designName);

                try {
                    const data = pendingUploadData as any;
                    const submissionData = new FormData();
                    submissionData.append('design_file', data.file);
                    submissionData.append('design_name', data.designName);
                    submissionData.append('material', data.material);
                    submissionData.append('quantity', data.quantity);
                    submissionData.append('urgency', data.urgency || 'standard');
                    submissionData.append('packaging_requirements', data.packaging || 'standard');
                    submissionData.append('inspection_requirements', JSON.stringify(data.inspectionRequirements || []));

                    if (data.additionalInstructions) submissionData.append('additional_instructions', data.additionalInstructions);
                    if (data.requiredCertifications) submissionData.append('required_certifications', data.requiredCertifications);
                    if (data.shippingDestination) submissionData.append('shipping_destination', data.shippingDestination);
                    if (data.targetPrice) submissionData.append('target_price', data.targetPrice);

                    if (data.supportingFiles) {
                        data.supportingFiles.forEach((f: File) => submissionData.append('supporting_files', f));
                    }

                    await api.createDesign(submissionData);
                    console.log("Design uploaded successfully after login");
                    setPendingUploadData(null);
                    handleNavigate('dashboard');
                } catch (uploadError) {
                    console.error("Failed to upload design after login:", uploadError);
                    alert("Login successful, but design upload failed. Please try uploading again from the dashboard.");
                    setPendingUploadData(null);
                    handleNavigate('dashboard');
                }
            } else {
                handleNavigate('dashboard');
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const handleLogout = () => {
        clearTokens();
        localStorage.removeItem('userRole');
        localStorage.removeItem('userCompanyName');
        setIsAuthenticated(false);
        setUser(null);
        handleNavigate('landing');
    };

    const handleProceedToLogin = (uploadData) => {
        setPendingUploadData(uploadData);
        setLoginReasonMessage('Please log in or create an account to upload your design.');
        handleNavigate('login');
    };

    const handleViewFiles = async (designId) => {
        try {
            const design = await api.getDesignById(designId);
            if (design && design.s3_file_key) {
                setFileViewerState({ isOpen: true, design: design });
            } else {
                alert("No files found for this design.");
            }
        } catch (err) {
            alert("Could not load files for this design.");
        }
    };

    const handleCloseFileViewer = () => {
        setFileViewerState({ isOpen: false, design: null });
    };

    const renderPage = () => {
        switch (page) {
            case 'landing': return <LandingPageContent onNavigate={handleNavigate} />;
            case 'how-it-works-detailed': return <HowItWorksDetailedPage onNavigate={handleNavigate} />;
            case 'directory': return <ManufacturerDirectoryPage onNavigate={handleNavigate} />;
            case 'manufacturer-profile': return <ManufacturerProfilePage manufacturerId={pageParams} onNavigate={handleNavigate} />;
            case 'trust-and-security': return <TrustAndSecurityPage />;
            case 'about': return <AboutUsPage />;
            case 'contact': return <ContactPage />;
            case 'faq': return <FAQPage />;
            case 'privacy': return (
                <LegalPage 
                    title="Privacy Policy" 
                    content={
                        <>
                            <h3>1. Information We Collect</h3>
                            <p>We collect information you provide directly to us when you create an account, upload designs, or communicate with manufacturers. This includes your name, email address, and any technical data contained in your manufacturing files.</p>
                            <h3>2. How We Use Your Information</h3>
                            <p>We use your information to facilitate the quoting and manufacturing process, improve our AI matching engine, and ensure the security of our platform.</p>
                            <h3>3. Data Security</h3>
                            <p>We implement industry-standard security measures to protect your intellectual property and personal data. Your files are only shared with manufacturers you choose to engage with.</p>
                        </>
                    } 
                />
            );
            case 'terms': return (
                <LegalPage 
                    title="Terms of Service" 
                    content={
                        <>
                            <h3>1. Acceptance of Terms</h3>
                            <p>By using Quotanic, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
                            <h3>2. User Responsibilities</h3>
                            <p>You are responsible for the accuracy of the designs you upload and for ensuring you have the legal right to manufacture those designs.</p>
                            <h3>3. Platform Role</h3>
                            <p>Quotanic is a marketplace that connects customers and manufacturers. While we vet partners, the final contract for production is between the user and the manufacturer.</p>
                        </>
                    } 
                />
            );
            case 'login': return <LoginRoleSelector onNavigate={handleNavigate} reasonMessage={loginReasonMessage} />;
            case 'login-customer': return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} role="customer" />;
            case 'login-manufacturer': return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} role="manufacturer" />;
            case 'signup': return <SignupRoleSelector onNavigate={handleNavigate} />;
            case 'signup-customer': return <CustomerSignupPage onLogin={handleLogin} onNavigate={handleNavigate} />;
            case 'signup-manufacturer': return <ManufacturerSignupPage onLogin={handleLogin} onNavigate={handleNavigate} />;
            case 'upload': return <UploadPage onProceedToLogin={handleProceedToLogin} onNavigate={handleNavigate} isAuthenticated={isAuthenticated} user={user} targetManufacturerId={pageParams} />;
            case 'view-quotes': return <DesignQuotationsPage designId={pageParams?.designId} onNavigate={handleNavigate} onViewFiles={handleViewFiles} />;
            case 'dashboard':
                if (!isAuthenticated) {
                    handleNavigate('login');
                    return null;
                }
                if (user?.role === 'manufacturer') {
                    return <ManufacturerDashboard user={user} onViewFiles={handleViewFiles} onNavigate={handleNavigate} />;
                }
                if (user?.role === 'customer') {
                    return <CustomerDashboard user={user} onViewFiles={handleViewFiles} onNavigate={handleNavigate} />;
                }
                // Fallback while user data is loading or if role is unknown
                return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Loading dashboard...</div>;
            default: return <LandingPageContent onNavigate={handleNavigate} />;
        }
    };

    if (authLoading) {
        return (
            <div style={{ backgroundColor: bg_deep_space, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: neon_cyan, fontSize: '18px', fontWeight: 500 }}>Initializing application...</div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: bg_deep_space }}>
            <BackgroundAnimation />
            <div style={{ ...styles.appWrapper, backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
                <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} onNavigate={handleNavigate} />
                <main style={styles.mainContent}>
                    {renderPage()}
                </main>
                {fileViewerState.isOpen && <FileViewerModal design={fileViewerState.design} onClose={handleCloseFileViewer} />}
                <Footer onNavigate={handleNavigate} />
            </div>
        </div>
    );
};



ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CurrencyProvider>
            <App />
        </CurrencyProvider>
    </React.StrictMode>
);