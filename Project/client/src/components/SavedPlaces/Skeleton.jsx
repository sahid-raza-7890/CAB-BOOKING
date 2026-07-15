import React from 'react';

export default function Skeleton({ count = 3 }) {
    return (
        <div className="place-list-wrapper">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="place-card" style={{ opacity: 1 - (i * 0.2) }}>
                    <div className="place-info">
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ width: '40%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
                            <div style={{ width: '70%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
