import React from 'react';
import './DriverDashboard.css';

const DashboardSkeleton = () => {
    return (
        <div className="driver-earnings-dashboard">
            <div className="dashboard-row">
                <div className="dashboard-col dashboard-col-8">
                    <div className="earnings-card">
                        <div className="skeleton-pulse skeleton-text" style={{ width: '30%' }}></div>
                        <div className="skeleton-pulse skeleton-big-value"></div>
                        <div className="mini-stats-grid">
                            <div className="skeleton-pulse" style={{ height: '80px', borderRadius: '12px' }}></div>
                            <div className="skeleton-pulse" style={{ height: '80px', borderRadius: '12px' }}></div>
                            <div className="skeleton-pulse" style={{ height: '80px', borderRadius: '12px' }}></div>
                        </div>
                    </div>
                    <div className="earnings-card">
                        <div className="skeleton-pulse skeleton-text" style={{ width: '40%' }}></div>
                        <div className="chart-container" style={{ border: 'none' }}>
                            <div className="skeleton-pulse" style={{ width: '100%', height: '100%', borderRadius: '8px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-col dashboard-col-4">
                    <div className="earnings-card">
                        <div className="skeleton-pulse skeleton-text"></div>
                        <div className="skeleton-pulse skeleton-big-value" style={{ width: '80%' }}></div>
                    </div>
                    <div className="earnings-card">
                        <div className="skeleton-pulse skeleton-text" style={{ marginBottom: '16px' }}></div>
                        <div className="transaction-list">
                            <div className="skeleton-pulse skeleton-tx"></div>
                            <div className="skeleton-pulse skeleton-tx"></div>
                            <div className="skeleton-pulse skeleton-tx"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
