import React from 'react';

const TripHistoryEmpty = ({ hasSearch }) => {
    return (
        <div className="history-card" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="analytics-icon" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px' }}>
                <i className="fas fa-route"></i>
            </div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#fff' }}>
                {hasSearch ? 'No trips found' : 'No trips yet'}
            </h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>
                {hasSearch 
                    ? 'Try adjusting your search or filters.' 
                    : 'Start driving to build your trip history!'}
            </p>
        </div>
    );
};

export default TripHistoryEmpty;
