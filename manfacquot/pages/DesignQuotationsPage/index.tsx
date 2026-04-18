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

export const DesignQuotationsPage = ({ designId, navigate, onViewFiles }: { designId: string, navigate: (page: string, params?: any) => void, onViewFiles: (id: string) => void }) => {
    const [quotes, setQuotes] = useState([]);
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('price'); // 'price' or 'lead_time'
    const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);
    const { formatPrice } = useCurrency();
    const [breakdownModalInfo, setBreakdownModalInfo] = useState({ isOpen: false, request: null });
    const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null);

    const parseBreakdown = (notes) => {
        if (!notes) return null;
        try {
            const jsonStart = notes.indexOf('{');
            const jsonEnd = notes.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) return null;
            const jsonStr = notes.substring(jsonStart, jsonEnd + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                const fixedJson = jsonStr.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
                return JSON.parse(fixedJson);
            }
        } catch (e) { return null; }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [designData, quotesData] = await Promise.all([
                    api.getDesignById(designId),
                    api.getDesignQuotes(designId)
                ]);
                setDesign(designData);
                setQuotes(quotesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [designId]);

    const handleAcceptQuote = async (quoteId) => {
        if (!confirm('Are you sure you want to accept this quote? This will create an order.')) {
            return;
        }
        setAcceptingQuoteId(quoteId);
        try {
            await api.updateQuoteStatus(quoteId, 'accepted');
            alert('Quote accepted! Order created successfully.');
            navigate('/dashboard'); // Redirect to dashboard/orders
        } catch (err) {
            alert(`Failed to accept quote: ${err.message}`);
        } finally {
            setAcceptingQuoteId(null);
        }
    };

    const sortedQuotes = [...quotes].sort((a, b) => {
        if (sortBy === 'price') {
            return parseFloat(a.price_usd || 0) - parseFloat(b.price_usd || 0);
        } else {
            return (a.estimated_lead_time_days || 0) - (b.estimated_lead_time_days || 0);
        }
    });

    if (loading) {
        return (
            <div style={{ ...styles.uploadPageContainer, textAlign: 'center', paddingTop: '120px' }}>
                <p>Loading quotations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.uploadPageContainer}>
                <div style={styles.warningBox}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <CtaButton text="Back to Dashboard" onClick={() => navigate('/dashboard')} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.uploadPageContainer}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{ ...styles.backButton, marginBottom: '32px' }}
            >
                <ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
                Back to My Designs
            </button>

            {/* Design Summary */}
            <div style={{ ...styles.featureCard, marginBottom: '32px' }}>
                <h2 style={styles.dashboardPageTitle}>Quotations for: {design?.design_name || 'Design'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Material</p>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{design?.material}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quantity</p>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{design?.quantity} units</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quotes Received</p>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{quotes.length}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <CtaButton
                            text="View 3D Design"
                            onClick={() => onViewFiles(designId)}
                            className="button-small"
                        >
                            <EyeIcon style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                        </CtaButton>
                    </div>
                </div>
            </div>

            {quotes.length === 0 ? (
                <div style={styles.warningBox}>
                    <h3>No Quotations Yet</h3>
                    <p>No manufacturers have provided quotes for this design yet. Please check back later.</p>
                    <CtaButton text="Back to Dashboard" onClick={() => navigate('/dashboard')} primary />
                </div>
            ) : (
                <>
                    {/* Sort Controls */}
                    <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sort by:</span>
                        <button
                            onClick={() => setSortBy('price')}
                            style={{
                                ...styles.button,
                                ...(sortBy === 'price' ? styles.buttonPrimary : styles.buttonSecondary),
                                padding: '8px 16px',
                                fontSize: '14px'
                            }}>
                            💰 Price (Low to High)
                        </button>
                        <button
                            onClick={() => setSortBy('lead_time')}
                            style={{
                                ...styles.button,
                                ...(sortBy === 'lead_time' ? styles.buttonPrimary : styles.buttonSecondary),
                                padding: '8px 16px',
                                fontSize: '14px'
                            }}>
                            ⚡ Lead Time (Fast to Slow)
                        </button>
                    </div>

                    {/* Quotes Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Manufacturer</th>
                                    <th style={styles.tableHeader}>Company</th>
                                    <th style={styles.tableHeader}>Price (USD)</th>
                                    <th style={styles.tableHeader}>Lead Time</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedQuotes.map((quote: any) => {
                                    const isAccepted = quote.status === 'accepted';
                                    const isPending = quote.status === 'pending';
                                    const hasAcceptedQuote = quotes.some(q => q.status === 'accepted');
                                    const isExpanded = expandedQuoteId === quote.id;

                                    const requestObj = {
                                        id: quote.id,
                                        designId: quote.design,
                                        designName: design?.design_name || 'Design',
                                        customer: quote.manufacturer_name || 'Manufacturer',
                                        material: design?.material || 'N/A',
                                        quantity: design?.quantity || 0,
                                        price: quote.price_usd,
                                        leadTime: quote.estimated_lead_time_days,
                                        notes: quote.notes || '',
                                    };

                                    return (
                                        <React.Fragment key={quote.id}>
                                            <tr style={{ backgroundColor: isExpanded ? 'rgba(var(--neon-cyan-rgb), 0.03)' : 'transparent' }}>
                                                <td style={styles.tableCell}>
                                                    {quote.manufacturer_name || 'Unknown'}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {quote.manufacturer_company || 'N/A'}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <strong style={{ color: 'var(--neon-cyan)', fontSize: '16px' }}>
                                                        {formatPrice(quote.price_usd || 0)}
                                                    </strong>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {quote.estimated_lead_time_days || 'N/A'} days
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        color: isAccepted ? 'var(--status-success)' : '#FBBF24',
                                                        backgroundColor: isAccepted ? 'rgba(var(--status-success-rgb), 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                                        border: `1px solid ${isAccepted ? 'rgba(var(--status-success-rgb), 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
                                                    }}>
                                                        {isAccepted ? '✓ Accepted' : isPending ? '⏳ Pending' : quote.status}
                                                    </span>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        {isPending && !hasAcceptedQuote && (
                                                            <CtaButton
                                                                text={acceptingQuoteId === quote.id ? 'Accepting...' : 'Accept Quote'}
                                                                onClick={() => handleAcceptQuote(quote.id)}
                                                                primary
                                                                disabled={acceptingQuoteId !== null}
                                                                className="button-small"
                                                            />
                                                        )}
                                                        <CtaButton
                                                            text={isExpanded ? "Hide Details" : "View Details"}
                                                            onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                                                            className="button-small"
                                                        />
                                                        {isAccepted && (
                                                            <span style={{ ...styles.statusBadge, color: 'var(--status-success)' }}>✓ Order Created</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={6} style={{ padding: '0 16px 24px 16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                                        <div style={{
                                                            marginTop: '8px',
                                                            padding: '24px',
                                                            backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)',
                                                            borderRadius: '0 0 12px 12px',
                                                            border: '1px solid rgba(var(--neon-cyan-rgb), 0.2)',
                                                            borderTop: 'none'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                                <h4 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '14px', textTransform: 'uppercase' }}>Quotation Breakdown</h4>
                                                                <CtaButton text="Open in Popup" className="button-small" onClick={() => setBreakdownModalInfo({ isOpen: true, request: requestObj })} />
                                                            </div>
                                                            <CostBreakdownContent breakdown={parseBreakdown(quote.notes)} request={requestObj} formatPrice={formatPrice} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {breakdownModalInfo.isOpen && <CostBreakdownModal request={breakdownModalInfo.request} onClose={() => setBreakdownModalInfo({ isOpen: false, request: null })} />}
        </div>
    );
};