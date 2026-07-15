import React from 'react';

export default function CategoryRatings({ ratings, onChange }) {
    const categories = [
        { key: 'driving', label: 'Driving Safety' },
        { key: 'cleanliness', label: 'Cleanliness' },
        { key: 'behavior', label: 'Driver Behavior' },
        { key: 'punctuality', label: 'Punctuality' },
        { key: 'vehicleCondition', label: 'Vehicle Condition' }
    ];

    const handleRating = (key, val) => {
        onChange({ ...ratings, [key]: val });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
            {categories.map(cat => (
                <div key={cat.key} className="category-row">
                    <span style={{ color: '#ccc', fontSize: '0.9rem' }}>{cat.label}</span>
                    <div className="category-stars">
                        {[1,2,3,4,5].map(star => (
                            <i 
                                key={star}
                                className={`fa-solid fa-star category-star ${star <= ratings[cat.key] ? 'filled' : 'empty'}`}
                                onClick={() => handleRating(cat.key, star)}
                            ></i>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
