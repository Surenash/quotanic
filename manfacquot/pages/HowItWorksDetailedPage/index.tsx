import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles, neon_cyan, neon_magenta, neon_orange, bg_deep_space, border_color } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import { 
    UploadIcon, SparklesIcon, ShieldCheckIcon, ArrowLeftIcon, 
    CubeIcon, SearchIcon, LightningBoltIcon
} from '../../components/icons';

const steps = [
    {
        id: 0,
        title: "Upload & AI Analysis",
        subtitle: "The FBM (Feature-Based Manufacturing) Intelligence",
        description: "When you upload an STL or STEP file, our AI engine immediately dissects the geometry. It calculates volume, detects undercuts, identifies hole patterns, and assesses complex features to determine machinability in seconds.",
        icon: UploadIcon,
        color: neon_cyan,
        accent: 'rgba(10, 240, 240, 0.2)'
    },
    {
        id: 1,
        title: "Smart Matching",
        subtitle: "Verified Global Network Connection",
        description: "We don't just broadcast your design. Our proprietary matching algorithm cross-references your part's requirements—tolerances, materials, and volume—against our manufacturers' verified machine lists and expertise.",
        icon: SparklesIcon,
        color: neon_magenta,
        accent: 'rgba(255, 0, 255, 0.2)'
    },
    {
        id: 2,
        title: "Secure Production",
        subtitle: "End-to-End Visibility & Trust",
        description: "Once matched, your order enters our secure production pipeline. Track progress in real-time, communicate directly with the shop, and rest easy knowing your IP is protected by industry-standard encryption and legal framework.",
        icon: ShieldCheckIcon,
        color: neon_orange,
        accent: 'rgba(255, 165, 0, 0.2)'
    }
];

