import React, { useState, useEffect } from 'react';
import DriverTripHistoryService from '../../../services/driverTripHistoryService';
import '../DriverPortal.css';

function statusStyle(s) {
    const m = {
        Completed:  { bg: 'rgba(0,210,106,0.12)',  color: '#00D26A' },
        InProgress: { bg: 'rgba(255,210,31,0.12)',  color: '#FFD21F' },
        Pending:    { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
        Cancelled:  { bg: 'rgba(255,75,75,0.12)',   color: '#FF4B4B' },
        Accepted:   { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
    };
    return m[s] || { bg: 'rgba(255,255,255,0.08)', color: '#aaa' };
}

export default function TripHistory() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await DriverTripHistoryService.getHistory();
                if (res.success && res.rides) {
                    setTrips(res.rides);
                } else if (Array.isArray(res)) {
                    setTrips(res);
                }
            } catch (err) {
                console.error("Failed to load trip history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="dp-root" style={{ padding: '20px' }}>Loading trip history...</div>;

    const safeTrips = Array.isArray(trips) ? trips : [];
    const totalPages = Math.max(1, Math.ceil(safeTrips.length / PER_PAGE));
    const pagedTrips = safeTrips.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="dp-content">
            <h2 className="dp-section-title" style={{ fontSize: '24px', marginBottom: '16px' }}>Trip History</h2>
            
            <div className="dp-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="dp-card-header">
                    <span className="dp-card-title">Recent Trips</span>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="dp-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date & Time</th>
                                <th>Passenger</th>
                                <th>Pickup</th>
                                <th>Dropoff</th>
                                <th>Fare</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedTrips.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No trips found</td>
                                </tr>
                            ) : pagedTrips.map(trip => {
                                const st = statusStyle(trip.status);
                                return (
                                    <tr key={trip.id || trip._id}>
                                        <td style={{ fontWeight: '700', color: '#FFD21F' }}>
                                            #{String(trip.id || trip._id).substring(0, 6)}
                                        </td>
                                        <td>{new Date(trip.createdAt || trip.date).toLocaleString()}</td>
                                        <td>{trip.passengerName || 'N/A'}</td>
                                        <td>{trip.pickupLocation?.address || trip.pickupAddress || 'Unknown'}</td>
                                        <td>{trip.dropoffLocation?.address || trip.dropoffAddress || 'Unknown'}</td>
                                        <td style={{ fontWeight: '800' }}>₹{trip.fare || trip.amount || 0}</td>
                                        <td>
                                            <span className="dp-status-badge" style={{ background: st.bg, color: st.color }}>
                                                {trip.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="dp-action-btn" title="View Details">👁️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="dp-pagination">
                    <div className="dp-page-info">
                        Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, safeTrips.length)} of {safeTrips.length} entries
                    </div>
                    <div className="dp-page-btns">
                        <button 
                            className="dp-page-btn" 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            &lt;
                        </button>
                        <span style={{ fontSize: '12px', padding: '0 8px', alignSelf: 'center', color: '#aaa' }}>Page {page} of {totalPages}</span>
                        <button 
                            className="dp-page-btn" 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
