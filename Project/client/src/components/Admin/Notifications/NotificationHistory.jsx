import React, { useContext } from 'react';
import NotificationFilters from './NotificationFilters';
import { AdminContext } from '../../../context/AdminContext';

const NotificationHistory = () => {
  const { notifications } = useContext(AdminContext);
  // Filtering for sent notifications, assuming notification history is fetched and available in `notifications` or `notificationHistory`.
  const historyData = notifications || [];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Notification History</h2>
      
      <NotificationFilters />
      
      <div className="glass-panel" style={{ padding: '0', marginTop: '20px' }}>
        {historyData.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No notification history found.</div>
        ) : (
          historyData.map(h => (
            <div key={h._id || h.id} className="list-item">
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>{h.title || 'Untitled'}</h4>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Sent: {h.sentAt ? new Date(h.sentAt).toLocaleString() : 'N/A'} • {h.channel} to {h.audience}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{h.delivered || '0'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Delivered</div>
                </div>
                <span className="status-badge status-sent">{h.status || 'Sent'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;
