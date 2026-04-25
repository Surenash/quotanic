import React, { useState } from 'react';
import { styles, neon_cyan, neon_magenta, border_color } from '../../types/theme';
import { SearchIcon } from '../../components/icons';

const faqItems = [
    { q: "How fast can I get a quote?", a: "Instantly. Our AI-driven Feature-Based Manufacturing (FBM) engine analyzes your 3D models (STEP, STL, etc.) and cross-references them against our network's real-time capabilities and pricing structures in seconds." },
    { q: "Are my designs secure?", a: "Absolutely. Quotanic uses AES-256 encryption at rest and SSL/TLS in transit. Your intellectual property is only accessible to manufacturers who have signed our binding digital NDAs." },
    { q: "How do you vet manufacturers?", a: "Every shop in our network undergoes a rigorous 4-step verification process: Document Verification (ISO 9001/AS9100), Equipment Audit, Quality Control Inspection, and a Trial Production Run." },
    { q: "What file formats do you support?", a: "We primarily support .STEP, .STP, .STL, and .IGES for automated quoting. We also support .OBJ and technical 2D drawings in .PDF format for manual review." },
    { q: "What happens if there's an issue with my order?", a: "Quotanic provides a dedicated dispute resolution layer. If parts don't meet your specified tolerances or quality standards, we facilitate re-runs or refunds through our escrow-like payment protection." },
    { q: "Do you offer international shipping?", a: "Yes. Our global network allows us to route production to the manufacturer closest to your location or the most cost-effective one, with integrated logistics tracking directly in your dashboard." }
];

const AccordionItem = ({ q, a, isOpen, onClick }) => (
    <div style={{ 
        marginBottom: '16px', 
        borderRadius: '16px', 
        border: `1px solid ${isOpen ? neon_cyan : border_color}`,
        background: isOpen ? 'rgba(10, 240, 240, 0.03)' : 'rgba(255,255,255,0.01)',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
    }}>
        <button 
            onClick={onClick}
            style={{ 
                width: '100%', padding: '24px', textAlign: 'left', background: 'none', border: 'none', 
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}
        >
            <span style={{ fontSize: '18px', fontWeight: 600, color: isOpen ? neon_cyan : 'var(--text-primary)' }}>{q}</span>
            <span style={{ fontSize: '24px', color: isOpen ? neon_cyan : 'var(--text-secondary)', transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
        </button>
        <div style={{ 
            maxHeight: isOpen ? '300px' : '0', 
            overflow: 'hidden', 
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: isOpen ? '0 24px 24px' : '0 24px'
        }}>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{a}</p>
        </div>
    </div>
);

export const FAQPage = () => {
    const [search, setSearch] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const filteredFaqs = faqItems.filter(item => 
        item.q.toLowerCase().includes(search.toLowerCase()) || 
        item.a.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ ...styles.container, padding: '100px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px' }}>Got <span style={{ color: neon_cyan }}>Questions?</span></h1>
                    <p style={{ ...styles.heroSubtitle, color: 'rgba(255,255,255,0.6)' }}>Everything you need to know about the Quotanic platform.</p>
                    
                    {/* Search Bar */}
                    <div style={{ 
                        maxWidth: '500px', margin: '48px auto 0', position: 'relative',
                        background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${border_color}`,
                        display: 'flex', alignItems: 'center', padding: '0 16px'
                    }}>
                        <SearchIcon style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.3)' }} />
                        <input 
                            type="text" 
                            placeholder="Search questions..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                flex: 1, background: 'none', border: 'none', padding: '16px', 
                                color: '#fff', fontSize: '16px', outline: 'none' 
                            }} 
                        />
                    </div>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((item, i) => (
                            <AccordionItem 
                                key={i} 
                                q={item.q} 
                                a={item.a} 
                                isOpen={openIndex === i} 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.4)' }}>
                            No matching questions found. Try different keywords.
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '80px', padding: '48px', borderRadius: '24px', background: 'linear-gradient(rgba(10, 240, 240, 0.05), transparent)', border: `1px solid rgba(10, 240, 240, 0.1)` }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Still have questions?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>Our support team is here to help you with your custom manufacturing needs.</p>
                    <a href="/contact" style={{ color: neon_cyan, fontWeight: 700, textDecoration: 'none', fontSize: '18px' }}>Contact Support →</a>
                </div>
            </div>
        </div>
    );
};
