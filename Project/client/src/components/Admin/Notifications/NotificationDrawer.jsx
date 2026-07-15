import React from 'react';

const NotificationDrawer = ({ notification, onClose }) => {
  if (!notification) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0,
      width: '400px',
      background: 'rgba(20, 20, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid rgba(255,255,255,0.1)',
      padding: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Notification Details</h3>
        <button onClick={onClose} className="glass-btn-secondary" style={{ padding: '4px 8px' }}>×</button>
      </div>
      
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Title</label>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{notification.title}</div>
      </div>
      
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Message</label>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', minHeight: '100px' }}>{notification.message}</div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
