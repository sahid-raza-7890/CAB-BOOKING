import React from 'react';
import { useDriver } from '../DriverContext';

const RatingSummary = () => {
    const { reviewSummary } = useDriver();

    if (!reviewSummary) return null;

    const distribution = reviewSummary.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const total = reviewSummary.totalReviews || 0;
    const fiveStarCount = distribution[5] || 0;
    const fiveStarPct = total > 0 ? ((fiveStarCount / total) * 100).toFixed(0) : 0;

    return (
        <div className="analytics-row">
            <div className="analytics-stat">
                <div className="analytics-icon">
                    <i className="fas fa-star"></i>
                </div>
                <div className="analytics-info">
                    <h4>Average Rating</h4>
                    <h2>{reviewSummary.averageRating?.toFixed(2) || '0.00'}</h2>
                </div>
            </div>

            <div className="analytics-stat">
                <div className="analytics-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}>
                    <i className="fas fa-comment-dots"></i>
                </div>
                <div className="analytics-info">
                    <h4>Total Reviews</h4>
                    <h2>{total}</h2>
                </div>
            </div>

            <div className="analytics-stat">
                <div className="analytics-icon" style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444' }}>
                    <i className="fas fa-heart"></i>
                </div>
                <div className="analytics-info">
                    <h4>5-Star Rate</h4>
                    <h2>{fiveStarPct}%</h2>
                </div>
            </div>
        </div>
    );
};

export default RatingSummary;
