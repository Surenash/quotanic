import React from 'react';
import { styles, neon_cyan, neon_magenta, border_color } from '../../types/theme';
import CtaButton from '../../components/CtaButton';

const blogPosts = [
    {
        title: "The Future of Distributed Manufacturing",
        excerpt: "How AI and cloud orchestration are reshaping the global hardware supply chain.",
        author: "Sarah Chen",
        date: "Oct 12, 2024",
        category: "Industry Trends",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070"
    },
    {
        title: "Optimizing CAD for Instant Quoting",
        excerpt: "Learn how to structure your design files to get the fastest and most accurate quotes.",
        author: "Marcus Thorne",
        date: "Oct 08, 2024",
        category: "Engineering",
        image: "https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&q=80&w=2070"
    },
    {
        title: "Quotanic raised $15M Series A",
        excerpt: "We are excited to announce our latest funding round led by Global Ventures.",
        author: "Quotanic Team",
        date: "Sep 28, 2024",
        category: "News",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070"
    }
];

export const BlogPage = () => {
    return (
        <div style={{ background: 'var(--bg-deep-space)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ ...styles.container, padding: '120px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ ...styles.heroTitle, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '24px' }}>Insights & <span style={{ color: neon_cyan }}>Innovations</span></h1>
                    <p style={{ ...styles.heroSubtitle, color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto' }}>Stay updated with the latest in manufacturing technology, supply chain resilience, and engineering best practices.</p>
                </div>

                {/* Featured Post */}
                <div style={{ 
                    background: 'rgba(255,255,255,0.02)', border: `1px solid ${border_color}`, borderRadius: '32px', padding: '48px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', marginBottom: '80px',
                    backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', height: '400px' }}>
                        <img src={blogPosts[0].image} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <span style={{ color: neon_cyan, fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>{blogPosts[0].category}</span>
                        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px', color: '#fff' }}>{blogPosts[0].title}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '18px', marginBottom: '32px' }}>{blogPosts[0].excerpt}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: neon_magenta, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>SC</div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700 }}>{blogPosts[0].author}</p>
                                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{blogPosts[0].date}</p>
                            </div>
                        </div>
                        <CtaButton text="Read Full Article" primary />
                    </div>
                </div>

                {/* Post Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
                    {blogPosts.slice(1).map((post, i) => (
                        <div key={i} style={{ 
                            background: 'rgba(255,255,255,0.01)', border: `1px solid ${border_color}`, borderRadius: '24px', overflow: 'hidden',
                            transition: 'all 0.3s ease', cursor: 'pointer'
                        }} className="blog-card">
                            <div style={{ height: '220px' }}>
                                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '32px' }}>
                                <span style={{ color: neon_cyan, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>{post.category}</span>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.4 }}>{post.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>{post.excerpt}</p>
                                <div style={{ pt: '24px', borderTop: `1px solid ${border_color}`, color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                    {post.date} • {post.author}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .blog-card:hover { transform: translateY(-10px); border-color: ${neon_cyan}; background: rgba(255,255,255,0.03); }
            `}</style>
        </div>
    );
};
