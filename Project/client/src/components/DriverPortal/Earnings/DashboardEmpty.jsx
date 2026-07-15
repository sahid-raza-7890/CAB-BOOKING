import React from 'react';

const DashboardEmpty = () => {
    return (
        <div className="earnings-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="card-icon" style={{ margin: '0 auto 16px auto', width: '64px', height: '64px', fontSize: '32px' }}>
                <i className="fas fa-chart-bar"></i>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>No Data Available</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Start driving to see your earnings, wallet balance, and performance metrics here.</p>
        </div>
    );
};

export default DashboardEmpty;
