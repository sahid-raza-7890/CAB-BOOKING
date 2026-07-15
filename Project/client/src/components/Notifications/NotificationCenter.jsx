import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import NotificationList from './NotificationList';
import NotificationFilter from './NotificationFilter';
import './Notifications.css';

const TABS = ['All', 'Ride', 'Wallet', 'Offers', 'Safety', 'System'];

export default function NotificationCenter({ onClose }) {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        // Initial Fetch
        fetchNotifications(1, activeTab, true);

        // Socket.IO Listener
        const socket = io('http://localhost:5000');
        socket.emit('register', user.userId || user.id);
        
        const roomName = `notification_${user.userId || user.id}`;
        socket.on(roomName, (payload) => {
            if (payload.event === 'notification:new') {
                setNotifications(prev => [payload.data, ...prev]);
            }
        });

        return () => {
            socket.off(roomName);
            socket.disconnect();
        };
    }, [user, activeTab]);

    const fetchNotifications = async (pageNum, category, reset = false) => {
        try {
            if (reset) setLoading(true);
            const data = await notificationService.getNotifications({
                page: pageNum,
                limit: 20,
                category: category === 'All' ? undefined : category
            });
            
            if (reset) {
                setNotifications(data.notifications);
            } else {
                setNotifications(prev => [...prev, ...data.notifications]);
            }
            
            setHasMore(data.page < data.pages);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchNotifications(page + 1, activeTab);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all read:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await notificationService.clearAll();
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear all:", error);
        }
    };

    return (
        <div className="notification-drawer-overlay" onClick={onClose}>
            <motion.div 
                className="notification-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="notification-header">
                    <h2><i className="fa-solid fa-bell"></i> Notifications</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="notification-actions">
                    <button className="action-btn" onClick={handleMarkAllRead}>
                        <i className="fa-solid fa-check-double"></i> Mark All Read
                    </button>
                    <button className="action-btn" onClick={handleClearAll}>
                        <i className="fa-solid fa-trash-can"></i> Clear All
                    </button>
                </div>

                <NotificationFilter tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

                <NotificationList 
                    notifications={notifications}
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={loadMore}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleDelete}
                />
            </motion.div>
        </div>
    );
}
