import React, { useContext } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import './Operations.css';

const OperationsMap = () => {
  const { liveDrivers = [], activeRides = [] } = useContext(AdminContext);

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '4px', overflow: 'hidden' }}>
      <div className="map-placeholder">
        <div style={{ position: 'absolute', zIndex: 2, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🗺️</div>
          <div style={{ color: 'var(--accent-cyan)', fontWeight: '600', letterSpacing: '2px' }}>LIVE OPERATIONS MAP</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Tracking drivers and active rides...</div>
        </div>
        
        {liveDrivers.slice(0, 50).map((driver, i) => (
          <div key={driver._id || i} style={{ position: 'absolute', top: `${30 + (i % 5) * 10}%`, left: `${20 + (i % 6) * 10}%`, fontSize: '24px', zIndex: 1 }}>🚕</div>
        ))}
        {activeRides.slice(0, 50).map((ride, i) => (
          <div key={ride._id || i} style={{ position: 'absolute', top: `${20 + (i % 5) * 10}%`, left: `${30 + (i % 6) * 10}%`, fontSize: '24px', zIndex: 1 }}>📍</div>
        ))}
      </div>
    </div>
  );
};

export default OperationsMap;
