import React from 'react';
import { useDriver } from '../DriverContext';

const RatingDistribution = () => {
    const { reviewSummary } = useDriver();

    if (!reviewSummary || !reviewSummary.distribution) return null;

    const distribution = reviewSummary.distribution;
    const total = reviewSummary.totalReviews || 1; // prevent divide by zero

    return (
        <div style={{ marginTop: '24px' }}>
            <h4 className="section-title">Rating Distribution</h4>
            {[5, 4, 3, 2, 1].map(stars => {
                const count = distribution[stars] || 0;
                const percentage = (count / total) * 100;
                return (
                    <div key={stars} className="dist-row">
                        <span style={{ width: '40px' }}>{stars} <i className="fas fa-star" style={{ color: '#fbbf24', fontSize: '10px' }}></i></span>
                        <div className="dist-bar-bg">
                            <div className="dist-bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span style={{ width: '30px', textAlign: 'right' }}>{count}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RatingDistribution;
