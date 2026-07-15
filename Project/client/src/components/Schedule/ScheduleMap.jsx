import React, { useMemo } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useMapContext } from '../../context/MapContext';

const PICKUP_ICON = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#22C55E" stroke="#000" stroke-width="2"/></svg>'),
    scaledSize: { width: 16, height: 16 },
    anchor: { x: 8, y: 8 }
};

const DROPOFF_ICON = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#EF4444" stroke="#000" stroke-width="2"/></svg>'),
    scaledSize: { width: 16, height: 16 },
    anchor: { x: 8, y: 8 }
};

export default function ScheduleMap({ pickup, dropoff, category }) {
    const { isLoaded } = useMapContext();
    
    // Mock coordinates for visualization (Mumbai logic)
    const pCoord = useMemo(() => pickup ? { lat: 19.0760, lng: 72.8777 } : null, [pickup]);
    const dCoord = useMemo(() => dropoff ? { lat: 18.5204, lng: 73.8567 } : null, [dropoff]);

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
        <div className="sch-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', minHeight: '300px', flex: 1 }}>
                {!isLoaded ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        Loading Google Maps...
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={pCoord || { lat: 19.0760, lng: 72.8777 }}
                        zoom={pCoord && (!dCoord || category === 'Rental') ? 13 : 11}
                        options={mapOptions}
                    >
                        {pCoord && <Marker position={pCoord} icon={PICKUP_ICON} />}
                        
                        {category !== 'Rental' && dCoord && (
                            <>
                                <Marker position={dCoord} icon={DROPOFF_ICON} />
                                {pCoord && (
                                    <Polyline 
                                        path={[pCoord, dCoord]} 
                                        options={{ strokeColor: '#22C55E', strokeWeight: 4, strokeOpacity: 0.6 }} 
                                    />
                                )}
                            </>
                        )}
                    </GoogleMap>
                )}
            </div>
        </div>
    );
}
