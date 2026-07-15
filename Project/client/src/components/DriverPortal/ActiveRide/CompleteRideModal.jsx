import React, { useState } from 'react';
import { useDriver } from '../DriverContext';

const CompleteRideModal = ({ onClose }) => {
    const { completeRide, activeRide } = useDriver();
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = async () => {
        setIsCompleting(true);
        await completeRide();
        onClose();
    };

    return (
        <div className="active-ride-modal-overlay">
            <div className="active-ride-modal">
                <div className="modal-icon">
                    <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="modal-title">Complete Ride</h3>
                <p className="modal-desc">You have reached the destination. The estimated fare is <strong>${activeRide?.fare?.toFixed(2) || '0.00'}</strong>.</p>
                
                <div className="modal-actions">
                    <button className="modal-btn secondary" onClick={onClose} disabled={isCompleting}>
                        Cancel
                    </button>
                    <button className="modal-btn primary" onClick={handleComplete} disabled={isCompleting} style={{ background: '#00ff88', color: '#000' }}>
                        {isCompleting ? 'Completing...' : 'Confirm Drop-off'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompleteRideModal;
