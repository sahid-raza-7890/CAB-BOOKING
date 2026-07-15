import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsEmpty({ onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      <Settings size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
      <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Preferences Unavailable</h2>
      <p style={{ marginBottom: 24, fontSize: 14 }}>We couldn't load your settings at this time.</p>
      {onRetry && (
        <button className="settings-btn-primary" onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}
