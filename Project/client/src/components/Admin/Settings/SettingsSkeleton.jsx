import React from 'react';
import './Settings.css';

const SettingsSkeleton = () => {
  return (
    <div className="settings-card" style={{ opacity: 0.5, pointerEvents: 'none' }}>
      <div className="settings-card-title" style={{ width: '150px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
      <div className="settings-card-content" style={{ marginTop: '20px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="settings-form-group">
            <div style={{ width: '100px', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsSkeleton;
