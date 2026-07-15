import React from 'react';

export default function SummaryCards({ summary, wallet }) {
    return (
        <div className="de-summary-grid">
            <div className="de-summary-card">
                <div className="de-summary-label">Today's Earnings</div>
                <div className="de-summary-value">₹{summary?.today?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="de-summary-card">
                <div className="de-summary-label">This Week</div>
                <div className="de-summary-value">₹{summary?.weekly?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="de-summary-card">
                <div className="de-summary-label">Available Wallet Balance</div>
                <div className="de-summary-value" style={{ color: '#22c55e' }}>
                    ₹{wallet?.available?.toFixed(2) || '0.00'}
                </div>
            </div>
            <div className="de-summary-card">
                <div className="de-summary-label">Pending Settlement</div>
                <div className="de-summary-value" style={{ color: '#eab308' }}>
                    ₹{summary?.pending?.toFixed(2) || '0.00'}
                </div>
            </div>
        </div>
    );
}
