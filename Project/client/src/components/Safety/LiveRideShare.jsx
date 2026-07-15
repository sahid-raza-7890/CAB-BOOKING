import React, { useState } from 'react';
import safetyService from '../../services/safetyService';

export default function LiveRideShare({ ride }) {
    const [sharing, setSharing] = useState(false);
    const [contacts] = useState(['Mom', 'Partner']); // Mocked

    const handleShare = async () => {
        try {
            setSharing(true);
            await safetyService.shareLiveRide(ride._id, contacts);
            alert("Live tracking link sent to your emergency contacts!");
        } catch (e) {
            alert("Failed to share");
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e5b05c' }}>
                <i className="fa-solid fa-location-arrow"></i> Share Live Ride
            </h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Keep your loved ones updated with your real-time location.
            </p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleShare} disabled={sharing}>
                {sharing ? 'Sharing...' : 'Share Status'}
            </button>
        </div>
    );
}