export const HowItWorksDetailedPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timer);
    }, [activeStep]);

    const renderVisual = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className="visual-container ai-scan">
                        <div className="scanning-cube">
                            <CubeIcon style={{ width: '120px', height: '120px', color: neon_cyan }} />
                            <div className="scan-line"></div>
                        </div>
                        <div className="data-points">
                            <span className="data-p p1">Vol: 142cm³</span>
                            <span className="data-p p2">Features: 12</span>
                            <span className="data-p p3">Tolerances: ±0.05</span>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="visual-container smart-match">
                        <div className="matching-hub">
                            <SearchIcon style={{ width: '80px', height: '80px', color: neon_magenta }} />
                            <div className="network-nodes">
                                <div className="node n1"></div>
                                <div className="node n2"></div>
                                <div className="node n3"></div>
                                <div className="pulse-circle"></div>
                            </div>
                        </div>
                        <div className="match-status">Matching Capabilities...</div>
                    </div>
                );
            case 2:
                return (
                    <div className="visual-container secure-prod">
                        <div className="lock-shield">
                            <ShieldCheckIcon style={{ width: '100px', height: '100px', color: neon_orange }} />
                            <div className="orbit">
                                <div className="satellite s1"><ShieldCheckIcon style={{width:'16px'}}/></div>
                                <div className="satellite s2"><LightningBoltIcon style={{width:'16px'}}/></div>
                            </div>
                        </div>
                        <div className="status-badge">SECURE PIPELINE ACTIVE</div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: bg_deep_space, color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: `radial-gradient(circle, ${steps[activeStep].accent} 0%, transparent 70%)`, filter: 'blur(80px)', transition: 'all 0.8s ease' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: `radial-gradient(circle, ${steps[activeStep].accent} 0%, transparent 70%)`, filter: 'blur(80px)', transition: 'all 0.8s ease' }}></div>

            <div style={{ ...styles.container, padding: '80px 24px', position: 'relative', zIndex: 1 }}>
                <header style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <button onClick={() => navigate(-1)} style={{ ...styles.backButton, marginBottom: '24px' }}>
                        <ArrowLeftIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                        Back
                    </button>
                    <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '16px' }}>How It Works</h1>
                    <p style={{ ...styles.heroSubtitle, color: 'var(--text-secondary)' }}>The technology powering the future of custom manufacturing.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '64px', alignItems: 'center' }} className="stepper-grid">
                    {/* Stepper Navigation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {steps.map((step, idx) => (
                            <div 
                                key={step.id}
                                onClick={() => setActiveStep(idx)}
                                style={{
                                    padding: '32px',
                                    borderRadius: '16px',
                                    background: activeStep === idx ? 'rgba(255,255,255,0.03)' : 'transparent',
                                    border: `1px solid ${activeStep === idx ? step.color : 'transparent'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    backdropFilter: activeStep === idx ? 'blur(10px)' : 'none',
                                    boxShadow: activeStep === idx ? `0 0 30px ${step.accent}` : 'none'
                                }}
                                className={`step-nav-item ${activeStep === idx ? 'active' : ''}`}
                            >
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '12px', 
                                        background: activeStep === idx ? step.color : 'rgba(255,255,255,0.05)',
                                        color: activeStep === idx ? '#000' : 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 style={{ 
                                            margin: 0, 
                                            fontSize: '20px', 
                                            color: activeStep === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            fontWeight: 600
                                        }}>{step.title}</h3>
                                        {activeStep === idx && (
                                            <p style={{ margin: '8px 0 0', fontSize: '14px', color: step.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{step.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: '55px', 
                                        bottom: '-24px', 
                                        width: '2px', 
                                        height: '24px', 
                                        background: activeStep > idx ? steps[idx+1].color : 'rgba(255,255,255,0.1)' 
                                    }}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Content Display */}
                    <div style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        borderRadius: '24px', 
                        padding: '48px',
                        border: `1px solid ${border_color}`,
                        minHeight: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            opacity: isAnimating ? 0 : 1, 
                            transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
                            transition: 'all 0.5s ease',
                            width: '100%'
                        }}>
                            <div style={{ marginBottom: '40px' }}>
                                {renderVisual()}
                            </div>
                            <h2 style={{ fontSize: '28px', marginBottom: '20px', color: steps[activeStep].color }}>{steps[activeStep].title}</h2>
                            <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                                {steps[activeStep].description}
                            </p>
                            <div style={{ marginTop: '40px' }}>
                                <CtaButton 
                                    text={activeStep === 2 ? "Get Started Now" : "Next Step"} 
                                    onClick={() => activeStep === 2 ? navigate('/upload') : setActiveStep(s => s + 1)}
                                    primary
                                    style={{ padding: '16px 40px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .visual-container {
                    height: 200px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }

                /* AI Scan Animation */
                .scanning-cube {
                    position: relative;
                    animation: float 3s ease-in-out infinite;
                }
                .scan-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: ${neon_cyan};
                    box-shadow: 0 0 15px ${neon_cyan};
                    animation: scan 2s linear infinite;
                }
                .data-points {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }
                .data-p {
                    position: absolute;
                    font-family: monospace;
                    font-size: 10px;
                    color: ${neon_cyan};
                    opacity: 0.6;
                    background: rgba(0,0,0,0.5);
                    padding: 2px 6px;
                    border-radius: 4px;
                    white-space: nowrap;
                }
                .p1 { top: 10%; left: 10%; animation: pulse 1.5s infinite; }
                .p2 { top: 50%; right: 5%; animation: pulse 1.5s infinite 0.5s; }
                .p3 { bottom: 10%; left: 20%; animation: pulse 1.5s infinite 1s; }

                /* Smart Match Animation */
                .matching-hub {
                    position: relative;
                }
                .network-nodes {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 150px;
                    height: 150px;
                }
                .node {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: ${neon_magenta};
                    border-radius: 50%;
                    box-shadow: 0 0 10px ${neon_magenta};
                }
                .n1 { top: 0; left: 50%; animation: nodeMove1 4s infinite linear; }
                .n2 { bottom: 0; right: 0; animation: nodeMove2 4s infinite linear; }
                .n3 { bottom: 0; left: 0; animation: nodeMove3 4s infinite linear; }
                .pulse-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    border: 1px solid ${neon_magenta};
                    border-radius: 50%;
                    animation: matchPulse 2s infinite;
                }
                .match-status {
                    position: absolute;
                    bottom: -30px;
                    font-size: 12px;
                    color: ${neon_magenta};
                    letter-spacing: 2px;
                    animation: blink 1s infinite;
                }

                /* Secure Prod Animation */
                .lock-shield {
                    position: relative;
                }
                .orbit {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 140px;
                    height: 140px;
                    border: 1px dashed rgba(255, 165, 0, 0.3);
                    border-radius: 50%;
                    animation: rotate 10s linear infinite;
                }
                .satellite {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    background: ${bg_deep_space};
                    border: 1px solid ${neon_orange};
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${neon_orange};
                }
                .s1 { top: -12px; left: calc(50% - 12px); }
                .s2 { bottom: -12px; left: calc(50% - 12px); }
                .status-badge {
                    position: absolute;
                    bottom: -40px;
                    background: rgba(255, 165, 0, 0.1);
                    border: 1px solid ${neon_orange};
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 700;
                    color: ${neon_orange};
                }

                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                @keyframes matchPulse {
                    0% { width: 0; height: 0; opacity: 1; }
                    100% { width: 100px; height: 100px; opacity: 0; }
                }
                @keyframes rotate {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes nodeMove1 {
                    0% { top: 0; left: 50%; }
                    33% { top: 100%; left: 100%; }
                    66% { top: 100%; left: 0; }
                    100% { top: 0; left: 50%; }
                }
                @keyframes nodeMove2 {
                    0% { bottom: 0; right: 0; }
                    33% { bottom: 100%; right: 50%; }
                    66% { bottom: 0; right: 100%; }
                    100% { bottom: 0; right: 0; }
                }
                @keyframes nodeMove3 {
                    0% { bottom: 0; left: 0; }
                    33% { bottom: 100%; left: 50%; }
                    66% { bottom: 0; left: 100%; }
                    100% { bottom: 0; left: 0; }
                }

                @media (max-width: 968px) {
                    .stepper-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};
