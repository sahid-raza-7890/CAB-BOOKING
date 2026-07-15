import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';

const AvailabilitySettings = () => {
    const { availabilityPreferences, setAvailabilityPreferences } = useDriver();

    const handleToggle = async (key) => {
        const updated = { ...availabilityPreferences, [key]: !availabilityPreferences[key] };
        setAvailabilityPreferences(updated);
        try {
            await DriverPreferenceService.updateAvailability(updated);
        } catch (error) {
            console.error('Failed to update availability preferences:', error);
            setAvailabilityPreferences(availabilityPreferences);
        }
    };

    const handleBreakBehaviorChange = async (e) => {
        const val = e.target.value;
        const updated = { ...availabilityPreferences, breakBehavior: val };
        setAvailabilityPreferences(updated);
        try {
            await DriverPreferenceService.updateAvailability(updated);
        } catch (error) {
            console.error('Failed to update availability preferences:', error);
            setAvailabilityPreferences(availabilityPreferences);
        }
    };

    return (
        <PreferenceCard title="Availability Defaults" description="Configure how your online presence behaves by default.">
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Default Online Mode</h3>
                    <p>Automatically go online when you launch the app (if compliant).</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!availabilityPreferences?.defaultOnlineMode} onChange={() => handleToggle('defaultOnlineMode')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Break Behavior</h3>
                    <p>What should the system do when you start a break?</p>
                </div>
                <div className="setting-action">
                    <select value={availabilityPreferences?.breakBehavior || 'PauseRequests'} onChange={handleBreakBehaviorChange}>
                        <option value="PauseRequests">Pause Incoming Requests</option>
                        <option value="GoOffline">Go Completely Offline</option>
                    </select>
                </div>
            </div>
        </PreferenceCard>
    );
};

export default AvailabilitySettings;
