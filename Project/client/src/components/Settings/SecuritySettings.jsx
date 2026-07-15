import React, { useState } from 'react';
import PreferenceCard from './PreferenceCard';
import userPreferenceService from '../../services/userPreferenceService';

const ToggleRow = ({ label, description, active, onChange }) => (
  <div className="settings-row">
    <div className="settings-row-text">
      <h4>{label}</h4>
      <p>{description}</p>
    </div>
    <div className={`settings-toggle ${active ? 'on' : ''}`} onClick={onChange}>
      <div className="settings-toggle-knob" />
    </div>
  </div>
);

export default function SecuritySettings({ prefs, onUpdate }) {
  const [pin, setPin] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const verifyPin = (e) => {
    e.preventDefault();
    // Simulate PIN verification for security area
    if (pin === '1234') {
      setVerified(true);
      setError('');
    } else {
      setError('Invalid PIN. (Hint: Use 1234 for demo)');
    }
  };

  const toggle = (key) => {
    onUpdate({ [key]: !prefs[key] });
  };

  const toggleDevice = async () => {
    try {
      const data = { devicePreferences: { rememberLogin: !prefs.rememberLogin } };
      // we need to call userPreferenceService.updatePreferences to update devicePreferences
      // since it's part of the general preferences object but handled in the root.
      // But for simplicity in this UI, we can just hit the updatePreferences endpoint.
      await userPreferenceService.updatePreferences(data);
      // It will auto-update via socket
    } catch (err) {
      console.error(err);
    }
  };

  if (!verified) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto' }}>
        <div className="settings-card" style={{ textAlign: 'center' }}>
          <h2 className="settings-card-title">Security Verification</h2>
          <p className="settings-card-subtitle" style={{ marginBottom: 24 }}>
            Enter your 4-digit PIN to access Security Settings.
          </p>
          <form onSubmit={verifyPin}>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="settings-input"
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, marginBottom: 16 }}
              autoFocus
            />
            {error && <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 16 }}>{error}</div>}
            <button type="submit" className="settings-btn-primary" style={{ width: '100%' }}>Verify</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PreferenceCard title="Account Security" subtitle="Enhance your account's protection.">
      <ToggleRow 
        label="Biometric Authentication" 
        description="Require Face ID or Fingerprint when opening the app or viewing sensitive data."
        active={prefs.biometricEnabled}
        onChange={() => toggle('biometricEnabled')}
      />
      <ToggleRow 
        label="Two-Factor Authentication (2FA)" 
        description="Require an SMS code when logging in from a new device."
        active={prefs.twoFactorEnabled}
        onChange={() => toggle('twoFactorEnabled')}
      />
      {/* 
        Note: Device preferences aren't fully separated in the API map to "security", 
        but we can mock the toggle or use the general update function.
      */}
      <div style={{ marginTop: 24, padding: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12 }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#EF4444' }}>Danger Zone</h4>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>
          Log out of all other sessions immediately.
        </p>
        <button className="settings-btn-danger">Sign Out Everywhere</button>
      </div>
    </PreferenceCard>
  );
}
