import React from 'react';
import { useDriver } from '../DriverContext';

const AnalyticsCard = () => {
    const { analytics } = useDriver();

    if (!analytics) return null;

    return (
        <div className="earnings-card">
            <div className="card-header">
                <h3 className="card-title">Performance Analytics</h3>
                <div className="card-icon">
                    <i className="fas fa-tachometer-alt"></i>
                </div>
            </div>
            
            <div className="mini-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="mini-stat">
                    <p className="mini-stat-label">Average Rating</p>
                    <h3 className="mini-stat-value" style={{ color: '#fbbf24' }}>
                        {(analytics.averageRating || 0).toFixed(1)} <i className="fas fa-star" style={{ fontSize: '14px' }}></i>
                    </h3>
                </div>
                <div className="mini-stat">
                    <p className="mini-stat-label">Acceptance Rate</p>
                    <h3 className="mini-stat-value" style={{ color: analytics.acceptanceRate > 85 ? '#00ff88' : '#ff4444' }}>
                        {analytics.acceptanceRate}%
                    </h3>
                </div>
                <div className="mini-stat">
                    <p className="mini-stat-label">Cancellation Rate</p>
                    <h3 className="mini-stat-value" style={{ color: analytics.cancellationRate < 5 ? '#00ff88' : '#ff4444' }}>
                        {analytics.cancellationRate}%
                    </h3>
                </div>
                <div className="mini-stat">
                    <p className="mini-stat-label">Profile Status</p>
                    <h3 className="mini-stat-value" style={{ color: (analytics.profileStatus === 'Excellent' || analytics.profileStatus === 'Good') ? '#00ff88' : '#ff4444' }}>
                        {analytics.profileStatus || 'N/A'}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;
