import React from 'react';

const TripProgress = ({ distance, time, fare }) => {
    return (
        <div className="trip-progress">
            <div className="progress-item">
                <span className="progress-value">{distance || '--'}</span>
            </div>
            <div className="progress-divider"></div>
            <div className="progress-item">
                <span className="progress-value">{time || '--'}</span>
            </div>
            <div className="progress-divider"></div>
            <div className="progress-item">
                <span className="progress-value">₹{fare?.toFixed(2) || '0.00'}</span>
                <span className="progress-label">Est. Fare</span>
            </div>
        </div>
    );
};

export default TripProgress;
