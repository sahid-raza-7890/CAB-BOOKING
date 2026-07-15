import React, { useEffect, useRef } from 'react';

function ActiveRideCard({ ride, onViewDetails }) {
    const mapRef = useRef(null);
    const mapInst = useRef(null);

    useEffect(() => {
        if (!window.L || !mapRef.current) return;
        if (mapInst.current) return;

        const L = window.L;
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false
        }).setView([16.0, 80.1], 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);
        
        mapInst.current = map;

        // If ride has driver coordinates, add marker. This is a simple mockup since backend might not send actual coords yet
        // In real system, driver location is pushed via socket and mapped here.
        const dIcon = L.divIcon({
            html: `<div style="font-size:18px;filter:drop-shadow(0 2px 6px #ffc107);">🚕</div>`,
            iconSize: [24, 24], iconAnchor: [12, 12], className: ''
        });
        L.marker([16.0, 80.1], { icon: dIcon }).addTo(map);

        return () => {
            if (mapInst.current) {
                mapInst.current.remove();
                mapInst.current = null;
            }
        };
    }, [ride]);

    return (
        <div className="mr-active-ride">
            <div className="mr-active-map" id="mr-active-map-container" ref={mapRef}></div>
            <div className="mr-active-details">
                <div>
                    <div className="mr-active-header">
                        <span className="mr-active-badge">{ride.status}</span>
                        <span style={{ color: '#aaa', fontSize: '13px' }}>OTP: <strong style={{color:'#fff', letterSpacing: '2px'}}>{ride.otp || '---'}</strong></span>
                    </div>
                    
                    <div className="mr-driver-info">
                        <img 
                            src={ride.driver?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.driver?.name || 'Driver'}`} 
                            alt="Driver" 
                            className="mr-driver-avatar" 
                        />
                        <div>
                            <h3 className="mr-driver-name">{ride.driver?.name || 'Searching...'}</h3>
                            <div className="mr-vehicle-info">
                                {ride.vehicleId?.label} • {ride.vehicleType} • <span style={{color: '#ffc107'}}>⭐ {ride.driver?.rating || 'New'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#e5e5e5', fontSize: '14px' }}>
                            <span>📍</span> <span>{typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e5e5e5', fontSize: '14px' }}>
                            <span style={{ color: '#ef4444' }}>🔴</span> <span>{typeof ride.dropoffLocation === 'object' ? ride.dropoffLocation?.address || 'Unknown' : ride.dropoffLocation}</span>
                        </div>
                    </div>
                </div>
                
                <div className="mr-active-actions">
                    <button className="mr-btn mr-btn-primary" onClick={onViewDetails}>View Live Details</button>
                    <button className="mr-btn mr-btn-outline" onClick={() => alert("SOS Triggered! Admin Notified.")}>🆘 SOS</button>
                    <button className="mr-btn mr-btn-outline" onClick={() => alert("Tracking link copied!")}>🔗 Share</button>
                </div>
            </div>
        </div>
    );
}

export default ActiveRideCard;
