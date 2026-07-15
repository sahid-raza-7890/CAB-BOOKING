import React from 'react';
import './Settings.css';

const SettingsSkeleton = () => {
    return (
        <div className="settings-dashboard">
            <div className="settings-header">
                <div className="skeleton-box" style={{ width: '250px', height: '32px' }}></div>
                <div className="skeleton-box" style={{ width: '150px', height: '40px', borderRadius: '8px' }}></div>
            </div>
            
            <div className="settings-container">
                <div className="settings-sidebar">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="skeleton-box" style={{ height: '44px', marginBottom: '8px', borderRadius: '8px' }}></div>
                    ))}
                </div>
                
                <div className="settings-content">
                    <div className="preference-card">
                        <div className="preference-card-header">
                            <div className="skeleton-box" style={{ width: '200px', height: '24px', marginBottom: '8px' }}></div>
                            <div className="skeleton-box" style={{ width: '300px', height: '16px' }}></div>
                        </div>
                        <div className="preference-card-content">
                            {[1,2,3].map(i => (
                                <div key={i} className="setting-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div className="skeleton-box" style={{ width: '120px', height: '20px', marginBottom: '4px' }}></div>
                                        <div className="skeleton-box" style={{ width: '200px', height: '14px' }}></div>
                                    </div>
                                    <div className="skeleton-box" style={{ width: '44px', height: '24px', borderRadius: '24px' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsSkeleton;
