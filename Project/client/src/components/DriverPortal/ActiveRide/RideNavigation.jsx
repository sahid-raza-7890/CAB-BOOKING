import React, { useEffect } from 'react';
import RideMapPlaceholder from './RideMapPlaceholder';
import PassengerCard from './PassengerCard';
import TripProgress from './TripProgress';
import { useDriver } from '../DriverContext';

const RideNavigation = ({ onCompleteClick, onCancelClick }) => {
    const { 
        activeRide, 
        rideStatus, 
        passenger, 
        startRide, 
        rideTimeline 
    } = useDriver();

    const isStarted = rideStatus === 'InProgress' || rideTimeline?.rideStarted;

    useEffect(() => {
        // Auto-start ride once we transition to this screen if not already started
        if (!isStarted) {
            startRide();
        }
    }, [isStarted, startRide]);

    return (
        <React.Fragment>
            <div className="active-ride-map-container">
                <RideMapPlaceholder step="destination" />
            </div>

            <div className="active-ride-bottom-sheet">
                <div className="bottom-sheet-handle"></div>
                
                <PassengerCard passenger={passenger} activeRide={activeRide} />
                
                <TripProgress 
                    distance={activeRide?.distance?.text || '--'} 
                    time={activeRide?.duration?.text || '--'} 
                    fare={activeRide?.fare} 
                />

                <div className="ride-controls" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="ride-btn primary" onClick={onCompleteClick}>
                        Ride Completed
                    </button>
                    <button className="ride-btn secondary" onClick={onCancelClick} style={{ backgroundColor: '#2a2a2a', border: '1px solid #444', color: '#ccc' }}>
                        Ride not completed due to problems
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default RideNavigation;
