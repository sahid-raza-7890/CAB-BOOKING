import React from 'react';
import './Audit.css';

const AuditDrawer = ({ isOpen, log, onClose }) => {
  return (
    <>
      <div 
        className={`ucab-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div className={`ucab-drawer ${isOpen ? 'open' : ''}`}>
        <div className="ucab-drawer-header">
          <h3>Audit Details</h3>
          <button 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="ucab-drawer-content">
          {log ? (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span className={`ucab-status-badge ucab-status-${log.status.toLowerCase() === 'success' ? 'success' : log.status.toLowerCase() === 'failed' ? 'danger' : 'warning'}`}>
                  {log.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Action</label>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{log.action}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>User</label>
                <div style={{ fontSize: '14px' }}>{log.user}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Timestamp</label>
                <div style={{ fontSize: '14px' }}>{new Date(log.timestamp).toLocaleString()}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>IP Address</label>
                <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>{log.ipAddress}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Details</label>
                <pre style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '12px', 
                  borderRadius: '8px',
                  fontSize: '12px',
                  overflowX: 'auto',
                  marginTop: '4px'
                }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>No log selected.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AuditDrawer;
