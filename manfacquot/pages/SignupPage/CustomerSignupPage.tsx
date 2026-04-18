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

export const CustomerSignupPage = ({ onLogin, navigate }: { onLogin: (credentials: object, role: string) => Promise<void>, navigate: (page: string) => void }) => {
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
        <div style={styles.loginPage}><div style={styles.loginContainer}><h2 style={styles.loginTitle}>Create Customer Account</h2><p style={styles.loginSubtitle}>Get instant quotes from top manufacturers.</p><form onSubmit={handleSubmit} style={styles.loginForm}>{error && <p style={styles.loginError}>{error}</p>}<div style={styles.formGroup}><label htmlFor="companyName" style={styles.label}>Company Name</label><input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={styles.input} required /></div><div style={styles.formGroup}><label htmlFor="email" style={styles.label}>Email Address</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required autoComplete="email" /></div><div style={styles.formGroup}><label htmlFor="password" style={styles.label}>Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required autoComplete="new-password" /></div><div style={styles.formGroup}><label htmlFor="password2" style={styles.label}>Confirm Password</label><input type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)} style={styles.input} required autoComplete="new-password" /></div><CtaButton text={loading ? "Creating Account..." : "Create Account"} primary type="submit" disabled={loading} /></form><div style={styles.loginLinks}><a href="#" style={styles.loginLink} onClick={(e) => { e.preventDefault(); navigate('signup'); }}>Back to role selection</a></div></div></div>
    );
};