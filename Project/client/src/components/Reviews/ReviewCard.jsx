import React, { useState } from 'react';
import RatingStars from './RatingStars';
import ReviewModal from './ReviewModal';

export default function ReviewCard({ review, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);

    const date = new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="driver-info">
                    <div className="driver-avatar">
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{review.driverId?.name || 'Driver'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{date}</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <RatingStars rating={review.overallRating} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setIsEditing(true)}>
                            <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button className="btn-danger-outline" onClick={() => onDelete(review._id)}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>

            {review.review && (
                <div className="review-text">
                    "{review.review}"
                </div>
            )}

            {review.tags && review.tags.length > 0 && (
                <div className="review-tags">
                    {review.tags.map(tag => (
                        <span key={tag} className="tag-badge selected">{tag}</span>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#888' }}>
                Ride details: {typeof review.rideId?.pickupLocation === 'object' ? review.rideId?.pickupLocation?.address || 'Unknown' : review.rideId?.pickupLocation} to {typeof review.rideId?.dropoffLocation === 'object' ? review.rideId?.dropoffLocation?.address || 'Unknown' : review.rideId?.dropoffLocation}
            </div>

            {isEditing && (
                <ReviewModal 
                    rideId={review.rideId?._id || review.rideId}
                    driver={review.driverId}
                    existingReview={review}
                    onClose={() => {
                        setIsEditing(false);
                        window.location.reload(); // Simplest way to refresh data for now
                    }}
                />
            )}
        </div>
    );
}
