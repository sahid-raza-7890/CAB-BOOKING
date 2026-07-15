import React from 'react';
import DriverPreferenceService from '../../../services/driverPreferenceService';
import { useDriver } from '../DriverContext';

const ResetPreferencesModal = ({ onClose }) => {
    const { setPreferences } = useDriver();

    const handleConfirm = async () => {
        try {
            const data = await DriverPreferenceService.resetPreferences();
            setPreferences(data);
            onClose();
        } catch (error) {
            console.error('Failed to reset preferences:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Reset Settings?</h3>
                <p>Are you sure you want to reset all preferences to their defaults? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button className="btn-primary" onClick={onClose} style={{ background: '#333', color: '#fff' }}>Cancel</button>
                    <button className="btn-danger" onClick={handleConfirm}>Reset Settings</button>
                </div>
            </div>
        </div>
    );
};

export default ResetPreferencesModal;
