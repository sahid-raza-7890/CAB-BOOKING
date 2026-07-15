import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import tripHistoryService from '../../services/tripHistoryService';
import FareBreakdown from './FareBreakdown';
import InvoiceViewer from './InvoiceViewer';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../Reviews/ReviewModal';

export default function RideDetails({ rideId, onClose }) {
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [rebooking, setRebooking] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await tripHistoryService.getRideDetails(rideId);
                setRide(res.data);
            } catch (error) {
                console.error("Failed to load ride details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [rideId]);

    const handleRebook = async () => {
        if (!window.confirm("Do you want to request this exact ride again right now?")) return;
        try {
            setRebooking(true);
            await tripHistoryService.rebookRide(rideId);
            alert("Ride successfully requested! Check your active rides.");
            onClose(); // Close modal and let dashboard update active ride state
        } catch (error) {
            alert(error.message || "Failed to rebook");
            setRebooking(false);
        }
    };

    const handleSupport = async () => {
        const desc = window.prompt("Briefly describe the issue with this ride:");
        if (!desc) return;
        try {
            await tripHistoryService.attachSupportTicket(rideId, { description: desc });
            alert("Support ticket created. Support team will contact you shortly.");
        } catch (error) {
            alert("Failed to create ticket");
        }
    };

    const handleTrackLive = () => {
        onClose();
        navigate(`/live/${rideId}`);
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this ride?")) return;
        try {
            setCancelling(true);
            const token = localStorage.getItem('authToken') || localStorage.getItem('ucab_token');
            const res = await fetch(`http://localhost:5000/api/rides/${rideId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ reason: 'Cancelled by user via history details' })
            });
            if (res.ok) {
                alert("Ride cancelled successfully.");
                window.location.reload(); // Refresh history
            } else {
                alert("Failed to cancel ride.");
            }
        } catch (err) {
            alert("Error cancelling ride");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#e5b05c' }}></i>
                    <p style={{ marginTop: '1rem', color: '#ccc' }}>Loading Ride Details...</p>
                </div>
            </div>
        );
    }

    if (!ride) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 style={{ margin: 0, color: '#e5b05c', fontSize: '1.25rem' }}>Ride Details</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Header Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{ride.fare?.toFixed(2)}</div>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                {new Date(ride.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <span className={`ride-status-badge ${ride.status.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                            {ride.status}
                        </span>
                    </div>

                    {/* Route */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                        <div className="ride-route">
                            <div className="route-point">
                                <i className="fa-solid fa-circle-dot" style={{ color: '#10b981' }}></i>
                                <span>{typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}</span>
                            </div>
                            <div style={{ borderLeft: '2px dashed rgba(255,255,255,0.1)', height: '20px', marginLeft: '9px', margin: '4px 0' }}></div>
                            <div className="route-point">
                                <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i>
                                <span>{ride.dropoffLocation || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Driver & Vehicle */}
                    {ride.driver && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-user" style={{ fontSize: '1.5rem', color: '#ccc' }}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{ride.driver.name}</div>
                                <div style={{ color: '#888', fontSize: '0.85rem' }}>
                                    <i className="fa-solid fa-star" style={{ color: '#e5b05c' }}></i> {ride.driver.rating?.toFixed(1) || 'New'}
                                </div>
                            </div>
                            {ride.vehicleId && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>{ride.vehicleId.licensePlate}</div>
                                    <div style={{ color: '#888', fontSize: '0.85rem' }}>{ride.vehicleId.color} {ride.vehicleId.model}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fare Breakdown Component */}
                    <FareBreakdown fareBreakdown={ride.fareBreakdown} total={ride.fare} paymentMethod={ride.paymentMethod} />

                </div>

                <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
                    {['Searching', 'Accepted', 'InProgress'].includes(ride.status) && (
                        <button className="btn-primary" onClick={handleTrackLive} style={{ flex: 1, backgroundColor: '#10b981' }}>
                            <i className="fa-solid fa-location-arrow"></i> Track Live
                        </button>
                    )}
                    {['Searching', 'Accepted'].includes(ride.status) && (
                        <button className="btn-outline" onClick={handleCancel} disabled={cancelling} style={{ flex: 1, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <i className="fa-solid fa-ban"></i> {cancelling ? 'Cancelling...' : 'Cancel Ride'}
                        </button>
                    )}
                    <button className="btn-outline" onClick={handleSupport} style={{ flex: 1, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <i className="fa-solid fa-circle-exclamation"></i> Report Issue
                    </button>
                    {ride.status === 'Completed' && (
                        <button className="btn-outline" onClick={() => setShowInvoice(true)} style={{ flex: 1 }}>
                            <i className="fa-solid fa-file-invoice"></i> Invoice
                        </button>
                    )}
                    {ride.status === 'Completed' && !ride.rating?.submittedAt && (
                        <button className="btn-primary" onClick={() => setShowReview(true)} style={{ flex: 1 }}>
                            <i className="fa-solid fa-star"></i> Rate Ride
                        </button>
                    )}
                    {['Completed', 'Cancelled'].includes(ride.status) && (
                        <button className="btn-primary" onClick={handleRebook} disabled={rebooking} style={{ flex: 1 }}>
                            <i className="fa-solid fa-rotate-right"></i> {rebooking ? 'Rebooking...' : 'Rebook'}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Nested Invoice Modal */}
            <AnimatePresence>
                {showInvoice && <InvoiceViewer rideId={ride._id} onClose={() => setShowInvoice(false)} />}
                {showReview && (
                    <ReviewModal 
                        rideId={ride._id} 
                        driver={ride.driver} 
                        onClose={() => {
                            setShowReview(false);
                            // Soft reload or fetch to hide button
                            window.location.reload();
                        }} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
