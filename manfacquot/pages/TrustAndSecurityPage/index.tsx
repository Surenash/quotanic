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

export const TrustAndSecurityPage = () => (
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