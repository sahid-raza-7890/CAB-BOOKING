import React from 'react';

const NotificationEmpty = ({ message = "No notifications found." }) => {
  return (
    <div className="glass-panel empty-state">
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>Nothing here yet</h3>
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
};

export default NotificationEmpty;
