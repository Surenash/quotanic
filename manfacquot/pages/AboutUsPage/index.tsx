import React from 'react';
import { styles } from '../../types/theme';

export const AboutUsPage = () => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <h1 style={styles.heroTitle}>About Quotanic</h1>
        <p style={styles.heroSubtitle}>Revolutionizing manufacturing procurement.</p>
        <div style={{ maxWidth: '800px', margin: '48px auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <p style={styles.stepText}>At Quotanic, we believe getting custom parts manufactured shouldn't take weeks of back-and-forth emails. We're a team of engineers, machinists, and software developers who built the tool we always wished we had.</p>
            <p style={styles.stepText}>Our mission is to connect innovative companies with the world's best manufacturers through transparent, instant, and reliable quoting and production management.</p>
        </div>
    </div>
);
