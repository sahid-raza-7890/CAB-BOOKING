import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApiService from '../../../services/adminApiService';
import './Settings.css';

// Import child components
import PricingSettings from './PricingSettings';
import CommissionSettings from './CommissionSettings';
import PaymentSettings from './PaymentSettings';
import MapSettings from './MapSettings';
import NotificationSettings from './NotificationSettings';
import LocalizationSettings from './LocalizationSettings';
import SecuritySettings from './SecuritySettings';
import BrandingSettings from './BrandingSettings';
import FeatureFlags from './FeatureFlags';
import SettingsSkeleton from './SettingsSkeleton';
import ResetSettingsModal from './ResetSettingsModal';

const navItems = [
  { id: 'pricing', label: 'Pricing & Fares', icon: '💰', component: PricingSettings },
  { id: 'commission', label: 'Commission & Fees', icon: '📈', component: CommissionSettings },
  { id: 'payments', label: 'Payment Gateways', icon: '💳', component: PaymentSettings },
  { id: 'maps', label: 'Maps & Geo', icon: '🗺️', component: MapSettings },
  { id: 'notifications', label: 'Notifications', icon: '🔔', component: NotificationSettings },
  { id: 'localization', label: 'Localization', icon: '🌍', component: LocalizationSettings },
  { id: 'security', label: 'Security', icon: '🔒', component: SecuritySettings },
  { id: 'branding', label: 'Branding', icon: '🎨', component: BrandingSettings },
  { id: 'features', label: 'Feature Flags', icon: '🚩', component: FeatureFlags }
];

const SettingsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || navItems[0].id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const res = await adminApiService.getSettings();
      if (res && res.data) {
        setSettings(res.data);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSettingChange = (category, updates) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), ...updates }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await adminApiService.bulkUpdateSettings(settings);
    setSaving(false);
    if (res?.error) {
      alert('Failed to save settings: ' + res.error);
    } else {
      alert('Settings saved successfully!');
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    setShowResetModal(false);
    setLoading(true);
    const res = await adminApiService.resetAllSettings();
    if (res && res.data) setSettings(res.data);
    setLoading(false);
  };

  const ActiveComponent = navItems.find(item => item.id === activeTab)?.component;
  const activeLabel = navItems.find(item => item.id === activeTab)?.label;

  return (
    <div className="settings-dashboard">
      <div className="settings-sidebar">
        <div className="settings-sidebar-header">
          Platform Settings
        </div>
        <div className="settings-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="settings-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-header">
          <h2 className="settings-title">{activeLabel}</h2>
          <div className="settings-actions">
            <button className="btn-cancel" onClick={handleReset} disabled={loading || saving}>
              Reset to Defaults
            </button>
            <button className="btn-save" onClick={handleSave} disabled={loading || saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="settings-form-area">
          {loading ? (
            <>
              <SettingsSkeleton />
              <SettingsSkeleton />
            </>
          ) : (
            ActiveComponent && <ActiveComponent 
              settings={settings[activeTab] || {}} 
              onChange={(updates) => handleSettingChange(activeTab, updates)} 
            />
          )}
        </div>
      </div>

      <ResetSettingsModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
        onConfirm={confirmReset} 
      />
    </div>
  );
};

export default SettingsDashboard;
