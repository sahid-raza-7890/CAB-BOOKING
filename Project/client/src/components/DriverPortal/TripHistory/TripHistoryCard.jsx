import React from 'react';
import { useDriver } from '../DriverContext';

const TripHistoryCard = ({ ride }) => {
    const { selectedTrip, setSelectedTrip } = useDriver();
    const isActive = selectedTrip && selectedTrip._id === ride._id;
    
    const dateStr = new Date(ride.createdAt || ride.timeline?.booking).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isCompleted = ride.status === 'Completed';
    const isCancelled = ride.status === 'Cancelled';
    
    // Only completed rides display final fare amount typically
    const amount = isCompleted ? (ride.fareBreakdown?.total || ride.fare) : 0;

    return (
        <div 
            className={`trip-item ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedTrip(ride)}
        >
            <div className="trip-item-header">
                <span className="trip-date">{dateStr}</span>
                {isCompleted && <span className="trip-amount">₹{amount.toFixed(2)}</span>}
                {isCancelled && <span className="trip-status cancelled">Cancelled</span>}
                {!isCompleted && !isCancelled && <span className="trip-status" style={{background: 'rgba(255,255,255,0.1)'}}>{ride.status}</span>}
            </div>
            
            <div className="trip-locations">
                <div className="trip-loc">
                    <div className="loc-dot pickup"></div>
                    <span style={{ color: '#fff', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}
                    </span>
                </div>
                {ride.dropoffLocation && (
                    <div className="trip-loc">
                        <div className="loc-dot dropoff"></div>
                        <span style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {typeof ride.dropoffLocation === 'object' ? ride.dropoffLocation?.address || 'Unknown' : ride.dropoffLocation}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripHistoryCard;
