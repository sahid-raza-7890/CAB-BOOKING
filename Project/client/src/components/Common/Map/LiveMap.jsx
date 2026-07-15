import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Polyline, Circle } from '@react-google-maps/api';
import { useMapContext } from '../../../context/MapContext';

const CAR_ICON = {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><text y="24" font-size="24">🚖</text></svg>'),
  scaledSize: { width: 30, height: 30 },
  anchor: { x: 15, y: 15 }
};

export default React.memo(function LiveMap({ drivers = [], pickup, dropoff, route = [] }) {
  const { isLoaded } = useMapContext();
  const [animatedDrivers, setAnimatedDrivers] = useState(drivers);
  const mapRef = useRef(null);

  useEffect(() => {
    // Simulated driver animation for clustering and live tracking
    const interval = setInterval(() => {
      setAnimatedDrivers(prev => prev.map(d => ({
        ...d,
        lat: d.lat + (Math.random() - 0.5) * 0.001,
        lng: d.lng + (Math.random() - 0.5) * 0.001
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const center = useMemo(() => {
    if (pickup) {
      return Array.isArray(pickup) ? { lat: pickup[0], lng: pickup[1] } : pickup;
    }
    return { lat: 40.758896, lng: -73.985130 };
  }, [pickup]);

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
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
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
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
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

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback((map) => {
    mapRef.current = null;
  }, []);

  const getLatLng = (pt) => Array.isArray(pt) ? { lat: pt[0], lng: pt[1] } : pt;

  if (!isLoaded) {
    return (
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-slate-900">
        <span className="text-white/50">Loading Google Maps...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10" role="region" aria-label="Interactive Map">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={14}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {pickup && (
          <Circle
            center={getLatLng(pickup)}
            radius={500}
            options={{
              strokeColor: '#22C55E',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#22C55E',
              fillOpacity: 0.2,
            }}
          />
        )}

        {dropoff && (
          <Circle
            center={getLatLng(dropoff)}
            radius={500}
            options={{
              strokeColor: '#EF4444',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#EF4444',
              fillOpacity: 0.2,
            }}
          />
        )}

        {route.length > 0 && (
          <Polyline
            path={route.map(getLatLng)}
            options={{ strokeColor: '#3B82F6', strokeWeight: 4, strokeOpacity: 0.8 }}
          />
        )}

        {animatedDrivers.map(d => (
          <Marker
            key={d.id}
            position={{ lat: d.lat, lng: d.lng }}
            icon={CAR_ICON}
          />
        ))}
      </GoogleMap>
    </div>
  );
});
