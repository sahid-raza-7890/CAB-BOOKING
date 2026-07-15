import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useDriver } from '../DriverContext';

const DriverInfo = () => {
    const { user } = useAuth();
    const { dashboard } = useDriver(); // Just reusing for simple state if needed

    if (!user) return null;

    return (
        <div className="profile-panel" style={{ flex: 1 }}>
            <h4 className="section-title"><i className="fas fa-id-card"></i> Driver Information</h4>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '40px', 
                    background: '#333', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: '32px', color: '#fbbf24' 
                }}>
                    <i className="fas fa-user"></i>
                </div>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#fff' }}>
                        {user.firstName} {user.lastName}
                    </h2>
                    <p style={{ margin: '0 0 4px 0', color: '#94a3b8' }}>{user.email}</p>
                    <p style={{ margin: 0, color: '#94a3b8' }}>{user.phone || 'No phone number added'}</p>
                </div>
            </div>
        </div>
    );
};

export default DriverInfo;
