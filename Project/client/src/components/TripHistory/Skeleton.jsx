import React from 'react';

export default function Skeleton({ count = 3 }) {
    return (
        <div className="ride-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="ride-card" style={{ opacity: 1 - (i * 0.2), display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginBottom: '10px' }}></div>
                        <div style={{ width: '60%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
                        <div style={{ width: '50%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ width: '50px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                        <div style={{ width: '100px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
