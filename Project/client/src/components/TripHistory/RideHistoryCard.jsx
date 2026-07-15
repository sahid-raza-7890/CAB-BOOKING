import React from 'react';

export default function RideHistoryCard({ ride, onClick }) {
    const date = new Date(ride.createdAt).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    return (
        <div className="ride-card" onClick={onClick}>
            <div className="ride-info-section" style={{ flex: 1 }}>
                <span className={`ride-status-badge ${ride.status.toLowerCase()}`}>
                    {ride.status}
                </span>
                
                <div className="ride-route">
                    <div className="route-point">
                        <i className="fa-solid fa-circle-dot" style={{ color: '#10b981' }}></i>
                        <span>{typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}</span>
                    </div>
                    {ride.dropoffLocation && (
                        <div className="route-point">
                            <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i>
                            <span>{typeof ride.dropoffLocation === 'object' ? ride.dropoffLocation?.address || 'Unknown' : ride.dropoffLocation}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="ride-meta">
                <div className="ride-fare">
                    ₹{ride.fare?.toFixed(2)}
                </div>
                <div className="ride-date">
                    {date}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    <i className="fa-solid fa-car"></i> {ride.vehicleType}
                </div>
            </div>
        </div>
    );
}
