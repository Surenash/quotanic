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

export const FAQPage = () => (
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