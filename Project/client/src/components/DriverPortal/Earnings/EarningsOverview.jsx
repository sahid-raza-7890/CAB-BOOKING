import React from 'react';
import { useDriver } from '../DriverContext';

const EarningsOverview = () => {
    const { earnings } = useDriver();

    if (!earnings) return null;

    const todayTotal = earnings.today?.total || 0;
    const todayTrips = earnings.today?.trips || 0;
    const todayTime = earnings.today?.timeOnline || 0;

    return (
        <div className="earnings-card gold-glow">
            <div className="card-header">
                <h3 className="card-title">Today's Earnings</h3>
                <div className="card-icon">
                    <i className="fas fa-rupee-sign"></i>
                </div>
            </div>
            
            <h1 className="big-value">₹{todayTotal.toFixed(2)}</h1>
            {earnings.today?.trend && (
                <div className={`sub-value ${earnings.today.trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                    <i className={`fas fa-arrow-${earnings.today.trend >= 0 ? 'up' : 'down'}`}></i>
                    <span>{Math.abs(earnings.today.trend)}% vs yesterday</span>
                </div>
            )}

            <div className="mini-stats-grid">
                <div className="mini-stat">
                    <p className="mini-stat-label">Trips Completed</p>
                    <h3 className="mini-stat-value">{todayTrips}</h3>
                </div>
                <div className="mini-stat">
                    <p className="mini-stat-label">Hours Online</p>
                    <h3 className="mini-stat-value">{todayTime.toFixed(1)}h</h3>
                </div>
                <div className="mini-stat">
                    <p className="mini-stat-label">Weekly Total</p>
                    <h3 className="mini-stat-value">₹{(earnings.week?.total || 0).toFixed(2)}</h3>
                </div>
            </div>
        </div>
    );
};

export default EarningsOverview;
