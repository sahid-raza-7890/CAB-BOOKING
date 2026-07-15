import React from 'react';
import './Audit.css';

const AuditTimeline = ({ data, onRowClick }) => {
  return (
    <div className="ucab-glass-panel">
      <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>Activity Timeline</h2>
      <div className="ucab-timeline">
        {data.map((log) => (
          <div 
            key={log.id} 
            className="ucab-timeline-item"
            onClick={() => onRowClick(log)}
            style={{ cursor: 'pointer' }}
          >
            <div className="ucab-timeline-content">
              <div className="ucab-timeline-time">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{log.user}</strong> performed <strong>{log.action}</strong>
                </div>
                <span className={`ucab-status-badge ucab-status-${log.status.toLowerCase() === 'success' ? 'success' : log.status.toLowerCase() === 'failed' ? 'danger' : 'warning'}`}>
                  {log.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTimeline;
