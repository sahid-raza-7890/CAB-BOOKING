import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const LocalizationSettings = () => {
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currency: 'INR'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <SettingsCard title="Localization">
      <div className="settings-form-group">
        <label className="settings-label">Default Language</label>
        <select name="language" value={settings.language} onChange={handleChange} className="settings-input">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="hi">Hindi</option>
          <option value="bn">Bengali</option>
        </select>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Timezone</label>
        <select name="timezone" value={settings.timezone} onChange={handleChange} className="settings-input">
          <option value="UTC">UTC</option>
          <option value="Asia/Kolkata">EST (Mumbai)</option>
          <option value="America/Los_Angeles">PST (Los Angeles)</option>
          <option value="Asia/Kolkata">IST (Kolkata)</option>
        </select>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Currency</label>
        <select name="currency" value={settings.currency} onChange={handleChange} className="settings-input">
          <option value="INR">INR ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
        </select>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Date Format</label>
        <select name="dateFormat" value={settings.dateFormat} onChange={handleChange} className="settings-input">
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
        </select>
      </div>
    </SettingsCard>
  );
};

export default LocalizationSettings;
