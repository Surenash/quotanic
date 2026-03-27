// Theme and Styles extracted from index.tsx
import React from 'react';

// --- Colors ---
export const neon_cyan = 'var(--neon-cyan)';
export const neon_magenta = 'var(--neon-magenta)';
export const neon_orange = 'var(--neon-orange)';
export const bg_deep_space = 'var(--bg-deep-space)';
export const text_primary = 'var(--text-primary)';
export const text_secondary = 'var(--text-secondary)';
export const border_color = 'var(--border-color)';
export const border_color_strong = 'var(--border-color-strong)';

// --- Styles ---
export const styles: { [key: string]: React.CSSProperties } = {
    appWrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bg_deep_space,
        color: text_primary,
        backgroundImage: `
            linear-gradient(rgba(175, 200, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(175, 200, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
    },
    backgroundAnimationContainer: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
    },
    animatedPart: {
        position: 'absolute',
        willChange: 'transform, opacity',
        transition: 'transform 0.2s linear, opacity 0.2s linear',
        transformStyle: 'preserve-3d',
    },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
    container: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' },
    header: {
        backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${border_color}`,
        position: 'sticky',
        top: 0,
        zIndex: 50
    },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px' },
    logo: {
        fontWeight: 'bold',
        fontSize: '24px',
        color: text_primary,
        textDecoration: 'none',
        textShadow: `0 0 4px ${neon_cyan}`
    },
    nav: { display: 'flex', gap: '32px' },
    navLink: {
        color: text_secondary,
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '15px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-block'
    },
    navLinkHover: {
        color: neon_cyan,
        textShadow: `0 0 8px ${neon_cyan}`,
        transform: 'translateY(-1px)'
    },
    headerActions: { display: 'flex', alignItems: 'center', gap: '16px' },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid transparent',
        fontWeight: 600,
        fontSize: '15px',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        width: 'auto'
    },
    buttonPrimary: {
        backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)',
        color: neon_cyan,
        border: `1px solid ${neon_cyan}`,
        boxShadow: `0 0 5px rgba(var(--neon-cyan-rgb), 0.5), inset 0 0 5px rgba(var(--neon-cyan-rgb), 0.3)`,
        textShadow: `0 0 3px ${neon_cyan}`
    },
    buttonPrimaryHover: {
        backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.2)',
        boxShadow: `0 0 15px rgba(var(--neon-cyan-rgb), 0.8), inset 0 0 8px rgba(var(--neon-cyan-rgb), 0.5)`,
        transform: 'scale(1.02)'
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        color: neon_magenta,
        border: `1px solid ${neon_magenta}`,
        boxShadow: `0 0 5px rgba(var(--neon-magenta-rgb), 0.4), inset 0 0 5px rgba(var(--neon-magenta-rgb), 0.2)`,
        textShadow: `0 0 3px ${neon_magenta}`
    },
    buttonSecondaryHover: {
        backgroundColor: 'rgba(var(--neon-magenta-rgb), 0.15)',
        boxShadow: `0 0 15px rgba(var(--neon-magenta-rgb), 0.7), inset 0 0 8px rgba(var(--neon-magenta-rgb), 0.4)`,
        transform: 'scale(1.02)'
    },
    buttonDanger: {
        backgroundColor: 'transparent',
        color: neon_orange,
        border: `1px solid ${neon_orange}`,
        boxShadow: `0 0 5px rgba(var(--neon-orange-rgb), 0.4), inset 0 0 5px rgba(var(--neon-orange-rgb), 0.2)`,
        textShadow: `0 0 3px ${neon_orange}`
    },
    buttonDangerHover: {
        backgroundColor: `rgba(var(--neon-orange-rgb), 0.15)`,
        boxShadow: `0 0 15px rgba(var(--neon-orange-rgb), 0.7), inset 0 0 8px rgba(var(--neon-orange-rgb), 0.4)`
    },
    buttonDisabled: {
        backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)',
        color: 'rgba(var(--text-primary-rgb), 0.4)',
        border: `1px solid rgba(var(--text-primary-rgb), 0.2)`,
        cursor: 'not-allowed',
        boxShadow: 'none',
        textShadow: 'none',
        transform: 'none'
    },
    hero: { padding: '96px 0', textAlign: 'center' },
    heroContent: { maxWidth: '800px', margin: '0 auto' },
    heroTitle: {
        fontSize: '56px',
        fontWeight: 800,
        color: text_primary,
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
        margin: '0 0 24px 0',
        textShadow: `0 0 5px ${neon_cyan}, 0 0 15px ${neon_cyan}, 0 0 30px rgba(var(--neon-cyan-rgb), 0.5)`
    },
    heroSubtitle: {
        fontSize: '20px',
        color: text_secondary,
        lineHeight: 1.6,
        maxWidth: '650px',
        margin: '0 auto 32px auto',
        textShadow: `0 0 2px rgba(var(--text-primary-rgb), 0.3)`
    },
    heroActions: { display: 'flex', justifyContent: 'center', gap: '16px' },
    howItWorks: { padding: '96px 0' },
    sectionTitle: {
        fontSize: '42px',
        fontWeight: 700,
        color: text_primary,
        textAlign: 'center',
        margin: '0 0 64px 0',
        textShadow: `0 0 8px ${neon_magenta}`
    },
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', textAlign: 'center' },
    step: {},
    stepTitle: {
        fontSize: '20px',
        fontWeight: 600,
        color: text_primary,
        margin: '16px 0 8px 0',
        textShadow: `0 0 4px ${text_primary}`
    },
    stepText: { color: text_secondary, lineHeight: 1.6, margin: 0 },
    features: { padding: '96px 0', backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)' },
    valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' },
    valueCard: {
        backgroundColor: 'var(--bg-panel)',
        padding: '32px',
        borderRadius: '12px',
        textAlign: 'center',
        border: `1px solid ${border_color}`,
        transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
        boxShadow: 'inset 0 0 10px rgba(var(--neon-cyan-rgb), 0.1)'
    },
    valueCardHover: {
        transform: 'translateY(-8px) scale(1.03)',
        borderColor: neon_cyan,
        boxShadow: `0 0 20px rgba(var(--neon-cyan-rgb), 0.5), inset 0 0 15px rgba(var(--neon-cyan-rgb), 0.3)`
    },
    forWhomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
    forWhomCard: {
        backgroundColor: 'var(--bg-panel)',
        padding: '40px',
        borderRadius: '12px',
        border: `1px solid ${border_color_strong}`,
        display: 'flex',
        flexDirection: 'column'
    },
    forWhomIcon: {
        width: '32px',
        height: '32px',
        marginBottom: 0,
        filter: 'drop-shadow(0 0 8px currentColor)'
    },
    featureTitle: {
        fontSize: '24px',
        fontWeight: 600,
        color: text_primary,
        margin: 0,
        textShadow: `0 0 5px currentColor`
    },
    forWhomText: { color: text_secondary, lineHeight: 1.6, margin: '16px 0 24px 0', flexGrow: 1 },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 32px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: text_secondary,
    },
    socialProofGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
    testimonialCard: { backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', border: `1px solid ${border_color}` },
    testimonialText: { fontStyle: 'italic', color: text_primary, lineHeight: 1.6, margin: '0 0 16px 0' },
    testimonialAuthor: { fontWeight: 600, color: neon_magenta, textShadow: `0 0 5px ${neon_magenta}` },
    metricsContainer: { display: 'flex', justifyContent: 'space-around', marginTop: '80px', borderTop: `1px solid ${border_color}`, paddingTop: '64px' },
    metricItem: { textAlign: 'center' },
    metricValue: { display: 'block', fontSize: '42px', fontWeight: 700, color: neon_cyan, textShadow: `0 0 10px ${neon_cyan}` },
    metricLabel: { color: text_secondary, marginTop: '8px' },
    footer: { backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.8)', color: text_secondary, padding: '64px 0', borderTop: `1px solid ${border_color}` },
    footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', paddingBottom: '48px' },
    footerColumn: { display: 'flex', flexDirection: 'column', gap: '12px' },
    footerHeading: { color: text_primary, fontWeight: 600, fontSize: '16px', margin: '0 0 8px 0' },
    footerLink: { color: text_secondary, textDecoration: 'none', transition: 'color 0.2s, text-shadow 0.2s' },
    footerBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${border_color_strong}`, paddingTop: '32px', marginTop: '32px' },
    footerCopyright: { fontSize: '14px' },
    footerSocials: { display: 'flex', gap: '16px' },
    footerSocialLink: { color: text_secondary, textDecoration: 'none', transition: 'color 0.2s, filter 0.2s', filter: 'grayscale(50%)' },
    featureCard: { backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', border: `1px solid ${border_color}` },
    loginPage: { flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' },
    loginContainer: {
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: `0 0 30px rgba(var(--neon-cyan-rgb), 0.3), inset 0 0 10px rgba(var(--neon-magenta-rgb), 0.2)`,
        border: `1px solid ${neon_cyan}`
    },
    loginTitle: { fontSize: '32px', fontWeight: 700, color: text_primary, textAlign: 'center', margin: '0 0 12px 0', textShadow: `0 0 5px ${neon_cyan}` },
    loginSubtitle: { fontSize: '16px', color: text_secondary, textAlign: 'center', margin: '0 0 32px 0' },
    loginForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
    loginError: { color: 'var(--status-error)', backgroundColor: 'rgba(var(--status-error-rgb), 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid var(--status-error)', textAlign: 'center', fontSize: '14px', textShadow: '0 0 5px var(--status-error)' },
    loginReasonMessage: { color: '#60A5FA', backgroundColor: 'rgba(96, 165, 250, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #60A5FA', textAlign: 'center', fontSize: '14px', marginBottom: '24px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontWeight: 500, color: text_secondary, marginBottom: '8px', fontSize: '14px' },
    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${border_color_strong}`,
        fontSize: '16px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: text_primary,
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none'
    },
    loginLinks: { display: 'flex', justifyContent: 'space-between', marginTop: '24px', fontSize: '14px' },
    loginLink: { color: neon_cyan, textDecoration: 'none', transition: 'filter 0.2s', filter: 'brightness(0.9)' },
    fieldset: { border: `1px solid ${border_color}`, borderRadius: '8px', padding: '24px', margin: '24px 0 0 0', backgroundColor: 'var(--bg-panel)' },
    legend: { fontWeight: 600, fontSize: '18px', color: neon_magenta, padding: '0 8px', textShadow: `0 0 5px ${neon_magenta}` },
    fieldsetDescription: { color: text_secondary, fontSize: '14px', marginTop: '-8px', marginBottom: '16px' },
    subLegend: { fontWeight: 600, color: text_primary, marginBottom: '12px', fontSize: '16px' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', fontSize: '14px', color: text_secondary, cursor: 'pointer' },
    checkboxInput: { marginRight: '8px', width: '16px', height: '16px', accentColor: neon_cyan, backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${border_color_strong}` },
    uploadPageContainer: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '64px 24px', boxSizing: 'border-box', flexGrow: 1 },
    dashboardHeader: { borderBottom: `1px solid ${border_color}`, paddingBottom: '16px', marginBottom: '24px' },
    dashboardTitle: { fontSize: '36px', fontWeight: 700, color: text_primary, margin: 0, textShadow: `0 0 8px ${neon_cyan}` },
    uploadLayout: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', marginTop: '24px' },
    uploadDropzoneWrapper: {},
    uploadDropzone: { border: `2px dashed ${border_color_strong}`, borderRadius: '12px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: 'var(--bg-panel)' },
    uploadDropzoneActive: { borderColor: neon_cyan, backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)', boxShadow: `0 0 15px rgba(var(--neon-cyan-rgb), 0.3)` },
    uploadFileInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: neon_cyan },
    uploadFileName: { fontWeight: 500, color: text_primary },
    uploadFormFields: { display: 'flex', flexDirection: 'column', gap: '20px' },
    supportingFileList: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    supportingFileItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: `1px solid ${border_color}` },
    supportingFileName: { flexGrow: 1, fontSize: '14px', color: text_secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    supportingFileRemoveBtn: { background: 'none', border: 'none', cursor: 'pointer', color: text_secondary, padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '50%' },
    directoryLayout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', marginTop: '48px' },
    directoryFilters: { backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: `1px solid ${border_color}` },
    directoryResults: {},
    searchContainer: { position: 'relative', marginTop: '24px' },
    searchInput: { padding: '10px 12px', paddingLeft: '40px', borderRadius: '8px', border: `1px solid ${border_color_strong}`, fontSize: '16px', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(0,0,0,0.3)', color: text_primary },
    mfgGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    mfgCard: { backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: `1px solid ${border_color}`, transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s', cursor: 'pointer' },
    mfgCardHover: { transform: 'translateY(-5px) scale(1.02)', boxShadow: `0 0 25px rgba(var(--neon-magenta-rgb), 0.4)`, border: `1px solid ${neon_magenta}` },
    mfgCardLogo: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${border_color_strong}`, backgroundColor: bg_deep_space, flexShrink: 0 },
    mfgCardTitle: { fontSize: '18px', fontWeight: '600', color: text_primary, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    mfgCardLocation: { fontSize: '14px', color: text_secondary, margin: '0', display: 'flex', alignItems: 'center' },
    mfgCardSectionTitle: { fontSize: '12px', fontWeight: '600', color: text_secondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' },
    mfgCardTagContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    mfgCardTag: { backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)', color: neon_cyan, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 },
    mfgCardCertTag: { backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34D399', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 },
    mfgCardMaterialTag: { backgroundColor: 'rgba(var(--text-secondary), 0.1)', color: text_secondary, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 },
    mfgCardViewProfileLink: { color: neon_magenta, fontWeight: 600, fontSize: '14px', textDecoration: 'none', transition: 'text-shadow 0.2s, letter-spacing 0.2s' },
    mfgCardViewProfileLinkHover: { textShadow: `0 0 5px ${neon_magenta}`, letterSpacing: '0.5px' },
    profilePageContainer: { flexGrow: 1, paddingBottom: '64px' },
    backButton: { display: 'inline-flex', alignItems: 'center', background: 'none', border: `1px solid ${border_color}`, cursor: 'pointer', color: text_primary, fontWeight: 500, fontSize: '15px', padding: '8px 12px', marginBottom: '24px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', transition: 'all 0.2s ease' },
    profileHeader: { position: 'relative', padding: '48px 0', color: '#fff', backgroundSize: 'cover', backgroundPosition: 'center' },
    profileHeaderContent: { display: 'flex', alignItems: 'center', gap: '32px', position: 'relative', zIndex: 2 },
    profileHeaderLogo: { width: '120px', height: '120px', backgroundColor: bg_deep_space, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff', boxShadow: `0 0 15px #fff`, objectFit: 'cover' },
    profileTitle: { fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' },
    profileLocation: { fontSize: '18px', color: 'var(--text-primary)', margin: '8px 0 0 0', display: 'flex', alignItems: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.7)' },
    profileContentGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '48px', marginTop: '48px' },
    profileMainContent: { display: 'flex', flexDirection: 'column', gap: '48px' },
    profileSidebar: { display: 'flex', flexDirection: 'column', gap: '32px' },
    profileSection: { backgroundColor: 'var(--bg-panel)', borderRadius: '12px', padding: '24px', border: `1px solid ${border_color}` },
    profileSectionTitle: { fontSize: '20px', fontWeight: 600, color: neon_magenta, margin: '0 0 16px 0', paddingBottom: '12px', borderBottom: `1px solid ${border_color}`, textShadow: `0 0 5px ${neon_magenta}` },
    profilePortfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
    portfolioItem: { position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3', backgroundColor: bg_deep_space, cursor: 'pointer', border: `1px solid ${border_color}` },
    profilePortfolioImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },
    portfolioItemOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '16px 12px 8px 12px', transition: 'opacity 0.3s ease' },
    portfolioItemTitle: { color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0, lineHeight: 1.2 },
    portfolioVideoPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#374151' },
    dashboardContainer: { display: 'flex', flexGrow: 1, backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)' },
    dashboardSidebar: { width: '280px', backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.7)', backdropFilter: 'blur(10px)', color: text_primary, padding: '24px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${border_color}` },
    dashboardSidebarTitle: { fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, margin: '0 0 32px 0', textShadow: `0 0 5px ${neon_cyan}` },
    dashboardNav: { display: 'flex', flexDirection: 'column', gap: '8px' },
    dashboardNavLink: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', color: text_secondary, fontWeight: 500, transition: 'all 0.2s', border: '1px solid transparent' },
    dashboardNavLinkActive: { backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)', color: neon_cyan, border: `1px solid ${neon_cyan}` },
    dashboardMainContent: { flex: 1, padding: '48px', overflowY: 'auto' },
    dashboardPageTitle: { fontSize: '32px', fontWeight: 700, color: text_primary, margin: '0 0 8px 0', textShadow: `0 0 8px ${neon_cyan}` },
    dashboardPageSubtitle: { fontSize: '16px', color: text_secondary, margin: '0 0 32px 0' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', marginTop: '32px' },
    statCard: { backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: `1px solid ${border_color}`, boxShadow: 'inset 0 0 10px rgba(var(--neon-magenta-rgb), 0.1)' },
    statValue: { fontSize: '36px', fontWeight: 700, color: neon_cyan, margin: '0 0 4px 0', textShadow: `0 0 8px ${neon_cyan}` },
    statLabel: { fontSize: '14px', color: text_secondary, margin: 0, fontWeight: 500 },
    tableContainer: { backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: `1px solid ${border_color}`, overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.7)', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: text_secondary, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${border_color_strong}` },
    tableCell: { padding: '16px', borderTop: `1px solid ${border_color}`, fontSize: '14px', color: text_secondary, verticalAlign: 'middle' },
    statusBadge: { padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, display: 'inline-block', whiteSpace: 'nowrap', border: '1px solid' },
    modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' },
    modalContent: { backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.9)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: `0 0 40px rgba(var(--neon-cyan-rgb), 0.4)`, overflowY: 'auto', maxHeight: '90vh', border: `1px solid ${neon_cyan}` },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border_color}`, paddingBottom: '16px', marginBottom: '16px' },
    modalTitle: { fontSize: '20px', fontWeight: 600, color: text_primary, margin: 0, textShadow: `0 0 5px ${neon_cyan}` },
    modalCloseButton: { background: 'none', border: 'none', cursor: 'pointer', color: text_secondary },
    modalBody: {},
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: `1px solid ${border_color}`, paddingTop: '16px' },
    quoteDetailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' },
    quoteDetailLabel: { fontSize: '12px', color: text_secondary, margin: '0 0 4px 0', textTransform: 'uppercase' },
    quoteDetailValue: { fontSize: '16px', color: text_primary, margin: 0, fontWeight: 500 },
    fileListItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' },
    fileInfo: { flexGrow: 1 },
    fileName: { fontWeight: 500, color: text_primary },
    fileSize: { fontSize: '12px', color: text_secondary },
    imageUploadBox: { position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--bg-panel)', border: `2px dashed ${border_color_strong}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'all 0.3s' },
    imageUploadPreview: { width: '100%', height: '100%', objectFit: 'cover' },
    imageUploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    imageUploadRemoveBtn: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' },
    portfolioManagementGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' },
    portfolioManagementItem: { position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' },
    portfolioManagementImage: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${border_color}` },
    portfolioManagementTitleInput: { width: '100%', padding: '8px', border: `1px solid ${border_color_strong}`, borderRadius: '6px', fontSize: '12px', backgroundColor: 'rgba(0,0,0,0.3)', color: text_primary },

    // Chip styles
    chip: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 500,
        backgroundColor: 'rgba(var(--text-secondary), 0.1)',
        color: text_secondary,
        border: `1px solid ${border_color}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chipActive: {
        backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)',
        color: neon_cyan,
        border: `1px solid ${neon_cyan}`,
        boxShadow: `0 0 5px rgba(var(--neon-cyan-rgb), 0.3)`
    },

    // FBM-specific styles
    fbmBadge: {
        display: 'flex',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'rgba(var(--neon-cyan-rgb), 0.1)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '8px',
        fontSize: '12px',
        alignItems: 'center'
    },
    intelligenceCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
    },
    intelCard: {
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(var(--neon-cyan-rgb),0.1) 0%, rgba(var(--neon-magenta-rgb),0.05) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        textAlign: 'center'
    },
    toolCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: 'rgba(30, 30, 40, 0.5)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
    },
    toolCost: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'flex-end',
        fontSize: '12px',
        color: text_secondary
    },
    optimizationCard: {
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: 'rgba(var(--status-success-rgb), 0.1)',
        border: '1px solid var(--status-success)',
        borderRadius: '8px'
    },
    savingsBadge: {
        backgroundColor: 'var(--status-success)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        marginLeft: '8px'
    },
    alertBox: {
        padding: '12px',
        backgroundColor: 'rgba(var(--status-warning-rgb), 0.1)',
        border: '1px solid var(--status-warning)',
        borderRadius: '8px',
        marginTop: '12px',
        color: 'var(--status-warning)'
    },
    section: {
        marginBottom: '32px'
    },
    dimCard: {
        display: 'flex',
        gap: '16px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '13px'
    },

    // --- Dashboard Redesign Styles ---
    dashboardCard: {
        backgroundColor: 'var(--bg-panel)',
        padding: '24px',
        borderRadius: '16px',
        border: `1px solid ${border_color}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    dashboardHeroCard: {
        backgroundColor: 'var(--bg-panel)',
        padding: '32px',
        borderRadius: '20px',
        border: `1px solid ${neon_cyan}`,
        boxShadow: `0 0 20px rgba(var(--neon-cyan-rgb), 0.1), inset 0 0 20px rgba(var(--neon-cyan-rgb), 0.05)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    dashboardMetricValue: {
        fontSize: '48px',
        fontWeight: 800,
        color: text_primary,
        lineHeight: 1.1,
        margin: '8px 0',
        textShadow: `0 0 10px rgba(var(--text-primary-rgb), 0.5)`
    },
    dashboardMetricLabel: {
        fontSize: '15px',
        fontWeight: 500,
        color: text_secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0
    },
    dashboardSectionHeader: {
        fontSize: '18px',
        fontWeight: 600,
        color: text_primary,
        margin: '0 0 20px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dashboardComparisonUp: {
        color: 'var(--status-success)',
        fontSize: '13px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        backgroundColor: 'rgba(var(--status-success-rgb), 0.1)',
        borderRadius: '12px'
    },
    dashboardComparisonDown: {
        color: 'var(--status-error)',
        fontSize: '13px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        backgroundColor: 'rgba(var(--status-error-rgb), 0.1)',
        borderRadius: '12px'
    },
    dashboardBarChartContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '180px',
        marginTop: '16px',
        paddingTop: '32px',
        borderBottom: `1px solid ${border_color_strong}`
    },
    dashboardVerticalBarGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        position: 'relative'
    },
    dashboardVerticalBarFill: {
        width: '32px',
        backgroundColor: neon_cyan,
        borderRadius: '6px 6px 0 0',
        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 0 10px rgba(var(--neon-cyan-rgb), 0.3)`
    },
    dashboardBarLabel: {
        marginTop: '12px',
        fontSize: '12px',
        color: text_secondary,
        fontWeight: 500,
        whiteSpace: 'nowrap'
    },
    dashboardBarValueLabel: {
        position: 'absolute',
        top: '-24px',
        fontSize: '12px',
        color: text_primary,
        fontWeight: 600
    },
    dashboardHorizontalBarGroup: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px'
    },
    dashboardHorizontalBarTrack: {
        flex: 1,
        height: '12px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '6px',
        overflow: 'hidden',
        margin: '0 16px'
    },
    dashboardHorizontalBarFill: {
        height: '100%',
        backgroundColor: neon_magenta,
        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    dashboardActivityTable: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    dashboardActivityRow: {
        borderBottom: `1px solid ${border_color}`,
        transition: 'background-color 0.2s'
    },
    dashboardActivityCell: {
        padding: '16px 12px',
        fontSize: '14px',
        color: text_secondary
    }
};
