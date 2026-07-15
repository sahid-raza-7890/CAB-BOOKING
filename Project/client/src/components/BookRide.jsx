import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import LocationPicker from './LocationPicker';
import SpecializedServices from './SpecializedServices';
import FarePreview from './FarePreview';
import AmenitySelector from './dashboard/AmenitySelector';

// ─── BOOKING TYPE CONFIG ──────────────────────────────────────────────────────
const BOOKING_TYPES = [
  { id: 'Immediate', icon: '🚖', label: 'Ride Now', desc: 'Pick up in minutes' },
  { id: 'Scheduled', icon: '📅', label: 'Book Later', desc: 'Schedule ahead' },
  { id: 'Rental', icon: '🔑', label: 'Rentals', desc: 'Hire by the hour' },
  { id: 'Airport Transfer', icon: '✈️', label: 'Airport', desc: 'Flight tracking' },
  { id: 'Inter City', icon: '🛣️', label: 'Outstation', desc: 'City to city rides' },
  { id: 'Personal Driver', icon: '👔', label: 'Personal Driver', desc: 'Hire a driver' },
  { id: 'Package', icon: '📦', label: 'Package', desc: 'Send a parcel' },
];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Route', 'Details', 'Confirm'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? 'var(--primary-accent)' : active ? 'var(--primary-accent)' : 'var(--card-border)',
                color: (done || active) ? 'var(--primary-text)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15,
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 0 0 4px rgba(40,167,69,0.2)' : 'none'
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 11, color: active ? 'var(--primary-accent)' : 'var(--text-muted)', fontWeight: active ? 700 : 500 }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 8px 18px',
                background: step > num ? 'var(--primary-accent)' : 'var(--card-border)',
                transition: 'background 0.3s ease'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
