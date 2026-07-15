import React, { createContext, useContext, useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const MapContext = createContext({
  isLoaded: false,
  loadError: null,
  googleKey: null,
});

const libraries = ['places', 'geometry', 'drawing', 'visualization'];

// Inner component that only mounts AFTER we have the key,
// so useJsApiLoader is only ever called with one stable value.
const MapLoaderProvider = ({ googleKey, children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleKey,
    libraries,
    preventGoogleFontsLoading: true,
  });

  return (
    <MapContext.Provider value={{ isLoaded, loadError, googleKey }}>
      {children}
    </MapContext.Provider>
  );
};

export const MapProvider = ({ children }) => {
  const [googleKey, setGoogleKey] = useState(null);
  const [keyFetched, setKeyFetched] = useState(false);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/maps/provider');
        const data = await res.json();
        if (data.success && data.googleKey) {
          setGoogleKey(data.googleKey);
        }
      } catch (err) {
        console.error('Failed to fetch map provider details', err);
      } finally {
        setKeyFetched(true);
      }
    };
    fetchKey();
  }, []);

  // Don't render children until we know the key status
  if (!keyFetched) return null;

  // If we got a key, load Google Maps with it
  if (googleKey) {
    return (
      <MapLoaderProvider googleKey={googleKey}>
        {children}
      </MapLoaderProvider>
    );
  }

  // No key available — render children without maps
  return (
    <MapContext.Provider value={{ isLoaded: false, loadError: null, googleKey: null }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);
