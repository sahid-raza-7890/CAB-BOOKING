import React from 'react';
import { useDriver } from '../DriverContext';

const SearchBar = () => {
    const { reviewFilters, setReviewFilters } = useDriver();

    const handleSearch = (e) => {
        setReviewFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    return (
        <input 
            type="text" 
            className="search-input" 
            placeholder="Search reviews..." 
            value={reviewFilters.search}
            onChange={handleSearch}
        />
    );
};

export default SearchBar;
