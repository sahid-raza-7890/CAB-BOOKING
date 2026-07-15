import React from 'react';
import './Analytics.css';

const AnalyticsSkeleton = () => {
  return (
    <div className="analytics-skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton" style={{ height: '2rem', width: '40%' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '30%' }}></div>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <div className="skeleton skeleton-title" style={{ marginBottom: '1rem' }}></div>
          <div className="skeleton skeleton-chart"></div>
        </div>
        <div className="chart-card">
          <div className="skeleton skeleton-title" style={{ marginBottom: '1rem' }}></div>
          <div className="skeleton skeleton-chart"></div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
