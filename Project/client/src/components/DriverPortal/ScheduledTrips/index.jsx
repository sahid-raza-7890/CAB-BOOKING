import React, { useState, useEffect } from 'react';
import { useDriver } from '../DriverContext';

export default function ScheduledTrips() {
    const { token } = useDriver();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch scheduled trips
        setTimeout(() => {
            setTrips([]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="pp-glass-panel">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>Scheduled Trips</h2>
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading scheduled trips...</div>
            ) : trips.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trips.map(trip => (
                        <div key={trip._id} style={{ padding: '16px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{trip.passengerName}</span>
                                <span style={{ color: 'var(--primary-accent)', fontWeight: 'bold' }}>{trip.time}</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                <div>📍 {trip.pickup}</div>
                                <div>🏁 {trip.dropoff}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No scheduled trips found.</div>
            )}
        </div>
    );
}
