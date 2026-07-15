import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getNotifications();
      setNotifications(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await passengerApiService.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        (n.id === id || n._id === id) ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const containerStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    margin: '0 auto'
  };

  if (loading) return <div style={containerStyle}>Loading notifications...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#FFD21F', textAlign: 'center', marginBottom: '1.5rem' }}>Notifications</h2>
      
      {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94A3B8' }}>No notifications yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <div 
              key={notif._id || notif.id} 
              style={{
                background: notif.isRead ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.8)',
                border: '1px solid',
                borderColor: notif.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(255, 210, 31, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: notif.isRead ? '#94A3B8' : '#fff' }}>{notif.title}</h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>{notif.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '5px' }}>
                  {new Date(notif.createdAt || notif.date).toLocaleString()}
                </span>
              </div>
              {!notif.isRead && (
                <button 
                  onClick={() => handleMarkRead(notif._id || notif.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #FFD21F',
                    color: '#FFD21F',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
