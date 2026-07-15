import React from 'react';
import './Notifications.css';
import NotificationCard from './NotificationCard';
import NotificationEmpty from './NotificationEmpty';
import { NotificationSkeleton } from './NotificationSkeleton';

const NotificationList = ({ notifications, loading, onUpdate }) => {
    if (loading) {
        return (
            <div className="notification-list">
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
            </div>
        );
    }

    if (!notifications || notifications.length === 0) {
        return <NotificationEmpty />;
    }

    return (
        <div className="notification-list">
            {notifications.map(notification => (
                <NotificationCard 
                    key={notification._id} 
                    notification={notification} 
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};

export default NotificationList;
