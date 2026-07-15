import React from 'react';
import './Notifications.css';

const NotificationEmpty = () => (
    <div className="empty-state">
        <i className="fas fa-bell-slash empty-icon"></i>
        <h3>No Notifications</h3>
        <p>You're all caught up! We'll notify you when there's something new.</p>
    </div>
);

export default NotificationEmpty;
