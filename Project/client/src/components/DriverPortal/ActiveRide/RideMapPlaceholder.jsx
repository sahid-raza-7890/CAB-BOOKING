import React, { useMemo, useState, useEffect } from 'react';
import { useDriver } from '../DriverContext';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useMapContext } from '../../../context/MapContext';

const RideMapPlaceholder = ({ step = 'pickup' }) => {
    const { activeRide } = useDriver();
    const { isLoaded } = useMapContext();
    const [directions, setDirections] = useState(null);
    const [coords, setCoords] = useState({ pLat: null, pLng: null, dLat: null, dLng: null });

    const pickup = activeRide?.pickupLocation;
    const dropoff = activeRide?.dropoffLocation;
    
    const pickupStr = typeof pickup === 'object' ? pickup?.address : pickup;
    const dropoffStr = typeof dropoff === 'object' ? dropoff?.address : dropoff;

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
            { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
        ]
    }), []);

    // Resolve coordinates using Geocoder if missing
    useEffect(() => {
        if (!isLoaded || !window.google) return;

        const geocoder = new window.google.maps.Geocoder();
        const resolveLoc = async (loc) => {
            if (!loc) return null;
            if (loc.coordinates) return { lat: loc.coordinates[1], lng: loc.coordinates[0] };
            if (loc.lat && loc.lng) return { lat: loc.lat, lng: loc.lng };

            const locStr = typeof loc === 'object' ? loc.address : loc;
            if (locStr) {
                return new Promise((resolve) => {
                    geocoder.geocode({ address: locStr }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            resolve({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                            });
                        } else {
                            resolve(null);
                        }
                    });
                });
            }
            return null;
        };

        const fetchAll = async () => {
            const p = await resolveLoc(pickup);
            const d = await resolveLoc(dropoff);
            setCoords({
                pLat: p ? p.lat : 14.4426, // Nellore
                pLng: p ? p.lng : 79.9865,
                dLat: d ? d.lat : 14.1463, // Gudur
                dLng: d ? d.lng : 79.8504
            });
        };
        fetchAll();
    }, [isLoaded, pickup, dropoff]);

    const { pLat, pLng, dLat, dLng } = coords;

    // Fetch directions
    useEffect(() => {
        if (!isLoaded || !window.google || pLat === null) return;

        // Mock driver location a bit away from pickup to show a realistic route
        const origin = step === 'pickup' 
            ? { lat: pLat - 0.005, lng: pLng - 0.005 } 
            : { lat: pLat, lng: pLng };
        
        const destination = step === 'pickup'
            ? { lat: pLat, lng: pLng }
            : { lat: dLat, lng: dLng };

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                } else {
                    console.error(`Error fetching directions: ${status}`);
                }
            }
        );
    }, [isLoaded, pLat, pLng, dLat, dLng, step]);

    const directionsOptions = {
        polylineOptions: {
            strokeColor: '#FFD21F', // Driver accent color
            strokeWeight: 4,
            strokeOpacity: 0.8
        },
        suppressMarkers: false 
    };

    if (pLat === null) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F', color: '#64748b' }}>
                Locating...
            </div>
        );
    }

    const currentCenter = step === 'pickup' ? { lat: pLat, lng: pLng } : { lat: dLat, lng: dLng };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GoogleMap 
                center={currentCenter} 
                zoom={13} 
                mapContainerStyle={{ width: '100%', height: '100%' }}
                options={mapOptions}
            >
                {directions ? (
                    <DirectionsRenderer directions={directions} options={directionsOptions} />
                ) : (
                    <>
                        <Marker position={{ lat: pLat, lng: pLng }} label="P" />
                        {activeRide?.status !== 'Accepted' && <Marker position={{ lat: dLat, lng: dLng }} label="D" />}
                    </>
                )}
            </GoogleMap>

            <div className="address-banner">
                <div className="address-icon">
                    <i className={`fas fa-${step === 'pickup' ? 'location-arrow' : 'flag-checkered'}`}></i>
                </div>
                <div className="address-info">
                    <p className="address-label">
                        {step === 'pickup' ? 'Navigating to Pickup' : 'Navigating to Drop-off'}
                    </p>
                    <p className="address-text">
                        {step === 'pickup' ? pickupStr || 'Loading...' : dropoffStr || 'Loading...'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RideMapPlaceholder;
