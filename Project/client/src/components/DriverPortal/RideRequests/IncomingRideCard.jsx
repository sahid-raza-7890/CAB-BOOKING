import React from 'react';
import RideCountdown from './RideCountdown';
import { useDriver } from '../DriverContext';

const IncomingRideCard = ({ dispatch, onAccept, onReject, onExpire }) => {
    const { ride, expiresAt, _id } = dispatch;

    return (
        <div className="incoming-ride-card">
            <RideCountdown expiresAt={expiresAt} onExpire={() => onExpire(_id)} />
            
            <div className="ride-card-header">
                <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>New Request</div>
                    <div className="ride-earnings">₹{ride?.fare?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="ride-eta">
                    {ride?.pickupETA || '-- MIN AWAY'}
                </div>
            </div>

            <div className="ride-locations">
                <div className="location-item">
                    <div className="location-icon" style={{ color: '#22c55e' }}>●</div>
                    <div className="location-text">
                        <span className="location-label">Pickup</span>
                        <span className="location-address">{ride?.pickupLocation || 'Unknown'}</span>
                    </div>
                </div>
                <div style={{ height: '24px', width: '2px', background: 'rgba(255,255,255,0.1)', marginLeft: '4px', marginTop: '-12px', marginBottom: '-12px' }}></div>
                <div className="location-item">
                    <div className="location-icon" style={{ color: '#ef4444' }}>■</div>
                    <div className="location-text">
                        <span className="location-label">Dropoff</span>
                        <span className="location-address">{ride?.dropoffLocation || 'Not specified'}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>{ride?.paymentMethod || 'Cash'}</span>
                <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>{ride?.vehicleType || 'Standard'}</span>
                {ride?.passengerRating && <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>★ {ride.passengerRating}</span>}
            </div>

            <div className="ride-actions">
                <button className="btn-reject" onClick={() => onReject(_id)}>Decline</button>
                <button className="btn-accept" onClick={() => onAccept(_id)}>Accept Ride</button>
            </div>
        </div>
    );
};

export default IncomingRideCard;
