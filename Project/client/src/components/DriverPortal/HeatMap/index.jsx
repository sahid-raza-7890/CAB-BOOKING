import React, { useMemo } from 'react';
import { useMapContext } from '../../../context/MapContext';
import { GoogleMap, Circle } from '@react-google-maps/api';

export default function HeatMap() {
    const { isLoaded } = useMapContext();
    const mapCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai

    // Generate some mock heatmap data around Mumbai
    const heatmapData = useMemo(() => {
        return [
            { lat: 19.0760, lng: 72.8777 },
            { lat: 19.0780, lng: 72.8777 },
            { lat: 19.0750, lng: 72.8797 },
            { lat: 19.0710, lng: 72.8727 },
            { lat: 19.0810, lng: 72.8747 },
            { lat: 19.0658, lng: 72.8683 }, // BKC area (higher density)
            { lat: 19.0658, lng: 72.8683 },
            { lat: 19.0650, lng: 72.8690 },
            { lat: 18.9696, lng: 72.8193 }, // Mumbai Central
            { lat: 18.9696, lng: 72.8193 },
            { lat: 18.9700, lng: 72.8200 }
        ];
    }, []);

    if (!isLoaded) {
        return (
            <div className="dp-content" style={{ flex: 1, padding: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD21F', marginBottom: '16px' }}>Demand Heat Map</h2>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', minHeight: '400px' }}>
                    <div style={{ color: '#666', fontSize: '14px' }}>Loading Map...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dp-content" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD21F', marginBottom: '16px', flexShrink: 0 }}>Demand Heat Map</h2>
            <div style={{ flex: 1, width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--card-border, rgba(255,255,255,0.08))', minHeight: '400px', position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                    center={mapCenter}
                    zoom={12}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
                        ]
                    }}
                >
                    {heatmapData.map((pt, i) => (
                        <Circle
                            key={i}
                            center={{ lat: pt.lat, lng: pt.lng }}
                            radius={400}
                            options={{
                                fillColor: '#ff0000',
                                fillOpacity: 0.35,
                                strokeColor: 'transparent',
                                strokeWeight: 0
                            }}
                        />
                    ))}
                </GoogleMap>
            </div>
        </div>
    );
}
