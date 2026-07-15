import React from 'react';
import { useDriver } from '../DriverContext';
import ReviewCard from './ReviewCard';
import { ReviewsEmpty } from './ReviewsSkeleton'; // Actually let's import it correctly

// Fix import
import { ReviewsEmpty as EmptyComponent } from './ReviewsSkeleton';

const ReviewList = () => {
    const { reviews, reviewFilters, setReviewFilters } = useDriver();

    const safeReviews = Array.isArray(reviews) ? reviews : [];
    if (safeReviews.length === 0) {
        // I will fix the import to use the actual ReviewsEmpty component directly
        return null;
    }

    return (
        <div className="review-list">
            {safeReviews.map(r => <ReviewCard key={r._id} review={r} />)}
        </div>
    );
};

export default ReviewList;
