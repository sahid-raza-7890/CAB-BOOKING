import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    ipWhitelist: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleSetting = (name) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <SettingsCard title="Security & Access">
      <div className="settings-form-group">
        <label className="settings-label">Require 2FA for Admins</label>
        <div className="settings-toggle" onClick={() => toggleSetting('twoFactorAuth')}>
          <div className={`toggle-switch ${settings.twoFactorAuth ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.twoFactorAuth ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Password Expiry (Days)</label>
        <input type="number" name="passwordExpiry" value={settings.passwordExpiry} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Session Timeout (Minutes)</label>
        <input type="number" name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">IP Whitelist (comma separated)</label>
        <input type="text" name="ipWhitelist" value={settings.ipWhitelist} onChange={handleChange} className="settings-input" placeholder="e.g. 192.168.1.1, 10.0.0.1" />
      </div>
    </SettingsCard>
  );
};

export default SecuritySettings;
