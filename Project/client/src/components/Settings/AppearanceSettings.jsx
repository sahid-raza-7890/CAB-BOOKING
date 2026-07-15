import React from 'react';
import PreferenceCard from './PreferenceCard';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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

export default function AppearanceSettings({ prefs, onUpdate }) {
  const { theme, setTheme } = useTheme();

  const handleThemeSet = (newTheme) => {
    setTheme(newTheme);
    onUpdate({ theme: newTheme });
  };

  const toggleAccessibility = (key) => {
    onUpdate({ [key]: !prefs[key] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PreferenceCard title="Appearance" subtitle="Customize how UCAB looks on this device.">
        <div className="settings-grid-select">
          <div 
            className={`settings-grid-item ${theme === 'System' ? 'active' : ''}`}
            onClick={() => handleThemeSet('System')}
          >
            <Monitor className="settings-grid-item-icon" />
            <span className="settings-grid-item-label">System Default</span>
          </div>
          <div 
            className={`settings-grid-item ${theme === 'Dark' ? 'active' : ''}`}
            onClick={() => handleThemeSet('Dark')}
          >
            <Moon className="settings-grid-item-icon" />
            <span className="settings-grid-item-label">Dark Mode</span>
          </div>
          <div 
            className={`settings-grid-item ${theme === 'Light' ? 'active' : ''}`}
            onClick={() => handleThemeSet('Light')}
          >
            <Sun className="settings-grid-item-icon" />
            <span className="settings-grid-item-label">Light Mode</span>
          </div>
        </div>
      </PreferenceCard>

      <PreferenceCard title="Accessibility" subtitle="Enhance readability and usability.">
        <ToggleRow 
          label="High Contrast" 
          description="Increase color contrast for easier reading."
          active={prefs.highContrast}
          onChange={() => toggleAccessibility('highContrast')}
        />
        <ToggleRow 
          label="Large Text" 
          description="Increase text size across the application."
          active={prefs.largeText}
          onChange={() => toggleAccessibility('largeText')}
        />
        <ToggleRow 
          label="Reduce Motion" 
          description="Minimize animations and transitions."
          active={prefs.reduceMotion}
          onChange={() => toggleAccessibility('reduceMotion')}
        />
      </PreferenceCard>
    </div>
  );
}
