import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import '../Profile/Profile.css';

const Settings = () => {
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark',
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await passengerApiService.getPreferences();
        setPreferences({
          language: data.language || 'en',
          theme: data.theme || 'dark',
          twoFactorEnabled: data.security?.twoFactorEnabled || false,
          emailNotifications: data.notifications?.email || false,
          smsNotifications: data.notifications?.sms || false
        });
      } catch (err) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      await passengerApiService.updatePreferences({
        language: preferences.language,
        theme: preferences.theme,
        security: { twoFactorEnabled: preferences.twoFactorEnabled },
        notifications: {
          email: preferences.emailNotifications,
          sms: preferences.smsNotifications
        }
      });
      // Apply theme and language locally
      toggleTheme(preferences.theme);
      if (i18n && i18n.changeLanguage) {
        let code = 'en';
        if (preferences.language === 'Spanish' || preferences.language === 'es') code = 'es';
        if (preferences.language === 'French' || preferences.language === 'fr') code = 'fr';
        if (preferences.language === 'Hindi' || preferences.language === 'hi') code = 'hi';
        i18n.changeLanguage(code);
      }
      setMessage('Settings updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return <div className="pp-container pp-loading">Loading settings...</div>;
  }

  return (
    <div className="pp-container">
      <div className="pp-card pp-glass">
        <div className="pp-header">
          <h2 className="pp-title">Account Settings</h2>
        </div>
        
        {message && <div className="pp-alert pp-success">{message}</div>}
        {error && <div className="pp-alert pp-error">{error}</div>}
        
        <form onSubmit={handleSave} className="pp-form">
          <div className="pp-form-group">
            <label className="pp-label">Language</label>
            <select 
              className="pp-input"
              value={preferences.language}
              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="pp-form-group">
            <label className="pp-label">Theme</label>
            <select 
              className="pp-input"
              value={preferences.theme}
              onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="pp-flex-between" style={{ marginTop: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>Two-Factor Authentication (2FA)</h3>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Enhance your account security</p>
            </div>
            <button 
              type="button" 
              className={`pp-btn ${preferences.twoFactorEnabled ? 'pp-btn-danger' : 'pp-btn-primary'}`}
              style={{ width: 'auto', padding: '8px 16px' }}
              onClick={() => handleToggle('twoFactorEnabled')}
            >
              {preferences.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="pp-flex-between" style={{ marginTop: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>Email Notifications</h3>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Receive updates via email</p>
            </div>
            <button 
              type="button" 
              className={`pp-btn ${preferences.emailNotifications ? 'pp-btn-danger' : 'pp-btn-primary'}`}
              style={{ width: 'auto', padding: '8px 16px' }}
              onClick={() => handleToggle('emailNotifications')}
            >
              {preferences.emailNotifications ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="pp-flex-between" style={{ marginTop: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>SMS Notifications</h3>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Receive updates via SMS</p>
            </div>
            <button 
              type="button" 
              className={`pp-btn ${preferences.smsNotifications ? 'pp-btn-danger' : 'pp-btn-primary'}`}
              style={{ width: 'auto', padding: '8px 16px' }}
              onClick={() => handleToggle('smsNotifications')}
            >
              {preferences.smsNotifications ? 'Disable' : 'Enable'}
            </button>
          </div>

          <button 
            type="submit"
            className="pp-btn pp-btn-primary" 
            style={{ marginTop: '1.5rem' }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
