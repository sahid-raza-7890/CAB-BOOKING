import React from 'react';

export default function SafetySkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
            <div style={{ width: '200px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
            {[1,2].map(i => (
                <div key={i} style={{ height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}></div>
            ))}
        </div>
    );
}
