import React, { useEffect, useState, useCallback } from 'react';
import { useDriver } from '../DriverContext';
import DriverNotificationService from '../../../services/driverNotificationService';
import '../DriverPortal.css'; // ensure dp- styles are loaded

export default function NotificationsDashboard() {
  const { notifications, setNotifications, setUnreadCount } = useDriver();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DriverNotificationService.getNotifications({ category: activeCategory !== 'All' ? activeCategory : undefined });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, setNotifications, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await DriverNotificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await DriverNotificationService.clearAllNotifications();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await DriverNotificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', 'System', 'Ride', 'Promotions'];

  const getIcon = (type) => {
    switch (type) {
      case 'System': return { emoji: '⚙️', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
      case 'Ride': return { emoji: '🚕', bg: 'rgba(0, 210, 106, 0.15)', color: '#00D26A' };
      case 'Promotions': return { emoji: '🎉', bg: 'rgba(255, 210, 31, 0.15)', color: '#FFD21F' };
      case 'Alert': return { emoji: '🚨', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      default: return { emoji: '🔔', bg: 'rgba(255, 255, 255, 0.1)', color: '#fff' };
    }
  };

  return (
    <div className="dp-content" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 className="dp-section-title">Notifications</h2>
          <p className="dp-section-sub">System broadcasts, ride updates, and alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleMarkAllRead} 
            className="dp-action-btn" 
            style={{ width: 'auto', padding: '0 12px', fontSize: 12, fontWeight: 600, color: '#fff' }}
          >
            Mark all read
          </button>
          <button 
            onClick={handleClearAll} 
            className="dp-action-btn danger" 
            style={{ width: 'auto', padding: '0 12px', fontSize: 12, fontWeight: 600, color: '#FF4B4B' }}
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="dp-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="dp-card-header" style={{ padding: '0 16px', gap: 16 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 0',
                color: activeCategory === cat ? '#FFD21F' : '#888',
                borderBottom: activeCategory === cat ? '2px solid #FFD21F' : '2px solid transparent',
                fontWeight: activeCategory === cat ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="dp-feed" style={{ padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#555', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              No notifications found
            </div>
          ) : (
            notifications.map(notif => {
              const iconObj = getIcon(notif.type || notif.category);
              return (
                <div 
                  key={notif._id} 
                  className="dp-feed-item" 
                  onClick={() => handleMarkRead(notif._id, notif.isRead)}
                  style={{ 
                    cursor: 'pointer',
                    background: notif.isRead ? 'transparent' : 'rgba(255,255,255,0.03)',
                    borderLeft: notif.isRead ? '3px solid transparent' : '3px solid #3b82f6'
                  }}
                >
                  <div className="dp-feed-icon" style={{ background: iconObj.bg, color: iconObj.color, fontSize: 16 }}>
                    {iconObj.emoji}
                  </div>
                  <div className="dp-feed-text">
                    <div className="dp-feed-title" style={{ color: notif.isRead ? '#ccc' : '#fff' }}>
                      {notif.title}
                    </div>
                    <div className="dp-feed-sub" style={{ color: notif.isRead ? '#666' : '#999', lineHeight: 1.4, marginTop: 4 }}>
                      {notif.message}
                    </div>
                  </div>
                  <div className="dp-feed-time">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
