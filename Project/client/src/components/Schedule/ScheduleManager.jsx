import React, { useEffect, useState } from 'react';
import { getScheduledRides, cancelScheduledRide } from '../../services/scheduleService';
import { motion } from 'framer-motion';

export default function ScheduleManager() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const data = await getScheduledRides();
            setRides(data.rides || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            await cancelScheduledRide(id);
            // Refresh list
            fetchRides();
        } catch (err) {
            console.error('Failed to cancel', err);
        }
    };

    if (loading) return <div style={{ color: '#888' }}>Loading scheduled rides...</div>;

    if (rides.length === 0) {
        return (
            <div className="sch-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Upcoming Rides</h3>
                <p style={{ color: '#888', margin: 0 }}>You have no scheduled rides. Book one today!</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rides.map(ride => (
                <motion.div 
                    key={ride._id}
                    className="sch-ride-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="sch-ride-header">
                        <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                            {ride.type === 'Inter City' ? 'Intercity' : ride.type}
                        </span>
                        <span className="sch-status-badge">
                            {ride.schedule?.scheduledStatus || 'Scheduled'}
                        </span>
                    </div>

                    <div className="sch-detail-row">
                        <span className="sch-detail-label">Date & Time</span>
                        <span className="sch-detail-value" style={{ color: '#22C55E' }}>
                            {ride.schedule?.pickupDate} at {ride.schedule?.pickupTime}
                        </span>
                    </div>

                    <div className="sch-detail-row">
                        <span className="sch-detail-label">Pickup</span>
                        <span className="sch-detail-value">{typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}</span>
                    </div>

                    {ride.type !== 'Rental' && (
                        <div className="sch-detail-row">
                            <span className="sch-detail-label">Dropoff</span>
                            <span className="sch-detail-value">{typeof ride.dropoffLocation === 'object' ? ride.dropoffLocation?.address || 'Unknown' : ride.dropoffLocation}</span>
                        </div>
                    )}

                    <div className="sch-detail-row">
                        <span className="sch-detail-label">Vehicle</span>
                        <span className="sch-detail-value">{ride.vehicleType}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button 
                            className="sch-btn-danger" 
                            onClick={() => handleCancel(ride._id)}
                            disabled={ride.schedule?.scheduledStatus !== 'Scheduled'}
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
