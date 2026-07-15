import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';

const NavigationSettings = () => {
    const { navigationPreferences, setNavigationPreferences, mapProvider, setMapProvider, voiceNavigation, setVoiceNavigation } = useDriver();

    const handleNavToggle = async (key) => {
        const updated = { ...navigationPreferences, [key]: !navigationPreferences[key] };
        setNavigationPreferences(updated);
        try {
            await DriverPreferenceService.updateNavigation(updated);
        } catch (error) {
            console.error('Failed to update navigation:', error);
            setNavigationPreferences(navigationPreferences);
        }
    };

    const handleMapProviderChange = async (e) => {
        const val = e.target.value;
        const oldVal = mapProvider;
        setMapProvider(val);
        try {
            await DriverPreferenceService.updateMapProvider(val);
        } catch (error) {
            console.error('Failed to update map provider:', error);
            setMapProvider(oldVal);
        }
    };

    const handleVoiceToggle = async () => {
        const updated = !voiceNavigation;
        setVoiceNavigation(updated);
        try {
            await DriverPreferenceService.updateVoiceNavigation(updated);
        } catch (error) {
            console.error('Failed to update voice nav:', error);
            setVoiceNavigation(!updated);
        }
    };

    return (
        <div>
            <PreferenceCard title="Map Provider" description="Select the default navigation app to use for dispatch intents.">
                <div className="setting-row">
                    <div className="setting-info">
                        <h3>Default App</h3>
                        <p>We will launch this app for turn-by-turn navigation.</p>
                    </div>
                    <div className="setting-action">
                        <select value={mapProvider || 'Google Maps'} onChange={handleMapProviderChange}>
                            <option value="Google Maps">Google Maps</option>
                            <option value="Waze">Waze</option>
                            <option value="Apple Maps">Apple Maps</option>
                            <option value="OpenStreetMap">OpenStreetMap</option>
                        </select>
                    </div>
                </div>
            </PreferenceCard>

            <div style={{ marginTop: '24px' }}>
                <PreferenceCard title="Routing Preferences" description="Set rules for how navigation routes are calculated.">
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Voice Navigation</h3>
                            <p>Enable voice prompts during active rides.</p>
                        </div>
                        <div className="setting-action">
                            <label className="switch">
                                <input type="checkbox" checked={!!voiceNavigation} onChange={handleVoiceToggle} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Avoid Tolls</h3>
                        </div>
                        <div className="setting-action">
                            <label className="switch">
                                <input type="checkbox" checked={!!navigationPreferences?.avoidTolls} onChange={() => handleNavToggle('avoidTolls')} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Avoid Highways</h3>
                        </div>
                        <div className="setting-action">
                            <label className="switch">
                                <input type="checkbox" checked={!!navigationPreferences?.avoidHighways} onChange={() => handleNavToggle('avoidHighways')} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Auto-Rerouting</h3>
                            <p>Automatically recalculate route when off-path.</p>
                        </div>
                        <div className="setting-action">
                            <label className="switch">
                                <input type="checkbox" checked={!!navigationPreferences?.autoRerouting} onChange={() => handleNavToggle('autoRerouting')} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </PreferenceCard>
            </div>
        </div>
    );
};

export default NavigationSettings;
