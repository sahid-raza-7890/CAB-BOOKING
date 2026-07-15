import React, { useState } from 'react';
import './Audit.css';

const AuditExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('30d');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ format, dateRange });
    onClose();
  };

  return (
    <div className="ucab-modal-overlay">
      <div className="ucab-modal">
        <h2>Export Audit Data</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          Select the format and date range for your audit log export.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Format</label>
          <select 
            className="ucab-select" 
            style={{ width: '100%' }}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="csv">CSV (Spreadsheet)</option>
            <option value="json">JSON (API format)</option>
            <option value="pdf">PDF (Report)</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Date Range</label>
          <select 
            className="ucab-select" 
            style={{ width: '100%' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="ucab-modal-footer">
          <button className="ucab-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="ucab-btn-primary" onClick={handleExport}>
            <span>⬇️</span> Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditExportModal;
