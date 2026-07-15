import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as rideService from '../../services/rideService';

function RideDetailsModal({ rideId, onClose }) {
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRideDetails();
    }, [rideId]);

    const fetchRideDetails = async () => {
        try {
            const data = await rideService.getRideDetails(rideId);
            setRide(data);
        } catch (err) {
            console.error('Error fetching ride details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const reason = prompt("Please provide a reason for cancellation:");
        if (reason === null) return;
        try {
            await rideService.cancelRide(rideId, reason);
            alert("Ride cancelled.");
            fetchRideDetails();
        } catch (error) {
            alert(error.message || "Error cancelling ride.");
        }
    };

    if (loading) return (
        <div className="mr-modal-overlay" onClick={onClose}>
            <div className="mr-modal-content" onClick={e => e.stopPropagation()} style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#fff' }}>Loading details...</p>
            </div>
        </div>
    );
    if (!ride) return null;

    return (
        <div className="mr-modal-overlay" onClick={onClose}>
            <div className="mr-modal-content" onClick={e => e.stopPropagation()}>
                <button className="mr-modal-close" onClick={onClose}>✕</button>
                <div className="mr-modal-header">
                    <h2>Ride Details</h2>
                    <p style={{ margin: 0, color: '#888', fontSize: '13px', marginTop: '4px' }}>ID: {ride._id}</p>
                </div>
                
                <div className="mr-modal-body">
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, background: '#1e1e1e', padding: '16px', borderRadius: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Total Fare</div>
                            <div style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold' }}>₹{ride.fare?.toFixed(2) || '0.00'}</div>
                            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>{ride.paymentMethod} • <span style={{ color: ride.paymentStatus === 'Paid' ? '#22c55e' : '#f97316' }}>{ride.paymentStatus}</span></div>
                        </div>
                        <div style={{ flex: 1, background: '#1e1e1e', padding: '16px', borderRadius: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                            <div style={{ fontSize: '24px', color: '#ffc107', fontWeight: 'bold' }}>{ride.status}</div>
                            {ride.otp && <div style={{ fontSize: '13px', color: '#fff', marginTop: '4px' }}>OTP: {ride.otp}</div>}
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Trip Timeline</h3>
                    <div className="mr-timeline">
                        <div className="mr-timeline-item done">
                            <div className="mr-timeline-time">{new Date(ride.createdAt).toLocaleString()}</div>
                            <div className="mr-timeline-title">Booking Created</div>
                        </div>
                        {ride.timeline?.driverAssigned && (
                            <div className="mr-timeline-item done">
                                <div className="mr-timeline-time">{new Date(ride.timeline.driverAssigned).toLocaleString()}</div>
                                <div className="mr-timeline-title">Driver Assigned</div>
                            </div>
                        )}
                        {ride.timeline?.driverArrived && (
                            <div className="mr-timeline-item done">
                                <div className="mr-timeline-time">{new Date(ride.timeline.driverArrived).toLocaleString()}</div>
                                <div className="mr-timeline-title">Driver Arrived</div>
                            </div>
                        )}
                        {ride.timeline?.rideStarted && (
                            <div className="mr-timeline-item done">
                                <div className="mr-timeline-time">{new Date(ride.timeline.rideStarted).toLocaleString()}</div>
                                <div className="mr-timeline-title">Trip Started</div>
                            </div>
                        )}
                        {ride.timeline?.rideCompleted && (
                            <div className="mr-timeline-item done">
                                <div className="mr-timeline-time">{new Date(ride.timeline.rideCompleted).toLocaleString()}</div>
                                <div className="mr-timeline-title">Trip Completed</div>
                            </div>
                        )}
                        {ride.status === 'Cancelled' && (
                            <div className="mr-timeline-item done">
                                <div className="mr-timeline-time">{new Date(ride.updatedAt).toLocaleString()}</div>
                                <div className="mr-timeline-title" style={{ color: '#ef4444' }}>Trip Cancelled ({ride.cancelReason || 'No reason provided'})</div>
                            </div>
                        )}
                    </div>

                    <h3 style={{ color: '#fff', fontSize: '16px', margin: '24px 0 16px' }}>Fare Breakdown</h3>
                    <div style={{ background: '#1e1e1e', padding: '16px', borderRadius: '16px' }}>
                        <div className="mr-fare-row"><span>Base Fare</span> <span>₹{ride.fareBreakdown?.baseFare?.toFixed(2) || ride.baseFare?.toFixed(2) || '0.00'}</span></div>
                        <div className="mr-fare-row"><span>Distance Fare</span> <span>₹{ride.fareBreakdown?.distanceFare?.toFixed(2) || ((ride.perKmRate || 0) * (ride.distanceKm || 0)).toFixed(2)}</span></div>
                        <div className="mr-fare-row"><span>Taxes & Fees</span> <span>₹{ride.fareBreakdown?.taxes?.toFixed(2) || '0.00'}</span></div>
                        <div className="mr-fare-row total"><span>Total Charged</span> <span>₹{ride.fare?.toFixed(2) || '0.00'}</span></div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        {['Searching', 'Accepted', 'InProgress'].includes(ride.status) && (
                            <button className="mr-btn mr-btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '12px', background: '#FFD21F', color: '#000' }} onClick={() => navigate(`/live/${ride._id}`)}>
                                Track Live
                            </button>
                        )}
                        {['Searching', 'Accepted'].includes(ride.status) && (
                            <button className="mr-btn mr-btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCancel}>
                                Cancel Booking
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RideDetailsModal;
