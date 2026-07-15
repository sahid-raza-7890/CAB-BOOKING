import React from 'react';
import { useDriver } from '../DriverContext';

const ReviewDetails = () => {
    const { selectedReview, setSelectedReview } = useDriver();

    if (!selectedReview) {
        return (
            <div className="review-panel" style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="analytics-icon" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px' }}>
                    <i className="fas fa-hand-pointer"></i>
                </div>
                <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>Select a Review</h3>
                <p style={{ color: '#94a3b8', margin: 0 }}>Click on a review to see the full details here.</p>
            </div>
        );
    }

    const passengerName = selectedReview.passengerId 
        ? `${selectedReview.passengerId.firstName} ${selectedReview.passengerId.lastName}`
        : 'Unknown Passenger';

    const safeTags = Array.isArray(selectedReview.tags) ? selectedReview.tags : [];

    return (
        <div className="review-panel" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="analytics-icon" style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)' }}>
                        <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '20px' }}>{passengerName}</h3>
                        <div className="star-rating large">
                            {selectedReview.overallRating} <i className="fas fa-star" style={{ fontSize: '20px' }}></i>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedReview(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                <h4 style={{ color: '#fbbf24', margin: '0 0 12px 0', fontSize: '14px' }}>Passenger's Feedback</h4>
                {selectedReview.review ? (
                    <p style={{ color: '#e2e8f0', margin: 0, lineHeight: 1.6 }}>"{selectedReview.review}"</p>
                ) : (
                    <p style={{ color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>No written feedback provided.</p>
                )}
            </div>

            {safeTags.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#fbbf24', margin: '0 0 12px 0', fontSize: '14px' }}>Tags</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {safeTags.map((tag, idx) => (
                            <span key={idx} style={{ 
                                background: 'rgba(251, 191, 36, 0.1)', 
                                color: '#fbbf24', 
                                padding: '6px 12px', 
                                borderRadius: '16px', 
                                fontSize: '12px' 
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: '#fbbf24', margin: '0 0 12px 0', fontSize: '14px' }}>Ride Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
                    <span>Date: {new Date(selectedReview.createdAt).toLocaleString()}</span>
                    {selectedReview.rideId && selectedReview.rideId.fare && (
                        <span>Fare: ${selectedReview.rideId.fare.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewDetails;
