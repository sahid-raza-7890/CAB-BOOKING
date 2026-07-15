import React, { useState, useEffect, useContext } from 'react';
import { User, Bell, Shield, Car, Palette, Globe, Lock, RotateCcw } from 'lucide-react';
import userPreferenceService from '../../services/userPreferenceService';
import { SocketContext } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import RidePreferences from './RidePreferences';
import AppearanceSettings from './AppearanceSettings';
import LanguageSettings from './LanguageSettings';
import SecuritySettings from './SecuritySettings';
import ResetPreferencesModal from './ResetPreferencesModal';
import SettingsSkeleton from './SettingsSkeleton';
import SettingsEmpty from './SettingsEmpty';

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('general');
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const fetchPrefs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userPreferenceService.getPreferences();
      setPreferences(data || {});
    } catch (err) {
      console.error('Failed to fetch preferences', err);
      setError('Failed to load preferences.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;
    
    const handlePrefUpdate = (payload) => {
      if (payload && payload.data) {
        setPreferences(payload.data);
      }
    };
    
    socket.on(`preferencesUpdated_${user._id}`, handlePrefUpdate);
    return () => socket.off(`preferencesUpdated_${user._id}`, handlePrefUpdate);
  }, [socket, user]);

  const handleReset = async () => {
    try {
      const newPrefs = await userPreferenceService.resetPreferences();
      setPreferences(newPrefs || {});
      setShowReset(false);
    } catch (err) {
      console.error('Failed to reset', err);
    }
  };

  const updateSection = async (section, data) => {
    try {
      if (section === 'notifications') await userPreferenceService.updateNotifications(data);
      else if (section === 'privacy') await userPreferenceService.updatePrivacy(data);
      else if (section === 'ride') await userPreferenceService.updateRidePreferences(data);
      else if (section === 'theme') await userPreferenceService.updateTheme(data);
      else if (section === 'language') await userPreferenceService.updateLanguage(data);
      else if (section === 'security') await userPreferenceService.updateSecurity(data);
      else if (section === 'general') await userPreferenceService.updatePreferences(data);
      
      // Optionally trigger refetch if we don't rely fully on sockets
      // fetchPrefs();
    } catch (err) {
      console.error(`Failed to update ${section}`, err);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-sidebar"><SettingsSkeleton /></div>
        <div className="settings-content"><SettingsSkeleton /></div>
      </div>
    );
  }

  if (error || !preferences) {
    return <SettingsEmpty onRetry={fetchPrefs} error={error} />;
  }

  const safePrefs = preferences || {};
  const ridePrefs = safePrefs.ridePreferences || {};
  const notifPrefs = safePrefs.notificationPreferences || {};
  const privPrefs = safePrefs.privacy || {};
  const secPrefs = safePrefs.security || {};

  const TABS = [
    { id: 'general', label: 'General & Profile', icon: User },
    { id: 'ride', label: 'Ride Preferences', icon: Car },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
  ];

  return (
    <div className="settings-container">
      <aside className="settings-sidebar">
        <h3>Settings</h3>
        {Array.isArray(TABS) && TABS.map(tab => (
          <button
            key={tab.id}
            className={`settings-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="settings-nav-btn" style={{ color: '#EF4444' }} onClick={() => setShowReset(true)}>
          <RotateCcw size={18} /> Reset to Default
        </button>
      </aside>

      <main className="settings-content">
        {activeTab === 'general' && <GeneralSettings prefs={safePrefs} onUpdate={(d) => updateSection('general', d)} />}
        {activeTab === 'ride' && <RidePreferences prefs={ridePrefs} onUpdate={(d) => updateSection('ride', d)} />}
        {activeTab === 'notifications' && <NotificationSettings prefs={notifPrefs} onUpdate={(d) => updateSection('notifications', d)} />}
        {activeTab === 'privacy' && <PrivacySettings prefs={privPrefs} onUpdate={(d) => updateSection('privacy', d)} />}
        {activeTab === 'security' && <SecuritySettings prefs={secPrefs} onUpdate={(d) => updateSection('security', d)} />}
        {activeTab === 'appearance' && <AppearanceSettings prefs={safePrefs} onUpdate={(d) => updateSection('theme', d)} />}
        {activeTab === 'language' && <LanguageSettings prefs={safePrefs} onUpdate={(d) => updateSection('language', d)} />}
      </main>

      {showReset && (
        <ResetPreferencesModal 
          onConfirm={handleReset} 
          onCancel={() => setShowReset(false)} 
        />
      )}
    </div>
  );
}
