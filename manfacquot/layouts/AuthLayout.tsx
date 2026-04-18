import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainLayout } from './MainLayout';

export const AuthLayout = () => {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};
