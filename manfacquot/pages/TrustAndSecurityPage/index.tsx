import React from 'react';
import { styles, neon_cyan, neon_magenta, neon_orange, border_color } from '../../types/theme';
import { ShieldCheckIcon, LockIcon, ZapIcon, ScaleIcon } from '../../components/icons';

const SecurityCard = ({ icon, title, text, color }) => (
    <div style={{ 
        padding: '32px', 
        borderRadius: '24px', 
        background: 'rgba(255,255,255,0.02)', 
        border: `1px solid ${border_color}`,
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${color}10, transparent 70%)`, filter: 'blur(30px)' }}></div>
        <div style={{ color: color, marginBottom: '24px' }}>
            {React.cloneElement(icon as React.ReactElement, { style: { width: '32px', height: '32px' } })}
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>{title}</h3>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{text}</p>
    </div>
);

export const TrustAndSecurityPage = () => (
    <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
        {/* Hero with Security Shield */}
        <div style={{ ...styles.container, padding: '100px 24px', textAlign: 'center', position: 'relative' }}>
            <div className="security-shield-visual" style={{ marginBottom: '48px', position: 'relative', display: 'inline-block' }}>
                <div style={{ 
                    width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255, 165, 0, 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: neon_orange,
                    border: `1px solid ${neon_orange}`, boxShadow: `0 0 30px rgba(255, 165, 0, 0.2)`,
                    position: 'relative', zIndex: 2
                }}>
                    <ShieldCheckIcon style={{ width: '60px', height: '60px' }} />
                </div>
                {/* Orbital Rings */}
                <div className="orbit-ring r1"></div>
                <div className="orbit-ring r2"></div>
            </div>

            <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(3rem, 7vw, 4.5rem)', marginBottom: '16px' }}>Enterprise-Grade <span style={{ color: neon_orange }}>Trust</span></h1>
            <p style={{ ...styles.heroSubtitle, maxWidth: '700px', margin: '0 auto', fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>
                Your intellectual property is the lifeblood of your company. We treat it with the absolute highest priority.
            </p>
        </div>

        {/* Security Grid */}
        <div style={{ ...styles.container, paddingBottom: '120px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                <SecurityCard 
                    icon={<ShieldCheckIcon />} 
                    title="Data Protection" 
                    text="All files are encrypted in transit using industry-standard SSL/TLS protocols and stored securely in AWS S3 buckets with strict IAM access controls."
                    color={neon_cyan}
                />
                <SecurityCard 
                    icon={<ScaleIcon />} 
                    title="Manufacturer Vetting" 
                    text="Every manufacturer on our platform undergoes a rigorous vetting process. We verify ISO certifications, machine lists, and historical performance."
                    color={neon_magenta}
                />
                <SecurityCard 
                    icon={<ShieldCheckIcon />} 
                    title="Secure 3D Viewing" 
                    text="Inspect designs without ever downloading source files. Our secure WebGL viewer ensures your CAD geometry stays protected during quoting."
                    color={neon_orange}
                />
                <SecurityCard 
                    icon={<ShieldCheckIcon />} 
                    title="IP Preservation" 
                    text="We enforce binding digital NDAs and strict data retention policies, ensuring your designs are only accessible to those authorized for production."
                    color={neon_cyan}
                />
            </div>
        </div>

        <style>{`
            .orbit-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 1px dashed rgba(255, 165, 0, 0.3);
                border-radius: 50%;
                z-index: 1;
            }
            .r1 { width: 180px; height: 180px; animation: rotate 15s linear infinite; }
            .r2 { width: 240px; height: 240px; animation: rotate 20s linear reverse infinite; }
            
            @keyframes rotate {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
        `}</style>
    </div>
);
