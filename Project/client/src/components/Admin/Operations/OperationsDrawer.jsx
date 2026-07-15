import React from 'react';
import './Operations.css';

const OperationsDrawer = ({ isOpen, onClose, data, title }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="operations-title" style={{ fontSize: '20px' }}>{title || 'Details'}</h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {data ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', fontSize: '13px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <p>No details available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsDrawer;
