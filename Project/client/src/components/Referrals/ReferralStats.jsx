import React from 'react';

const ReferralStats = ({ stats }) => {
    return (
        <div className="referral-stats-grid">
            <div className="stat-card">
                <h3>Total Earned</h3>
                <div className="stat-value">${stats.totalEarned || '0.00'}</div>
            </div>
            <div className="stat-card">
                <h3>Friends Invited</h3>
                <div className="stat-value">{stats.totalInvites || 0}</div>
            </div>
            <div className="stat-card">
                <h3>Pending Rides</h3>
                <div className="stat-value">{stats.pending || 0}</div>
            </div>
        </div>
    );
};

export default ReferralStats;
