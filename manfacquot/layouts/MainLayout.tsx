import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BackgroundAnimation, Header, CurrencyRatesWarning, Footer, FileViewerModal } from '../components';
import { useFileViewer } from '../contexts/FileViewerContext';
import { styles, bg_deep_space } from '../types/theme';

export const MainLayout = () => {
    const { fileViewerState, closeViewer } = useFileViewer();

    const { pathname } = useLocation();
    const isLandingPage = pathname === '/';
    const isSmartView = pathname.startsWith('/smart-view/');

    return (
        <div style={{ backgroundColor: bg_deep_space }}>
            <BackgroundAnimation />
            <div style={{ ...styles.appWrapper, backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
                {!isSmartView && <Header />}
                <CurrencyRatesWarning />
                <main style={{ ...styles.mainContent, paddingTop: isLandingPage || isSmartView ? 0 : '80px' }}>
                    <Outlet />
                </main>
                {fileViewerState.isOpen && <FileViewerModal design={fileViewerState.design} onClose={closeViewer} />}
                {!isSmartView && <Footer />}
            </div>
        </div>
    );
};
