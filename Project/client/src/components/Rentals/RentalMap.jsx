import React, { useMemo } from 'react';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { useMapContext } from '../../context/MapContext';

const MARKER_ICON = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#22C55E" stroke="#000" stroke-width="2"/></svg>'),
    scaledSize: { width: 16, height: 16 },
    anchor: { x: 8, y: 8 }
};

export default function RentalMap({ pickup, includedDistance }) {
    const { isLoaded } = useMapContext();
    
    // Mock coordinates for pickup
    const pCoord = useMemo(() => pickup ? { lat: 19.0760, lng: 72.8777 } : null, [pickup]);

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

    return (
        <div className="rn-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', minHeight: '300px', flex: 1 }}>
                {!isLoaded ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        Loading Google Maps...
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={pCoord || { lat: 19.0760, lng: 72.8777 }}
                        zoom={pCoord ? (includedDistance ? 11 : 13) : 11}
                        options={mapOptions}
                    >
                        {pCoord && <Marker position={pCoord} icon={MARKER_ICON} />}
                        
                        {pCoord && includedDistance && (
                            <Circle 
                                center={pCoord} 
                                radius={(includedDistance / 2) * 1000} 
                                options={{
                                    strokeColor: '#22C55E',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                    fillColor: '#22C55E',
                                    fillOpacity: 0.1,
                                }}
                            />
                        )}
                    </GoogleMap>
                )}
            </div>

            {includedDistance > 0 && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 400, display: 'flex', gap: 12 }}>
                    <div style={{ background: 'rgba(20,20,20,0.9)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>Coverage Radius</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#22C55E' }}>{includedDistance / 2} km</div>
                    </div>
                </div>
            )}
        </div>
    );
}
