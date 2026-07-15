import React from 'react';
import { useDriver } from '../DriverContext';

const FilterPanel = () => {
    const { reviewFilters, setReviewFilters } = useDriver();

    const handleSortChange = (e) => {
        setReviewFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }));
    };

    const handleRatingChange = (e) => {
        setReviewFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }));
    };

    return (
        <div style={{ display: 'flex', gap: '16px' }}>
            <select className="filter-select" value={reviewFilters.rating} onChange={handleRatingChange}>
                <option value="">All Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars Only</option>
                <option value="2">2 Stars Only</option>
                <option value="1">1 Star Only</option>
            </select>

            <select className="filter-select" value={reviewFilters.sort} onChange={handleSortChange}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
            </select>
        </div>
    );
};

export default FilterPanel;
