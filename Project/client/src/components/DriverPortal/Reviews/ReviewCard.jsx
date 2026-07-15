import React from 'react';
import { useDriver } from '../DriverContext';

const ReviewCard = ({ review }) => {
    const { selectedReview, setSelectedReview } = useDriver();
    const isActive = selectedReview && selectedReview._id === review._id;

    const passengerName = review.passengerId 
        ? `${review.passengerId.firstName} ${review.passengerId.lastName}`
        : 'Unknown Passenger';

    return (
        <div 
            className={`review-item ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedReview(review)}
        >
            <div className="review-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="star-rating">
                        {review.overallRating} <i className="fas fa-star"></i>
                    </div>
                    <strong style={{ color: '#fff', fontSize: '14px' }}>
                        {passengerName}
                    </strong>
                </div>
                <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                </span>
            </div>
            {review.review && (
                <div className="review-text-snippet">
                    "{review.review}"
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
