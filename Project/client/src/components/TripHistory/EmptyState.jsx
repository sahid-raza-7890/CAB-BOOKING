import React from 'react';

export default function EmptyState({ title, message }) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <i className="fa-solid fa-car-side" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#ccc', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#888' }}>{message}</p>
        </div>
    );
}
