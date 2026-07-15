import React from 'react';

const ReferralSkeleton = () => (
    <div className="referral-container">
        <div className="referral-header skeleton"></div>
        <div className="referral-stats-grid">
            <div className="stat-card skeleton"></div>
            <div className="stat-card skeleton"></div>
            <div className="stat-card skeleton"></div>
        </div>
        <div className="referral-actions-grid">
            <div className="glass-panel skeleton" style={{ height: '250px' }}></div>
            <div className="glass-panel skeleton" style={{ height: '250px' }}></div>
        </div>
    </div>
);

export default ReferralSkeleton;
