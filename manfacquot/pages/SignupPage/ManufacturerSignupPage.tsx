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

export const ManufacturerSignupPage = ({ onLogin, navigate }: { onLogin: (credentials: object, role: string) => Promise<void>, navigate: (page: string) => void }) => {
    const [formData, setFormData] = useState<ManufacturerSignupFormData>({ companyName: '', email: '', password: '', password2: '', location: '', website: '', productionVolume: '', leadTimeRange: '', certifications: [], otherCertifications: '', qualityControlProcesses: '', materialTesting: '', moq: '', machining: [], sheetMetal: [], casting: [], forging: [], injectionMolding: { processes: [], cavityCount: '', moldClass: '' }, threeDPrinting: [], weldingJoining: [], supportedMaterials: [], generalTolerance: '', specificTolerances: '', gdtSupport: false, minSizeX: '', minSizeY: '', minSizeZ: '', maxSizeX: '', maxSizeY: '', maxSizeZ: '', maxWeightKg: '', thinWallCapabilityMm: '', surfaceFinishes: [], postProcessing: [], acceptedFileFormats: [], incoterms: [], specialCapabilities: [], });
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

    const processCategoryByTitle: Record<string, string> = {
        Machining: 'machining',
        'Sheet Metal': 'sheetMetal',
        Casting: 'casting',
        Forging: 'forging',
        'Injection Molding': 'injectionMolding', // fixed the processes inner prop
        '3D Printing': 'threeDPrinting',
        'Welding & Joining': 'weldingJoining',
    };

    const getSelectedProcesses = (category: string): string[] => {
        if (!category) return [];
        if (category === 'injectionMolding') {
            return formData.injectionMolding.processes || [];
        }
        return (formData as Record<string, any>)[category] as string[] || [];
    };

    const handleCheckboxGroupChange = (category: string, value: string) => {
        if (category === 'injectionMolding') {
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
        const parsedMoq = Number(moq);
        if (!Number.isInteger(parsedMoq) || parsedMoq < 1) {
            setLoading(false);
            return validateAndScroll('moq', 'Minimum order quantity must be at least 1');
        }

        const totalProcesses = [...machining, ...sheetMetal, ...casting, ...forging, ...injectionMolding.processes, ...threeDPrinting, ...weldingJoining].length;
        if (totalProcesses === 0) {
            setLoading(false);
            setError('Please select at least one Manufacturing Process.');
            setTimeout(() => {
                const element = document.getElementById('processes-fieldset');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }, 100);
            return;
        }
        if (supportedMaterials.length === 0) {
            setLoading(false);
            setError('Please select at least one supported Material.');
            setTimeout(() => {
                const element = document.getElementById('materials-fieldset');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }, 100);
            return;
        }
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
                    moq: parsedMoq,
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
        <div style={styles.loginPage}><div style={manufacturerSignupContainerStyle}><h2 style={styles.loginTitle}>Create Manufacturer Account</h2><p style={styles.loginSubtitle}>Join our network and start receiving orders. Fields marked with * are required.</p><form onSubmit={handleSubmit}>{error && <p style={styles.loginError}>{error}</p>}<fieldset style={styles.fieldset}><legend style={styles.legend}>Account & Profile</legend><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="companyName" style={styles.label}>Company Name *</label><input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} style={getInputStyle('companyName')} required />{fieldErrors.companyName && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.companyName}</p>}</div><div style={styles.formGroup}><label htmlFor="email" style={styles.label}>Email Address *</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} style={getInputStyle('email')} required autoComplete="email" />{fieldErrors.email && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.email}</p>}</div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="password" style={styles.label}>Password *</label><input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} style={getInputStyle('password')} required autoComplete="new-password" />{fieldErrors.password && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.password}</p>}</div><div style={styles.formGroup}><label htmlFor="password2" style={styles.label}>Confirm Password *</label><input type="password" id="password2" name="password2" value={formData.password2} onChange={handleInputChange} style={getInputStyle('password2')} required autoComplete="new-password" />{fieldErrors.password2 && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.password2}</p>}</div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="location" style={styles.label}>Location (City, Country) *</label><input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} style={getInputStyle('location')} required />{fieldErrors.location && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.location}</p>}</div><div style={styles.formGroup}><label htmlFor="website" style={styles.label}>Website URL</label><input type="url" name="website" value={formData.website} onChange={handleInputChange} style={styles.input} placeholder="https://yourcompany.com" /></div></div></fieldset><fieldset style={styles.fieldset}><legend style={styles.legend}>1. General Capabilities *</legend><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="productionVolume" style={styles.label}>Production Volume Capacity *</label><select id="productionVolume" name="productionVolume" value={formData.productionVolume} onChange={handleInputChange} style={getInputStyle('productionVolume')} required><option value="">Select volume...</option>{PRODUCTION_VOLUMES.map(v => <option key={v} value={v}>{v}</option>)}</select>{fieldErrors.productionVolume && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.productionVolume}</p>}</div><div style={styles.formGroup}><label htmlFor="leadTimeRange" style={styles.label}>Typical Lead Time Range *</label><input type="text" id="leadTimeRange" name="leadTimeRange" value={formData.leadTimeRange} onChange={handleInputChange} style={getInputStyle('leadTimeRange')} required placeholder="e.g., 5-10 days" />{fieldErrors.leadTimeRange && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.leadTimeRange}</p>}</div></div><div style={styles.formRow}><div style={styles.formGroup}><label htmlFor="moq" style={styles.label}>Minimum Order Quantity (MOQ) *</label><input type="number" id="moq" name="moq" value={formData.moq} onChange={handleInputChange} style={getInputStyle('moq')} required min="1" step="1" />{fieldErrors.moq && <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.moq}</p>}</div><div style={styles.formGroup}><label htmlFor="otherCertifications" style={styles.label}>Other Certs (comma-separated)</label><input type="text" name="otherCertifications" value={formData.otherCertifications} onChange={handleInputChange} style={styles.input} /></div></div><CheckboxGroup title="Certifications" options={CERTIFICATIONS} selected={formData.certifications} onChange={(v) => handleCheckboxGroupChange('certifications', v)} /><div style={styles.formGroup}><label htmlFor="qualityControlProcesses" style={styles.label}>Quality Control Processes</label><textarea name="qualityControlProcesses" value={formData.qualityControlProcesses} onChange={handleInputChange} style={styles.input} rows={3}></textarea></div><div style={styles.formGroup}><label htmlFor="materialTesting" style={styles.label}>Material Testing / Inspection Equipment</label><textarea name="materialTesting" value={formData.materialTesting} onChange={handleInputChange} style={styles.input} rows={3}></textarea></div></fieldset><fieldset id="processes-fieldset" tabIndex={-1} style={styles.fieldset}><legend style={styles.legend}>2. Manufacturing Processes Supported *</legend><p style={styles.fieldsetDescription}>Select all that apply. You must select at least one process.</p>{ALL_CAPABILITIES_GROUPS.map(group => {
    const category = processCategoryByTitle[group.title];
    return (
        <CheckboxGroup
            key={group.title}
            title={group.title}
            options={group.processes}
            selected={getSelectedProcesses(category)}
            onChange={(v) => handleCheckboxGroupChange(category, v)}
        />
    );
})}</fieldset><fieldset id="materials-fieldset" tabIndex={-1} style={styles.fieldset}><legend style={styles.legend}>3. Material Capabilities *</legend><p style={styles.fieldsetDescription}>You must select at least one material.</p><CheckboxGroup title="Metals" options={MATERIALS_METALS} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Plastics" options={MATERIALS_PLASTICS} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Composites" options={MATERIALS_COMPOSITES} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /><CheckboxGroup title="Others" options={MATERIALS_OTHERS} selected={formData.supportedMaterials} onChange={(v) => handleCheckboxGroupChange('supportedMaterials', v)} /></fieldset><div style={{ marginTop: '24px' }}><CtaButton text={loading ? "Creating Account..." : "Create Account & Go to Dashboard"} primary type="submit" disabled={loading} /></div></form><div style={styles.loginLinks}><a href="#" style={styles.loginLink} onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Back to role selection</a></div></div></div>
    );
};