import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const MapSettings = () => {
  const [settings, setSettings] = useState({
    provider: 'google',
    apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXX',
    defaultCity: 'Bengaluru',
    updateInterval: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <SettingsCard title="Maps & Geolocation">
      <div className="settings-form-group">
        <label className="settings-label">Map Provider</label>
        <select name="provider" value={settings.provider} onChange={handleChange} className="settings-input">
          <option value="google">Google Maps</option>
          <option value="mapbox">Mapbox</option>
          <option value="osm">OpenStreetMap</option>
        </select>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">API Key</label>
        <input type="text" name="apiKey" value={settings.apiKey} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Default City</label>
        <input type="text" name="defaultCity" value={settings.defaultCity} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Location Update Interval (seconds)</label>
        <input type="number" name="updateInterval" value={settings.updateInterval} onChange={handleChange} className="settings-input" />
      </div>
    </SettingsCard>
  );
};

export default MapSettings;
