import React from 'react';
import { styles } from '../../types/theme';

export const LegalPage = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div style={{ ...styles.container, padding: '64px 24px' }}>
        <h1 style={styles.heroTitle}>{title}</h1>
        <div style={{ maxWidth: '800px', margin: '48px auto', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            {content}
        </div>
    </div>
);
