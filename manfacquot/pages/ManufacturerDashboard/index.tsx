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

export const ManufacturerDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { openViewer: onViewFiles } = useFileViewer();
    const [activeView, setActiveView] = useState('overview'); // overview, profile, quotes, orders, internal, settings
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('mfg_sidebar_collapsed') === 'true';
    });

    const navItems = [
        { id: 'overview', label: 'Overview', icon: ChartPieIcon },
        { id: 'quotes', label: 'Quote Requests', icon: DocumentTextIcon },
        { id: 'internal', label: 'Internal Quotations', icon: DocumentTextIcon },
        { id: 'orders', label: 'Active Orders', icon: CubeIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
        { id: 'profile', label: 'Profile Management', icon: UserCircleIcon },
    ];

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('mfg_sidebar_collapsed', String(newState));
            return newState;
        });
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'settings': return <ManufacturerSettingsPage />;
            case 'profile': return <Components.ManufacturerProfileManagementPage user={user} />;
            case 'quotes': return <Components.QuoteRequestsPage />;
            case 'internal': return <Components.InternalQuotationsPage />;
            case 'orders': return <Components.ActiveOrdersPage />;
            case 'overview':
            default:
                return <Components.DashboardOverview user={user} onSetActiveView={setActiveView} />;
        }
    };

    // Dark Mode Optimized Sidebar Button Styles
    const getSidebarBtnStyle = (isActive: boolean) => ({
        ...styles.dashboardNavLink,
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '4px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: 'none',
        background: isActive ? 'rgba(10, 240, 240, 0.1)' : 'transparent',
        color: isActive ? neon_cyan : 'var(--text-secondary)',
        cursor: 'pointer',
        textAlign: 'left' as const,
        width: '100%',
        fontFamily: 'inherit',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        position: 'relative' as const,
        overflow: 'hidden',
        ...(isActive && {
            boxShadow: 'inset 0 0 10px rgba(10, 240, 240, 0.05)',
            borderLeft: `3px solid ${neon_cyan}`,
            paddingLeft: '13px'
        })
    });

    return (
        <div style={styles.dashboardContainer}>
            <aside style={{ 
                ...styles.dashboardSidebar, 
                width: isSidebarCollapsed ? '80px' : '260px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', marginBottom: '20px' }}>
                    {!isSidebarCollapsed && (
                        <h2 style={{ ...styles.dashboardSidebarTitle, margin: 0, fontSize: '18px' }}>Manufacturer<br />Dashboard</h2>
                    )}
                    <button 
                        onClick={toggleSidebar}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${border_color}`,
                            borderRadius: '6px',
                            color: text_secondary,
                            cursor: 'pointer',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSidebarCollapsed ? <ArrowLeftIcon style={{ transform: 'rotate(180deg)', width: '16px', height: '16px' }} /> : <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />}
                    </button>
                </div>

                <nav style={{ ...styles.dashboardNav, padding: '0 12px' }}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                style={getSidebarBtnStyle(isActive)}
                                aria-pressed={isActive}
                                title={isSidebarCollapsed ? item.label : ""}
                            >
                                <Icon style={{ width: '20px', height: '20px', marginRight: isSidebarCollapsed ? 0 : '12px', flexShrink: 0 }} />
                                {!isSidebarCollapsed && item.label}
                                {isActive && !isSidebarCollapsed && (
                                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: neon_cyan, boxShadow: `0 0 10px ${neon_cyan}` }} />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', padding: '20px 16px', borderTop: `1px solid ${border_color}` }}>
                     <button
                        onClick={clearTokens}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            color: '#ef4444',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: '100%',
                            opacity: 0.8
                        }}
                    >
                        <XMarkIcon style={{ width: '20px', height: '20px', marginRight: isSidebarCollapsed ? 0 : '12px' }} />
                        {!isSidebarCollapsed && "Log Out"}
                    </button>
                </div>
            </aside>
            <main style={{ 
                ...styles.dashboardMainContent,
                flex: 1,
                overflowY: 'auto',
                transition: 'padding-left 0.3s'
            }}>
                {renderActiveView()}
            </main>
            <style>{`
                .dashboard-nav-item-hover:hover {
                    background: rgba(255, 255, 255, 0.03) !important;
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
};
