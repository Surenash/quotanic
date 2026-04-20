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

export const LoginRoleSelector = ({ navigate, reasonMessage }: { navigate: (page: string) => void, reasonMessage?: string }) => (
    <div style={styles.loginPage}><div style={styles.loginContainer}>{reasonMessage && <p style={styles.loginReasonMessage}>{reasonMessage}</p>}<h2 style={styles.loginTitle}>Sign In</h2><p style={styles.loginSubtitle}>Please select your role to continue.</p><div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}><CtaButton text="I'm a Customer" primary onClick={() => navigate('login-customer')} /><CtaButton text="I'm a Manufacturer" onClick={() => navigate('login-manufacturer')} /></div><div style={{ textAlign: 'center', marginTop: '24px' }}><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>New to Quotanic? <a href="#" style={{ ...styles.loginLink, fontSize: '14px' }} onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Create an account</a></p><p style={{ marginTop: '16px' }}><a href="#" style={{ ...styles.loginLink, color: 'var(--text-secondary)', fontSize: '14px' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>← Back to Homepage</a></p></div></div></div>
);