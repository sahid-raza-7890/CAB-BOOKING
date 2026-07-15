import React from 'react';

export default function PreferenceCard({ title, subtitle, children }) {
  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <h2 className="settings-card-title">{title}</h2>
        {subtitle && <p className="settings-card-subtitle">{subtitle}</p>}
      </div>
      <div className="settings-card-body">
        {children}
      </div>
    </div>
  );
}
