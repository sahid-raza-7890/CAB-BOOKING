import React from 'react';
import './Audit.css';

const AuditAnalytics = ({ data }) => {
  if (!data || data.length === 0) return null;

  const totalLogs = data.length;
  const successRate = Math.round((data.filter(d => d.status === 'Success').length / totalLogs) * 100) || 0;
  const uniqueUsers = new Set(data.map(d => d.user)).size;
  
  // Count actions
  const actionCounts = data.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  
  const topAction = Object.keys(actionCounts).length > 0 
    ? Object.keys(actionCounts).reduce((a, b) => actionCounts[a] > actionCounts[b] ? a : b)
    : 'N/A';

  return (
    <div className="ucab-glass-panel">
      <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>Audit Analytics</h2>
      <div className="ucab-kpi-grid">
        <div className="ucab-kpi-card">
          <div className="ucab-kpi-value">{totalLogs}</div>
          <div className="ucab-kpi-label">Total Events</div>
        </div>
        <div className="ucab-kpi-card">
          <div className="ucab-kpi-value">{successRate}%</div>
          <div className="ucab-kpi-label">Success Rate</div>
        </div>
        <div className="ucab-kpi-card">
          <div className="ucab-kpi-value">{uniqueUsers}</div>
          <div className="ucab-kpi-label">Unique Users</div>
        </div>
        <div className="ucab-kpi-card">
          <div className="ucab-kpi-value" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px' }}>
            {topAction}
          </div>
          <div className="ucab-kpi-label">Most Frequent Action</div>
        </div>
      </div>
    </div>
  );
};

export default AuditAnalytics;
