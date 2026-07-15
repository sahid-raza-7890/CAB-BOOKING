import React from 'react';
import { useDriver } from './DriverContext';

const ShiftControls = () => {
    const { isOnline, toggleOnlineStatus } = useDriver();

    return (
        <div className="dashboard-card col-span-12">
            <h3>Shift Controls</h3>
            <div className="shift-controls">
                <button 
                    className="btn-primary"
                    onClick={toggleOnlineStatus}
                >
                    {isOnline ? 'End Shift' : 'Start Shift'}
                </button>
                {isOnline && (
                    <button className="btn-danger">
                        Take a Break
                    </button>
                )}
            </div>
            <p style={{ marginTop: '12px', color: '#94a3b8' }}>
                {isOnline 
                    ? "You are online and available for dispatch in your current zone." 
                    : "You are offline. Start your shift to receive ride requests."}
            </p>
        </div>
    );
};

export default ShiftControls;
