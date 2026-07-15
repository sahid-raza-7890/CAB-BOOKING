import React from 'react';

export default function ScheduleBookingCard({ formData, setFormData, onBook, loading }) {
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (cat) => {
        setFormData({ ...formData, category: cat });
    };

    // Calculate minimum allowed datetime to prevent past scheduling
    const today = new Date();
    // Padding 1 hour from now minimum for scheduling
    today.setHours(today.getHours() + 1);
    const minDate = today.toISOString().split('T')[0];
    const minTime = today.toTimeString().slice(0, 5); // "HH:MM"

    return (
        <div className="sch-card">
            <h2 className="sch-card-title">Schedule a Ride</h2>

            <div className="sch-category-grid">
                {['City', 'Inter City', 'Rental'].map(cat => (
                    <div 
                        key={cat}
                        className={`sch-cat-card ${formData.category === cat ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(cat)}
                    >
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{cat}</span>
                    </div>
                ))}
            </div>

            <div className="sch-input-group">
                <label>Pickup Location</label>
                <input 
                    type="text" 
                    className="sch-input"
                    name="pickup"
                    value={formData.pickup}
                    onChange={handleChange}
                    placeholder="Where from?"
                />
            </div>

            {formData.category !== 'Rental' && (
                <div className="sch-input-group">
                    <label>Dropoff Location</label>
                    <input 
                        type="text" 
                        className="sch-input"
                        name="dropoff"
                        value={formData.dropoff}
                        onChange={handleChange}
                        placeholder="Where to?"
                    />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="sch-input-group">
                    <label>Pickup Date</label>
                    <input 
                        type="date" 
                        className="sch-input"
                        name="pickupDate"
                        min={minDate}
                        value={formData.pickupDate}
                        onChange={handleChange}
                    />
                </div>
                <div className="sch-input-group">
                    <label>Pickup Time</label>
                    <input 
                        type="time" 
                        className="sch-input"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="sch-input-group">
                <label>Vehicle Type</label>
                <select 
                    className="sch-input"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    style={{ appearance: 'none' }}
                >
                    <option value="Basic">Basic (Hatchback)</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                </select>
            </div>

            <div style={{ marginTop: '24px' }}>
                <button 
                    className="sch-btn-primary" 
                    onClick={onBook}
                    disabled={loading || !formData.pickup || (!formData.dropoff && formData.category !== 'Rental') || !formData.pickupDate || !formData.pickupTime}
                >
                    {loading ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
            </div>
        </div>
    );
}
