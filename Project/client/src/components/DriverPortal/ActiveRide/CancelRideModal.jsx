import React, { useState } from 'react';
import { useDriver } from '../DriverContext';

const CancelRideModal = ({ onClose }) => {
    const { cancelRide } = useDriver();
    const [reason, setReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const reasons = [
        "Passenger no-show",
        "Vehicle issue",
        "Too much traffic",
        "Other"
    ];

    const handleCancel = async () => {
        if (!reason) return;
        setIsCancelling(true);
        await cancelRide(reason);
        onClose();
    };

    return (
        <div className="active-ride-modal-overlay">
            <div className="active-ride-modal">
                <div className="modal-icon danger">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="modal-title">Cancel Ride?</h3>
                <p className="modal-desc">Are you sure you want to cancel this ride? Please select a reason.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {reasons.map((r, i) => (
                        <div 
                            key={i}
                            onClick={() => setReason(r)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: reason === r ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${reason === r ? '#ff4444' : 'rgba(255,255,255,0.1)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: `2px solid ${reason === r ? '#ff4444' : '#999'}`,
                                marginRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {reason === r && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff4444' }} />}
                            </div>
                            <span style={{ color: reason === r ? '#fff' : '#eee', fontSize: '15px' }}>{r}</span>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button className="modal-btn secondary" onClick={onClose} disabled={isCancelling}>
                        Back
                    </button>
                    <button 
                        className="modal-btn danger" 
                        onClick={handleCancel} 
                        disabled={isCancelling || !reason} 
                        style={{ background: reason ? '#ff4444' : '#555', color: '#fff', cursor: reason ? 'pointer' : 'not-allowed' }}
                    >
                        {isCancelling ? 'Cancelling...' : 'Cancel Ride'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelRideModal;
