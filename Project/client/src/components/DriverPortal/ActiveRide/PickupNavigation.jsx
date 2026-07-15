import React from 'react';
import RideMapPlaceholder from './RideMapPlaceholder';
import PassengerCard from './PassengerCard';
import TripProgress from './TripProgress';
import OTPVerification from './OTPVerification';
import { useDriver } from '../DriverContext';

const PickupNavigation = ({ onCancelClick }) => {
    const { activeRide, rideTimeline, passenger, arriveAtPickup } = useDriver();

    const isArrived = rideTimeline?.driverArrived;
    const isOTPVerified = rideTimeline?.otpVerified;

    return (
        <React.Fragment>
            <div className="active-ride-map-container">
                <RideMapPlaceholder step="pickup" />
            </div>

            <div className="active-ride-bottom-sheet">
                <div className="bottom-sheet-handle"></div>
                
                <PassengerCard passenger={passenger} activeRide={activeRide} />
                
                {!isArrived && (
                    <TripProgress 
                        distance={activeRide?.distance?.text || '--'} 
                        time={activeRide?.duration?.text || '--'} 
                        fare={activeRide?.fare} 
                    />
                )}

                {isArrived && !isOTPVerified ? (
                    <OTPVerification />
                ) : (
                    <div className="ride-controls">
                        {!isArrived && (
                            <button className="ride-btn primary" onClick={arriveAtPickup}>
                                Arrived at Pickup
                            </button>
                        )}
                        {/* Once OTP is verified, the parent dashboard will transition to RideNavigation */}
                        <button className="ride-btn danger" onClick={onCancelClick} style={{ fontWeight: 'bold' }}>
                            X
                        </button>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};

export default PickupNavigation;
