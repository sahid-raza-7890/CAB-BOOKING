import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { SocketContext } from '../../../context/SocketContext';
import { PassengerContext } from '../../../context/PassengerContext';
import { passengerApiService } from '../../../services/passengerApiService';

import PassengerProfile from '../Profile';
import SavedPlaces from '../SavedPlaces';
import Settings from '../Settings';
import Referrals from '../Referrals';
import Offers from '../Offers';
import Receipts from '../Receipts';
import LostAndFound from '../LostFound/LostAndFound';
import FavoriteDrivers from '../Favorites/FavoriteDrivers';
import HelpCenter from '../Help/HelpCenter';
import Wallet from '../Wallet';
import MyRides from '../MyRides';
import Notifications from '../Notifications/Notifications';
import Reviews from '../Reviews/Reviews';
import SOSButton from '../SOS/SOSButton';
import { useNavigate } from 'react-router-dom';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const { activeRide } = useContext(PassengerContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await passengerApiService.getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);



  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    padding: '2rem',
    color: '#fff',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const contentStyle = {
    width: '100%',
    maxWidth: '1200px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    width: '100%'
  };

  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  };

  const iconStyle = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    background: 'rgba(255, 210, 31, 0.1)',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  };

  const navItems = [
    { id: 'profile', title: 'Profile', icon: '👤', desc: 'Manage your personal info' },
    { id: 'settings', title: 'Settings', icon: '⚙️', desc: 'Preferences, 2FA, Theme' },
    { id: 'myrides', title: 'My Rides', icon: '🚙', desc: 'Active, upcoming, and past rides' },
    { id: 'wallet', title: 'Wallet', icon: '💳', desc: 'Manage funds and payments' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', desc: 'View alerts and updates' },
    { id: 'reviews', title: 'Reviews', icon: '⭐', desc: 'Your past ride ratings' },
    { id: 'places', title: 'Saved Places', icon: '📍', desc: 'Home, work, and favorites' },
    { id: 'receipts', title: 'Ride Receipts', icon: '🧾', desc: 'View past trips and payments' },
    { id: 'lostfound', title: 'Lost & Found', icon: '🔍', desc: 'Report forgotten items' },
    { id: 'favorites', title: 'Favorite Drivers', icon: '🚗', desc: 'Drivers you prefer' },
    { id: 'referrals', title: 'Invite Friends', icon: '🎁', desc: 'Earn rewards by sharing' },
    { id: 'offers', title: 'Offers & Promos', icon: '🎟️', desc: 'Coupons and special deals' },
    { id: 'help', title: 'Help Center', icon: '❓', desc: 'Get support and FAQs' }
  ];

  if (loading) {
    return <div style={{...containerStyle, justifyContent: 'center'}}>Loading...</div>;
  }

  if (error) {
    return <div style={{...containerStyle, justifyContent: 'center', color: '#EF4444'}}>{error}</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <PassengerProfile />;
      case 'settings': return <Settings />;
      case 'myrides': return <MyRides />;
      case 'wallet': return <Wallet />;
      case 'notifications': return <Notifications />;
      case 'reviews': return <Reviews />;
      case 'places': return <SavedPlaces />;
      case 'receipts': return <Receipts />;
      case 'lostfound': return <LostAndFound />;
      case 'favorites': return <FavoriteDrivers />;
      case 'referrals': return <Referrals />;
      case 'offers': return <Offers />;
      case 'help': return <HelpCenter />;
      default:
        return (
          <div style={gridStyle}>
            {activeRide ? (
               <div style={{...cardStyle, gridColumn: '1 / -1', flexDirection: 'row', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981'}}>
               <div style={{ textAlign: 'left' }}>
                 <h3 style={{ margin: '0 0 10px 0', color: '#10B981' }}>Active Ride</h3>
                 <p style={{ margin: 0, color: '#E2E8F0' }}>Status: {activeRide.status}</p>
               </div>
               <button onClick={() => navigate(`/live/${activeRide._id}`)} style={{ background: '#10B981', color: '#0F172A', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                 View Ride
               </button>
             </div>
            ) : (
              <div style={{...cardStyle, gridColumn: '1 / -1', flexDirection: 'row', justifyContent: 'space-between', background: 'rgba(255, 210, 31, 0.1)', border: '1px solid #FFD21F'}}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#FFD21F' }}>Ready for a ride?</h3>
                  <p style={{ margin: 0, color: '#E2E8F0' }}>Book a car in seconds and reach your destination safely.</p>
                </div>
                <button style={{ background: '#FFD21F', color: '#0F172A', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                  Book Now
                </button>
              </div>
            )}

            {navItems.map((item, index) => (
              <div 
                key={index} 
                style={cardStyle}
                onClick={() => setActiveTab(item.id)}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#FFD21F';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 210, 31, 0.2)';
                }}
              >
                <div style={iconStyle}>{item.icon}</div>
                <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>{item.title}</h3>
                <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={{ paddingBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#FFD21F', margin: '0 0 0.5rem 0' }}>Welcome back, {user?.name || 'Passenger'}</h1>
            <p style={{ color: '#94A3B8', margin: 0 }}>
              {activeTab === 'dashboard' ? 'What would you like to do today?' : <span style={{cursor: 'pointer', color: '#FFD21F', textDecoration: 'underline'}} onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</span>}
            </p>
          </div>
        </div>
        
        {renderContent()}
      </div>
      <SOSButton rideId={activeRide?.id || null} />
    </div>
  );
};

export default PassengerDashboard;
