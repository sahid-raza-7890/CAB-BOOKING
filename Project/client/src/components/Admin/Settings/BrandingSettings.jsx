import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const BrandingSettings = () => {
  const [settings, setSettings] = useState({
    appName: 'UCAB',
    primaryColor: '#FFD21F',
    logoUrl: '/assets/logo.png',
    supportEmail: 'support@ucab.com'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <SettingsCard title="Branding & Appearance">
      <div className="settings-form-group">
        <label className="settings-label">App Name</label>
        <input type="text" name="appName" value={settings.appName} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Primary Color</label>
        <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange} className="settings-input" style={{ padding: '4px', height: '48px' }} />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Logo URL</label>
        <input type="text" name="logoUrl" value={settings.logoUrl} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Support Email</label>
        <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="settings-input" />
      </div>
    </SettingsCard>
  );
};

export default BrandingSettings;
