import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { useMapContext } from '../context/MapContext';

// Simple Car emoji icon
const CAR_ICON = {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><text y="24" font-size="24">🚖</text></svg>'),
  scaledSize: { width: 30, height: 30 },
  anchor: { x: 15, y: 15 }
};

// Sample path in NYC
const pathCoordinates = [
  { lat: 40.758896, lng: -73.985130 }, // Times Square
  { lat: 40.760136, lng: -73.984242 },
  { lat: 40.762145, lng: -73.982823 },
  { lat: 40.764426, lng: -73.981273 },
  { lat: 40.766779, lng: -73.979605 },
  { lat: 40.768078, lng: -73.981442 }, // Turning
  { lat: 40.768132, lng: -73.981458 }, 
  { lat: 40.769917, lng: -73.983944 }, // Central Park South
];

export default function InteractiveMapSection() {
  const { isLoaded } = useMapContext();
  const [carPosition, setCarPosition] = useState(pathCoordinates[0]);
  const [pathIndex, setPathIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex(prev => {
        const nextIndex = (prev + 1) % pathCoordinates.length;
        setCarPosition(pathCoordinates[nextIndex]);
        return nextIndex;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: false,
    gestureHandling: 'none',
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

  return (
    <section className="py-24 bg-dark relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Precision Routing</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience real-time telemetry and sub-meter accuracy from pickup to destination.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Glass Overlay on map edges for styling */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(15,23,42,1)] z-[400]" />
          
          {!isLoaded ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: '#0f172a' }}>
              Loading Google Maps...
            </div>
          ) : (
            <GoogleMap 
              center={{ lat: 40.764426, lng: -73.981273 }} 
              zoom={14} 
              mapContainerStyle={{ height: '100%', width: '100%' }}
              options={mapOptions}
            >
              <Polyline 
                path={pathCoordinates} 
                options={{ strokeColor: '#22C55E', strokeWeight: 4, strokeOpacity: 0.6 }} 
              />
              
              <Marker position={pathCoordinates[0]} title="Pickup" />
              <Marker position={pathCoordinates[pathCoordinates.length - 1]} title="Dropoff" />
              
              <Marker position={carPosition} icon={CAR_ICON} />
            </GoogleMap>
          )}
        </motion.div>

      </div>
    </section>
  );
}
