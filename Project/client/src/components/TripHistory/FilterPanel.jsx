import React from 'react';

export default function FilterPanel({ filters, onChange, totalCount }) {
    const handleChange = (e) => {
        onChange({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginTop: 0, color: '#e5b05c' }}>Filters</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Showing {totalCount} result{totalCount !== 1 ? 's' : ''}
            </p>

            <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Status</label>
                <select name="status" className="form-control" value={filters.status} onChange={handleChange}>
                    <option value="Active">Active Rides</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Time Period</label>
                <select name="days" className="form-control" value={filters.days} onChange={handleChange}>
                    <option value="All">All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="365">Last Year</option>
                </select>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Sort By</label>
                <select name="sort" className="form-control" value={filters.sort} onChange={handleChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="fare-high">Highest Fare</option>
                    <option value="fare-low">Lowest Fare</option>
                </select>
            </div>
        </div>
    );
}
