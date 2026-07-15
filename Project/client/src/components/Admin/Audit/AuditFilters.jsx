import React, { useState, useEffect } from 'react';
import './Audit.css';

const AuditFilters = ({ filters, onFilterChange }) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onFilterChange({ ...filters, search: localSearch });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="ucab-glass-panel">
      <div className="ucab-filters">
        <input 
          type="text" 
          placeholder="Search actions or users..." 
          className="ucab-input"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <select 
          name="status" 
          className="ucab-select" 
          value={filters.status || ''}
          onChange={handleSelectChange}
        >
          <option value="">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
          <option value="Warning">Warning</option>
        </select>

        <select 
          name="dateRange" 
          className="ucab-select" 
          value={filters.dateRange || ''}
          onChange={handleSelectChange}
        >
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
    </div>
  );
};

export default AuditFilters;
