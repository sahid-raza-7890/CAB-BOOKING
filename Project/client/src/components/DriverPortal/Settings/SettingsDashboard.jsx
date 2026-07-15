import React, { useState, useEffect } from 'react';
import { useDriver } from '../DriverContext';
import DriverPreferenceService from '../../../services/driverPreferenceService';
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import NavigationSettings from './NavigationSettings';
import RidePreferences from './RidePreferences';
import AvailabilitySettings from './AvailabilitySettings';
import AppearanceSettings from './AppearanceSettings';
import LanguageSettings from './LanguageSettings';
import SecuritySettings from './SecuritySettings';
import SettingsSkeleton from './SettingsSkeleton';
import ResetPreferencesModal from './ResetPreferencesModal';
import './Settings.css';

const SettingsDashboard = () => {
    const { preferences, setPreferences } = useDriver();
    const [activeTab, setActiveTab] = useState('General');
    const [loading, setLoading] = useState(!preferences);
    const [showResetModal, setShowResetModal] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!preferences) {
                try {
                    const data = await DriverPreferenceService.getPreferences();
                    // Let DriverContext handle the main state population eventually, but we can also set local loading off
                    setPreferences(data);
                } catch (error) {
                    console.error('Failed to load preferences:', error);
                }
                setLoading(false);
            }
        };
        fetchPreferences();
    }, [preferences, setPreferences]);

    const renderContent = () => {
        switch (activeTab) {
            case 'General': return <GeneralSettings />;
            case 'Notifications': return <NotificationSettings />;
            case 'Privacy': return <PrivacySettings />;
            case 'Navigation': return <NavigationSettings />;
            case 'Ride Types': return <RidePreferences />;
            case 'Availability': return <AvailabilitySettings />;
            case 'Appearance': return <AppearanceSettings />;
            case 'Language': return <LanguageSettings />;
            case 'Security': return <SecuritySettings />;
            default: return <GeneralSettings />;
        }
    };

    if (loading) return <SettingsSkeleton />;

    return (
        <div className="settings-dashboard">
            <div className="settings-header">
                <h1>Settings & Preferences</h1>
                <button className="btn-danger" onClick={() => setShowResetModal(true)}>
                    Reset to Default
                </button>
            </div>
            
            <div className="settings-container">
                <div className="settings-sidebar">
                    {['General', 'Notifications', 'Privacy', 'Navigation', 'Ride Types', 'Availability', 'Appearance', 'Language', 'Security'].map(tab => (
                        <div 
                            key={tab}
                            className={`settings-nav-item ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>

            {showResetModal && (
                <ResetPreferencesModal onClose={() => setShowResetModal(false)} />
            )}
        </div>
    );
};

export default SettingsDashboard;
