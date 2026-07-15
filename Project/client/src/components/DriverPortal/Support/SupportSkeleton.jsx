import React from 'react';
import './Support.css';

export const SupportSkeleton = () => (
    <div className="support-dashboard" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
        <div className="support-grid">
            <div className="support-panel">
                <div style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '16px' }}></div>
                {[1,2,3].map(i => (
                    <div key={i} style={{ height: '80px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px' }}></div>
                ))}
            </div>
            <div className="support-panel">
                <div style={{ height: '60px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px' }}></div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px' }}></div>
                <div style={{ height: '50px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '25px' }}></div>
            </div>
        </div>
    </div>
);

export const SupportEmpty = () => (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <i className="fas fa-headset" style={{ fontSize: '48px', color: '#334155', marginBottom: '16px' }}></i>
        <h3>How can we help?</h3>
        <p>You don't have any active support tickets.</p>
    </div>
);
