import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, MapPin, Calendar, Clock, Wallet, Gift, Tag, 
  Headphones, Shield, HelpCircle, Settings, LogOut, Menu, X 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './PassengerPortal.css';

const SIDEBAR_ITEMS = [
  { icon: Home,        label: 'Dashboard',     path: '/' },
  { icon: Clock,       label: 'My Rides',      path: '/my-rides' },
  { icon: MapPin,      label: 'Intercity',     path: '/intercity' },
  { icon: Calendar,    label: 'Rentals',       path: '/rentals' },
  { icon: Wallet,      label: 'Wallet',        path: '/wallet' },
  { icon: Gift,        label: 'Referrals',     path: '/referrals' },
  { icon: Tag,         label: 'Offers',        path: '/offers' },
  { icon: Headphones,  label: 'Support',       path: '/support' },
  { icon: Shield,      label: 'Safety',        path: '/safety' },
  { icon: HelpCircle,  label: 'Help',          path: '/help' },
  { icon: Settings,    label: 'Settings',      path: '/settings' },
];

export default function PassengerLayout() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = user?.name || 'Passenger';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pp-root">
      {/* Mobile Overlay */}
      <div 
        className={`pp-mobile-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`pp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="pp-sidebar-header">
          <a href="/" className="pp-logo">
            <span role="img" aria-label="Ucab">🚖</span> Ucab
          </a>
          <button 
            className="pp-mobile-toggle"
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', display: sidebarOpen ? 'block' : 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="pp-nav">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button 
                key={item.label}
                className={`pp-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="pp-sidebar-footer">
          <div className="pp-user-profile">
            <div className="pp-avatar">{userInitial}</div>
            <div className="pp-user-info">
              <span className="pp-user-name">{userName}</span>
              <span className="pp-user-role">{user?.email || 'passenger@ucab.com'}</span>
            </div>
          </div>
          <button className="pp-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pp-main">
        <header className="pp-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="pp-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{ display: window.innerWidth <= 768 ? 'block' : 'none' }}
            >
              <Menu size={24} />
            </button>
            <h1 className="pp-header-title">
              {SIDEBAR_ITEMS.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="pp-header-actions">
            <button className="pp-btn" onClick={() => navigate('/book-ride')}>
              Book Ride
            </button>
          </div>
        </header>

        <div className="pp-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
