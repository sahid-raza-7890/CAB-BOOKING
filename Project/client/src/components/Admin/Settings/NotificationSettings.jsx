import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    sendGridKey: 'SG.xxxxxxxxxxxxxxxx',
    twilioAccountSid: 'ACxxxxxxxxxxxxxx'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleSetting = (name) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <SettingsCard title="Notifications & Alerts">
      <div className="settings-form-group">
        <label className="settings-label">Email Notifications</label>
        <div className="settings-toggle" onClick={() => toggleSetting('emailEnabled')}>
          <div className={`toggle-switch ${settings.emailEnabled ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.emailEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">SMS Notifications</label>
        <div className="settings-toggle" onClick={() => toggleSetting('smsEnabled')}>
          <div className={`toggle-switch ${settings.smsEnabled ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.smsEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">SendGrid API Key</label>
        <input type="text" name="sendGridKey" value={settings.sendGridKey} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Twilio Account SID</label>
        <input type="text" name="twilioAccountSid" value={settings.twilioAccountSid} onChange={handleChange} className="settings-input" />
      </div>
    </SettingsCard>
  );
};

export default NotificationSettings;
