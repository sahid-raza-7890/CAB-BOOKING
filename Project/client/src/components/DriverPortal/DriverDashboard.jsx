import React, { useContext, useMemo, useEffect, useRef } from 'react';
import { useDriver } from './DriverContext';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { useMapContext } from '../../context/MapContext';

import { useNavigate } from 'react-router-dom';
import RideRequestList from './RideRequests/RideRequestList';
import ActiveRideDashboard from './ActiveRide';

const LiveOnlineTime = ({ isOnline, shiftStartedAt }) => {
    const [seconds, setSeconds] = React.useState(0);

    // Update seconds continuously based on shiftStartedAt
    React.useEffect(() => {
        let interval;
        if (isOnline && shiftStartedAt) {
            // Initial sync
            const start = new Date(shiftStartedAt).getTime();
            setSeconds(Math.floor((Date.now() - start) / 1000));

            // Tick every second
            interval = setInterval(() => {
                setSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isOnline, shiftStartedAt]);

    const displayHours = Math.floor(seconds / 3600);
    const displayMins = Math.floor((seconds % 3600) / 60);
    const displaySecs = seconds % 60;
    
    return (
        <div className="dp-kpi-value" style={{ color: '#3B82F6' }}>
            {displayHours}h {displayMins}m <span style={{fontSize: '0.6em', opacity: 0.8}}>{displaySecs}s</span>
        </div>
    );
};

const DriverDashboard = () => {
    const { driver, walletSummary, earningsSummary, isOnline, availability, pendingRequests, acceptRideRequest, rejectRideRequest, expireRideRequest, activeRide, dashboard } = useDriver();
    const { user } = useContext(AuthContext);
    const socket = useContext(SocketContext);
    const { isLoaded } = useMapContext();
    const navigate = useNavigate();

    const [position, setPosition] = React.useState({ lat: 12.9716, lng: 77.5946 });

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error("Location error", err)
            );
        }
    };

    const mapRef = useRef(null);
    const mapInst = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!mapRef.current) return;
        const loadMap = () => {
            if (!window.L || !mapRef.current) return;
            const L = window.L;
            if (!mapInst.current) {
                const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([position.lat, position.lng], 13);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
                mapInst.current = map;
            } else {
                mapInst.current.setView([position.lat, position.lng], mapInst.current.getZoom());
            }

            // Clear old markers
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            // Add Driver Position Marker
            if (isOnline) {
                const driverMarker = L.marker([position.lat, position.lng], {
                    icon: L.divIcon({ html: '<div style="font-size:24px;filter:drop-shadow(0 2px 6px rgba(34,197,94,0.6));">🚕</div>', iconSize:[24,24], iconAnchor:[12,12], className:'' })
                }).addTo(mapInst.current);
                markersRef.current.push(driverMarker);
            }

            // Add Pending Requests Markers
            if (pendingRequests && pendingRequests.length > 0) {
                pendingRequests.forEach(req => {
                    const lat = req.ride?.pickupLocation?.coordinates?.[1] || req.ride?.pickupLocation?.lat || 12.9716;
                    const lng = req.ride?.pickupLocation?.coordinates?.[0] || req.ride?.pickupLocation?.lng || 77.5946;
                    const reqMarker = L.marker([lat, lng], {
                        icon: L.divIcon({ html: '<div style="font-size:24px;filter:drop-shadow(0 2px 6px rgba(239,68,68,0.6));">🙋</div>', iconSize:[24,24], iconAnchor:[12,12], className:'' })
                    }).addTo(mapInst.current);
                    markersRef.current.push(reqMarker);
                });
            }
        };

        if (window.L) { loadMap(); return; }
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link'); link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = loadMap;
        document.head.appendChild(script);
    }, [position, isOnline, pendingRequests]);

    // Dashboard remains accessible even with an active ride, 
    // transition happens on explicitly accepting a ride.

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '14px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <div id="ucab-driver-map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Locate Me Button */}
            <button 
                onClick={handleLocateMe}
                style={{
                    position: 'absolute',
                    bottom: '120px',
                    right: '20px',
                    zIndex: 20,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    color: 'var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '24px'
                }}
                title="Current Location"
            >
                🎯
            </button>

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <div className="dp-kpi-grid" style={{ pointerEvents: 'auto', marginBottom: 'auto' }}>
                    <div className="dp-kpi-card" style={{ background: 'rgba(15,15,15,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="dp-kpi-top">
                            <div>
                                <div className="dp-kpi-label">Today's Earnings</div>
                                <div className="dp-kpi-value" style={{ color: '#FFD21F' }}>₹{earningsSummary?.today || 0}</div>
                            </div>
                            <span className="dp-kpi-icon">💰</span>
                        </div>
                    </div>
                    <div className="dp-kpi-card" style={{ background: 'rgba(15,15,15,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="dp-kpi-top">
                            <div>
                                <div className="dp-kpi-label">Trips Completed</div>
                                <div className="dp-kpi-value" style={{ color: '#00D26A' }}>{dashboard?.stats?.trips || 0}</div>
                            </div>
                            <span className="dp-kpi-icon">🚖</span>
                        </div>
                    </div>
                    <div className="dp-kpi-card" style={{ background: 'rgba(15,15,15,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="dp-kpi-top">
                            <div>
                                <div className="dp-kpi-label">Online Time</div>
                                <LiveOnlineTime isOnline={isOnline} shiftStartedAt={availability?.shiftStartedAt} />
                            </div>
                            <span className="dp-kpi-icon">⏱️</span>
                        </div>
                    </div>
                    <div className="dp-kpi-card" style={{ background: 'rgba(15,15,15,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="dp-kpi-top">
                            <div>
                                <div className="dp-kpi-label">Wallet Balance</div>
                                <div className="dp-kpi-value" style={{ color: '#fff' }}>₹{walletSummary?.balance || 0}</div>
                            </div>
                            <span className="dp-kpi-icon">💳</span>
                        </div>
                    </div>
                </div>

                <div style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingBottom: '20px' }}>
                    {pendingRequests && pendingRequests.length > 0 && (
                        <div className="dp-card" style={{ width: '100%', maxWidth: '400px', borderColor: '#FFD21F', boxShadow: '0 8px 32px rgba(255,210,31,0.2)', background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(16px)' }}>
                            <div className="dp-card-header" style={{ borderBottomColor: 'rgba(255,210,31,0.2)' }}>
                                <div className="dp-section-title" style={{ color: '#FFD21F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ animation: 'adPulse 2s infinite', display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#FFD21F' }}></span>
                                    Incoming Ride Request!
                                </div>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <RideRequestList 
                                    pendingRequests={[pendingRequests[0]]} 
                                    loading={false}
                                    onAccept={async (reqId) => {
                                        await acceptRideRequest(reqId);
                                        navigate('/driver/active');
                                    }}
                                    onReject={rejectRideRequest}
                                    onExpire={expireRideRequest}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
