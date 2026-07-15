import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';

const SecuritySettings = () => {
    const { securitySettings, setSecuritySettings } = useDriver();

    const handleToggle = async (key) => {
        const updated = { ...securitySettings, [key]: !securitySettings[key] };
        setSecuritySettings(updated);
        try {
            await DriverPreferenceService.updateSecurity(updated);
        } catch (error) {
            console.error('Failed to update security settings:', error);
            setSecuritySettings(securitySettings);
        }
    };

    return (
        <PreferenceCard title="Account Security" description="Manage your login security and trusted devices.">
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Biometric Login</h3>
                    <p>Use FaceID or Fingerprint to unlock the app.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!securitySettings?.biometricLogin} onChange={() => handleToggle('biometricLogin')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className="setting-row">
                <div className="setting-info">
                    <h3>Two-Factor Authentication (2FA)</h3>
                    <p>Require an SMS code when logging in from a new device.</p>
                </div>
                <div className="setting-action">
                    <label className="switch">
                        <input type="checkbox" checked={!!securitySettings?.twoFactorEnabled} onChange={() => handleToggle('twoFactorEnabled')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </PreferenceCard>
    );
};

export default SecuritySettings;
