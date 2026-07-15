import React from 'react';

export default function ReviewFilters({ filters, onChange, totalCount }) {
    const handleChange = (e) => {
        onChange({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginTop: 0, color: '#e5b05c' }}>Filters</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Showing {totalCount} review{totalCount !== 1 ? 's' : ''}
            </p>

            <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Sort By</label>
                <select name="sort" className="form-control" value={filters.sort} onChange={handleChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>
        </div>
    );
}
