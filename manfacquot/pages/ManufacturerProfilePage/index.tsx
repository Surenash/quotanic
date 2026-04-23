import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { styles } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import {
    ArrowLeftIcon, LocationMarkerIcon, StarIcon, VideoCameraIcon
} from "../../components/icons";
import { ALL_CAPABILITIES_GROUPS, MATERIALS_METALS, MATERIALS_PLASTICS, MATERIALS_COMPOSITES, MATERIALS_OTHERS } from '../../utils/constants';

export const ManufacturerProfilePage = () => {
    const { id: manufacturerId } = useParams<{ id: string }>();
    const navigate = useNavigate();
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

    const getCapabilitiesByGroup = () => {
        if (!manufacturer?.capabilities) return [];
        return ALL_CAPABILITIES_GROUPS.map(group => ({
            title: group.title,
            processes: group.processes.filter(p => manufacturer.capabilities.includes(p))
        })).filter(g => g.processes.length > 0);
    };

    if (loading) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!manufacturer) return <div style={{ ...styles.container, padding: '64px 24px', textAlign: 'center' }}>Manufacturer profile could not be loaded.</div>;

    const capabilityGroups = getCapabilitiesByGroup();
    const materials = manufacturer.capabilities.filter(c => [...MATERIALS_METALS, ...MATERIALS_PLASTICS, ...MATERIALS_COMPOSITES, ...MATERIALS_OTHERS].includes(c));
    const certifications = manufacturer.certifications || [];

    const profileHeaderStyle: React.CSSProperties = {
        ...styles.profileHeader,
        backgroundImage: `linear-gradient(rgba(var(--bg-deep-space-rgb), 0.7), rgba(var(--bg-deep-space-rgb), 0.7)), url(${manufacturer.backgroundUrl})`,
    };

    return (
        <div style={styles.profilePageContainer}>
            <header style={profileHeaderStyle}>
                <div style={styles.container}>
                    <button onClick={() => navigate('/directory')} style={styles.backButton}>
                        <ArrowLeftIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                        Back to Directory
                    </button>
                    <div style={styles.profileHeaderContent}>
                        <img src={manufacturer.logoUrl} alt={`${manufacturer.company_name} logo`} style={styles.profileHeaderLogo} />
                        <div style={{ flex: 1 }}>
                            <h1 style={styles.profileTitle}>{manufacturer.company_name}</h1>
                            <p style={styles.profileLocation}>
                                <LocationMarkerIcon style={{ width: '18px', height: '18px', marginRight: '6px' }} />
                                {manufacturer.location}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <StarIcon style={{ width: '28px', height: '28px', color: '#FFD700', filter: 'drop-shadow(0 0 5px #FFD700)' }} />
                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{(parseFloat(manufacturer.rating) || 0).toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </header>
            <div style={styles.container}>
                <div style={styles.profileContentGrid}>
                    <main style={styles.profileMainContent}>
                        <section style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>About {manufacturer.company_name}</h2>
                            <p style={styles.stepText}>{manufacturer.about}</p>
                        </section>
                        <section style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Project Portfolio</h2>
                            <div style={styles.profilePortfolioGrid}>
                                {(manufacturer.portfolio || []).map(item => (
                                    <div key={item.id} style={styles.portfolioItem}>
                                        {item.type === 'video' ? (
                                            <div style={styles.portfolioVideoPlaceholder}>
                                                <VideoCameraIcon style={{ width: '48px', height: '48px', color: '#fff' }} />
                                            </div>
                                        ) : (
                                            <img src={item.url} alt={item.title} style={styles.profilePortfolioImage} />
                                        )}
                                        <div style={styles.portfolioItemOverlay}>
                                            <p style={styles.portfolioItemTitle}>{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Customer Reviews</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {(manufacturer.reviews || []).map(review => (
                                    <div key={review.id} style={{ border: `1px solid var(--border-color)`, backgroundColor: 'rgba(var(--bg-deep-space-rgb), 0.5)', borderRadius: '8px', padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{review.author}</p>
                                            <div style={{ display: 'flex', gap: '2px', color: '#FFD700' }}>
                                                {[...Array(review.rating)].map((_, i) => <StarIcon key={i} style={{ width: '16px', height: '16px', filter: 'drop-shadow(0 0 2px #FFD700)' }} />)}
                                                {[...Array(5 - review.rating)].map((_, i) => <StarIcon key={i} style={{ width: '16px', height: '16px', color: 'rgba(175, 200, 255, 0.2)' }} />)}
                                            </div>
                                        </div>
                                        <p style={{ ...styles.stepText, fontSize: '14px' }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                    <aside style={styles.profileSidebar}>
                        <div style={{ ...styles.profileSection, border: '1px solid var(--neon-cyan)', padding: '24px', background: 'rgba(var(--neon-cyan-rgb), 0.1)', textAlign: 'center', boxShadow: '0 0 15px rgba(var(--neon-cyan-rgb), 0.3)' }}>
                            <CtaButton text="Request Quote" primary onClick={() => navigate(`/upload?manufacturer=${manufacturer.id}`)} className="button-full-width" />
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Capabilities</h2>
                            {capabilityGroups.map(group => (
                                <div key={group.title} style={{ marginBottom: '16px' }}>
                                    <h3 style={styles.mfgCardSectionTitle}>{group.title}</h3>
                                    <div style={styles.mfgCardTagContainer}>
                                        {group.processes.map(p => <span key={p} style={styles.mfgCardTag}>{p}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Certifications</h2>
                            <div style={styles.mfgCardTagContainer}>
                                {certifications.length > 0 ?
                                    certifications.map(c => <span key={c} style={{ ...styles.mfgCardTag, ...styles.mfgCardCertTag }}>{c}</span>)
                                    : <p style={styles.stepText}>No certifications listed.</p>}
                            </div>
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Materials</h2>
                            <div style={styles.mfgCardTagContainer}>
                                {materials.length > 0 ?
                                    materials.map(m => <span key={m} style={{ ...styles.mfgCardTag, ...styles.mfgCardMaterialTag }}>{m}</span>)
                                    : <p style={styles.stepText}>No materials specified.</p>}
                            </div>
                        </div>
                        <div style={styles.profileSection}>
                            <h2 style={styles.profileSectionTitle}>Equipment List</h2>
                            <ul style={{ ...styles.featureList, listStyle: 'disc', paddingLeft: '20px', gap: '8px', margin: 0 }}>
                                {(manufacturer.equipment || []).map(e => <li key={e}>{e}</li>)}
                            </ul>
                        </div>
                        {manufacturer.qualityControl && (
                            <div style={styles.profileSection}>
                                <h2 style={styles.profileSectionTitle}>Quality Control</h2>
                                <p style={styles.stepText}>{manufacturer.qualityControl}</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};