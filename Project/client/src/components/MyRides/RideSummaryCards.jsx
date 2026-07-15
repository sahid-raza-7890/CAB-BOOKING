import React from 'react';

function RideSummaryCards({ stats }) {
    return (
        <div className="mr-summary-grid">
            <div className="mr-summary-card">
                <div className="mr-sc-title">Completed Rides</div>
                <div className="mr-sc-value" style={{ color: '#22c55e' }}>{stats.completed}</div>
                <div className="mr-sc-icon">✅</div>
            </div>
            <div className="mr-summary-card">
                <div className="mr-sc-title">Cancelled</div>
                <div className="mr-sc-value" style={{ color: '#ef4444' }}>{stats.cancelled}</div>
                <div className="mr-sc-icon">❌</div>
            </div>
            <div className="mr-summary-card">
                <div className="mr-sc-title">Upcoming</div>
                <div className="mr-sc-value" style={{ color: '#ffc107' }}>{stats.upcoming}</div>
                <div className="mr-sc-icon">⏳</div>
            </div>
            <div className="mr-summary-card">
                <div className="mr-sc-title">Total Spent</div>
                <div className="mr-sc-value" style={{ color: '#3b82f6' }}>₹{stats.totalSpent.toFixed(2)}</div>
                <div className="mr-sc-icon">💳</div>
            </div>
        </div>
    );
}

export default RideSummaryCards;
