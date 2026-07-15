import React from 'react';
import './Settings.css';

const SettingsCard = ({ title, children }) => {
  return (
    <div className="settings-card">
      {title && <div className="settings-card-title">{title}</div>}
      <div className="settings-card-content">
        {children}
      </div>
    </div>
  );
};

export default SettingsCard;
