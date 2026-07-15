import React, { useContext } from 'react';
import NotificationEmpty from './NotificationEmpty';
import { AdminContext } from '../../../context/AdminContext';

const ScheduledNotifications = () => {
  const { scheduledNotifications } = useContext(AdminContext);
  const scheduled = scheduledNotifications || [];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Scheduled Notifications</h2>
      
      {scheduled.length === 0 ? (
        <NotificationEmpty message="No scheduled notifications." />
      ) : (
        <div className="glass-panel" style={{ padding: '0' }}>
          {scheduled.map(s => (
            <div key={s._id || s.id} className="list-item">
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>{s.title}</h4>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Scheduled for: {s.scheduledFor ? new Date(s.scheduledFor).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="status-badge status-scheduled">{s.status || 'Scheduled'}</span>
                <button className="glass-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledNotifications;
