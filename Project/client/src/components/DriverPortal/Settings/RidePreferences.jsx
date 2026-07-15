import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';

const RidePreferences = () => {
    const { ridePreferences, setRidePreferences } = useDriver();

    const handleToggleType = async (type) => {
        let types = ridePreferences?.preferredRideTypes || [];
        if (types.includes(type)) {
            types = types.filter(t => t !== type);
        } else {
            types = [...types, type];
        }
        
        const updated = { ...ridePreferences, preferredRideTypes: types };
        setRidePreferences(updated);
        try {
            await DriverPreferenceService.updateRides(updated);
        } catch (error) {
            console.error('Failed to update ride preferences:', error);
            setRidePreferences(ridePreferences);
        }
    };

    const handleRadiusChange = async (e) => {
        const val = parseInt(e.target.value);
        const updated = { ...ridePreferences, maxPickupRadius: val };
        setRidePreferences(updated);
        try {
            await DriverPreferenceService.updateRides(updated);
        } catch (error) {
            console.error('Failed to update ride preferences:', error);
        }
    };

    const handleAutoAcceptToggle = async () => {
        const updated = { ...ridePreferences, autoAccept: !ridePreferences?.autoAccept };
        setRidePreferences(updated);
        try {
            await DriverPreferenceService.updateRides(updated);
        } catch (error) {
            console.error('Failed to update ride preferences:', error);
            setRidePreferences(ridePreferences);
        }
    };

    return (
        <div>
            <PreferenceCard title="Preferred Ride Types" description="Select the types of rides you want to receive.">
                {['Standard', 'Premium', 'XL'].map(type => (
                    <div className="setting-row" key={type}>
                        <div className="setting-info">
                            <h3>{type} Rides</h3>
                        </div>
                        <div className="setting-action">
                            <label className="switch">
                                <input type="checkbox" checked={ridePreferences?.preferredRideTypes?.includes(type) || false} onChange={() => handleToggleType(type)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                ))}
            </PreferenceCard>

            <div style={{ marginTop: '24px' }}>
                <PreferenceCard title="Dispatch Settings" description="Configure how dispatch assigns rides.">
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Max Pickup Radius</h3>
                            <p>Maximum distance you are willing to travel for a pickup.</p>
                        </div>
                        <div className="setting-action">
                            <select value={ridePreferences?.maxPickupRadius || 5} onChange={handleRadiusChange}>
                                <option value="1">1 km</option>
                                <option value="3">3 km</option>
                                <option value="5">5 km</option>
                                <option value="10">10 km</option>
                                <option value="20">20 km</option>
                            </select>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Auto-Accept Rides</h3>
                            <p>Automatically accept rides that match your preferences.</p>
                        </div>
                        <div className="setting-action">
                            <label className="switch">
                                <input type="checkbox" checked={!!ridePreferences?.autoAccept} onChange={handleAutoAcceptToggle} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </PreferenceCard>
            </div>
        </div>
    );
};

export default RidePreferences;
