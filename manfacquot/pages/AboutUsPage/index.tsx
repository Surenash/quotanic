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

export const AboutUsPage = () => (
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