import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import {
    ArrowLeftIcon, LocationMarkerIcon, StarIcon, VideoCameraIcon
} from "../../components/icons";
import { ALL_CAPABILITIES_GROUPS, MATERIALS_METALS, MATERIALS_PLASTICS, MATERIALS_COMPOSITES, MATERIALS_OTHERS } from '../../utils/constants';

export const ManufacturerProfileView = ({ manufacturer }: { manufacturer: any }) => {
    const navigate = useNavigate();
    
    const getCapabilitiesByGroup = () => {
        if (!manufacturer?.capabilities) return [];
        const caps = Array.isArray(manufacturer.capabilities) 
            ? manufacturer.capabilities 
            : manufacturer.capabilities.processes || [];

        return ALL_CAPABILITIES_GROUPS.map(group => ({
            title: group.title,
            processes: group.processes.filter(p => caps.includes(p))
        })).filter(g => g.processes.length > 0);
    };

    const capabilityGroups = getCapabilitiesByGroup();
    const allCaps = Array.isArray(manufacturer.capabilities) 
        ? manufacturer.capabilities 
        : manufacturer.capabilities.processes || [];
        
    const materials = allCaps.filter(c => [...MATERIALS_METALS, ...MATERIALS_PLASTICS, ...MATERIALS_COMPOSITES, ...MATERIALS_OTHERS].includes(c));
    const certifications = manufacturer.certifications || [];

    return (
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            {/* Parallax-style Header */}
            <div style={{ 
                height: '400px', 
                position: 'relative', 
                overflow: 'hidden',
                background: `linear-gradient(rgba(11, 12, 16, 0.4), rgba(11, 12, 16, 1)), url(${manufacturer.backgroundUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '64px'
            }}>
                <div style={styles.container}>
                    <button 
                        onClick={() => navigate('/directory')} 
                        style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: '12px', 
                            padding: '8px 16px', 
                            color: '#fff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            marginBottom: '32px',
                            fontWeight: 700,
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                        Back to Directory
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ 
                            width: '120px', height: '120px', borderRadius: '24px', background: '#fff', padding: '16px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' 
                        }}>
                            <img src={manufacturer.logoUrl} alt="Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 12px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{manufacturer.company_name || manufacturer.companyName}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
                                    <LocationMarkerIcon style={{ width: '18px', height: '18px', color: neon_cyan }} />
                                    {manufacturer.location}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 215, 0, 0.1)', padding: '6px 16px', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                                    <StarIcon style={{ width: '18px', height: '18px', color: '#FFD700' }} />
                                    <span style={{ fontWeight: 800, color: '#FFD700', fontSize: '18px' }}>{(parseFloat(manufacturer.rating) || 0).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ ...styles.container, marginTop: '64px', paddingBottom: '100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '64px', alignItems: 'start' }} className="profile-layout">
                    
                    <main>
                        <section style={{ marginBottom: '64px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#fff' }}>About the Manufacturer</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '17px' }}>{manufacturer.about}</p>
                        </section>

                        <section style={{ marginBottom: '64px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', color: '#fff' }}>Project Portfolio</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                {(manufacturer.portfolio || []).map((item, i) => (
                                    <div key={i} style={{ 
                                        position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '240px',
                                        border: `1px solid ${border_color}`, group: 'true'
                                    }} className="portfolio-card">
                                        {item.type === 'video' ? (
                                            <div style={{ height: '100%', background: '#1a1b23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <VideoCameraIcon style={{ width: '48px', height: '48px', color: neon_cyan, opacity: 0.5 }} />
                                            </div>
                                        ) : (
                                            <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ 
                                            position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
                                            display: 'flex', alignItems: 'flex-end', padding: '24px', opacity: 0.9
                                        }}>
                                            <p style={{ fontWeight: 700, margin: 0, fontSize: '16px' }}>{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', color: '#fff' }}>Verified Reviews</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {(manufacturer.reviews || []).map((review, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${border_color}`, borderRadius: '24px', padding: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '16px' }}>{review.author}</span>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} style={{ width: '16px', height: '16px', color: i < review.rating ? '#FFD700' : 'rgba(255,255,255,0.1)' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>

                    <aside style={{ position: 'sticky', top: '120px' }}>
                        <div style={{ 
                            background: 'rgba(10, 240, 240, 0.05)', border: `1px solid ${neon_cyan}`, borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '32px',
                            boxShadow: `0 0 30px rgba(10, 240, 240, 0.1)`
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Ready to Manufacture?</h3>
                            <CtaButton text="Request Custom Quote" primary onClick={() => navigate(`/upload?manufacturer=${manufacturer.id}`)} style={{ width: '100%', padding: '16px' }} />
                            <p style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(10, 240, 240, 0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Avg. Response: &lt; 4 Hours</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${border_color}`, borderRadius: '24px', padding: '32px' }}>
                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>Core Capabilities</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {capabilityGroups.map(group => (
                                        <div key={group.title}>
                                            <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: neon_cyan }}>{group.title}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {group.processes.map(p => (
                                                    <span key={p} style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>Certifications</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {certifications.map(c => (
                                        <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: neon_magenta, fontSize: '13px', fontWeight: 700 }}>
                                            <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                                            {c}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>Equipment & QC</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(manufacturer.equipment || []).slice(0, 5).map(e => (
                                        <li key={e} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: neon_orange }} />
                                            {e}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <style>{`
                @media (max-width: 1024px) {
                    .profile-layout { grid-template-columns: 1fr !important; }
                    aside { position: relative !important; top: 0 !important; }
                }
                .portfolio-card:hover img { transform: scale(1.05); transition: transform 0.4s ease; }
            `}</style>
        </div>
    );
};

export const ManufacturerProfilePage = () => {
    const { id: manufacturerId } = useParams<{ id: string }>();
    const [manufacturer, setManufacturer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!manufacturerId) {
            setError('No manufacturer ID provided.');
            setLoading(false);
            return;
        }
        const fetchManufacturer = async () => {
            setLoading(true);
            try {
                const data = await api.getManufacturerById(manufacturerId);
                if (data) {
                    setManufacturer(data);
                } else {
                    setError('Manufacturer not found.');
                }
            } catch (err) {
                setError('Failed to load manufacturer details.');
            } finally {
                setLoading(false);
            }
        };
        fetchManufacturer();
    }, [manufacturerId]);

    if (loading) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!manufacturer) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Manufacturer profile could not be loaded.</div>;

    return <ManufacturerProfileView manufacturer={manufacturer} />;
};