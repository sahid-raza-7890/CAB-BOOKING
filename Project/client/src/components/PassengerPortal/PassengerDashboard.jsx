import React, { useContext, useMemo } from 'react';
import { PassengerContext } from '../../context/PassengerContext';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useMapContext } from '../../context/MapContext';
import { useNavigate } from 'react-router-dom';

const CAR_ICON = {
  url: 'https://cdn-icons-png.flaticon.com/512/744/744402.png',
  scaledSize: { width: 32, height: 32 },
  anchor: { x: 16, y: 16 }
};

export default function PassengerDashboard() {
  const { liveDrivers, activeRide, loading } = useContext(PassengerContext);
  const { isLoaded } = useMapContext();
  const navigate = useNavigate();

  // Default center (can be passenger's location if available)
  const mapCenter = useMemo(() => ({ lat: 15.99, lng: 80.09 }), []); 

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
      }
    ]
  }), []);

  if (loading) {
    return <div className="pp-glass-panel">Loading dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Map Section */}
      <div className="pp-glass-panel" style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>Live Map</h2>
        <div className="pp-map-container" style={{ width: '100%', height: '360px', borderRadius: '12px', overflow: 'hidden' }}>
          {!isLoaded ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Loading Google Maps...
            </div>
          ) : (
            <GoogleMap 
              center={mapCenter} 
              zoom={13} 
              mapContainerStyle={{ width: '100%', height: '100%' }}
              options={mapOptions}
            >
              {liveDrivers?.map((driver, idx) => (
                <Marker 
                  key={idx} 
                  position={{ lat: driver.location.lat, lng: driver.location.lng }} 
                  icon={CAR_ICON}
                  title={`Driver ${driver.id.substring(0,6)}`}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>

      {/* Active Ride / Status Section */}
      <div className="pp-glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
            Current Status
          </h2>
          {activeRide ? (
            <p style={{ color: '#a0a0a0', margin: 0 }}>
              You have an active ride: <span style={{ color: '#FFD400', fontWeight: '600' }}>{activeRide.status}</span>
            </p>
          ) : (
            <p style={{ color: '#a0a0a0', margin: 0 }}>No active rides right now.</p>
          )}
        </div>
        <button className="pp-btn" onClick={() => navigate('/book-ride')}>
          Book a Ride Now
        </button>
      </div>

    </div>
  );
}
