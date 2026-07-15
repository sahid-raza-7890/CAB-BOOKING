import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const FeatureFlags = () => {
  const [settings, setSettings] = useState({
    enableCarpooling: false,
    enablePremiumRides: true,
    enableDriverTipping: true,
    enableScheduledRides: true,
    betaTestMode: false
  });

  const toggleSetting = (name) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const flags = [
    { key: 'enableCarpooling', label: 'Carpooling Service' },
    { key: 'enablePremiumRides', label: 'Premium/Luxury Rides' },
    { key: 'enableDriverTipping', label: 'Driver Tipping' },
    { key: 'enableScheduledRides', label: 'Scheduled Rides' },
    { key: 'betaTestMode', label: 'Beta Features Mode' }
  ];

  return (
    <SettingsCard title="Feature Flags">
      {flags.map(({ key, label }) => (
        <div className="settings-form-group" key={key}>
          <label className="settings-label">{label}</label>
          <div className="settings-toggle" onClick={() => toggleSetting(key)}>
            <div className={`toggle-switch ${settings[key] ? 'active' : ''}`}>
              <div className="toggle-slider"></div>
            </div>
            <span>{settings[key] ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      ))}
    </SettingsCard>
  );
};

export default FeatureFlags;
