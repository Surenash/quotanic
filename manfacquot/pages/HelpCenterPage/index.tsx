import React from 'react';
import { styles, neon_cyan, border_color } from '../../types/theme';
import { SearchIcon, CubeIcon, UserCircleIcon, ShieldCheckIcon, DollarSignIcon } from '../../components/icons';

const categories = [
    { title: "Getting Started", icon: <CubeIcon />, count: 12 },
    { title: "Account & Security", icon: <UserCircleIcon />, count: 8 },
    { title: "Pricing & Payments", icon: <DollarSignIcon />, count: 5 },
    { title: "Quality & Compliance", icon: <ShieldCheckIcon />, count: 10 }
];

export const HelpCenterPage = () => {
    return (
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ ...styles.container, padding: '120px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '32px' }}>How can we <span style={{ color: neon_cyan }}>Help?</span></h1>
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <SearchIcon style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', width: '24px', height: '24px' }} />
                        <input 
                            type="text" 
                            placeholder="Search for articles, guides, or troubleshooting..." 
                            style={{ 
                                width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${border_color}`, 
                                borderRadius: '20px', padding: '20px 20px 20px 60px', color: '#fff', fontSize: '18px', outline: 'none',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', marginBottom: '80px' }}>
                    {categories.map((cat, i) => (
                        <div key={i} style={{ 
                            background: 'rgba(255,255,255,0.01)', border: `1px solid ${border_color}`, borderRadius: '24px', padding: '40px',
                            transition: 'all 0.3s ease', cursor: 'pointer', textAlign: 'center'
                        }} className="help-category">
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(10, 240, 240, 0.05)', 
                                margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: neon_cyan,
                                border: '1px solid rgba(10, 240, 240, 0.1)'
                            }}>
                                {React.cloneElement(cat.icon as React.ReactElement, { style: { width: '28px', height: '28px' } })}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{cat.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{cat.count} articles</p>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${border_color}`, borderRadius: '32px', padding: '48px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Can't find what you're looking for?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Our support team is available 24/7 to assist with your technical inquiries.</p>
                    <a href="/contact" style={{ 
                        display: 'inline-block', background: neon_cyan, color: '#000', fontWeight: 700, padding: '16px 32px', 
                        borderRadius: '12px', textDecoration: 'none', transition: 'all 0.3s'
                    }} className="contact-support-btn">Contact Support</a>
                </div>
            </div>
            <style>{`
                .help-category:hover { background: rgba(255,255,255,0.03); border-color: ${neon_cyan}; transform: translateY(-5px); }
                .contact-support-btn:hover { transform: scale(1.05); boxShadow: 0 0 20px rgba(10, 240, 240, 0.4); }
            `}</style>
        </div>
    );
};
