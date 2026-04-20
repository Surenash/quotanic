import React, { useState } from 'react';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';

export const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        }, 1000);
    };

    return (
        <div style={{ ...styles.container, padding: '64px 24px' }}>
            <h1 style={styles.heroTitle}>Contact Us</h1>
            <p style={styles.heroSubtitle}>We're here to help. Reach out with any questions or inquiries.</p>
            <div style={{ maxWidth: '600px', margin: '48px auto', backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {success ? (
                    <div style={{ padding: '24px', backgroundColor: 'rgba(10, 240, 240, 0.1)', color: 'var(--neon-cyan)', borderRadius: '8px', textAlign: 'center' }}>
                        Message sent successfully! We will get back to you shortly.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={styles.formGroup}>
                            <label htmlFor="name" style={styles.label}>Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label htmlFor="email" style={styles.label}>Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label htmlFor="message" style={styles.label}>Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                style={{ ...styles.input, minHeight: '150px', resize: 'vertical' }}
                                required
                            ></textarea>
                        </div>
                        <CtaButton text={loading ? "Sending..." : "Send Message"} primary type="submit" disabled={loading} />
                    </form>
                )}
            </div>
        </div>
    );
};
