import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';

export const HowItWorksDetailedPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ ...styles.container, padding: '64px 24px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={styles.heroTitle}>How It Works</h1>
                <p style={styles.heroSubtitle}>A deeper dive into the Quotanic ecosystem.</p>
            </div>
            <div style={{ maxWidth: '900px', margin: '64px auto 0', display: 'grid', gap: '48px' }}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <div style={{ ...styles.stepIcon, minWidth: '64px', height: '64px', fontSize: '24px' }}>1</div>
                    <div>
                        <h3 style={styles.featureTitle}>Upload & AI Analysis</h3>
                        <p style={styles.stepText}>When you upload an STL or STEP file, our Feature-Based Manufacturing (FBM) engine immediately goes to work. It calculates volume, surface area, detects undercuts, and assesses machinability. This data forms the basis of your instant quote.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <div style={{ ...styles.stepIcon, minWidth: '64px', height: '64px', fontSize: '24px', background: 'var(--neon-magenta)' }}>2</div>
                    <div>
                        <h3 style={styles.featureTitle}>Smart Matching</h3>
                        <p style={styles.stepText}>We don't just broadcast your design to everyone. Our system matches your part's requirements (material, tolerances, volume) against our manufacturers' verified capabilities. You only receive quotes from shops that can actually deliver.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <div style={{ ...styles.stepIcon, minWidth: '64px', height: '64px', fontSize: '24px', background: 'var(--neon-orange)' }}>3</div>
                    <div>
                        <h3 style={styles.featureTitle}>Secure Production</h3>
                        <p style={styles.stepText}>Once you accept a quote, the manufacturer receives the production files. All communication, status updates, and shipping tracking happen through your dashboard. (Escrow and Dispute resolution systems coming soon!)</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <CtaButton text="Get Started Now" onClick={() => navigate('/upload')} primary />
                </div>
            </div>
        </div>
    );
};
