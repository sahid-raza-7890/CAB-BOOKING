import React from 'react';

export default function SupportSkeleton() {
    return (
        <div className="ticket-list-wrapper">
            {[1, 2, 3].map(i => (
                <div key={i} className="ticket-card" style={{ opacity: 1 - (i * 0.2) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ width: '80px', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
                        <div style={{ width: '60px', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
                    </div>
                    <div style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                    <div style={{ width: '40%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                </div>
            ))}
        </div>
    );
}
