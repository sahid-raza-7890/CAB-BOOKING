import React from 'react';
import PreferenceCard from './PreferenceCard';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSettings({ prefs, onUpdate }) {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val); // Update global context immediately
    onUpdate(val);    // Update preferences (if needed)
  };

  return (
    <PreferenceCard title="Language" subtitle="Select your preferred language for the UCAB platform.">
      <div className="settings-input-group" style={{ marginTop: 16 }}>
        <label>Display Language</label>
        <select 
          className="settings-input"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi (हिन्दी)</option>
          <option value="Telugu">Telugu (తెలుగు)</option>
        </select>
      </div>
      <p style={{ fontSize: 12, color: '#888', marginTop: 16 }}>
        Changing the language updates the interface immediately across the app.
      </p>
    </PreferenceCard>
  );
}
