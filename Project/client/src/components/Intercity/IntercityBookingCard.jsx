import React from 'react';
import { motion } from 'framer-motion';

export default function IntercityBookingCard({
    formData,
    setFormData,
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    onCalculateFare,
    onBook
}) {
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTripType = (type) => {
        setFormData({ ...formData, tripType: type });
    };

    return (
        <div className="ic-card">
            <h2 className="ic-card-title">Book Intercity Trip</h2>

            <div className="ic-trip-types">
                {['One Way', 'Round Trip'].map(type => (
                    <div 
                        key={type}
                        className={`ic-trip-chip ${formData.tripType === type ? 'active' : ''}`}
                        onClick={() => handleTripType(type)}
                    >
                        {type}
                    </div>
                ))}
            </div>

            <div className="ic-form-row">
                <div className="ic-input-group">
                    <label>Pickup City</label>
                    <input 
                        className="ic-input" 
                        name="pickup"
                        placeholder="e.g. Mumbai"
                        value={formData.pickup}
                        onChange={handleInputChange}
                        onBlur={onCalculateFare}
                    />
                </div>
                <div className="ic-input-group">
                    <label>Destination</label>
                    <input 
                        className="ic-input" 
                        name="destination"
                        placeholder="e.g. Pune"
                        value={formData.destination}
                        onChange={handleInputChange}
                        onBlur={onCalculateFare}
                    />
                </div>
            </div>

            <div className="ic-form-row">
                <div className="ic-input-group">
                    <label>Departure Date</label>
                    <input 
                        type="date"
                        className="ic-input" 
                        name="departureDate"
                        value={formData.departureDate}
                        onChange={handleInputChange}
                    />
                </div>
                {formData.tripType === 'Round Trip' && (
                    <div className="ic-input-group">
                        <label>Return Date</label>
                        <input 
                            type="date"
                            className="ic-input" 
                            name="returnDate"
                            value={formData.returnDate}
                            onChange={(e) => {
                                handleInputChange(e);
                                onCalculateFare(); // Recalculate if dates change to add days
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="ic-form-row">
                <div className="ic-input-group">
                    <label>Passengers</label>
                    <input 
                        type="number"
                        min="1"
                        max="14"
                        className="ic-input" 
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="ic-input-group">
                    <label>Luggage (Bags)</label>
                    <input 
                        type="number"
                        min="0"
                        max="10"
                        className="ic-input" 
                        name="luggage"
                        value={formData.luggage}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            {vehicles && vehicles.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <label style={{ fontSize: '13px', color: '#a0a0a0', fontWeight: 600 }}>Select Vehicle Category</label>
                    <div className="ic-vehicle-grid">
                        {vehicles.map(v => (
                            <motion.div 
                                key={v.type}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`ic-vehicle-card ${selectedVehicle?.type === v.type ? 'active' : ''}`}
                                onClick={() => setSelectedVehicle(v)}
                            >
                                <div className="ic-vehicle-header">
                                    <span className="ic-vehicle-name">{v.label}</span>
                                    <span className="ic-vehicle-emoji">{v.emoji}</span>
                                </div>
                                <div className="ic-vehicle-fare">₹{v.estimatedTotal}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <button 
                className="ic-btn-primary" 
                onClick={onBook}
                disabled={!formData.pickup || !formData.destination || !selectedVehicle}
            >
                Confirm Booking
            </button>
        </div>
    );
}
