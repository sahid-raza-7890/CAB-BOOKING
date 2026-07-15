import React from 'react';
import IncomingRideCard from './IncomingRideCard';
import './RideRequests.css';

const RideRequestModal = ({ dispatch, onAccept, onReject, onExpire }) => {
    if (!dispatch) return null;

    return (
        <div className="ride-modal-overlay">
            <div className="ride-modal-content">
                <IncomingRideCard 
                    dispatch={dispatch} 
                    onAccept={onAccept} 
                    onReject={onReject}
                    onExpire={onExpire}
                />
            </div>
        </div>
    );
};

export default RideRequestModal;
