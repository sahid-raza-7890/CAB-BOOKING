import React from 'react';

export default function ResetPreferencesModal({ onConfirm, onCancel }) {
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h3 className="settings-modal-title">Reset Preferences?</h3>
        <p className="settings-modal-text">
          Are you sure you want to reset all preferences to their default values? 
          This will not delete your account or change your profile data, but your notification, privacy, and display settings will be reset.
        </p>
        <div className="settings-modal-actions">
          <button className="settings-nav-btn" style={{ justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }} onClick={onCancel}>
            Cancel
          </button>
          <button className="settings-btn-danger" onClick={onConfirm}>
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  );
}
