import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';
import { useTheme } from '../../../context/ThemeContext';

const AppearanceSettings = () => {
    const { theme, setTheme } = useDriver();
    const { setTheme: setGlobalTheme } = useTheme();

    const handleThemeChange = async (e) => {
        const val = e.target.value;
        const oldVal = theme;
        setTheme(val);
        setGlobalTheme(val);
        try {
            await DriverPreferenceService.updateTheme(val);
        } catch (error) {
            console.error('Failed to update theme:', error);
            setTheme(oldVal);
            setGlobalTheme(oldVal);
        }
    };

    return (
        <PreferenceCard title="Appearance" description="Customize the look and feel of your portal.">
            <div className="setting-row">
                <div className="setting-info">
                    <h3>App Theme</h3>
                    <p>Select your preferred visual theme.</p>
                </div>
                <div className="setting-action">
                    <select value={theme || 'System'} onChange={handleThemeChange}>
                        <option value="System">System Default</option>
                        <option value="Dark">Dark Mode</option>
                        <option value="Light">Light Mode</option>
                    </select>
                </div>
            </div>
        </PreferenceCard>
    );
};

export default AppearanceSettings;
