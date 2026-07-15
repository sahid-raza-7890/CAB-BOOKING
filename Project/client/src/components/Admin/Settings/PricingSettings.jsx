import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const PricingSettings = ({ settings = {}, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (onChange) onChange({ [name]: parseFloat(value) || 0 });
  };

  return (
    <SettingsCard title="Pricing & Fares">
      <div className="settings-form-group">
        <label className="settings-label">Base Fare</label>
        <input type="number" name="baseFare" value={settings.baseFare} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Per Km Rate</label>
        <input type="number" name="perKmRate" value={settings.perKmRate} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Per Minute Rate</label>
        <input type="number" name="perMinuteRate" value={settings.perMinuteRate} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Surge Multiplier</label>
        <input type="number" step="0.1" name="surgeMultiplier" value={settings.surgeMultiplier} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Cancellation Fee</label>
        <input type="number" name="cancellationFee" value={settings.cancellationFee} onChange={handleChange} className="settings-input" />
      </div>
    </SettingsCard>
  );
};

export default PricingSettings;
