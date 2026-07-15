import React from 'react';
import RideRequestList from './RideRequestList';
import { useDriver } from '../DriverContext';
import { useNavigate } from 'react-router-dom';
import './RideRequests.css';

const RideRequestsDashboard = () => {
    const { pendingRequests, acceptRideRequest, rejectRideRequest, expireRideRequest } = useDriver();
    const navigate = useNavigate();

    return (
        <div className="ride-requests-container">
            <h2 style={{ marginBottom: '24px' }}>Ride Requests</h2>
            <div style={{ maxWidth: '600px' }}>
                <RideRequestList 
                    pendingRequests={pendingRequests} 
                    loading={false}
                    onAccept={async (reqId) => {
                        await acceptRideRequest(reqId);
                        navigate('/driver/active');
                    }}
                    onReject={rejectRideRequest}
                    onExpire={expireRideRequest}
                />
            </div>
        </div>
    );
};

export default RideRequestsDashboard;
