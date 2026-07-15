import React from 'react';
import './Settings.css';

const ResetSettingsModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Reset Settings</h3>
        <p className="modal-text">Are you sure you want to reset all settings in this category to their default values? This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
};

export default ResetSettingsModal;
