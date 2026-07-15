import React, { useState } from 'react';
import PickupNavigation from './PickupNavigation';
import RideNavigation from './RideNavigation';
import CancelRideModal from './CancelRideModal';
import CompleteRideModal from './CompleteRideModal';
import ReceiptModal from './ReceiptModal';
import { useDriver } from '../DriverContext';
import './ActiveRide.css';

const ActiveRideDashboard = () => {
    const { activeRide, rideTimeline, rideStatus } = useDriver();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    if (!activeRide) {
        return (
            <div className="active-ride-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)' }}>
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <h2 style={{ color: 'var(--text-main)', fontSize: '24px', marginBottom: '16px' }}>No Active Ride</h2>
                    <p style={{ color: 'var(--text-muted)' }}>You do not have an active ride. Go to Dashboard or Requests to accept one.</p>
                </div>
            </div>
        );
    }

    // Transition to RideNavigation once OTP is verified or ride is already in progress
    const shouldShowRideNavigation = rideStatus === 'InProgress' || rideTimeline?.rideStarted || rideTimeline?.otpVerified;

    return (
        <div className="active-ride-dashboard">
            {!shouldShowRideNavigation ? (
                <PickupNavigation onCancelClick={() => setShowCancelModal(true)} />
            ) : (
                <RideNavigation 
                    onCompleteClick={() => setShowCompleteModal(true)} 
                    onCancelClick={() => setShowCancelModal(true)}
                />
            )}

            {showCancelModal && <CancelRideModal onClose={() => setShowCancelModal(false)} />}
            {showCompleteModal && <CompleteRideModal onClose={() => setShowCompleteModal(false)} />}
            {rideStatus === 'Completed' && <ReceiptModal />}
        </div>
    );
};

export default ActiveRideDashboard;
