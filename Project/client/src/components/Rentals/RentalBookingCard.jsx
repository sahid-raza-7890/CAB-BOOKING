import React from 'react';
import { motion } from 'framer-motion';

const PACKAGES = [
    { hours: 1, km: 10, label: '1 Hr / 10 km' },
    { hours: 2, km: 20, label: '2 Hrs / 20 km' },
    { hours: 4, km: 40, label: '4 Hrs / 40 km' },
    { hours: 6, km: 60, label: '6 Hrs / 60 km' },
    { hours: 8, km: 80, label: '8 Hrs / 80 km' },
];

export default function RentalBookingCard({
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

    const handlePackageSelect = (pkg) => {
        setFormData({ 
            ...formData, 
            hours: pkg.hours, 
            includedDistance: pkg.km, 
            packageType: pkg.label 
        });
        setTimeout(onCalculateFare, 100);
    };

    return (
        <div className="rn-card">
            <h2 className="rn-card-title">Book a Rental</h2>

            <div className="rn-form-row">
                <div className="rn-input-group">
                    <label>Pickup Location</label>
                    <input 
                        className="rn-input" 
                        name="pickup"
                        placeholder="Where do we pick you up?"
                        value={formData.pickup}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="rn-form-row">
                <div className="rn-input-group">
                    <label>Pickup Date & Time</label>
                    <input 
                        type="datetime-local"
                        className="rn-input" 
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <label style={{ fontSize: '13px', color: '#a0a0a0', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                    Select Package
                </label>
                <div className="rn-package-scroll">
                    {PACKAGES.map(pkg => (
                        <div 
                            key={pkg.label}
                            className={`rn-package-chip ${formData.packageType === pkg.label ? 'active' : ''}`}
                            onClick={() => handlePackageSelect(pkg)}
                        >
                            <div className="rn-pkg-hrs">{pkg.hours} {pkg.hours === 1 ? 'Hr' : 'Hrs'}</div>
                            <div className="rn-pkg-km">{pkg.km} km</div>
                        </div>
                    ))}
                </div>
            </div>

            {vehicles && vehicles.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <label style={{ fontSize: '13px', color: '#a0a0a0', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                        Select Vehicle Category
                    </label>
                    <div className="rn-vehicle-grid">
                        {vehicles.map(v => (
                            <motion.div 
                                key={v.type}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`rn-vehicle-card ${selectedVehicle?.type === v.type ? 'active' : ''}`}
                                onClick={() => setSelectedVehicle(v)}
                            >
                                <div className="rn-vehicle-header">
                                    <span className="rn-vehicle-name">{v.label}</span>
                                    <span style={{ fontSize: '24px' }}>{v.emoji}</span>
                                </div>
                                <div className="rn-vehicle-fare">₹{v.estimatedTotal}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <button 
                className="rn-btn-primary" 
                onClick={onBook}
                disabled={!formData.pickup || !formData.packageType || !selectedVehicle}
            >
                Confirm Rental Booking
            </button>
        </div>
    );
}
