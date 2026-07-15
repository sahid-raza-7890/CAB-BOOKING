import React from 'react';
import './Notifications.css';

export const NotificationSkeleton = () => (
    <div className="notification-card" style={{ opacity: 0.7, animation: 'pulse 1.5s infinite ease-in-out' }}>
        <div className="notification-icon" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
        <div className="notification-content">
            <div style={{ height: '16px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ height: '12px', width: '20%', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}></div>
        </div>
    </div>
);
