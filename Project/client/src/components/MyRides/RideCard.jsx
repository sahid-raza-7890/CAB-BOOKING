import React from 'react';

function RideCard({ ride, onDetails, onRating, onReceipt, onRepeat }) {
    const d = new Date(ride.createdAt);
    const month = d.toLocaleString('default', { month: 'short' });
    const day = d.getDate();
    
    return (
        <div className="mr-ride-card" onClick={onDetails}>
            <div className="mr-rc-left">
                <div className="mr-rc-date">
                    <span className="month">{month}</span>
                    <span className="day">{day}</span>
                </div>
                <div className="mr-rc-info">
                    <div className="mr-rc-route">
                        {ride.pickupLocation.split(',')[0]} → {ride.dropoffLocation ? ride.dropoffLocation.split(',')[0] : 'Rental'}
                    </div>
                    <div className="mr-rc-meta">
                        <span>{ride.vehicleId?.label || ride.vehicleType}</span> • 
                        <span>Driver: {ride.driver?.name || 'Unassigned'}</span> • 
                        <span>{new Date(ride.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span className={`mr-badge ${ride.status.toLowerCase()}`}>{ride.status}</span>
                        {ride.paymentStatus === 'Paid' && <span className="mr-badge completed">Paid</span>}
                    </div>
                </div>
            </div>
            
            <div className="mr-rc-right" onClick={(e) => e.stopPropagation()}>
                <div className="mr-rc-fare">₹{ride.fare?.toFixed(2) || '0.00'}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {ride.status === 'Completed' && (!ride.rating || !ride.rating.submittedAt) && (
                        <button className="mr-btn mr-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onRating}>Rate</button>
                    )}
                    {ride.status === 'Completed' && (
                        <button className="mr-btn mr-btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onReceipt}>Receipt</button>
                    )}
                    <button className="mr-btn mr-btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onRepeat}>Repeat</button>
                </div>
            </div>
        </div>
    );
}

export default RideCard;
