import React, { useState, useEffect, useContext } from 'react';
import notificationService from '../../../services/notificationService';
import { SocketContext } from '../../../context/SocketContext';
import '../Passenger.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { socket } = useContext(SocketContext) || {};

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
      };
      
      const handleRideAlert = (alert) => {
        setNotifications(prev => [{
          _id: Date.now().toString(),
          title: 'Ride Alert',
          message: alert.message || 'Important update about your ride.',
          isRead: false,
          createdAt: new Date().toISOString(),
          type: 'alert'
        }, ...prev]);
      };

      socket.on('newNotification', handleNewNotification);
      socket.on('rideAlert', handleRideAlert);

      return () => {
        socket.off('newNotification', handleNewNotification);
        socket.off('rideAlert', handleRideAlert);
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        (n.id === id || n._id === id) ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="pp-container" style={{ maxWidth: '600px' }}>
        <h2 className="pp-title">Notifications</h2>
        <div style={{ textAlign: 'center', color: '#94A3B8' }}>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="pp-container" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="pp-title" style={{ margin: 0 }}>Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead} 
            className="pp-btn"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Mark All Read
          </button>
        )}
      </div>
      
      {error && <div className="pp-error">{error}</div>}

      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94A3B8' }}>No notifications yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <div 
              key={notif._id || notif.id || Math.random()} 
              style={{
                background: notif.isRead ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.8)',
                border: '1px solid',
                borderColor: notif.isRead ? 'rgba(255,255,255,0.05)' : (notif.type === 'alert' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 210, 31, 0.3)'),
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: notif.type === 'alert' ? '#EF4444' : (notif.isRead ? '#94A3B8' : '#fff') }}>
                  {notif.title}
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>{notif.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '5px' }}>
                  {new Date(notif.createdAt || notif.date || Date.now()).toLocaleString()}
                </span>
              </div>
              {!notif.isRead && (
                <button 
                  onClick={() => handleMarkRead(notif._id || notif.id)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${notif.type === 'alert' ? '#EF4444' : '#FFD21F'}`,
                    color: notif.type === 'alert' ? '#EF4444' : '#FFD21F',
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
