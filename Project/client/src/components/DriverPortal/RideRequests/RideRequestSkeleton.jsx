import React from 'react';

const RideRequestSkeleton = () => {
    return (
        <div className="incoming-ride-card" style={{ opacity: 0.5 }}>
            <div className="ride-card-header">
                <div style={{ width: '80px', height: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}></div>
            </div>
            <div className="ride-locations">
                <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '16px' }}></div>
                <div style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
            </div>
            <div className="ride-actions">
                <div style={{ flex: 1, height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}></div>
                <div style={{ flex: 1, height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}></div>
            </div>
        </div>
    );
};

export default RideRequestSkeleton;
