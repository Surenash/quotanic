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

interface Manufacturer {
    id: string | number;
    company_name: string;
    capabilities: string[];
    certifications: string[];
    [key: string]: any;
}

export const ManufacturerDirectoryPage = ({ navigate }) => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCapabilities, setSelectedCapabilities] = useState([]);
    const [selectedCertifications, setSelectedCertifications] = useState([]);
    const [showAllCapabilities, setShowAllCapabilities] = useState(false);
    const [showAllCertifications, setShowAllCertifications] = useState(false);

    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const data = await api.getManufacturers();
                if (Array.isArray(data)) {
                    // Validate and normalize each manufacturer record
                    const validatedManufacturers: Manufacturer[] = data
                        .filter((item: any) => item && typeof item === 'object')
                        .map((item: any) => ({
                            ...item,
                            company_name: typeof item.company_name === 'string' ? item.company_name : '',
                            capabilities: Array.isArray(item.capabilities) ? item.capabilities : [],
                            certifications: Array.isArray(item.certifications) ? item.certifications : [],
                        }))
                        .filter((item: Manufacturer) => item.company_name); // Only keep items with valid company_name

                    setManufacturers(validatedManufacturers);
                    setFilteredManufacturers(validatedManufacturers);
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
            results = results.filter(m => m.company_name && m.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCapabilities.length > 0) {
            results = results.filter(m => m.capabilities && selectedCapabilities.every(cap => m.capabilities.includes(cap)));
        }
        if (selectedCertifications.length > 0) {
            results = results.filter(m => m.certifications && selectedCertifications.every(cert => m.certifications.includes(cert)));
        }
        setFilteredManufacturers(results);
    }, [searchTerm, selectedCapabilities, selectedCertifications, manufacturers]);

    const handleCapabilityChange = (capability) => {
        setSelectedCapabilities(prev => prev.includes(capability) ? prev.filter(c => c !== capability) : [...prev, capability]);
    };

    const handleCertificationChange = (certification) => {
        setSelectedCertifications(prev => prev.includes(certification) ? prev.filter(c => c !== certification) : [...prev, certification]);
    };

    const toggleShowAllCapabilities = () => {
        setShowAllCapabilities(prev => !prev);
    };

    const toggleShowAllCertifications = () => {
        setShowAllCertifications(prev => !prev);
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
                        <CheckboxGroup
                            title="Capabilities"
                            options={showAllCapabilities ? ALL_CAPABILITIES_FLAT : ALL_CAPABILITIES_FLAT.slice(0, 9)}
                            selected={selectedCapabilities}
                            onChange={handleCapabilityChange}
                            columns={1}
                        />
                        {ALL_CAPABILITIES_FLAT.length > 9 && (
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); toggleShowAllCapabilities(); }}
                                style={{ ...styles.loginLink, fontSize: '14px' }}
                            >
                                {showAllCapabilities ? 'Show fewer' : 'Show all...'}
                            </a>
                        )}
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <CheckboxGroup
                            title="Certifications"
                            options={showAllCertifications ? CERTIFICATIONS : CERTIFICATIONS.slice(0, 9)}
                            selected={selectedCertifications}
                            onChange={handleCertificationChange}
                            columns={1}
                        />
                        {CERTIFICATIONS.length > 9 && (
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); toggleShowAllCertifications(); }}
                                style={{ ...styles.loginLink, fontSize: '14px' }}
                            >
                                {showAllCertifications ? 'Show fewer' : 'Show all...'}
                            </a>
                        )}
                    </div>
                </aside>
                <main style={styles.directoryResults}>
                    {loading ? (
                        <p>Loading manufacturers...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : filteredManufacturers.length > 0 ? (
                        <div style={styles.mfgGrid}>
                            {filteredManufacturers.map(mfg => <Components.ManufacturerCard key={mfg.id} manufacturer={mfg} />)}
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