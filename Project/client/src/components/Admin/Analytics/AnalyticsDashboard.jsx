import React, { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import './Analytics.css';
import adminApiService from '../../../services/adminApiService';

// Components
import AnalyticsFilters from './AnalyticsFilters';
import ExportAnalyticsModal from './ExportAnalyticsModal';
import AnalyticsEmpty from './AnalyticsEmpty';

// Tabs
import RevenueAnalytics from './RevenueAnalytics';
import RideAnalytics from './RideAnalytics';
import DriverAnalytics from './DriverAnalytics';
import PassengerAnalytics from './PassengerAnalytics';
import FinanceAnalytics from './FinanceAnalytics';
import PromotionAnalytics from './PromotionAnalytics';
import SafetyAnalytics from './SafetyAnalytics';
import GeographyAnalytics from './GeographyAnalytics';

const TABS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'rides', label: 'Rides' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'passengers', label: 'Passengers' },
  { id: 'finance', label: 'Finance' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'safety', label: 'Safety' },
  { id: 'geography', label: 'Geography' },
];

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    region: 'all',
    comparison: 'none'
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExport = async (exportConfig) => {
    try {
      const { error } = await adminApiService.exportAnalytics(filters, exportConfig.format);
      if (error) {
        alert('Failed to export: ' + error);
      } else {
        alert(`Export started for format: ${exportConfig.format.toUpperCase()}`);
      }
    } catch (err) {
      alert('Export error: ' + err.message);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'revenue': return <RevenueAnalytics key={`rev-${refreshKey}`} filters={filters} />;
      case 'rides': return <RideAnalytics key={`rides-${refreshKey}`} filters={filters} />;
      case 'drivers': return <DriverAnalytics key={`dr-${refreshKey}`} filters={filters} />;
      case 'passengers': return <PassengerAnalytics key={`ps-${refreshKey}`} filters={filters} />;
      case 'finance': return <FinanceAnalytics key={`fin-${refreshKey}`} filters={filters} />;
      case 'promotions': return <PromotionAnalytics key={`pro-${refreshKey}`} filters={filters} />;
      case 'safety': return <SafetyAnalytics key={`saf-${refreshKey}`} filters={filters} />;
      case 'geography': return <GeographyAnalytics key={`geo-${refreshKey}`} filters={filters} />;
      default: return <AnalyticsEmpty />;
    }
  };

  return (
    <div className="admin-analytics-container">
      <div className="analytics-header">
        <h1>Analytics & Business Intelligence</h1>
        <div className="analytics-header-actions">
          <button className="btn-secondary" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setIsExportModalOpen(true)}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <AnalyticsFilters filters={filters} onFilterChange={setFilters} />

      <div className="analytics-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {renderActiveTab()}
      </div>

      <ExportAnalyticsModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExport}
      />
    </div>
  );
};

export default AnalyticsDashboard;
