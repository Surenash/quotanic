import React, { useState } from 'react';
import { styles, neon_cyan, border_color } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import { GlobeAltIcon, LinkedInIcon, TwitterIcon, GithubIcon } from '../../components/icons';

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
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ ...styles.container, padding: '100px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
                    
                    {/* Left Side: Contact Info */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: `radial-gradient(circle, rgba(10, 240, 240, 0.05) 0%, transparent 70%)`, filter: 'blur(100px)', zIndex: 0 }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '24px', textAlign: 'left' }}>Get in <span style={{ color: neon_cyan }}>Touch</span></h1>
                            <p style={{ ...styles.heroSubtitle, textAlign: 'left', marginBottom: '48px', color: 'rgba(255,255,255,0.7)' }}>
                                Have questions about our platform or network? Our team is ready to help you optimize your manufacturing workflow.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(10, 240, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: neon_cyan, border: `1px solid rgba(10, 240, 240, 0.2)` }}>
                                        <GlobeAltIcon style={{ width: '24px', height: '24px' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Email Us</h4>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>support@quotanic.com</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 0, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-magenta)', border: `1px solid rgba(255, 0, 255, 0.2)` }}>
                                        <GlobeAltIcon style={{ width: '24px', height: '24px' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Global Presence</h4>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>Sydney • Mumbai • San Francisco</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '64px', display: 'flex', gap: '24px' }}>
                                {[LinkedInIcon, TwitterIcon, GithubIcon].map((Icon, i) => (
                                    <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }} className="social-link-hover">
                                        <Icon style={{ width: '24px', height: '24px' }} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: `1px solid ${border_color}`, 
                        borderRadius: '32px', 
                        padding: '48px',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        {success ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(10, 240, 240, 0.1)', border: `1px solid ${neon_cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: neon_cyan, margin: '0 auto 24px' }}>
                                    <GlobeAltIcon style={{ width: '40px', height: '40px' }} />
                                </div>
                                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Message Sent!</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>We've received your inquiry and will get back to you within 24 hours.</p>
                                <button onClick={() => setSuccess(false)} style={{ marginTop: '32px', background: 'none', border: `1px solid ${border_color}`, color: '#fff', padding: '12px 32px', borderRadius: '12px', cursor: 'pointer' }}>Send another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        style={inputStyle}
                                        placeholder="John Doe"
                                        required
                                        className="form-input-premium"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Work Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        style={inputStyle}
                                        placeholder="john@company.com"
                                        required
                                        className="form-input-premium"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                                        placeholder="How can we help?"
                                        required
                                        className="form-input-premium"
                                    />
                                </div>
                                <CtaButton text={loading ? "Transmitting..." : "Send Message"} primary type="submit" disabled={loading} style={{ padding: '18px', fontSize: '18px' }} />
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .form-input-premium {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid ${border_color};
                    border-radius: 12px;
                    padding: 16px;
                    color: #fff;
                    font-size: 16px;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .form-input-premium:focus {
                    border-color: ${neon_cyan};
                    box-shadow: 0 0 15px rgba(10, 240, 240, 0.1);
                    background: rgba(255,255,255,0.08);
                }
                .social-link-hover:hover { color: ${neon_cyan} !important; }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const
};
