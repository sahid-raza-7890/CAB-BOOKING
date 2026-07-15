import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';

const PrivacySettings = () => {
    const { preferences, setPreferences } = useDriver();
    const privacy = preferences?.privacy || {};

    const handleToggle = async (key) => {
        const updatedPrivacy = { ...privacy, [key]: !privacy[key] };
        // Optimistic update
        setPreferences({ ...preferences, privacy: updatedPrivacy });
        try {
            await DriverPreferenceService.updatePrivacy(updatedPrivacy);
        } catch (error) {
            console.error('Failed to update privacy:', error);
            // Revert
            setPreferences({ ...preferences, privacy });
        }
    };

    return (
        <PreferenceCard title="Privacy Settings" description="Manage your data sharing and location preferences.">
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Location Permissions</h3>
                    <p>Allow UCAB to access your location even when the app is in the background.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!privacy.locationPermissions} onChange={() => handleToggle('locationPermissions')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Analytics Sharing</h3>
                    <p>Share anonymous usage data to help us improve the platform.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!privacy.analyticsSharing} onChange={() => handleToggle('analyticsSharing')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Profile Visibility</h3>
                    <p>Allow passengers to see your detailed profile (ratings, compliments) before pickup.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!privacy.visibility} onChange={() => handleToggle('visibility')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </PreferenceCard>
    );
};

export default PrivacySettings;
