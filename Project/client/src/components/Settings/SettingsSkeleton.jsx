import React from 'react';

export default function SettingsSkeleton() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="settings-skeleton-card" style={{ height: 120 }}></div>
      <div className="settings-skeleton-card" style={{ height: 300 }}></div>
      <div className="settings-skeleton-card" style={{ height: 200 }}></div>
    </div>
  );
}
