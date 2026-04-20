import React from 'react';
import { Outlet } from 'react-router-dom';
import { BackgroundAnimation, Header, CurrencyRatesWarning, Footer, FileViewerModal } from '../components';
import { useFileViewer } from '../contexts/FileViewerContext';
import { styles, bg_deep_space } from '../types/theme';

export const MainLayout = () => {
    const { fileViewerState, closeViewer } = useFileViewer();

    return (
        <div style={{ backgroundColor: bg_deep_space }}>
            <BackgroundAnimation />
            <div style={{ ...styles.appWrapper, backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
                <Header />
                <CurrencyRatesWarning />
                <main style={styles.mainContent}>
                    <Outlet />
                </main>
                {fileViewerState.isOpen && <FileViewerModal design={fileViewerState.design} onClose={closeViewer} />}
                <Footer />
            </div>
        </div>
    );
};
