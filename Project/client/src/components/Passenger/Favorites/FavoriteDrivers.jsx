import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const FavoriteDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getFavoriteDrivers();
      setDrivers(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch favorite drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove from favorites?')) return;
    try {
      await passengerApiService.removeFavoriteDriver(id);
      setDrivers(drivers.filter(d => d._id !== id && d.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to remove driver');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    padding: '2rem',
    color: '#fff',
    fontFamily: 'sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  };

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const cardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.2rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255, 210, 31, 0.2)',
    color: '#FFD21F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  };

  if (loading) {
    return <div style={{...containerStyle, alignItems: 'center'}}>Loading favorite drivers...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <h2 style={{ color: '#FFD21F', textAlign: 'center', marginBottom: '1.5rem' }}>Favorite Drivers</h2>
        
        {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {drivers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94A3B8' }}>You haven't added any favorite drivers yet.</p>
        ) : (
          drivers.map(driver => (
            <div key={driver._id || driver.id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={avatarStyle}>{(driver.name || driver.driverName || 'D').charAt(0).toUpperCase()}</div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1rem' }}>{driver.name || driver.driverName}</h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>{driver.car || 'Standard'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div>
                  <div style={{ color: '#FFD21F', fontWeight: 'bold', marginBottom: '4px' }}>★ {driver.rating || '5.0'}</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{driver.rides || 0} rides together</div>
                </div>
                <button 
                  onClick={() => handleRemove(driver._id || driver.id)}
                  style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoriteDrivers;
