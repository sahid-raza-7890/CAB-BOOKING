import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Analytics.css';

const AnalyticsEmpty = ({ title = "No Data Available", message = "There is currently no analytics data for the selected filters or date range." }) => {
  return (
    <div className="empty-state">
      <AlertCircle size={48} className="empty-icon" />
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{message}</p>
    </div>
  );
};

export default AnalyticsEmpty;
