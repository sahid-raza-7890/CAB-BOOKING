import React from 'react';
import { useDriver } from '../DriverContext';

const ReceiptModal = () => {
    const { activeRide, clearActiveRide } = useDriver();

    return (
        <div className="active-ride-modal-overlay">
            <div className="active-ride-modal" style={{ width: '400px' }}>
                <div className="modal-icon" style={{ background: '#00ff88', color: '#000' }}>
                    <i className="fas fa-receipt"></i>
                </div>
                <h3 className="modal-title">Ride Completed!</h3>
                <p className="modal-desc" style={{ marginBottom: '20px' }}>Please collect cash from the passenger.</p>
                
                <div style={{ background: 'var(--card-bg-light)', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Passenger:</span>
                        <span style={{ fontWeight: 'bold' }}>{activeRide?.passengerName || 'Passenger'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                        <span style={{ fontWeight: 'bold' }}>{activeRide?.paymentMethod || 'Cash'}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '15px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Fare:</span>
                        <span style={{ fontWeight: 'bold', color: '#00ff88' }}>₹{activeRide?.fare?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                        className="modal-btn primary" 
                        onClick={clearActiveRide} 
                        style={{ background: '#00ff88', color: '#000', width: '100%' }}
                    >
                        Payment Collected
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
