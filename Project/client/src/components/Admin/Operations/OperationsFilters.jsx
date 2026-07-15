import React from 'react';

const OperationsFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="glass-panel" style={{ flexDirection: 'row', gap: '16px', alignItems: 'center' }}>
      <span className="metric-label" style={{ margin: 0 }}>Filters:</span>
      <select 
        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '4px' }}
        value={filters.region} 
        onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
      >
        <option value="ALL">All Regions</option>
        <option value="NORTH">North</option>
        <option value="SOUTH">South</option>
      </select>
      <select 
        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '4px' }}
        value={filters.status} 
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
      >
        <option value="ALL">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="WARNING">Warning</option>
      </select>
    </div>
  );
};

export default OperationsFilters;
