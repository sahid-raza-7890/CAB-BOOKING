import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';

const GeneralSettings = () => {
    const { driver, activeVehicle, verificationStatus } = useDriver();

    return (
        <div>
            <PreferenceCard title="Driver Profile" description="Your basic driver account details.">
                <div className="setting-row">
                    <div className="setting-info">
                        <h3>Full Name</h3>
                        <p>{driver?.name}</p>
                    </div>
                </div>
                <div className="setting-row">
                    <div className="setting-info">
                        <h3>Email Address</h3>
                        <p>{driver?.email}</p>
                    </div>
                </div>
                <div className="setting-row">
                    <div className="setting-info">
                        <h3>Phone Number</h3>
                        <p>{driver?.phone}</p>
                    </div>
                </div>
            </PreferenceCard>

            <div style={{ marginTop: '24px' }}>
                <PreferenceCard title="Account Status" description="Your current verification and vehicle status.">
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Verification Status</h3>
                            <p>{verificationStatus || 'Pending'}</p>
                        </div>
                        <div className="setting-action">
                            <span style={{ 
                                background: verificationStatus === 'Verified' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                                color: verificationStatus === 'Verified' ? '#4ade80' : '#ef4444', 
                                padding: '4px 12px', 
                                borderRadius: '12px', 
                                fontSize: '12px', 
                                fontWeight: 'bold' 
                            }}>
                                {verificationStatus || 'Action Required'}
                            </span>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Active Vehicle</h3>
                            <p>{activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.plateNumber})` : 'No active vehicle selected'}</p>
                        </div>
                    </div>
                </PreferenceCard>
            </div>
        </div>
    );
};

export default GeneralSettings;
