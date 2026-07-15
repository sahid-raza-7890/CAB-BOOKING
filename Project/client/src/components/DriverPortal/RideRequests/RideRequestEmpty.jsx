import React from 'react';
import { useDriver } from '../DriverContext';

const RideRequestEmpty = () => {
    const { isOnline } = useDriver();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📡</div>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No Pending Requests</h3>
            <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '300px' }}>
                {isOnline 
                    ? "You're online and looking for rides. Stay in high-demand zones to increase your chances." 
                    : "You are currently offline. Go online to start receiving ride requests."}
            </p>
        </div>
    );
};

export default RideRequestEmpty;
