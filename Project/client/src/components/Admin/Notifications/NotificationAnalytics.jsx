import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../../context/AdminContext';

const NotificationAnalytics = () => {
  const { notificationsDashboard, fetchNotificationsDashboard, loadingNotifications } = useContext(AdminContext);

  useEffect(() => {
    fetchNotificationsDashboard();
  }, [fetchNotificationsDashboard]);

  if (loadingNotifications || !notificationsDashboard) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading analytics...</div>;
  }

  const { totalSent = 0, openRate = 0, clickRate = 0, failureRate = 0, chartData = [] } = notificationsDashboard.analytics || {};

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Analytics & Engagement</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Total Sent (30d)</div>
          <div className="metric-value">{totalSent.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Open Rate</div>
          <div className="metric-value">{openRate}%</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Click Rate</div>
          <div className="metric-value">{clickRate}%</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Delivery Failure</div>
          <div className="metric-value">{failureRate}%</div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ marginTop: '24px', height: '300px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h4 style={{ margin: 0, marginBottom: '20px' }}>Activity (30 Days)</h4>
        {chartData.length > 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--accent-cyan)', height: `${Math.max(5, d.value)}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }} title={`${d.date}: ${d.value}`} />
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
            No chart data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationAnalytics;
