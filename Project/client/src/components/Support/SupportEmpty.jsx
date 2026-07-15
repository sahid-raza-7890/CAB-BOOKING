import React from 'react';

export default function SupportEmpty() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
            <i className="fa-solid fa-ticket-simple" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#ccc', marginBottom: '0.5rem' }}>No Tickets Found</h3>
            <p>You haven't submitted any support tickets yet.</p>
        </div>
    );
}
