import React from 'react';

export default function ReviewSkeleton({ count = 3 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="review-card" style={{ opacity: 1 - (i * 0.2) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div>
                                <div style={{ width: '80px', height: '14px', background: 'rgba(255,255,255,0.1)', marginBottom: '6px' }}></div>
                                <div style={{ width: '60px', height: '10px', background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                        </div>
                        <div style={{ width: '100px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>
                    <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.1)', marginBottom: '8px' }}></div>
                    <div style={{ width: '80%', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>
            ))}
        </div>
    );
}
