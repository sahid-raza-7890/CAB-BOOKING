import React, { useState } from 'react';
import './Schedule.css';

import ScheduleBookingCard from './ScheduleBookingCard';
import ScheduleManager from './ScheduleManager';
import ScheduleMap from './ScheduleMap';

export default function ScheduleModule() {
    const [activeTab, setActiveTab] = useState('Book'); // 'Book' or 'Manage'
    
    // Booking Form State
    const [formData, setFormData] = useState({
        category: 'City',
        pickup: '',
        dropoff: '',
        pickupDate: '',
        pickupTime: '',
        vehicleType: 'Basic'
    });
    
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const handleBook = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch('http://localhost:5000/api/rides/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: formData.category, 
                    pickupLocation: formData.pickup,
                    dropoffLocation: formData.dropoff,
                    vehicleType: formData.vehicleType,
                    paymentMethod: 'Cash',
                    schedule: {
                        scheduled: true,
                        pickupDate: formData.pickupDate,
                        pickupTime: formData.pickupTime,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    // If it's a rental, we'd normally pass the rental subdoc too
                    rental: formData.category === 'Rental' ? { hours: 2, includedDistance: 20 } : undefined
                })
            });

            if (res.ok) {
                setBookingSuccess(true);
                setTimeout(() => {
                    setBookingSuccess(false);
                    setActiveTab('Manage');
                    // Reset form
                    setFormData({ ...formData, pickup: '', dropoff: '' });
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to schedule ride');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sch-container">
            <div className="sch-main-column">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0', color: '#22C55E' }}>Schedule</h1>
                    <p style={{ color: '#888', margin: 0 }}>Plan your rides ahead of time for City, Intercity, and Rentals.</p>
                </div>

                <div className="sch-tabs">
                    <div 
                        className={`sch-tab ${activeTab === 'Book' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Book')}
                    >
                        Schedule a Ride
                    </div>
                    <div 
                        className={`sch-tab ${activeTab === 'Manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Manage')}
                    >
                        Upcoming Rides
                    </div>
                </div>

                {activeTab === 'Book' ? (
                    bookingSuccess ? (
                        <div className="sch-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
                            <h2 style={{ color: '#22C55E' }}>Ride Scheduled Successfully!</h2>
                            <p style={{ color: '#aaa', marginTop: '16px' }}>Your ride has been placed in the dispatch queue.</p>
                        </div>
                    ) : (
                        <ScheduleBookingCard 
                            formData={formData} 
                            setFormData={setFormData} 
                            onBook={handleBook}
                            loading={loading}
                        />
                    )
                ) : (
                    <ScheduleManager />
                )}
            </div>

            <div className="sch-right-panel">
                <ScheduleMap 
                    pickup={formData.pickup}
                    dropoff={formData.dropoff}
                    category={formData.category}
                />
            </div>
        </div>
    );
}
