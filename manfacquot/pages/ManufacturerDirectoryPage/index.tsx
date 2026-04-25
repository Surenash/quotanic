import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFileViewer } from '../../contexts/FileViewerContext';
import { api, setTokens, getTokens, clearTokens } from '../../utils/api';
import { useCurrency } from '../../utils/currency';
import { styles, bg_deep_space, text_primary, text_secondary, border_color, border_color_strong, neon_cyan, neon_magenta, neon_orange } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import Notification from '../../components/Notification';
import CheckboxGroup from '../../components/CheckboxGroup';
import ManufacturerSettingsPage from '../../components/ManufacturerSettings';
import Viewer, { ErrorBoundary } from '../../components/Viewer';
import { ViewPreset } from '../../types/types';
import {
    ArrowLeftIcon, UploadIcon, QuoteIcon, ManufactureIcon, FileIcon, ShieldCheckIcon,
    GlobeAltIcon, ScaleIcon, LightningBoltIcon, SparklesIcon, CodeBracketIcon,
    WrenchScrewdriverIcon, CubeIcon, GithubIcon, LinkedInIcon, TwitterIcon,
    SearchIcon, LocationMarkerIcon, StarIcon, BuildingOfficeIcon, XMarkIcon,
    ChartPieIcon, UserCircleIcon, CogIcon, ArchiveBoxIcon, DocumentTextIcon,
    VideoCameraIcon, DownloadIcon, EyeIcon, iconStyle
} from "../../components/icons";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api';
const MEDIA_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

import {
    PRODUCTION_VOLUMES, CERTIFICATIONS, MACHINING_PROCESSES, SHEET_METAL_PROCESSES, CASTING_PROCESSES, FORGING_PROCESSES,
    INJECTION_MOLDING_PROCESSES, ADDITIVE_PROCESSES, WELDING_JOINING_PROCESSES, MATERIALS_METALS, MATERIALS_PLASTICS,
    MATERIALS_COMPOSITES, MATERIALS_OTHERS, SURFACE_FINISHES, POST_PROCESSING_ASSEMBLY, FILE_FORMATS, INCOTERMS,
    SPECIAL_CAPABILITIES, ORDER_STATUSES, ALL_CAPABILITIES_GROUPS, ALL_CAPABILITIES_FLAT
} from '../../utils/constants';

import * as Components from '../../components';

// Define Manufacturer type based on the data structure used
interface Manufacturer {
    id: number;
    company_name: string;
    location: string;
    capabilities: string[];
    certifications: string[];
    logoUrl?: string;
    rating?: string;
}

export const ManufacturerDirectoryPage = () => {
    const navigate = useNavigate();
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
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
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ ...styles.container, padding: '80px 24px' }}>
                <header style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px' }}>Verified <span style={{ color: neon_cyan }}>Network</span></h1>
                    <p style={{ ...styles.heroSubtitle, color: 'rgba(255,255,255,0.6)' }}>Browse 50+ vetted manufacturers with certified capabilities.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '48px' }} className="directory-grid">
                    {/* Glassmorphism Filters */}
                    <aside style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: `1px solid ${border_color}`, 
                        borderRadius: '24px', 
                        padding: '32px',
                        backdropFilter: 'blur(10px)',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <SearchIcon style={{ width: '20px', height: '20px', color: neon_cyan }} />
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Filters</h2>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '32px' }}>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: `1px solid ${border_color}`, 
                                    borderRadius: '12px', 
                                    padding: '12px 16px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                className="search-input-premium"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <CheckboxGroup 
                                title="Capabilities" 
                                options={ALL_CAPABILITIES_FLAT.slice(0, 12)} 
                                selected={selectedCapabilities} 
                                onChange={handleCapabilityChange} 
                                columns={1} 
                            />
                            <CheckboxGroup 
                                title="Certifications" 
                                options={CERTIFICATIONS} 
                                selected={selectedCertifications} 
                                onChange={handleCertificationChange} 
                                columns={1} 
                            />
                        </div>
                        
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${border_color}` }}>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Matching: {filteredManufacturers.length} Manufacturers
                            </p>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <main>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(10, 240, 240, 0.1)', borderTopColor: neon_cyan, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : error ? (
                            <p style={{ color: neon_orange, textAlign: 'center', padding: '40px' }}>{error}</p>
                        ) : filteredManufacturers.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                                gap: '24px' 
                            }}>
                                {filteredManufacturers.map(mfg => (
                                    <Components.ManufacturerCard key={mfg.id} manufacturer={mfg} navigate={navigate} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', padding: '100px 48px', 
                                background: 'rgba(255,255,255,0.01)', border: `1px dashed ${border_color}`, 
                                borderRadius: '24px' 
                            }}>
                                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>No matches found</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Try broadening your search or removing some filters.</p>
                                <button 
                                    onClick={() => { setSearchTerm(''); setSelectedCapabilities([]); setSelectedCertifications([]); }}
                                    style={{ 
                                        marginTop: '24px', background: 'none', border: `1px solid ${neon_cyan}`, 
                                        color: neon_cyan, padding: '10px 24px', borderRadius: '12px', cursor: 'pointer' 
                                    }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <style>{`
                .search-input-premium:focus {
                    border-color: ${neon_cyan} !important;
                    box-shadow: 0 0 15px rgba(10, 240, 240, 0.1);
                    background: rgba(255,255,255,0.08) !important;
                }
                @media (max-width: 1024px) {
                    .directory-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};