import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const CommissionSettings = () => {
  const [settings, setSettings] = useState({
    platformFeePercentage: 20,
    driverBonusPercentage: 5,
    taxRate: 10
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <SettingsCard title="Commission & Fees">
      <div className="settings-form-group">
        <label className="settings-label">Platform Fee (%)</label>
        <input type="number" name="platformFeePercentage" value={settings.platformFeePercentage} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Driver Bonus (%)</label>
        <input type="number" name="driverBonusPercentage" value={settings.driverBonusPercentage} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Tax Rate (%)</label>
        <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} className="settings-input" />
      </div>
    </SettingsCard>
  );
};

export default CommissionSettings;
