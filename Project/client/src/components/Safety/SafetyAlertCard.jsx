import React, { useState } from 'react';
import safetyService from '../../services/safetyService';

export default function SafetyAlertCard({ alert, refresh }) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this alert?`)) return;
        try {
            setLoading(true);
            if (action === 'cancel') {
                await safetyService.cancelAlert(alert._id);
            } else if (action === 'resolve') {
                await safetyService.resolveAlert(alert._id);
            }
            refresh();
        } catch (e) {
            window.alert('Action failed');
            setLoading(false);
        }
    };

    const date = new Date(alert.createdAt).toLocaleString();

    return (
        <div className={`alert-card ${alert.status.toLowerCase()}`}>
            <div className="alert-header">
                <span className="alert-type">
                    <i className="fa-solid fa-bell"></i> {alert.alertType}
                </span>
                <span className={`alert-status ${alert.status.toLowerCase()}`}>{alert.status}</span>
            </div>
            
            <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {date}
            </div>

            {alert.description && (
                <div style={{ color: '#ccc', marginBottom: '1rem', fontStyle: 'italic' }}>
                    "{alert.description}"
                </div>
            )}

            {alert.rideId && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <strong>Ride:</strong> {typeof alert.rideId.pickupLocation === 'object' ? alert.rideId.pickupLocation?.address || 'Unknown' : alert.rideId.pickupLocation} to {typeof alert.rideId.dropoffLocation === 'object' ? alert.rideId.dropoffLocation?.address || 'Unknown' : alert.rideId.dropoffLocation}
                </div>
            )}

            {alert.status === 'Active' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-outline" onClick={() => handleAction('resolve')} disabled={loading} style={{ flex: 1, padding: '5px' }}>
                        Mark Resolved
                    </button>
                    <button className="btn-outline" onClick={() => handleAction('cancel')} disabled={loading} style={{ flex: 1, padding: '5px', borderColor: '#888', color: '#888' }}>
                        Cancel False Alarm
                    </button>
                </div>
            )}
        </div>
    );
}
