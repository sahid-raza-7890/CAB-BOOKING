import React from 'react';

const NotificationFilters = () => {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
      <select className="glass-select" style={{ width: '150px' }}>
        <option value="all">All Channels</option>
        <option value="push">Push</option>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </select>
      
      <select className="glass-select" style={{ width: '150px' }}>
        <option value="all">All Audiences</option>
        <option value="drivers">Drivers</option>
        <option value="riders">Riders</option>
      </select>
      
      <input type="date" className="glass-input" style={{ width: '150px' }} />
    </div>
  );
};

export default NotificationFilters;
