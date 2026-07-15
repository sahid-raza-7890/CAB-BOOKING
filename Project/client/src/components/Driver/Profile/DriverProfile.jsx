import React, { useState } from 'react';

const DriverProfile = () => {
  const [profile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    vehicle: 'Toyota Prius - ABC 123',
    rating: 4.8,
    totalTrips: 1240,
    joinDate: 'Jan 2023',
  });

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  };

  const containerStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'system-ui, sans-serif'
  };

  const accentColor = '#FFD21F';

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: accentColor, marginBottom: '24px', fontSize: '2rem', fontWeight: 'bold' }}>Driver Profile</h1>
        
        <div style={glassStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: accentColor, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#0F172A',
              fontWeight: 'bold'
            }}>
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem' }}>{profile.name}</h2>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>Driver since {profile.joinDate}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Email</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{profile.email}</p>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Phone</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{profile.phone}</p>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Vehicle</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{profile.vehicle}</p>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Rating</p>
              <p style={{ margin: 0, fontWeight: '500', color: accentColor }}>⭐ {profile.rating}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', textAlign: 'right' }}>
            <button style={{
              background: accentColor,
              color: '#0F172A',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
