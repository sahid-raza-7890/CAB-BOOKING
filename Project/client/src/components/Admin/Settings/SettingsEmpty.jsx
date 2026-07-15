import React from 'react';
import './Settings.css';

const SettingsEmpty = ({ message = "No settings available in this category." }) => {
  return (
    <div className="settings-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>{message}</p>
    </div>
  );
};

export default SettingsEmpty;
