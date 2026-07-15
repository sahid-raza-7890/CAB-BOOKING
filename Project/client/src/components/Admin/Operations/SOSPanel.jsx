import React from 'react';
import './Operations.css';

const SOSPanel = ({ alerts, onAlertClick }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="glass-panel sos-panel">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--accent-red)' }}>
        🚨 EMERGENCY ALERTS ({alerts.length})
      </h3>
      <table className="data-table">
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} onClick={() => onAlertClick(alert)} style={{ cursor: 'pointer' }}>
              <td>
                <div style={{ fontWeight: 'bold' }}>{alert.type}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alert.time}</div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <span className="status-badge status-sos">ACTION REQUIRED</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SOSPanel;
