import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useMapContext } from '../../context/MapContext';

const MARKER_ICON = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#FFD400" stroke="#000" stroke-width="2"/></svg>'),
    scaledSize: { width: 16, height: 16 },
    anchor: { x: 8, y: 8 }
};

export default function IntercityMap({ pickup, destination, distanceKm }) {
    const { isLoaded } = useMapContext();
    const [directions, setDirections] = useState(null);

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
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
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }]
            }
        ]
    }), []);

    // Dummy Geocoding (In a real app, use Geocoding API)
    // Here we'll just mock coordinates for demo purposes
    const pCoord = useMemo(() => pickup ? { lat: 19.0760, lng: 72.8777 } : null, [pickup]);
    const dCoord = useMemo(() => {
        if (!destination) return null;
        const offset = (destination.length % 5) + 1;
        return { lat: 19.0760 + (offset * 0.2), lng: 72.8777 + (offset * 0.2) };
    }, [destination]);

    useEffect(() => {
        if (!isLoaded || !pCoord || !dCoord || !window.google) {
            setDirections(null);
            return;
        }

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: pCoord,
                destination: dCoord,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    }, [isLoaded, pCoord, dCoord]);

    return (
        <div className="ic-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', minHeight: '400px', flex: 1 }}>
                {!isLoaded ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        Loading Google Maps...
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={pCoord || { lat: 19.0760, lng: 72.8777 }}
                        zoom={pCoord && !dCoord ? 12 : 10}
                        options={mapOptions}
                    >
                        {pCoord && !directions && <Marker position={pCoord} icon={MARKER_ICON} />}
                        {dCoord && !directions && <Marker position={dCoord} icon={MARKER_ICON} />}
                        
                        {directions && (
                            <DirectionsRenderer 
                                directions={directions} 
                                options={{
                                    suppressMarkers: true,
                                    polylineOptions: {
                                        strokeColor: '#FFD400',
                                        strokeWeight: 4,
                                        strokeOpacity: 0.8
                                    }
                                }} 
                            />
                        )}
                        {directions && pCoord && <Marker position={pCoord} icon={MARKER_ICON} />}
                        {directions && dCoord && <Marker position={dCoord} icon={MARKER_ICON} />}
                    </GoogleMap>
                )}
            </div>

            {distanceKm > 0 && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 400, display: 'flex', gap: 12 }}>
                    <div style={{ background: 'rgba(20,20,20,0.9)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>Distance</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFD400' }}>{distanceKm} km</div>
                    </div>
                    <div style={{ background: 'rgba(20,20,20,0.9)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>Est. Travel Time</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{Math.round(distanceKm / 50)} hrs</div>
                    </div>
                </div>
            )}
        </div>
    );
}
