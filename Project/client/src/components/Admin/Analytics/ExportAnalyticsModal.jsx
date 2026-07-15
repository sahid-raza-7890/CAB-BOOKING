import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import './Analytics.css';

const ExportAnalyticsModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [modules, setModules] = useState({
    revenue: true,
    rides: true,
    users: true,
    safety: false
  });

  if (!isOpen) return null;

  const handleModuleChange = (mod) => {
    setModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleExport = () => {
    onExport({ format, dateRange, modules });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Export Analytics Data</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Format</label>
            <select className="filter-select" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="pdf">PDF (Report)</option>
              <option value="json">JSON (Raw Data)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date Range</label>
            <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Include Data Modules</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {Object.keys(modules).map(mod => (
                <label key={mod} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={modules[mod]} 
                    onChange={() => handleModuleChange(mod)}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{mod}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportAnalyticsModal;
