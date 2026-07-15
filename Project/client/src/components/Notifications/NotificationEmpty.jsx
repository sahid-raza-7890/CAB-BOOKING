import React from 'react';

export default function NotificationEmpty() {
    return (
        <div className="notification-empty">
            <i className="fa-regular fa-bell-slash"></i>
            <h3>No notifications yet</h3>
            <p>We'll let you know when something important happens.</p>
        </div>
    );
}