function Field({ icon, label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'var(--bg-color)',
  border: '1px solid var(--card-border)',
  borderRadius: 10, fontSize: 14,
  color: 'var(--text-main)', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BookRide({ preselectedVehicle = null, prefillData = null, onSuccess }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // ── Step state ──
  const [step, setStep] = useState(1);

  // ── Form state ──
  const [bookingType, setBookingType] = useState('Immediate');
  const [scheduledTime, setScheduledTime] = useState('');
  const [rentalHours, setRentalHours] = useState(2);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [intermediateStops, setIntermediateStops] = useState([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle);
  
  // Phase 2 Metadata
  const [metadata, setMetadata] = useState({
    flightNumber: '',
    isGuestBooking: false,
    guestName: '',
    guestPhone: ''
  });

  // Phase 4 Preferences
  const [preferences, setPreferences] = useState({
    silent: false,
    temp: 'cool',
    music: 'none'
  });

  // ── UI state ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookedRide, setBookedRide] = useState(null);

  useEffect(() => {
    if (preselectedVehicle) setSelectedVehicle(preselectedVehicle);
  }, [preselectedVehicle]);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.pickup) setPickup(prefillData.pickup);
      if (prefillData.dropoff) setDropoff(prefillData.dropoff);
      if (prefillData.paymentMethod) setPaymentMethod(prefillData.paymentMethod);
      if (prefillData.bookingType) setBookingType(prefillData.bookingType);
      if (prefillData.isGuestBooking) setMetadata(m => ({ ...m, isGuestBooking: true }));
      if (prefillData.vehicleType && !preselectedVehicle) {
        // Simple mapping from type name to a pseudo-object just to display the label.
        // A complete implementation would fetch the correct vehicle ID from the backend.
        setSelectedVehicle({ label: prefillData.vehicleType });
      }
    }
  }, [prefillData, preselectedVehicle]);

  const clearError = () => setError('');
  const minScheduledTime = () => new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16);

  // ── Intermediate Stops ──
  const addStop = () => {
    if (intermediateStops.length < 3) {
      setIntermediateStops([...intermediateStops, '']);
    }
  };
  const updateStop = (idx, val) => {
    const newStops = [...intermediateStops];
    newStops[idx] = val;
    setIntermediateStops(newStops);
  };
  const removeStop = (idx) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== idx));
  };

  // ── Step navigation ──
  const goNext = () => {
    if (step === 1) {
      if (!pickup.trim() && bookingType !== 'Personal Driver') {
        setError('Pickup location is required.'); return;
      }
      if (!dropoff.trim() && bookingType !== 'Rental') {
        setError('Drop-off location is required.'); return;
      }
    }
    if (step === 2) {
      if (bookingType === 'Scheduled' && !scheduledTime) {
        setError('Please select a date/time.'); return;
      }
      if (metadata.isGuestBooking && (!metadata.guestName || !metadata.guestPhone)) {
        setError('Guest name and phone are required.'); return;
      }
      // Clear selected vehicle to force re-selection in step 3
      setSelectedVehicle(null);
    }
    clearError();
    setStep(s => s + 1);
  };

  const goBack = () => {
    clearError();
    setStep(s => s - 1);
  };

  // Calculate fake distance for demo
  const distanceKm = pickup && dropoff ? 15.5 : 5; 

  // ── Submit ──
  const submitBooking = async () => {
    if (!token) { navigate('/login'); return; }
    if (!selectedVehicle) {
      setError('Please select a vehicle tier.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      type: bookingType,
      scheduledTime: bookingType === 'Scheduled' ? scheduledTime : undefined,
      rentalDurationHours: bookingType === 'Rental' ? Number(rentalHours) : undefined,
      pickupLocation: pickup,
      dropoffLocation: bookingType !== 'Rental' ? dropoff : undefined,
      intermediateStops: intermediateStops.filter(s => s.trim()),
      pickupCoords: pickupCoords || undefined,
      dropoffCoords: dropoffCoords || undefined,
      vehicleId: selectedVehicle.id || selectedVehicle._id,
      vehicleType: selectedVehicle.type || 'Basic',
      distanceKm,
      paymentMethod,
      notes,
      preferences,
      ...metadata
    };

    try {
      const res = await fetch('http://localhost:5000/api/rides/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setBookedRide(data.ride);
        setSuccess(true);
        onSuccess?.(data.ride);
      } else {
        setError(data.error || 'Booking failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (success && bookedRide) {
    return (
      <div className="premium-glass" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>Ride Booked!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your driver will be assigned shortly.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/my-rides')} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--primary-accent)', color: 'var(--primary-text)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>📦 My Rides</button>
          <button onClick={() => { setSuccess(false); setStep(1); }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontWeight: 600, cursor: 'pointer' }}>+ Book Another</button>
        </div>
      </div>
    );
  }

  return (
    <div id="book-ride-form" className="premium-glass" style={{ padding: '32px 28px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>🚖 Book Your Ride</h2>
      </div>

      <StepBar step={step} />

      {error && <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13 }}>⚠️ {error}</div>}

      {/* ─── STEP 1: Route & Type ─── */}
      {step === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {BOOKING_TYPES.map(bt => {
              const active = bookingType === bt.id;
              return (
                <button
                  key={bt.id}
                  onClick={() => { setBookingType(bt.id); clearError(); }}
                  style={{
                    padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                    border: active ? '2px solid var(--primary-accent)' : '1px solid var(--card-border)',
                    background: active ? 'var(--badge-bg)' : 'var(--card-bg)',
                    textAlign: 'center', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{bt.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--primary-accent)' : 'var(--text-main)' }}>{bt.label}</div>
                </button>
              );
            })}
          </div>

          <LocationPicker id="book-pickup" icon="📍" label="Pickup Location" placeholder="Enter pickup address…" value={pickup} onChange={setPickup} onCoords={setPickupCoords} autoFocus />

          {intermediateStops.map((stop, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <LocationPicker id={`stop-${i}`} icon="⏸️" placeholder={`Stop ${i + 1}`} value={stop} onChange={(val) => updateStop(i, val)} />
              </div>
              <button onClick={() => removeStop(i)} style={{ padding: '0 12px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: '#ef4444', cursor: 'pointer' }}>✖</button>
            </div>
          ))}

          {bookingType !== 'Rental' && intermediateStops.length < 3 && (
            <button onClick={addStop} style={{ marginTop: 12, padding: '8px 16px', background: 'transparent', border: '1px dashed var(--primary-accent)', color: 'var(--primary-accent)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, width: '100%' }}>+ Add Stop</button>
          )}

          {bookingType !== 'Rental' && (
            <div style={{ marginTop: 16 }}>
              <LocationPicker id="book-dropoff" icon="🏁" label="Drop-off Location" placeholder="Enter destination…" value={dropoff} onChange={setDropoff} onCoords={setDropoffCoords} />
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2: Details ─── */}
      {step === 2 && (
        <div>
          {bookingType === 'Scheduled' && (
            <Field icon="🗓️" label="Date & Time">
              <input type="datetime-local" value={scheduledTime} min={minScheduledTime()} onChange={e => setScheduledTime(e.target.value)} style={{ ...inputStyle, colorScheme: 'inherit' }} />
            </Field>
          )}
          {bookingType === 'Rental' && (
            <Field icon="⏱️" label="Rental Duration (Hours)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setRentalHours(Math.max(1, rentalHours - 1))} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: 20 }}>−</button>
                <div style={{ flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 900, color: 'var(--primary-accent)' }}>{rentalHours}h</div>
                <button onClick={() => setRentalHours(Math.min(12, rentalHours + 1))} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: 20 }}>+</button>
              </div>
            </Field>
          )}
          
          <SpecializedServices bookingType={bookingType} metadata={metadata} onChangeMetadata={setMetadata} />
          
          <Field icon="📝" label="Notes (Optional)">
            <textarea placeholder="Instructions for driver..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', marginTop: 16 }} />
          </Field>
        </div>
      )}

      {/* ─── STEP 3: Confirm & Pay ─── */}
      {step === 3 && (
        <div>
          <FarePreview distanceKm={distanceKm} bookingType={bookingType} onSelectVehicle={setSelectedVehicle} />

          <div style={{ marginTop: 24 }}>
            <Field icon="💳" label="Payment Method">
              <div style={{ display: 'flex', gap: 8 }}>
                {['Cash', 'Card', 'Wallet', 'UPI'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1, padding: '9px 4px', borderRadius: 8, cursor: 'pointer',
                      border: paymentMethod === method ? '2px solid var(--primary-accent)' : '1px solid var(--card-border)',
                      background: paymentMethod === method ? 'var(--badge-bg)' : 'var(--card-bg)',
                      color: paymentMethod === method ? 'var(--primary-accent)' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 700, transition: 'all 0.2s'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          
          {/* External Amenity Selector */}
          <AmenitySelector prefs={preferences} setPrefs={setPreferences} />
          
        </div>
      )}

      {/* ─── NAV BUTTONS ─── */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {step > 1 && (
          <button onClick={goBack} disabled={loading} style={{ padding: '13px 24px', borderRadius: 10, background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Back</button>
        )}
        {step < 3 ? (
          <button onClick={goNext} style={{ flex: 1, padding: '13px 0', borderRadius: 10, background: 'var(--primary-accent)', color: 'var(--primary-text)', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Continue →</button>
        ) : (
          <button onClick={submitBooking} disabled={loading || !selectedVehicle} style={{ flex: 1, padding: '13px 0', borderRadius: 10, background: (loading || !selectedVehicle) ? 'var(--card-border)' : 'var(--primary-accent)', color: 'var(--primary-text)', border: 'none', fontWeight: 700, fontSize: 15, cursor: (loading || !selectedVehicle) ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Booking…' : '✅ Confirm Ride'}
          </button>
        )}
      </div>
    </div>
  );
}
