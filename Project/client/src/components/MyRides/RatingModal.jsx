import React, { useState } from 'react';
import * as rideService from '../../services/rideService';

function RatingModal({ rideId, onClose }) {
    const [driverRating, setDriverRating] = useState(0);
    const [vehicleRating, setVehicleRating] = useState(0);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (driverRating === 0 || vehicleRating === 0) {
            alert("Please provide both driver and vehicle ratings.");
            return;
        }
        setSubmitting(true);
        try {
            await rideService.rateRide(rideId, { driverRating, vehicleRating, text, suggestions: [] });
            alert("Thank you for your feedback!");
            onClose();
        } catch (err) {
            alert(err.message || "Error submitting rating.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, setRating) => (
        <div className="mr-stars">
            {[1, 2, 3, 4, 5].map(star => (
                <span 
                    key={star} 
                    className={`mr-star ${star <= rating ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                >
                    ★
                </span>
            ))}
        </div>
    );

    return (
        <div className="mr-modal-overlay" onClick={onClose}>
            <div className="mr-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <button className="mr-modal-close" onClick={onClose}>✕</button>
                <div className="mr-modal-header" style={{ borderBottom: 'none', textAlign: 'center', paddingBottom: 0 }}>
                    <h2>Rate Your Ride</h2>
                    <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>Your feedback helps us improve.</p>
                </div>
                <div className="mr-modal-body">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>Rate the Driver</div>
                        {renderStars(driverRating, setDriverRating)}
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>Rate the Vehicle</div>
                        {renderStars(vehicleRating, setVehicleRating)}
                    </div>
                    
                    <textarea 
                        className="mr-rating-textarea" 
                        placeholder="Tell us more about your experience (optional)..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    
                    <button 
                        className="mr-btn mr-btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RatingModal;
