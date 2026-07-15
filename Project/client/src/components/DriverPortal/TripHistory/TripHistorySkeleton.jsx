import React from 'react';

const TripHistorySkeleton = () => {
    return (
        <div className="trip-history-dashboard">
            <div className="analytics-row">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="analytics-stat">
                        <div className="skeleton-pulse" style={{ width: '48px', height: '48px', borderRadius: '24px' }}></div>
                        <div style={{ flex: 1 }}>
                            <div className="skeleton-pulse skeleton-text"></div>
                            <div className="skeleton-pulse skeleton-title" style={{ margin: 0 }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="history-grid">
                <div className="history-card">
                    <div className="skeleton-pulse skeleton-title"></div>
                    <div className="trip-list" style={{ marginTop: '16px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="skeleton-pulse skeleton-card"></div>
                        ))}
                    </div>
                </div>
                <div className="history-card">
                    <div className="skeleton-pulse skeleton-title" style={{ width: '30%' }}></div>
                    <div className="skeleton-pulse skeleton-text" style={{ marginTop: '24px' }}></div>
                    <div className="skeleton-pulse skeleton-text"></div>
                    <div className="skeleton-pulse skeleton-card" style={{ height: '200px', marginTop: '24px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default TripHistorySkeleton;
