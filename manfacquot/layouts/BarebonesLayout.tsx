import React from 'react';
import { Outlet } from 'react-router-dom';
import { BackgroundAnimation } from '../pages';
import { styles, bg_deep_space } from '../types/theme';

export const BarebonesLayout = () => {
    return (
        <div style={{ backgroundColor: bg_deep_space }}>
             <BackgroundAnimation />
             <div style={{ ...styles.appWrapper, backgroundColor: 'transparent', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                <main style={styles.mainContent}>
                    <Outlet />
                </main>
             </div>
        </div>
    );
};
