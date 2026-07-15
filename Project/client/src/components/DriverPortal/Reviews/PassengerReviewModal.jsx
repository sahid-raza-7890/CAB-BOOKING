import React, { useState } from 'react';
import DriverReviewService from '../../../services/driverReviewService';

const PassengerReviewModal = ({ rideId, onClose }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await DriverReviewService.submitPassengerReview(rideId, { rating: 5 });
            setStatus({ type: response.success ? 'success' : 'info', message: response.message });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="review-panel" style={{ width: '400px', maxWidth: '90%' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Rate Passenger</h3>
                
                {status ? (
                    <div style={{ 
                        padding: '16px', borderRadius: '8px', marginBottom: '16px',
                        background: status.type === 'error' ? 'rgba(255,68,68,0.1)' : 'rgba(251, 191, 36, 0.1)',
                        color: status.type === 'error' ? '#ff4444' : '#fbbf24'
                    }}>
                        {status.message}
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        Submit a rating for this passenger. (Note: Currently implementing placeholder flow per requirements).
                    </p>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={onClose}
                        style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        {status ? 'Close' : 'Cancel'}
                    </button>
                    {!status && (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ padding: '10px 16px', background: '#fbbf24', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {loading ? 'Submitting...' : 'Submit 5-Star'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PassengerReviewModal;
