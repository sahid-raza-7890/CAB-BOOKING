import React from 'react';
import PreferenceCard from './PreferenceCard';

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

export default function NotificationSettings({ prefs, onUpdate }) {
  const toggle = (key) => {
    onUpdate({ [key]: !prefs[key] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PreferenceCard title="Push Notifications" subtitle="Manage what alerts you receive on your device.">
        <ToggleRow 
          label="Ride Updates" 
          description="Get real-time updates on driver arrival, ride status, and cancellations."
          active={prefs.rideUpdates}
          onChange={() => toggle('rideUpdates')}
        />
        <ToggleRow 
          label="Offers & Promos" 
          description="Receive exclusive discounts and promotional offers."
          active={prefs.offers}
          onChange={() => toggle('offers')}
        />
        <ToggleRow 
          label="Wallet Activity" 
          description="Alerts for wallet recharges and ride deductions."
          active={prefs.wallet}
          onChange={() => toggle('wallet')}
        />
        <ToggleRow 
          label="Safety Alerts" 
          description="Critical alerts regarding ride safety and emergency contacts."
          active={prefs.safety}
          onChange={() => toggle('safety')}
        />
        <ToggleRow 
          label="Referrals" 
          description="Notifications when friends sign up or complete rides using your code."
          active={prefs.referrals}
          onChange={() => toggle('referrals')}
        />
      </PreferenceCard>

      <PreferenceCard title="Communication Channels" subtitle="Choose how we contact you.">
        <ToggleRow 
          label="Email Notifications" 
          description="Receive receipts, monthly statements, and newsletters via email."
          active={prefs.email}
          onChange={() => toggle('email')}
        />
        <ToggleRow 
          label="SMS Updates" 
          description="Get text messages for important ride updates when offline."
          active={prefs.sms}
          onChange={() => toggle('sms')}
        />
        <ToggleRow 
          label="Push Notifications" 
          description="Allow the app to send you direct push notifications."
          active={prefs.push}
          onChange={() => toggle('push')}
        />
      </PreferenceCard>
    </div>
  );
}
