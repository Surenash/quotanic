// Notification Component
import React from 'react';
import { X as LucideX } from 'lucide-react';

const Notification = ({ message, type = 'success', onDismiss }: { message: string, type?: 'success' | 'error', onDismiss: () => void }) => {
    const baseStyle = {
        padding: '16px',
        borderRadius: '8px',
        margin: '16px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid',
    };
    const typeStyles = {
        success: { backgroundColor: 'rgba(var(--status-success-rgb), 0.1)', color: 'var(--status-success)', borderColor: 'var(--status-success)', textShadow: '0 0 5px var(--status-success)' },
        error: { backgroundColor: 'rgba(var(--status-error-rgb), 0.1)', color: 'var(--status-error)', borderColor: 'var(--status-error)', textShadow: '0 0 5px var(--status-error)' },
    };
    return (
        <div style={{ ...baseStyle, ...typeStyles[type] }}>
            <span>{message}</span>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                <LucideX style={{ width: '20px', height: '20px' }} />
            </button>
        </div>
    );
};

export default Notification;
