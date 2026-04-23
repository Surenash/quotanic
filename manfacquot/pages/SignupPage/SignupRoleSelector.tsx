import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';

export const SignupRoleSelector = () => {
    const navigate = useNavigate();
    return (
        <div style={styles.loginPage}>
            <div style={styles.loginContainer}>
                <h2 style={styles.loginTitle}>Join Quotanic</h2>
                <p style={styles.loginSubtitle}>Select your account type to get started.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                    <CtaButton text="Sign Up as a Customer" primary onClick={() => navigate('/signup/customer')} />
                    <CtaButton text="Sign Up as a Manufacturer" onClick={() => navigate('/signup/manufacturer')} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Already have an account? <Link to="/login" style={{ ...styles.loginLink, fontSize: '14px' }}>Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
