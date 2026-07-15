import React from 'react';
import './Operations.css';

const SystemHealth = ({ healthData }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'operational': return 'health-good';
      case 'degraded': return 'health-warn';
      case 'down': return 'status-sos';
      default: return '';
    }
  };

  return (
    <div className="glass-panel">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>System Health</h3>
      <div className="health-grid">
        {(healthData || []).map((service, idx) => (
          <div key={idx} className="glass-panel health-card" style={{ padding: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{service.name}</div>
            <div className={`status-badge ${getStatusColor(service.status)}`} style={{ marginTop: '4px', display: 'inline-block', background: 'transparent' }}>
              {service.status || 'Unknown'}
            </div>
          </div>
        ))}
        {(!healthData || healthData.length === 0) && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-muted)' }}>No health data</div>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
