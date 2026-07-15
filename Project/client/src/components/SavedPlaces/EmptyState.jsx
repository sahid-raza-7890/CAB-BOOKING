import React from 'react';

export default function EmptyState({ title, message }) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
            <i className="fa-solid fa-map-location-dot" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#ccc', marginBottom: '0.5rem' }}>{title || "No items found"}</h3>
            <p>{message}</p>
        </div>
    );
}
