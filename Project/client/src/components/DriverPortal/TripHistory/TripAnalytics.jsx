import React from 'react';
import { useDriver } from '../DriverContext';

const TripAnalytics = () => {
    const { tripAnalytics } = useDriver();

    if (!tripAnalytics) return null;

    return (
        <div className="analytics-row">
            <div className="analytics-stat">
                <div className="analytics-icon">
                    <i className="fas fa-car"></i>
                </div>
                <div className="analytics-info">
                    <h4>Total Trips</h4>
                    <h2>{tripAnalytics.totalTrips || 0}</h2>
                </div>
            </div>
            
            <div className="analytics-stat">
                <div className="analytics-icon">
                    <i className="fas fa-star"></i>
                </div>
                <div className="analytics-info">
                    <h4>Avg Rating</h4>
                    <h2>{tripAnalytics.averageRating?.toFixed(1) || 'N/A'}</h2>
                </div>
            </div>

            <div className="analytics-stat">
                <div className="analytics-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}>
                    <i className="fas fa-check-circle"></i>
                </div>
                <div className="analytics-info">
                    <h4>Completion Rate</h4>
                    <h2>{tripAnalytics.completionRate || 0}%</h2>
                </div>
            </div>

            <div className="analytics-stat">
                <div className="analytics-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                    <i className="fas fa-wallet"></i>
                </div>
                <div className="analytics-info">
                    <h4>Total Earnings</h4>
                    <h2>₹{tripAnalytics.earnings?.month?.total?.toFixed(2) || '0.00'}</h2>
                </div>
            </div>
        </div>
    );
};

export default TripAnalytics;
