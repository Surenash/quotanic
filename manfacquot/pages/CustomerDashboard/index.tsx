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

import * as Components from '../../components.tsx';

export const CustomerDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { openViewer: onViewFiles } = useFileViewer();
    const [activeView, setActiveView] = useState('overview');
    const navItems = [
        { id: 'overview', label: 'Overview', icon: ChartPieIcon },
        { id: 'designs', label: 'My Designs', icon: CubeIcon },
        { id: 'orders', label: 'My Orders', icon: ArchiveBoxIcon },
        { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'designs': return <Components.CustomerDesignsPage />;
            case 'orders': return <Components.CustomerOrdersPage />;
            case 'profile': return <Components.CustomerProfilePage />;
            case 'overview':
            default:
                return <Components.CustomerDashboardOverview user={user} navigate={navigate} onViewFiles={onViewFiles} />;
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
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                style={{ ...styles.dashboardNavLink, ...(isActive && styles.dashboardNavLinkActive), border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit', fontSize: 'inherit' }}
                                aria-pressed={isActive}
                            >
                                <Icon style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                                {item.label}
                            </button>
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