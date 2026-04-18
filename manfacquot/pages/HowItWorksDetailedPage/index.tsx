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

export const HowItWorksDetailedPage = ({ navigate }: { navigate: (p: string) => void }) => (
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
                <CtaButton text="Get Started Now" onClick={() => navigate('/upload')} primary />
            </div>
        </div>
    </div>
);