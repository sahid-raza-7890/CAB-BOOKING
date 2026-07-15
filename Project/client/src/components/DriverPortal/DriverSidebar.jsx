import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDriver } from './DriverContext';
import { useAuth } from '../../hooks/useAuth';

const DriverSidebar = () => {
    const { unreadCount, emergencyState } = useDriver();
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/driver/dashboard', icon: '📊' },
        { name: 'Ride Requests', path: '/driver/requests', icon: '🔔' },
        { name: 'Active Ride', path: '/driver/active', icon: '🚕' },
        { name: 'Scheduled Trips', path: '/driver/scheduled', icon: '📅' },
        { name: 'Trip History', path: '/driver/history', icon: '📜' },

        { name: 'Wallet', path: '/driver/wallet', icon: '💼' },
        { name: 'Earnings', path: '/driver/earnings', icon: '💰' },
        { name: 'Bonuses & Incentives', path: '/driver/bonuses', icon: '🎁' },
        { name: 'Ratings & Reviews', path: '/driver/reviews', icon: '⭐' },
        { name: 'Heat Map', path: '/driver/heatmap', icon: '🗺️' },
        { name: 'Analytics', path: '/driver/analytics', icon: '📈' },
        { name: 'Profile', path: '/driver/profile', icon: '👤' },
        { name: 'Vehicle', path: '/driver/vehicle', icon: '🚗' },
        { name: 'Documents', path: '/driver/documents', icon: '📄' },
        { name: 'Support', path: '/driver/support', icon: '🎧' },
        { 
            name: 'Notifications', 
            path: '/driver/notifications',
            icon: '🔔',
            badge: unreadCount > 0 ? unreadCount : null,
        },
        { 
            name: 'Emergency SOS', 
            path: '/driver/emergency',
            icon: '🚨',
            badge: emergencyState ? 'SOS' : null,
        },
        { name: 'Referrals', path: '/driver/referrals', icon: '🤝' },
        { name: 'Settings', path: '/driver/settings', icon: '⚙️' }
    ];

    return (
        <aside className="dp-sidebar">
            <div className="dp-brand">
                <span style={{ fontSize: 24 }}>🚕</span>
                <div>
                    <div className="dp-brand-name">UCAB</div>
                    <div className="dp-brand-sub">Driver Portal</div>
                </div>
            </div>
            
            {navItems.map((item, index) => (
                <NavLink 
                    key={index}
                    to={item.path} 
                    className={({ isActive }) => `dp-nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="dp-nav-icon">{item.icon}</span>
                    {item.name}
                    {item.badge && <span className="dp-nav-badge">{item.badge}</span>}
                </NavLink>
            ))}

            <div className="dp-sidebar-footer">
                <button onClick={logout} className="dp-logout-btn" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'center', display: 'block', fontSize: '13px', padding: '12px', color: '#ff4b4b' }}>
                    ⬡ Logout
                </button>
            </div>
        </aside>
    );
};

export default DriverSidebar;
