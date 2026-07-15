import React from 'react';
import './Notifications.css';
import DriverNotificationService from '../../../services/driverNotificationService';

const NotificationCard = ({ notification, onUpdate }) => {
    const handleMarkAsRead = async () => {
        if (notification.read) return;
        try {
            await DriverNotificationService.markAsRead(notification._id);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        try {
            await DriverNotificationService.deleteNotification(notification._id);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    const timeString = new Date(notification.createdAt).toLocaleString();

    return (
        <div className={`notification-card ${!notification.read ? 'unread' : ''}`}>
            <div className="notification-icon">
                <i className={`fas fa-${notification.icon || 'bell'}`}></i>
            </div>
            
            <div className="notification-content">
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-desc">{notification.description}</p>
                <div className="notification-meta">
                    <span>{timeString}</span>
                    <span style={{ color: '#ffd700', opacity: 0.8 }}>{notification.category}</span>
                </div>
            </div>

            <div className="notification-actions">
                {!notification.read && (
                    <button className="action-btn" onClick={handleMarkAsRead} title="Mark as read">
                        <i className="fas fa-check"></i>
                    </button>
                )}
                <button className="action-btn delete" onClick={handleDelete} title="Delete">
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

export default NotificationCard;
