import React, { useState, useEffect } from 'react';
import PreferenceCard from './PreferenceCard';
import { CreditCard, Wallet, Coins } from 'lucide-react';

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

export default function RidePreferences({ prefs, onUpdate }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
        const res = await fetch('http://localhost:5000/api/users/payment-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPaymentMethods(Array.isArray(data.paymentMethods) ? data.paymentMethods : []);
        }
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      }
    };
    fetchPayments();
  }, []);

  const toggle = (key) => onUpdate({ [key]: !prefs[key] });
  const setStringPref = (key, val) => onUpdate({ [key]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PreferenceCard title="Payment Preferences" subtitle="Set your default payment method for seamless rides.">
        <div className="settings-grid-select">
          <div 
            className={`settings-grid-item ${prefs.defaultPaymentMethod === 'Cash' ? 'active' : ''}`}
            onClick={() => setStringPref('defaultPaymentMethod', 'Cash')}
          >
            <Coins className="settings-grid-item-icon" />
            <span className="settings-grid-item-label">Cash</span>
          </div>
          <div 
            className={`settings-grid-item ${prefs.defaultPaymentMethod === 'Wallet' ? 'active' : ''}`}
            onClick={() => setStringPref('defaultPaymentMethod', 'Wallet')}
          >
            <Wallet className="settings-grid-item-icon" />
            <span className="settings-grid-item-label">UCAB Wallet</span>
          </div>
          {Array.isArray(paymentMethods) && paymentMethods.map((pm, idx) => {
            const label = `${pm.cardBrand} ${pm.cardNumber.slice(-4)}`;
            return (
              <div 
                key={idx}
                className={`settings-grid-item ${prefs.defaultPaymentMethod === label ? 'active' : ''}`}
                onClick={() => setStringPref('defaultPaymentMethod', label)}
              >
                <CreditCard className="settings-grid-item-icon" />
                <span className="settings-grid-item-label">{label}</span>
              </div>
            );
          })}
        </div>
      </PreferenceCard>

      <PreferenceCard title="Ride Customization" subtitle="Configure defaults for booking rides.">
        <div className="settings-input-group" style={{ marginTop: 16 }}>
          <label>Preferred Vehicle Type</label>
          <select 
            className="settings-input"
            value={prefs.preferredVehicleType}
            onChange={(e) => setStringPref('preferredVehicleType', e.target.value)}
          >
            <option value="Any">Any Available</option>
            <option value="Mini">Mini (Budget)</option>
            <option value="Sedan">Sedan (Comfort)</option>
            <option value="SUV">SUV (Spacious)</option>
            <option value="Premium">Premium (Luxury)</option>
          </select>
        </div>

        <div style={{ marginTop: 24 }}>
          <ToggleRow 
            label="Auto-Apply Coupons" 
            description="Automatically apply the best available coupon to your ride fare."
            active={prefs.autoApplyCoupons}
            onChange={() => toggle('autoApplyCoupons')}
          />
          <ToggleRow 
            label="Auto-Use Wallet" 
            description="Deduct from UCAB Wallet first before charging your default payment method."
            active={prefs.autoUseWallet}
            onChange={() => toggle('autoUseWallet')}
          />
        </div>
      </PreferenceCard>
    </div>
  );
}
