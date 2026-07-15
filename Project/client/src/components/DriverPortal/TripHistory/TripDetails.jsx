import React, { useEffect, useState } from 'react';
import { useDriver } from '../DriverContext';
import DriverTripHistoryService from '../../../services/driverTripHistoryService';

// Subcomponents
const RouteSummary = ({ ride }) => (
    <div className="details-section">
        <h4 className="section-title">Route Summary</h4>
        <div className="trip-locations" style={{ marginTop: '16px' }}>
            <div className="trip-loc">
                <div className="loc-dot pickup"></div>
                <div>
                    <div style={{ color: '#fff', fontSize: '14px' }}>{typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                        {new Date(ride.timeline?.rideStarted || ride.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
            {ride.dropoffLocation && (
                <div className="trip-loc" style={{ marginTop: '16px' }}>
                    <div className="loc-dot dropoff"></div>
                    <div>
                        <div style={{ color: '#fff', fontSize: '14px' }}>{typeof ride.dropoffLocation === 'object' ? ride.dropoffLocation?.address || 'Unknown' : ride.dropoffLocation}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                            {ride.timeline?.rideCompleted ? new Date(ride.timeline.rideCompleted).toLocaleString() : 'Not completed'}
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="breakdown-row" style={{ marginTop: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Distance</span>
            <span style={{ color: '#fff' }}>{ride.distanceKm ? ride.distanceKm.toFixed(1) : 0} km</span>
        </div>
    </div>
);

const PassengerCard = ({ passenger }) => {
    if (!passenger) return null;
    return (
        <div className="details-section">
            <h4 className="section-title">Passenger</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                    src={passenger.profilePicture || 'https://via.placeholder.com/48'} 
                    alt="Passenger" 
                    style={{ width: '48px', height: '48px', borderRadius: '24px', border: '2px solid rgba(255, 255, 255, 0.1)' }}
                />
                <div>
                    <h4 style={{ color: '#fff', margin: '0 0 4px 0' }}>{passenger.firstName} {passenger.lastName}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                        <i className="fas fa-star" style={{ color: '#fbbf24', marginRight: '4px' }}></i> {passenger.rating ? passenger.rating.toFixed(1) : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
};

const FareBreakdown = ({ ride }) => {
    if (!ride || ride.status !== 'Completed') return null;
    const fb = ride.fareBreakdown || {};
    
    return (
        <div className="details-section">
            <h4 className="section-title">Fare Breakdown</h4>
            <div className="breakdown-row">
                <span style={{ color: '#94a3b8' }}>Base Fare</span>
                <span style={{ color: '#fff' }}>₹{fb.baseFare?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="breakdown-row">
                <span style={{ color: '#94a3b8' }}>Distance Fare</span>
                <span style={{ color: '#fff' }}>₹{fb.distanceFare?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="breakdown-row">
                <span style={{ color: '#94a3b8' }}>Time Fare</span>
                <span style={{ color: '#fff' }}>₹{fb.timeFare?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="breakdown-row total">
                <span>Total Fare</span>
                <span style={{ color: '#fbbf24' }}>₹{fb.total?.toFixed(2) || ride.fare?.toFixed(2) || '0.00'}</span>
            </div>
        </div>
    );
};

const SettlementBreakdown = ({ earning }) => {
    if (!earning) return null;
    
    return (
        <div className="details-section" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px' }}>
            <h4 className="section-title" style={{ fontSize: '14px' }}>Earnings Breakdown</h4>
            <div className="breakdown-row">
                <span style={{ color: '#94a3b8' }}>Gross Earning</span>
                <span style={{ color: '#fff' }}>₹{earning.grossEarning?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="breakdown-row">
                <span style={{ color: '#ff4444' }}>Commission ({earning.commissionRate || 15}%)</span>
                <span style={{ color: '#ff4444' }}>-₹{earning.commissionAmount?.toFixed(2) || '0.00'}</span>
            </div>
            {earning.taxes > 0 && (
                <div className="breakdown-row">
                    <span style={{ color: '#ff4444' }}>Taxes</span>
                    <span style={{ color: '#ff4444' }}>-₹{earning.taxes?.toFixed(2) || '0.00'}</span>
                </div>
            )}
            <div className="breakdown-row total" style={{ fontSize: '16px', paddingTop: '8px', marginTop: '8px' }}>
                <span>Net Earning</span>
                <span style={{ color: '#00ff88' }}>₹{earning.netEarning?.toFixed(2) || '0.00'}</span>
            </div>
        </div>
    );
};

// Main Component
const TripDetails = () => {
    const { selectedTrip } = useDriver();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedTrip) {
            const fetchDetails = async () => {
                setLoading(true);
                try {
                    const res = await DriverTripHistoryService.getRide(selectedTrip._id);
                    if (res.success) {
                        setDetails(res.data);
                    }
                } catch (error) {
                    console.error('Failed to load trip details', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        } else {
            setDetails(null);
        }
    }, [selectedTrip]);

    if (!selectedTrip) {
        return (
            <div className="history-card" style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-hand-pointer" style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '16px' }}></i>
                <h3 style={{ color: '#fff' }}>Select a trip</h3>
                <p style={{ color: '#94a3b8' }}>Click on a trip from the list to view details</p>
            </div>
        );
    }

    if (loading || !details) {
        return (
            <div className="history-card">
                <div className="skeleton-pulse skeleton-title"></div>
                <div className="skeleton-pulse skeleton-text" style={{ marginTop: '24px' }}></div>
                <div className="skeleton-pulse skeleton-card" style={{ height: '200px', marginTop: '24px' }}></div>
            </div>
        );
    }

    const { ride, earning } = details;

    return (
        <div className="history-card" style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px 0', color: '#fff' }}>Trip Details</h2>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {ride._id}</span>
                </div>
                {ride.status === 'Completed' && (
                    <button className="btn-primary" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--driver-accent)', color: 'var(--driver-accent)', borderRadius: '6px' }}>
                        <i className="fas fa-file-invoice" style={{ marginRight: '8px' }}></i>
                        Invoice
                    </button>
                )}
            </div>

            <PassengerCard passenger={ride.userId} />
            <RouteSummary ride={ride} />
            
            {ride.status === 'Completed' && (
                <>
                    <FareBreakdown ride={ride} />
                    <SettlementBreakdown earning={earning} />
                </>
            )}

            {ride.status === 'Cancelled' && (
                <div className="details-section">
                    <h4 className="section-title">Cancellation Details</h4>
                    <p style={{ color: '#ff4444', margin: 0 }}>Ride was cancelled before completion.</p>
                </div>
            )}
        </div>
    );
};

export default TripDetails;
