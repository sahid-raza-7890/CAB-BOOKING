import React, { useEffect, useState, useCallback } from 'react';
import './Notifications.css';
import DriverNotificationService from '../../../services/driverNotificationService';
import NotificationList from './NotificationList';
import NotificationFilter from './NotificationFilter';
import { useDriver } from '../DriverContext';

const NotificationsDashboard = () => {
    const { notifications, setNotifications, setUnreadCount } = useDriver();
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await DriverNotificationService.getNotifications({ category: activeCategory });
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, setNotifications, setUnreadCount]);

    useEffect(() => {
        setLoading(true);
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

    return (
        <div className="notifications-dashboard">
            <div className="notifications-header">
                <h2 className="notifications-title">
                    <i className="fas fa-bell"></i> Notifications
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="ucab-btn" style={{ background: 'transparent', border: '1px solid #334155' }} onClick={handleMarkAllRead}>
                        Mark all read
                    </button>
                    <button className="ucab-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }} onClick={handleClearAll}>
                        Clear all
                    </button>
                </div>
            </div>

            <div className="notifications-panel">
                <NotificationFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
                <NotificationList 
                    notifications={notifications} 
                    loading={loading} 
                    onUpdate={fetchNotifications}
                />
            </div>
        </div>
    );
};

export default NotificationsDashboard;
