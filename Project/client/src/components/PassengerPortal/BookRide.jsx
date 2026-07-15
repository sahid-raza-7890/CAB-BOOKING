import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../LocationPicker'; // Re-use the existing LocationPicker
import FarePreview from '../FarePreview';
import AmenitySelector from '../dashboard/AmenitySelector';
import SpecializedServices from '../SpecializedServices';

export default function BookRide({ onSuccess }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState('Immediate');
  
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [metadata, setMetadata] = useState({
    flightNumber: '',
    isGuestBooking: false,
    guestName: '',
    guestPhone: ''
  });

  const [preferences, setPreferences] = useState({
    silent: false,
    temp: 'cool',
    music: 'none'
  });

  const distanceKm = pickup && dropoff ? 15.5 : 5; // Placeholder distance

  const goNext = () => {
    if (step === 1) {
      if (!pickup.trim()) { setError('Pickup location is required.'); return; }
      if (!dropoff.trim()) { setError('Drop-off location is required.'); return; }
    }
    if (step === 2) {
      if (!selectedVehicle) { setError('Please select a vehicle.'); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  const submitBooking = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    setError('');

    const payload = {
      type: bookingType,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      pickupCoords,
      dropoffCoords,
      vehicleId: selectedVehicle?.id || selectedVehicle?._id,
      vehicleType: selectedVehicle?.type || 'Basic',
      distanceKm,
      paymentMethod,
      notes,
      preferences,
      ...metadata
    };

    try {
      const res = await fetch('http://localhost:5000/api/rides/request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        if (onSuccess) onSuccess(data.ride);
      } else {
        setError(data.error || 'Booking failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pp-glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ color: '#FFD400', fontSize: '24px', marginBottom: '16px' }}>Ride Booked!</h2>
        <p style={{ color: '#ccc', marginBottom: '24px' }}>Your driver will be assigned shortly.</p>
        <button className="pp-btn" onClick={() => navigate('/my-rides')} style={{ margin: '0 auto' }}>
          View My Rides
        </button>
      </div>
    );
  }

  return (
    <div className="pp-glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>
        Book a Ride
      </h2>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="pp-booking-form">
          <LocationPicker 
            id="book-pickup" 
            icon="📍" 
            label="Pickup Location" 
            placeholder="Enter pickup address…" 
            value={pickup} 
            onChange={setPickup} 
            onCoords={setPickupCoords} 
          />
          
          <LocationPicker 
            id="book-dropoff" 
            icon="🏁" 
            label="Drop-off Location" 
            placeholder="Enter destination…" 
            value={dropoff} 
            onChange={setDropoff} 
            onCoords={setDropoffCoords} 
          />
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="pp-btn" onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="pp-booking-form">
          <SpecializedServices 
            bookingType={bookingType} 
            metadata={metadata} 
            onChangeMetadata={setMetadata} 
          />

          <FarePreview 
            distanceKm={distanceKm} 
            bookingType={bookingType} 
            onSelectVehicle={setSelectedVehicle} 
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="pp-btn-secondary" style={{ padding: '12px', borderRadius: '10px' }} onClick={() => setStep(1)}>Back</button>
            <button className="pp-btn" style={{ flex: 1 }} onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="pp-booking-form">
          <div className="pp-input-group">
            <label className="pp-label">Payment Method</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Cash', 'Card', 'Wallet'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: paymentMethod === method ? 'rgba(255,212,0,0.1)' : 'rgba(255,255,255,0.05)',
                    border: paymentMethod === method ? '1px solid #FFD400' : '1px solid rgba(255,255,255,0.1)',
                    color: paymentMethod === method ? '#FFD400' : '#fff',
                    cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <AmenitySelector prefs={preferences} setPrefs={setPreferences} />

          <div className="pp-input-group" style={{ marginTop: '16px' }}>
            <label className="pp-label">Notes (Optional)</label>
            <textarea 
              className="pp-input" 
              placeholder="Instructions for driver..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              rows={3} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="pp-btn-secondary" style={{ padding: '12px', borderRadius: '10px' }} onClick={() => setStep(2)}>Back</button>
            <button 
              className="pp-btn" 
              style={{ flex: 1 }} 
              onClick={submitBooking} 
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
