import React from 'react';
import './Operations.css';
import OperationsSkeleton from './OperationsSkeleton';

const OperationsMetrics = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="metrics-row">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-panel metric-card">
            <OperationsSkeleton rows={2} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="metrics-row">
      <div className="glass-panel metric-card">
        <div className="metric-value">{metrics?.activeRides || 0}</div>
        <div className="metric-label">Active Rides</div>
      </div>
      <div className="glass-panel metric-card">
        <div className="metric-value" style={{ color: 'var(--accent-green)' }}>{metrics?.onlineDrivers || 0}</div>
        <div className="metric-label">Online Drivers</div>
      </div>
      <div className="glass-panel metric-card">
        <div className="metric-value" style={{ color: 'var(--accent-orange)' }}>{metrics?.pendingDispatch || 0}</div>
        <div className="metric-label">Pending Dispatch</div>
      </div>
      <div className="glass-panel metric-card">
        <div className="metric-value" style={{ color: metrics?.activeSOS > 0 ? 'var(--accent-red)' : 'var(--text-main)' }}>
          {metrics?.activeSOS || 0}
        </div>
        <div className="metric-label">Active SOS</div>
      </div>
    </div>
  );
};

export default OperationsMetrics;
