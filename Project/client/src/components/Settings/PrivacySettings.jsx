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

export default function PrivacySettings({ prefs, onUpdate }) {
  const toggle = (key) => {
    onUpdate({ [key]: !prefs[key] });
  };

  return (
    <PreferenceCard title="Privacy & Data" subtitle="Control how your data is used and shared.">
      <ToggleRow 
        label="Location Tracking" 
        description="Allow UCAB to use your location for better pickups and ETA estimates."
        active={prefs.locationTracking}
        onChange={() => toggle('locationTracking')}
      />
      <ToggleRow 
        label="Usage Analytics" 
        description="Share anonymous usage data to help us improve the app experience."
        active={prefs.analytics}
        onChange={() => toggle('analytics')}
      />
      <ToggleRow 
        label="Personalized Ads" 
        description="Receive targeted advertisements based on your ride history."
        active={prefs.personalizedAds}
        onChange={() => toggle('personalizedAds')}
      />
      <ToggleRow 
        label="Profile Visibility" 
        description="Allow other users (like drivers or matched riders) to see your avatar and name."
        active={prefs.profileVisibility}
        onChange={() => toggle('profileVisibility')}
      />
    </PreferenceCard>
  );
}
