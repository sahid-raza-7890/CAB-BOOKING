import React from 'react';

// Simple relative time formatter
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
};

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
    const { _id, title, description, icon, read, createdAt, actionUrl } = notification;

    // Use FontAwesome icons safely
    const getIconClass = (iconName) => {
        const map = {
            'car': 'fa-solid fa-car',
            'wallet': 'fa-solid fa-wallet',
            'credit-card': 'fa-solid fa-credit-card',
            'minus-circle': 'fa-solid fa-minus-circle',
            'check-circle': 'fa-solid fa-check-circle',
            'x-circle': 'fa-solid fa-xmark-circle',
            'map': 'fa-solid fa-map-location-dot',
            'bell': 'fa-solid fa-bell'
        };
        return map[iconName] || 'fa-solid fa-bell';
    };

    return (
        <div className={`notification-card ${!read ? 'unread' : ''}`}>
            <div className="notification-icon">
                <i className={getIconClass(icon)}></i>
            </div>
            <div className="notification-content">
                <h4 className="notification-title">{title}</h4>
                <p className="notification-desc">{description}</p>
                <div className="notification-meta">
                    <span>{formatRelativeTime(createdAt)}</span>
                    <div className="notification-card-actions">
                        {!read && (
                            <button onClick={() => onMarkRead(_id)} title="Mark as read">
                                <i className="fa-solid fa-check"></i>
                            </button>
                        )}
                        <button onClick={() => onDelete(_id)} title="Delete">
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                {actionUrl && (
                    <a href={actionUrl} className="action-link" style={{ fontSize: '0.8rem', color: '#e5b05c', textDecoration: 'none', marginTop: '5px', display: 'inline-block' }}>
                        View Details <i className="fa-solid fa-arrow-right"></i>
                    </a>
                )}
            </div>
        </div>
    );
}
