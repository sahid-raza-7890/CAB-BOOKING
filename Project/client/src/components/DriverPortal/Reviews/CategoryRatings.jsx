import React from 'react';
import { useDriver } from '../DriverContext';

const CategoryRatings = () => {
    const { reviewSummary } = useDriver();

    if (!reviewSummary || !reviewSummary.categories) return null;

    const categories = [
        { key: 'driving', label: 'Driving & Safety' },
        { key: 'cleanliness', label: 'Cleanliness' },
        { key: 'behavior', label: 'Professionalism' },
        { key: 'punctuality', label: 'Punctuality' },
        { key: 'vehicleCondition', label: 'Vehicle Condition' }
    ];

    return (
        <div style={{ marginTop: '32px' }}>
            <h4 className="section-title">Category Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {categories.map(cat => (
                    <div key={cat.key} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{cat.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>
                                {reviewSummary.categories[cat.key]?.toFixed(1) || '0.0'}
                            </span>
                            <div className="star-rating small">
                                <i className="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryRatings;
