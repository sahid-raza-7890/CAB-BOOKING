import React from 'react';
import './Notifications.css';

const categories = ['All', 'Ride', 'Wallet', 'System', 'Safety'];

const NotificationFilter = ({ activeCategory, onSelect }) => (
    <div className="notification-filter">
        {categories.map(cat => (
            <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => onSelect(cat)}
            >
                {cat}
            </button>
        ))}
    </div>
);

export default NotificationFilter;
