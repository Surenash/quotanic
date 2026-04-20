import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';

export const LoginRoleSelector = ({ reasonMessage }: { reasonMessage?: string }) => {
    const navigate = useNavigate();
    return (
        <div style={styles.loginPage}>
            <div style={styles.loginContainer}>
                {reasonMessage && <p style={styles.loginReasonMessage}>{reasonMessage}</p>}
                <h2 style={styles.loginTitle}>Sign In</h2>
                <p style={styles.loginSubtitle}>Please select your role to continue.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                    <CtaButton text="I'm a Customer" primary onClick={() => navigate('/login/customer')} />
                    <CtaButton text="I'm a Manufacturer" onClick={() => navigate('/login/manufacturer')} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        New to Quotanic? <a href="#" style={{ ...styles.loginLink, fontSize: '14px' }} onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Create an account</a>
                    </p>
                    <p style={{ marginTop: '16px' }}>
                        <a href="#" style={{ ...styles.loginLink, color: 'var(--text-secondary)', fontSize: '14px' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>← Back to Homepage</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
