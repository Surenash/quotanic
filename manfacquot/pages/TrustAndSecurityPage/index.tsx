import React from 'react';
import { styles } from '../../types/theme';

export const TrustAndSecurityPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <h1 style={styles.heroTitle}>Trust & Security</h1>
        <p style={styles.heroSubtitle}>Your intellectual property is our top priority.</p>
        <div style={{ maxWidth: '800px', margin: '48px auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div>
                <h3 style={styles.featureTitle}>Data Protection</h3>
                <p style={styles.stepText}>All files are encrypted in transit using industry-standard SSL/TLS protocols and stored securely in AWS S3 buckets with strict access controls.</p>
            </div>
            <div>
                <h3 style={styles.featureTitle}>Manufacturer Verification</h3>
                <p style={styles.stepText}>Every manufacturer on our platform undergoes a vetting process. We verify their ISO certifications, review their equipment lists, and monitor their performance continuously.</p>
            </div>
            <div>
                <h3 style={styles.featureTitle}>Secure Payments</h3>
                <p style={styles.stepText}>We use Razorpay, a PCI DSS Level 1 compliant payment processor, to handle all transactions securely. Your payment information never touches our servers.</p>
            </div>
            <div>
                <h3 style={styles.featureTitle}>Non-Disclosure Agreements (Roadmap)</h3>
                <p style={styles.stepText}>We are actively developing integrated, automated NDAs that bind all parties before any files are viewed or downloaded. Coming soon!</p>
            </div>
            <div>
                <h3 style={styles.featureTitle}>Secure 3D Viewing</h3>
                <p style={styles.stepText}>Our platform includes a secure 3D viewer, allowing manufacturers to inspect your models for quoting purposes while retaining strict control over your source files.</p>
            </div>
        </div>
    </div>
);
