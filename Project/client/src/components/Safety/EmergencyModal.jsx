import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import safetyService from '../../services/safetyService';

export default function EmergencyModal({ rideId, onClose, onSuccess }) {
    const [alertType, setAlertType] = useState('SOS');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(5); // Auto-trigger SOS after 5 seconds if not cancelled
    
    const alertTypes = [
        'SOS', 'Emergency', 'UnsafeDriving', 'Medical', 'Harassment', 'Accident', 'VehicleIssue', 'Other'
    ];

    // Optional Auto-trigger for pure SOS
    useEffect(() => {
        if (alertType !== 'SOS' || submitting) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [alertType, submitting]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            
            // Get mock location (Bengaluru)
            const loc = { latitude: 12.9716, longitude: 77.5946, address: 'Current Location' };

            await safetyService.createAlert({
                rideId,
                alertType,
                description,
                currentLocation: loc
            });
            onSuccess();
        } catch (error) {
            alert(error.message || 'Failed to trigger alert');
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ border: '2px solid #ef4444' }}
            >
                <div className="modal-header" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <h2 style={{ margin: 0, color: '#ef4444' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Trigger Safety Alert
                    </h2>
                </div>

                <div className="modal-body">
                    {alertType === 'SOS' && (
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '4rem', color: '#ef4444', fontWeight: 'bold' }}>
                                {countdown}
                            </div>
                            <p style={{ color: '#ccc' }}>Auto-triggering SOS...</p>
                        </div>
                    )}

                    <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Select Alert Type</label>
                    <select 
                        className="form-control" 
                        value={alertType} 
                        onChange={(e) => {
                            setAlertType(e.target.value);
                            setCountdown(0); // Cancel auto if they interact
                        }}
                    >
                        {alertTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', marginTop: '1rem' }}>Additional Details (Optional)</label>
                    <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Provide details if safe to do so..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button className="btn-danger" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Triggering...' : 'TRIGGER NOW'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
