import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as intercityService from '../../services/intercityService';
import { useRideSocket } from '../../hooks/useRideSocket';
import './Intercity.css';

import IntercityBookingCard from './IntercityBookingCard';
import LiveFareEstimator from './LiveFareEstimator';
import IntercityMap from './IntercityMap';
import PopularDestinations from './PopularDestinations';

export default function IntercityModule() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tripType: 'One Way',
        pickup: '',
        destination: '',
        departureDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        passengers: 1,
        luggage: 0,
        distanceKm: 0 // Will mock a distance calculation based on input length
    });

    const [loadingFare, setLoadingFare] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookedRideId, setBookedRideId] = useState(null);

    // Socket integration to redirect when driver accepts
    useRideSocket((data) => {
        if (data.status === 'Accepted' && bookedRideId === data.rideId) {
            navigate(`/live/${data.rideId}`);
        }
    });

    const calculateDays = () => {
        if (formData.tripType !== 'Round Trip' || !formData.returnDate) return 1;
        const d1 = new Date(formData.departureDate);
        const d2 = new Date(formData.returnDate);
        const diff = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);
        return diff > 0 ? diff : 1;
    };

    const handleCalculateFare = async () => {
        if (!formData.pickup || !formData.destination) return;
        
        setLoadingFare(true);
        try {
            // Mock distance based on string length ratio for UI demo
            const dLen = formData.destination.length * 15;
            const distanceKm = Math.max(100, dLen + 50); // Minimum 100km for intercity
            
            setFormData(prev => ({ ...prev, distanceKm }));

            const data = await intercityService.getIntercityFareEstimate({
                distanceKm,
                tripType: formData.tripType,
                days: calculateDays()
            });
            
            setVehicles(data.estimates || []);
            if (!selectedVehicle && data.estimates?.length > 0) {
                setSelectedVehicle(data.estimates[0]);
            }
        } catch (err) {
            console.error('Fare estimate failed:', err);
        } finally {
            setLoadingFare(false);
        }
    };

    const handleBook = async () => {
        if (!selectedVehicle) return;

        try {
            // We use the standard ride request API which we patched for Intercity
            const res = await fetch('http://localhost:5000/api/rides/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'))}`
                },
                body: JSON.stringify({
                    type: 'Inter City',
                    pickupLocation: formData.pickup,
                    dropoffLocation: formData.destination,
                    vehicleType: selectedVehicle.type,
                    distanceKm: formData.distanceKm,
                    paymentMethod: 'Cash',
                    intercity: {
                        tripType: formData.tripType,
                        returnDate: formData.returnDate || undefined,
                        passengers: formData.passengers,
                        luggage: formData.luggage,
                        ...selectedVehicle.breakdown // Save outstation-specific fields
                    },
                    fareBreakdown: selectedVehicle.breakdown
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBookedRideId(data.ride._id);
                setBookingSuccess(true);
            }
        } catch (err) {
            console.error('Booking failed:', err);
        }
    };

    if (bookingSuccess) {
        return (
            <div className="intercity-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="ic-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚘✨</div>
                    <h2 style={{ color: '#FFD400', marginBottom: '16px' }}>Intercity Booking Confirmed!</h2>
                    <p style={{ color: '#aaa', marginBottom: '32px', lineHeight: 1.6 }}>
                        Your intercity ride to <strong>{formData.destination}</strong> has been placed into the dispatch queue. 
                        We are finding the perfect premium driver for your trip.
                    </p>
                    <p style={{ color: '#fff', fontSize: '12px', marginBottom: '32px' }}>
                        You will be redirected automatically when a driver accepts the trip...
                    </p>
                    <button className="ic-btn-primary" onClick={() => navigate('/my-rides')}>
                        Go to My Rides
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="intercity-container">
            <div className="ic-main-column">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>Intercity</h1>
                    <p style={{ color: '#888', margin: 0 }}>Premium outstation travel. Comfort guaranteed.</p>
                </div>

                <PopularDestinations onSelect={(dest) => {
                    setFormData(prev => ({ ...prev, destination: dest }));
                    setTimeout(() => handleCalculateFare(), 100);
                }} />

                <IntercityBookingCard 
                    formData={formData}
                    setFormData={setFormData}
                    vehicles={vehicles}
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    onCalculateFare={handleCalculateFare}
                    onBook={handleBook}
                />
            </div>

            <div className="ic-right-panel">
                <IntercityMap 
                    pickup={formData.pickup} 
                    destination={formData.destination} 
                    distanceKm={formData.distanceKm} 
                />
                
                <LiveFareEstimator 
                    estimate={selectedVehicle} 
                    loading={loadingFare} 
                />
            </div>
        </div>
    );
}
