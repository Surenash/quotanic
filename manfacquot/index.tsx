import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FileViewerProvider } from './contexts/FileViewerContext';
import { CurrencyProvider } from './utils/currency';
import { AppRoutes } from './router/routes';
// @ts-ignore
import SmartViewPage from './pages/SmartViewPage';

import './index.css';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <FileViewerProvider>
                    <CurrencyProvider>
                        <AppRoutes />
                    </CurrencyProvider>
                </FileViewerProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
