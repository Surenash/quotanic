import React, { Suspense } from 'react';
import { Route, Routes, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { BarebonesLayout } from '../layouts/BarebonesLayout';

const LandingPageContent = React.lazy(() => import('../pages/LandingPage').then(module => ({ default: module.LandingPageContent })));
const HowItWorksDetailedPage = React.lazy(() => import('../pages/HowItWorksDetailedPage').then(module => ({ default: module.HowItWorksDetailedPage })));
const ManufacturerDirectoryPage = React.lazy(() => import('../pages/ManufacturerDirectoryPage').then(module => ({ default: module.ManufacturerDirectoryPage })));
const ManufacturerProfilePage = React.lazy(() => import('../pages/ManufacturerProfilePage').then(module => ({ default: module.ManufacturerProfilePage })));
const TrustAndSecurityPage = React.lazy(() => import('../pages/TrustAndSecurityPage').then(module => ({ default: module.TrustAndSecurityPage })));
const AboutUsPage = React.lazy(() => import('../pages/AboutUsPage').then(module => ({ default: module.AboutUsPage })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage })));
const FAQPage = React.lazy(() => import('../pages/FAQPage').then(module => ({ default: module.FAQPage })));
const LegalPage = React.lazy(() => import('../pages/LegalPage').then(module => ({ default: module.LegalPage })));

const LoginRoleSelector = React.lazy(() => import('../pages/LoginPage/LoginRoleSelector').then(module => ({ default: module.LoginRoleSelector })));
const LoginPage = React.lazy(() => import('../pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupRoleSelector = React.lazy(() => import('../pages/SignupPage/SignupRoleSelector').then(module => ({ default: module.SignupRoleSelector })));
const CustomerSignupPage = React.lazy(() => import('../pages/SignupPage/CustomerSignupPage').then(module => ({ default: module.CustomerSignupPage })));
const ManufacturerSignupPage = React.lazy(() => import('../pages/SignupPage/ManufacturerSignupPage').then(module => ({ default: module.ManufacturerSignupPage })));

const ManufacturerDashboard = React.lazy(() => import('../pages/ManufacturerDashboard').then(module => ({ default: module.ManufacturerDashboard })));
const CustomerDashboard = React.lazy(() => import('../pages/CustomerDashboard').then(module => ({ default: module.CustomerDashboard })));
const UploadPage = React.lazy(() => import('../pages/UploadPage').then(module => ({ default: module.UploadPage })));
const DesignQuotationsPage = React.lazy(() => import('../pages/DesignQuotationsPage').then(module => ({ default: module.DesignQuotationsPage })));
const SmartViewPage = React.lazy(() => import('../pages/SmartViewPage'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, authLoading } = useAuth();
    if (authLoading) {
        return (
            <div style={{ backgroundColor: '#0B0C10', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#0AF0F0', fontSize: '18px', fontWeight: 500 }}>Initializing application...</div>
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

export const AppRoutes = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <Suspense fallback={
            <div style={{ backgroundColor: '#0B0C10', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#0AF0F0', fontSize: '18px', fontWeight: 500 }}>Loading...</div>
            </div>
        }>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<LandingPageContent />} />
                    <Route path="/how-it-works" element={<HowItWorksDetailedPage />} />
                    <Route path="/directory" element={<ManufacturerDirectoryPage />} />
                    <Route path="/manufacturer/:id" element={<ManufacturerProfilePage />} />
                    <Route path="/trust-and-security" element={<TrustAndSecurityPage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/privacy" element={
                        <LegalPage
                            title="Privacy Policy"
                            content={<><h3>1. Information We Collect</h3><p>We collect information you provide directly to us when you create an account, upload designs, or communicate with manufacturers. This includes your name, email address, and any technical data contained in your manufacturing files.</p><h3>2. How We Use Your Information</h3><p>We use your information to facilitate the quoting and manufacturing process, improve our AI matching engine, and ensure the security of our platform.</p><h3>3. Data Security</h3><p>We implement industry-standard security measures to protect your intellectual property and personal data. Your files are only shared with manufacturers you choose to engage with.</p></>}
                        />
                    } />
                    <Route path="/terms" element={
                        <LegalPage
                            title="Terms of Service"
                            content={<><h3>1. Acceptance of Terms</h3><p>By using Quotanic, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform.</p><h3>2. User Responsibilities</h3><p>You are responsible for the accuracy of the designs you upload and for ensuring you have the legal right to manufacture those designs.</p><h3>3. Platform Role</h3><p>Quotanic is a marketplace that connects customers and manufacturers. While we vet partners, the final contract for production is between the user and the manufacturer.</p></>}
                        />
                    } />

                    <Route path="/login">
                        <Route index element={<LoginRoleSelector />} />
                        <Route path="customer" element={<LoginPage role="customer" />} />
                        <Route path="manufacturer" element={<LoginPage role="manufacturer" />} />
                    </Route>

                    <Route path="/signup">
                        <Route index element={<SignupRoleSelector />} />
                        <Route path="customer" element={<CustomerSignupPage />} />
                        <Route path="manufacturer" element={<ManufacturerSignupPage />} />
                    </Route>

                    <Route path="/dashboard" element={<ProtectedRoute>
                        {user?.role === 'manufacturer' ? <ManufacturerDashboard user={user} /> :
                         user?.role === 'customer' ? <CustomerDashboard user={user} /> :
                         <div style={{ padding: '64px 24px', textAlign: 'center' }}>Loading dashboard...</div>}
                    </ProtectedRoute>} />

                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/upload-internal" element={<UploadPage isInternal={true} />} />
                    <Route path="/view-quotes/:designId" element={<DesignQuotationsPage />} />
                    <Route path="/smart-view/:designId" element={
                        <SmartViewWrapper />
                    } />
                </Route>
            </Routes>
        </Suspense>
    );
};

const SmartViewWrapper = () => {
    const { designId } = useParams<{ designId: string }>();
    const navigate = useNavigate();
    return <SmartViewPage designId={designId || ''} onNavigate={(page) => navigate(page)} />;
};
