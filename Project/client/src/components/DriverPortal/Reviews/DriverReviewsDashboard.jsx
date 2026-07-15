import React, { useEffect, useCallback } from 'react';
import { useDriver } from '../DriverContext';
import DriverReviewService from '../../../services/driverReviewService';
import './Reviews.css';

import RatingSummary from './RatingSummary';
import RatingDistribution from './RatingDistribution';
import CategoryRatings from './CategoryRatings';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';
import ReviewList from './ReviewList';
import ReviewDetails from './ReviewDetails';
import { ReviewsSkeleton, ReviewsEmpty } from './ReviewsSkeleton';

const DriverReviewsDashboard = () => {
    const { 
        reviews, setReviews, 
        reviewFilters, 
        setReviewSummary,
        loadingReviews, setLoadingReviews 
    } = useDriver();

    const fetchSummary = useCallback(async () => {
        try {
            const res = await DriverReviewService.getSummary();
            if (res.success) {
                setReviewSummary(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch review summary', err);
        }
    }, [setReviewSummary]);

    const fetchReviews = useCallback(async () => {
        setLoadingReviews(true);
        try {
            const res = await DriverReviewService.getReviews(reviewFilters);
            if (res.success) {
                setReviews(res.reviews);
            }
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoadingReviews(false);
        }
    }, [reviewFilters, setReviews, setLoadingReviews]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const safeReviews = Array.isArray(reviews) ? reviews : [];

    if (loadingReviews && safeReviews.length === 0) {
        return <ReviewsSkeleton />;
    }

    return (
        <div className="reviews-dashboard">
            <RatingSummary />
            
            <div className="reviews-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="review-panel">
                        <h4 className="section-title">Review History</h4>
                        <div className="filter-bar">
                            <SearchBar />
                            <FilterPanel />
                        </div>
                        {safeReviews.length > 0 ? (
                            <ReviewList />
                        ) : (
                            <ReviewsEmpty hasFilters={reviewFilters.search || reviewFilters.rating} />
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <ReviewDetails />
                    
                    <div className="review-panel">
                        <RatingDistribution />
                        <CategoryRatings />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverReviewsDashboard;
