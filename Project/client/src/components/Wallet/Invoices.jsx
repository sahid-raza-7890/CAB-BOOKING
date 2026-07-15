import React, { useState, useEffect } from 'react';

export default function Invoices() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
                const res = await fetch('http://localhost:5000/api/trips/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Assuming data.history or data is an array of trips
                    const tripList = data.history || Array.isArray(data) ? data : [];
                    // Filter only completed trips for invoices
                    setTrips(tripList.filter(t => t.status === 'Completed'));
                }
            } catch (error) {
                console.error("Failed to fetch trips for invoices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const handleDownloadInvoice = async (rideId) => {
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch(`http://localhost:5000/api/trips/${rideId}/invoice`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                alert(`Invoice generated: ${data.data?.invoiceNumber || data.invoiceNumber || 'Success'}. Check backend for full invoice data.`);
            } else {
                alert("Failed to fetch invoice.");
            }
        } catch (err) {
            console.error("Failed to download invoice", err);
        }
    };

    if (loading) return <div>Loading invoices...</div>;

    return (
        <div className="wal-card" style={{ marginTop: '20px' }}>
            <h2 className="wal-card-title">Recent Invoices</h2>
            {trips.length === 0 ? <p>No completed rides found to generate invoices.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {trips.map(trip => (
                        <li key={trip._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
                            <div>
                                <strong>Ride on {new Date(trip.createdAt).toLocaleDateString()}</strong>
                                <br />
                                <small>Fare: ₹{trip.fare}</small>
                            </div>
                            <button className="btn-outline" onClick={() => handleDownloadInvoice(trip._id)}>View Invoice</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
