import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SavedPlaceModal({ initialData, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        label: '',
        address: '',
        type: 'Custom',
        latitude: 0, // Mock default
        longitude: 0,
        isDefault: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                label: initialData.label || '',
                address: initialData.address || '',
                type: initialData.type || 'Custom',
                latitude: initialData.latitude || 0,
                longitude: initialData.longitude || 0,
                isDefault: initialData.isDefault || false
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app with Maps API, we'd geocode the address to lat/lng here
        // if it wasn't selected from a Places autocomplete.
        // For now, we submit as is (using mock lat/lng).
        
        const payload = {
            ...formData,
            latitude: formData.latitude === 0 ? 12.9716 : formData.latitude,
            longitude: formData.longitude === 0 ? 77.5946 : formData.longitude,
            source: 'Manual'
        };
        
        // Auto set label if type is Home or Work
        if (payload.type === 'Home') payload.label = 'Home';
        if (payload.type === 'Work') payload.label = 'Work';

        onSubmit(payload);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#e5b05c' }}>
                        {initialData && initialData._id && initialData.type !== 'Recent' ? 'Edit Location' : 'Save Location'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Location Type</label>
                        <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Favorite">Favorite</option>
                            <option value="Custom">Custom Label</option>
                        </select>
                    </div>

                    {(formData.type === 'Custom' || formData.type === 'Favorite') && (
                        <div className="form-group">
                            <label>Label</label>
                            <input 
                                type="text" 
                                name="label"
                                className="form-control" 
                                placeholder="e.g. Gym, Airport, Mom's House" 
                                value={formData.label}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Address</label>
                        {/* A real app would use a Places Autocomplete component here */}
                        <input 
                            type="text" 
                            name="address"
                            className="form-control" 
                            placeholder="Enter full address" 
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            id="isDefault" 
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isDefault" style={{ margin: 0, cursor: 'pointer' }}>Set as default location</label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Save Location
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
