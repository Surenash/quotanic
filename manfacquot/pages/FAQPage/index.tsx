import React from 'react';
import { styles } from '../../types/theme';

export const FAQPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <h1 style={styles.heroTitle}>Frequently Asked Questions</h1>
        <p style={styles.heroSubtitle}>Find answers to common questions about Quotanic.</p>
        <div style={{ maxWidth: '800px', margin: '48px auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div><h3 style={styles.featureTitle}>How fast can I get a quote?</h3><p style={styles.stepText}>Instantly. Our AI analyzes your 3D models and checks them against our network's capabilities and pricing structures in real-time.</p></div>
            <div><h3 style={styles.featureTitle}>Are my designs secure?</h3><p style={styles.stepText}>Yes. We use industry-standard encryption and only share your files with the manufacturers you explicitly choose to engage with.</p></div>
            <div><h3 style={styles.featureTitle}>How do you vet manufacturers?</h3><p style={styles.stepText}>Manufacturers undergo a strict verification process checking their ISO certifications, equipment lists, and past performance history.</p></div>
            <div><h3 style={styles.featureTitle}>What happens if there's an issue with my order?</h3><p style={styles.stepText}>Our platform includes a built-in messaging and dispute resolution system to ensure you get exactly what you ordered.</p></div>
        </div>
    </div>
);
