import React from 'react';
import IncomingRideCard from './IncomingRideCard';
import RideRequestEmpty from './RideRequestEmpty';
import RideRequestSkeleton from './RideRequestSkeleton';

const RideRequestList = ({ pendingRequests, loading, onAccept, onReject, onExpire }) => {
    if (loading) {
        return (
            <div className="ride-requests-list">
                <RideRequestSkeleton />
                <RideRequestSkeleton />
            </div>
        );
    }

    const safePendingRequests = Array.isArray(pendingRequests) ? pendingRequests : [];

    if (safePendingRequests.length === 0) {
        return <RideRequestEmpty />;
    }

    return (
        <div className="ride-requests-list">
            {safePendingRequests.map(dispatch => (
                <IncomingRideCard 
                    key={dispatch._id} 
                    dispatch={dispatch} 
                    onAccept={onAccept}
                    onReject={onReject}
                    onExpire={onExpire}
                />
            ))}
        </div>
    );
};

export default RideRequestList;
