import React from 'react';
import { styles, border_color, neon_cyan } from '../../types/theme';

export const LegalPage = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
        <div style={{ ...styles.container, padding: '100px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '64px' }} className="legal-layout">
                {/* Sticky Sidebar */}
                <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>Legal Center</h4>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <a href="/privacy" style={{ color: title.toLowerCase().includes('privacy') ? neon_cyan : 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Privacy Policy</a>
                        <a href="/terms" style={{ color: title.toLowerCase().includes('terms') ? neon_cyan : 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Terms of Service</a>
                        <a href="/legal" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Cookie Policy</a>
                    </nav>
                </aside>

                {/* Document Body */}
                <main style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: `1px solid ${border_color}`, 
                    borderRadius: '24px', 
                    padding: '64px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h1 style={{ ...styles.heroTitle, textAlign: 'left', fontSize: '36px', marginBottom: '48px', borderBottom: `1px solid ${border_color}`, paddingBottom: '24px' }}>{title}</h1>
                    <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontSize: '16px' }}>
                        {content}
                    </div>
                </main>
            </div>
        </div>
        <style>{`
            @media (max-width: 900px) {
                .legal-layout { grid-template-columns: 1fr; }
                aside { position: relative; top: 0; margin-bottom: 48px; }
            }
        `}</style>
    </div>
);
