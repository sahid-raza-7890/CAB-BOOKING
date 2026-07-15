import React from 'react';

export default function SafetyEmpty() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <i className="fa-solid fa-check-circle" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#ccc', marginBottom: '0.5rem' }}>All Clear</h3>
            <p style={{ color: '#888' }}>You have no active safety alerts. Ride safe!</p>
        </div>
    );
}
