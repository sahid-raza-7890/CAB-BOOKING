import React from 'react';

export const ReviewsEmpty = ({ hasFilters }) => (
    <div className="review-panel" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="analytics-icon" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px' }}>
            <i className="fas fa-star"></i>
        </div>
        <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#fff' }}>
            {hasFilters ? 'No reviews match your filters' : 'No reviews yet'}
        </h3>
        <p style={{ color: '#94a3b8', margin: 0 }}>
            {hasFilters 
                ? 'Try adjusting your search or rating filter.' 
                : 'Keep driving! Reviews from passengers will appear here.'}
        </p>
    </div>
);

export const ReviewsSkeleton = () => (
    <div className="reviews-dashboard">
        <div className="analytics-row">
            {[1, 2, 3].map(i => (
                <div key={i} className="analytics-stat">
                    <div className="skeleton-pulse" style={{ width: '48px', height: '48px', borderRadius: '24px' }}></div>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton-pulse" style={{ height: '16px', width: '60%', marginBottom: '8px' }}></div>
                        <div className="skeleton-pulse" style={{ height: '24px', width: '40%' }}></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="reviews-grid">
            <div className="review-panel">
                <div className="skeleton-pulse" style={{ height: '24px', width: '40%', marginBottom: '16px' }}></div>
                <div className="review-list">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton-pulse" style={{ height: '100px', borderRadius: '12px' }}></div>
                    ))}
                </div>
            </div>
            <div className="review-panel">
                <div className="skeleton-pulse" style={{ height: '24px', width: '30%', marginBottom: '24px' }}></div>
                <div className="skeleton-pulse" style={{ height: '16px', width: '100%', marginBottom: '8px' }}></div>
                <div className="skeleton-pulse" style={{ height: '16px', width: '80%', marginBottom: '24px' }}></div>
                <div className="skeleton-pulse" style={{ height: '200px', borderRadius: '12px' }}></div>
            </div>
        </div>
    </div>
);
