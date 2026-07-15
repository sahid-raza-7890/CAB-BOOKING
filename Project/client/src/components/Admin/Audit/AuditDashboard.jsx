import React, { useState, useEffect, useContext } from 'react';
import './Audit.css';
import AuditTable from './AuditTable';
import AuditTimeline from './AuditTimeline';
import AuditFilters from './AuditFilters';
import AuditAnalytics from './AuditAnalytics';
import AuditDrawer from './AuditDrawer';
import AuditExportModal from './AuditExportModal';
import AuditSkeleton from './AuditSkeleton';
import AuditEmpty from './AuditEmpty';

import { AdminContext } from '../../../context/AdminContext';
import adminApiService from '../../../services/adminApiService';

import { useSearchParams } from 'react-router-dom';

const AuditDashboard = () => {
  const { 
    audits, auditTimeline, auditFilters, setAuditFilters,
    loadingAudit, fetchAudits, fetchAuditTimeline 
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'table');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Initialize from URL
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateRange = searchParams.get('dateRange') || '';
    setAuditFilters({ search, status, dateRange });
  }, []);

  const updateUrl = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleFilterChange = (newFilters) => {
    setAuditFilters(newFilters);
    updateUrl({ search: newFilters.search, status: newFilters.status, dateRange: newFilters.dateRange });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateUrl({ view: mode });
  };

  // Fetch data
  useEffect(() => {
    fetchAudits();
    fetchAuditTimeline();
  }, [auditFilters, fetchAudits, fetchAuditTimeline]);

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleExport = async (exportConfig) => {
    try {
      const { error } = await adminApiService.exportAudits({ ...auditFilters, ...exportConfig });
      if (error) {
        alert('Failed to export: ' + error);
      } else {
        alert(`Export started for format: ${exportConfig.format}, range: ${exportConfig.dateRange}`);
      }
    } catch (err) {
      alert('Export error: ' + err.message);
    }
  };

  return (
    <div className="ucab-audit-container">
      <div className="ucab-header">
        <h1>Audit Center & Activity Timeline</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px' }}>
            <button 
              className={`ucab-btn-secondary ${viewMode === 'table' ? 'active' : ''}`}
              style={{ border: 'none', background: viewMode === 'table' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              onClick={() => handleViewModeChange('table')}
            >
              Table View
            </button>
            <button 
              className={`ucab-btn-secondary ${viewMode === 'timeline' ? 'active' : ''}`}
              style={{ border: 'none', background: viewMode === 'timeline' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              onClick={() => handleViewModeChange('timeline')}
            >
              Timeline View
            </button>
          </div>
          <button className="ucab-btn-primary" onClick={() => setIsExportModalOpen(true)}>
            <span>📤</span> Export Logs
          </button>
        </div>
      </div>

      <AuditAnalytics data={audits?.data || []} />
      
      <AuditFilters filters={auditFilters} onFilterChange={handleFilterChange} />

      {loadingAudit ? (
        <div className="ucab-glass-panel">
          <AuditSkeleton rows={8} />
        </div>
      ) : audits?.data?.length === 0 ? (
        <div className="ucab-glass-panel">
          <AuditEmpty />
        </div>
      ) : viewMode === 'table' ? (
        <AuditTable data={audits?.data || []} onRowClick={handleRowClick} />
      ) : (
        <AuditTimeline data={auditTimeline?.data || []} onRowClick={handleRowClick} />
      )}

      <AuditDrawer 
        isOpen={isDrawerOpen} 
        log={selectedLog} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <AuditExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default AuditDashboard;
