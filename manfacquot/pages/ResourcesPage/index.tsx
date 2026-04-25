import React from 'react';
import { styles, neon_cyan, neon_orange, border_color } from '../../types/theme';
import { DownloadIcon, FileIcon, VideoCameraIcon, GlobeAltIcon } from '../../components/icons';

const resources = [
    {
        title: "Design for Manufacturing (DFM) Guide",
        description: "A comprehensive checklist for optimizing parts for CNC and Sheet Metal production.",
        type: "PDF Guide",
        icon: <FileIcon />,
        color: neon_cyan
    },
    {
        title: "Global Supply Chain Report 2024",
        description: "Insights into the shifting landscape of hardware production and distributed resilience.",
        type: "Whitepaper",
        icon: <GlobeAltIcon />,
        color: neon_orange
    },
    {
        title: "Case Study: XYZ Robotics",
        description: "How a high-growth startup reduced their lead times by 40% using Quotanic.",
        type: "Case Study",
        icon: <VideoCameraIcon />,
        color: 'var(--neon-magenta)'
    }
];

export const ResourcesPage = () => {
    return (
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ ...styles.container, padding: '120px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '24px' }}>Engineering <span style={{ color: neon_orange }}>Resources</span></h1>
                    <p style={{ ...styles.heroSubtitle, color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto' }}>Tools, guides, and insights to help you build better products and master the modern manufacturing stack.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px' }}>
                    {resources.map((res, i) => (
                        <div key={i} style={{ 
                            background: 'rgba(255,255,255,0.02)', border: `1px solid ${border_color}`, borderRadius: '24px', padding: '40px',
                            transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                        }} className="resource-card">
                            <div style={{ 
                                position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', 
                                background: `radial-gradient(circle, ${res.color}22 0%, transparent 70%)`, filter: 'blur(30px)' 
                            }}></div>
                            
                            <div style={{ 
                                width: '56px', height: '56px', borderRadius: '16px', background: `${res.color}11`,
                                border: `1px solid ${res.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: res.color, marginBottom: '32px'
                            }}>
                                {React.cloneElement(res.icon as React.ReactElement, { style: { width: '28px', height: '28px' } })}
                            </div>
                            
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>{res.type}</span>
                            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>{res.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontSize: '15px', marginBottom: '40px' }}>{res.description}</p>
                            
                            <button style={{ 
                                background: 'transparent', border: `1px solid ${border_color}`, color: '#fff', borderRadius: '12px', 
                                padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700,
                                fontSize: '14px', transition: 'all 0.3s'
                            }} className="download-btn">
                                <DownloadIcon style={{ width: '18px', height: '18px' }} />
                                Download Resource
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .resource-card:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); }
                .resource-card:hover .download-btn { background: #fff; color: #000; }
            `}</style>
        </div>
    );
};
