import React from 'react';

const RewardProgress = ({ pendingCount, requiredRides = 1 }) => {
    return (
        <div className="glass-panel" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
            <h2>Reward Progress</h2>
            <p>You have {pendingCount} friend(s) who need to complete their first ride to unlock rewards.</p>
            <div style={{ marginTop: '1.5rem', background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: pendingCount > 0 ? '50%' : '0%', background: '#ffd700', height: '100%', transition: 'width 0.5s' }}></div>
            </div>
        </div>
    );
};

export default RewardProgress;
