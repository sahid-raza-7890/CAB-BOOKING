import React, { useState } from 'react';
import SettingsCard from './SettingsCard';

const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    stripeKey: 'pk_test_xxxxxxxxxx',
    paypalEnabled: true,
    razorpayEnabled: false,
    upiEnabled: false,
    cryptoEnabled: false,
    currency: 'INR'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleSetting = (name) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <SettingsCard title="Payment Gateways">
      <div className="settings-form-group">
        <label className="settings-label">Stripe Public Key</label>
        <input type="text" name="stripeKey" value={settings.stripeKey} onChange={handleChange} className="settings-input" />
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Default Currency</label>
        <select name="currency" value={settings.currency} onChange={handleChange} className="settings-input">
          <option value="INR">INR ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
        </select>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Enable PayPal</label>
        <div className="settings-toggle" onClick={() => toggleSetting('paypalEnabled')}>
          <div className={`toggle-switch ${settings.paypalEnabled ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.paypalEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Enable Razorpay (India)</label>
        <div className="settings-toggle" onClick={() => toggleSetting('razorpayEnabled')}>
          <div className={`toggle-switch ${settings.razorpayEnabled ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.razorpayEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Enable UPI (India)</label>
        <div className="settings-toggle" onClick={() => toggleSetting('upiEnabled')}>
          <div className={`toggle-switch ${settings.upiEnabled ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.upiEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="settings-form-group">
        <label className="settings-label">Enable Crypto Payments</label>
        <div className="settings-toggle" onClick={() => toggleSetting('cryptoEnabled')}>
          <div className={`toggle-switch ${settings.cryptoEnabled ? 'active' : ''}`}>
            <div className="toggle-slider"></div>
          </div>
          <span>{settings.cryptoEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </SettingsCard>
  );
};

export default PaymentSettings;
