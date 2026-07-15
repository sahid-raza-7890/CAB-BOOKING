import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as rentalService from '../../services/rentalService';
import { useRideSocket } from '../../hooks/useRideSocket';
import './Rentals.css';

import RentalBookingCard from './RentalBookingCard';
import LiveFareEstimator from './LiveFareEstimator';
import RentalMap from './RentalMap';

export default function RentalsModule() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pickup: '',
        pickupTime: '',
        packageType: '2 Hrs / 20 km',
        hours: 2,
        includedDistance: 20
    });

    const [loadingFare, setLoadingFare] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookedRideId, setBookedRideId] = useState(null);

    useRideSocket((data) => {
        if (data.status === 'Accepted' && bookedRideId === data.rideId) {
            navigate(`/live/${data.rideId}`);
        }
    });

    // Auto-calculate fare when hours change
    useEffect(() => {
        handleCalculateFare();
    }, [formData.hours]);

    const handleCalculateFare = async () => {
        setLoadingFare(true);
        try {
            const data = await rentalService.getRentalFareEstimate({
                hours: formData.hours
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
            const isScheduled = !!formData.pickupTime;
            const rideType = 'Rental'; // Let the backend handle logic

            const res = await fetch('http://localhost:5000/api/rides/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'))}`
                },
                body: JSON.stringify({
                    type: rideType,
                    pickupLocation: formData.pickup,
                    vehicleType: selectedVehicle.type,
                    paymentMethod: 'Cash',
                    scheduledTime: isScheduled ? new Date(formData.pickupTime).toISOString() : undefined,
                    rentalDurationHours: formData.hours, // Fallback for legacy systems
                    rental: {
                        packageType: formData.packageType,
                        hours: formData.hours,
                        includedDistance: formData.includedDistance,
                        overtimeRate: selectedVehicle.overtimeRate,
                        extraDistanceRate: selectedVehicle.extraDistanceRate
                    },
                    fareBreakdown: selectedVehicle.breakdown
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBookedRideId(data.ride._id);
                setBookingSuccess(true);
            } else {
                console.error('Booking failed server-side');
            }
        } catch (err) {
            console.error('Booking failed:', err);
        }
    };

    if (bookingSuccess) {
        return (
            <div className="rentals-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="rn-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳🔑</div>
                    <h2 style={{ color: '#22C55E', marginBottom: '16px' }}>Rental Booking Confirmed!</h2>
                    <p style={{ color: '#aaa', marginBottom: '32px', lineHeight: 1.6 }}>
                        Your {formData.packageType} rental has been placed into the dispatch queue. 
                        We are finding the perfect premium driver for your booking.
                    </p>
                    <p style={{ color: '#fff', fontSize: '12px', marginBottom: '32px' }}>
                        You will be redirected automatically when a driver accepts...
                    </p>
                    <button className="rn-btn-primary" onClick={() => navigate('/my-rides')}>
                        Go to My Rides
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rentals-container">
            <div className="rn-main-column">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0', color: '#22C55E' }}>Rentals</h1>
                    <p style={{ color: '#888', margin: 0 }}>Keep a car and driver for hours. Multiple stops, no stress.</p>
                </div>

                <RentalBookingCard 
                    formData={formData}
                    setFormData={setFormData}
                    vehicles={vehicles}
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    onCalculateFare={handleCalculateFare}
                    onBook={handleBook}
                />
            </div>

            <div className="rn-right-panel">
                <RentalMap 
                    pickup={formData.pickup} 
                    includedDistance={formData.includedDistance} 
                />
                
                <LiveFareEstimator 
                    estimate={selectedVehicle} 
                    loading={loadingFare} 
                />
            </div>
        </div>
    );
}
