import React from 'react';
import './Emergency.css';

export const EmergencySkeleton = () => (
    <div className="emergency-dashboard" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
        <div className="emergency-grid">
            <div className="emergency-panel" style={{ height: '300px', background: 'rgba(239, 68, 68, 0.05)' }}></div>
            <div className="emergency-panel" style={{ height: '300px', background: 'rgba(255, 255, 255, 0.02)' }}></div>
        </div>
    </div>
);

export const EmergencyEmpty = () => null; // Not really needed for SOS dashboard since it's a fixed UI
