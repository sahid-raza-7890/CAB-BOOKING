import React from 'react';
import './Analytics.css';

const AnalyticsFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="filters-container">
      <div className="filter-group">
        <label className="filter-label">Date Range:</label>
        <select 
          className="filter-select"
          value={filters.dateRange}
          onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
        >
          <option value="today">Today</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="this_year">This Year</option>
          <option value="all_time">All Time</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Region:</label>
        <select 
          className="filter-select"
          value={filters.region}
          onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
        >
          <option value="all">All Regions</option>
          <option value="north">North Region</option>
          <option value="south">South Region</option>
          <option value="east">East Region</option>
          <option value="west">West Region</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Compare to:</label>
        <select 
          className="filter-select"
          value={filters.comparison}
          onChange={(e) => onFilterChange({ ...filters, comparison: e.target.value })}
        >
          <option value="none">No Comparison</option>
          <option value="previous_period">Previous Period</option>
          <option value="previous_year">Previous Year</option>
        </select>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
