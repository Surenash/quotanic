import React from 'react';
import { styles, neon_cyan, neon_magenta, neon_orange, border_color } from '../../types/theme';
import { GlobeAltIcon, ZapIcon, ShieldCheckIcon, TrendingUpIcon } from '../../components/icons';

const milestones = [
    { year: '2023', title: 'The Genesis', text: 'Quotanic was founded by a team of aerospace engineers frustrated by the opaque nature of custom manufacturing.', color: neon_cyan },
    { year: '2024', title: 'FBM Engine v1.0', text: 'Successfully launched our proprietary Feature-Based Manufacturing engine, automating geometric analysis for CNC and 3D printing.', color: neon_magenta },
    { year: '2025', title: 'Global Network Expansion', text: 'Vetted and onboarded over 50+ premium manufacturers across 3 continents, ensuring distributed resilience.', color: neon_orange },
    { year: 'Today', title: 'The Intelligence Layer', text: 'Quotanic now serves as the intelligent orchestration layer for global hardware innovation.', color: neon_cyan }
];

export const AboutUsPage = () => (
    <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
        {/* Hero Section */}
        <div style={{ ...styles.container, padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '60%', background: `radial-gradient(circle, rgba(10, 240, 240, 0.05) 0%, transparent 70%)`, filter: 'blur(100px)', zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '24px' }}>Bridging Design <br/> & <span style={{ color: neon_cyan }}>Production</span></h1>
                <p style={{ ...styles.heroSubtitle, maxWidth: '800px', margin: '0 auto', fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>
                    Quotanic is the intelligent infrastructure for the next generation of hardware innovation.
                </p>
            </div>
        </div>

        {/* Mission & Vision */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '100px 0', borderTop: `1px solid ${border_color}`, borderBottom: `1px solid ${border_color}` }}>
            <div style={styles.container}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: 'rgba(10, 240, 240, 0.1)', border: `1px solid ${neon_cyan}`, borderRadius: '20px', marginBottom: '24px' }}>
                            <ZapIcon style={{ width: '16px', height: '16px', color: neon_cyan }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: neon_cyan, letterSpacing: '1px', textTransform: 'uppercase' }}>Our Mission</span>
                        </div>
                        <h2 style={{ fontSize: '36px', marginBottom: '24px', fontWeight: 800 }}>Making Hardware as Instant as Software.</h2>
                        <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)' }}>
                            At Quotanic, we believe getting custom parts manufactured shouldn't take weeks of back-and-forth emails. We're building the tool we always wished we had: an intelligent, transparent, and ultra-fast bridge between engineering intent and physical reality.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {[
                            { icon: <GlobeAltIcon />, title: "Distributed", text: "Global manufacturing resilience." },
                            { icon: <ShieldCheckIcon />, title: "Secure", text: "Enterprise-grade IP protection." },
                            { icon: <TrendingUpIcon />, title: "Scalable", text: "From proto to mass production." },
                            { icon: <ZapIcon />, title: "Instant", text: "Real-time AI analysis." }
                        ].map((card, i) => (
                            <div key={i} style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${border_color}` }}>
                                <div style={{ color: neon_cyan, marginBottom: '16px' }}>{React.cloneElement(card.icon as React.ReactElement, { style: { width: '24px', height: '24px' } })}</div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{card.title}</h4>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{card.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Timeline Section */}
        <div style={{ ...styles.container, padding: '120px 24px' }}>
            <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '80px' }}>Our Journey</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: `linear-gradient(to bottom, ${neon_cyan}, ${neon_magenta}, ${neon_orange})`, transform: 'translateX(-50%)', opacity: 0.3 }}></div>
                
                {milestones.map((m, i) => (
                    <div key={i} style={{ 
                        display: 'flex', 
                        justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start', 
                        width: '100%', 
                        marginBottom: '64px',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            position: 'absolute', 
                            left: '50%', 
                            top: '20px', 
                            width: '16px', 
                            height: '16px', 
                            background: m.color, 
                            borderRadius: '50%', 
                            transform: 'translateX(-50%)',
                            boxShadow: `0 0 15px ${m.color}`,
                            zIndex: 2
                        }}></div>
                        
                        <div style={{ 
                            width: '45%', 
                            padding: '32px', 
                            borderRadius: '24px', 
                            background: 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${border_color}`,
                            textAlign: i % 2 === 0 ? 'right' : 'left',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: m.color, textTransform: 'uppercase', letterSpacing: '2px' }}>{m.year}</span>
                            <h3 style={{ fontSize: '22px', margin: '12px 0', fontWeight: 700 }}>{m.title}</h3>
                            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{m.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
