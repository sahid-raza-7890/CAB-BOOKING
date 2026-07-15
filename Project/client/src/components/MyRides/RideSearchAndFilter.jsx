import React from 'react';

function RideSearchAndFilter({ filters, setFilters }) {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="mr-filter-bar">
            <div className="mr-filter-group">
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Searching">Searching</option>
                    <option value="Accepted">Accepted</option>
                </select>
            </div>
            
            <div className="mr-filter-group">
                <select name="vehicleType" value={filters.vehicleType} onChange={handleFilterChange}>
                    <option value="All">All Vehicle Types</option>
                    <option value="Basic">Basic</option>
                    <option value="Auto">Auto</option>
                    <option value="Moto">Moto</option>
                    <option value="SUV">SUV</option>
                </select>
            </div>
            
            <div className="mr-filter-group">
                <select name="days" value={filters.days} onChange={handleFilterChange}>
                    <option value="All">All Time</option>
                    <option value="1">Last 24 Hours</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                </select>
            </div>

            <div className="mr-filter-group">
                <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="fare-high">Fare: High to Low</option>
                    <option value="fare-low">Fare: Low to High</option>
                </select>
            </div>
        </div>
    );
}

export default RideSearchAndFilter;
