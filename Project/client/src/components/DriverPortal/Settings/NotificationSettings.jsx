import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';

const NotificationSettings = () => {
    const { notificationPreferences, setNotificationPreferences } = useDriver();

    const handleToggle = async (key) => {
        const updated = { ...notificationPreferences, [key]: !notificationPreferences[key] };
        // Optimistic update
        setNotificationPreferences(updated);
        try {
            await DriverPreferenceService.updateNotifications(updated);
        } catch (error) {
            console.error('Failed to update notifications:', error);
            // Revert on failure
            setNotificationPreferences(notificationPreferences);
        }
    };

    return (
        <PreferenceCard title="Notification Preferences" description="Manage how we communicate with you.">
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Ride Alerts</h3>
                    <p>Receive alerts for incoming ride requests and updates.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!notificationPreferences?.rideAlerts} onChange={() => handleToggle('rideAlerts')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Dispatch Alerts</h3>
                    <p>Receive notifications regarding your availability status.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!notificationPreferences?.dispatchAlerts} onChange={() => handleToggle('dispatchAlerts')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Support Updates</h3>
                    <p>Receive notifications when support tickets are replied to or closed.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!notificationPreferences?.supportUpdates} onChange={() => handleToggle('supportUpdates')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Settlement Notifications</h3>
                    <p>Get notified when daily or weekly earnings are deposited.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!notificationPreferences?.settlementNotifications} onChange={() => handleToggle('settlementNotifications')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Marketing & Promotions</h3>
                    <p>Receive news about driver bonuses and platform promotions.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!notificationPreferences?.marketing} onChange={() => handleToggle('marketing')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </PreferenceCard>
    );
};

export default NotificationSettings;
