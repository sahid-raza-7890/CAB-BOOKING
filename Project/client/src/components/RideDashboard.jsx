import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Skeleton from './Common/Skeleton';
import { useSocket } from '../context/SocketContext';

export default function RideDashboard() {
    const { id } = useParams();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const [driverLocation, setDriverLocation] = useState(null);
    const [showCallModal, setShowCallModal] = useState(false);
    
    const mapRef = React.useRef(null);
    const mapInst = React.useRef(null);
    const markerInst = React.useRef(null);

    // Handoff & OTP
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [showStartedPopup, setShowStartedPopup] = useState(false);
    const [showCompletedPopup, setShowCompletedPopup] = useState(false);

    // Cancel Timer
    const [cancelMode, setCancelMode] = useState(false);
    const [cancelSeconds, setCancelSeconds] = useState(40);

    // Call / Share
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        fetchRide();
        // Fallback polling for status updates
        const interval = setInterval(fetchRide, 5000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (socket) {
            const handleLocationUpdate = (data) => {
                if (data.rideId === id) {
                    setDriverLocation({ lat: data.lat, lng: data.lon });
                }
            };
            socket.on('driver_location_update', handleLocationUpdate);
            return () => {
                socket.off('driver_location_update', handleLocationUpdate);
            };
        }
    }, [socket, id]);

    // Initialize & update Leaflet Map
    useEffect(() => {
        if (!driverLocation || !mapRef.current) return;
        const loadMap = () => {
            if (!window.L || !mapRef.current) return;
            const L = window.L;
            if (!mapInst.current) {
                const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([driverLocation.lat, driverLocation.lng], 15);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
                mapInst.current = map;
                markerInst.current = L.marker([driverLocation.lat, driverLocation.lng], { 
                    icon: L.divIcon({ html: '<div style="font-size:24px;filter:drop-shadow(0 2px 6px rgba(34,197,94,0.6));">🚕</div>', iconSize:[24,24], iconAnchor:[12,12], className:'' }) 
                }).addTo(map);
            } else {
                mapInst.current.setView([driverLocation.lat, driverLocation.lng]);
                if (markerInst.current) {
                    markerInst.current.setLatLng([driverLocation.lat, driverLocation.lng]);
                }
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
    }, [driverLocation]);

    const fetchRide = async () => {
        const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
        try {
            const res = await fetch('http://localhost:5000/api/rides/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const ridesArray = data.rides || (Array.isArray(data) ? data : []);
            const currentRide = ridesArray.find(r => r._id === id);
            if (currentRide) {
                setRide(currentRide);
                if (currentRide.status === 'Accepted' && !showOtpModal && currentRide.status !== 'InProgress') {
                    setShowOtpModal(true);
                }
                if (currentRide.status === 'InProgress' || currentRide.status === 'Completed' || currentRide.status === 'Cancelled') {
                    setShowOtpModal(false);
                }
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartRide = async () => {
        if (!otpInput) {
            setOtpError('Please enter the OTP.');
            return;
        }
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch(`http://localhost:5000/api/rides/${id}/start`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otp: otpInput })
            });
            const data = await res.json();
            if (res.ok) {
                setShowOtpModal(false);
                setOtpError('');
                fetchRide();
                setShowStartedPopup(true);
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Ride Started', { body: 'Your driver has verified the OTP. Have a safe trip!' });
                }
            } else {
                setOtpError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setOtpError('Network error');
        }
    };

    const handleCompleteRide = async () => {
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch(`http://localhost:5000/api/rides/${id}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRide();
                setShowCompletedPopup(true);
            }
        } catch (err) {
            console.error('Complete failed', err);
        }
    };

    // Cancellation Timer Logic
    useEffect(() => {
        let timer;
        if (cancelMode && cancelSeconds > 0) {
            timer = setInterval(() => {
                setCancelSeconds(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cancelMode, cancelSeconds]);

    const handleConfirmCancel = async () => {
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch(`http://localhost:5000/api/rides/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ reason: 'Cancelled by user via dashboard' })
            });
            if (res.ok) {
                navigate('/my-rides');
            }
        } catch (err) {
            console.error('Cancel failed', err);
        }
    };

    const handleShare = async () => {
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch(`http://localhost:5000/api/rides/${id}/share`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.shareUrl) {
                setShareUrl(data.shareUrl);
            }
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    const handleCall = async () => {
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch(`http://localhost:5000/api/rides/mask-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ rideId: id, driverId: 'mock-driver' })
            });
            const data = await res.json();
            if (data.maskedCallUrl) {
                setShowCallModal(true);
            }
        } catch (err) {
            console.error('Call failed', err);
        }
    };

    if (loading || !ride) {
        return <div style={{ padding: 40 }}><Skeleton height="500px" /></div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 600, margin: '0 auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Live Mission Control</h2>
                <div style={{ padding: '6px 12px', borderRadius: 20, background: 'var(--badge-bg)', color: 'var(--badge-text)', fontWeight: 800, fontSize: 13 }}>
                    {ride.status.toUpperCase()}
                </div>
            </div>

            {/* Live Progress Bar and Map */}
            <div className="premium-glass" style={{ marginBottom: 24, padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                    <span>{ride.pickupLocation.split(',')[0]}</span>
                    <span>{ride.dropoffLocation ? ride.dropoffLocation.split(',')[0] : 'Rental'}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--card-border)', borderRadius: 4, overflow: 'hidden', position: 'relative', marginBottom: 16 }}>
                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, bottom: 0, 
                        width: ride.status === 'InProgress' ? '60%' : ride.status === 'Completed' ? '100%' : '10%', 
                        background: 'var(--primary-accent)', 
                        transition: 'width 2s ease-in-out' 
                    }} />
                </div>
                {driverLocation && (
                    <div style={{ height: 200, width: '100%', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                        <div id="ucab-live-map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, zIndex: 1000 }}>LIVE</div>
                    </div>
                )}
            </div>

            {/* Driver Info or Searching Placeholder */}
            {ride.status === 'Pending' || ride.status === 'Searching' ? (
                <div className="premium-glass" style={{ marginBottom: 24, padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, border: '3px solid var(--primary-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Searching for a driver...</h3>
                    <p style={{ margin: 0, fontSize: 13 }}>Please wait while we connect you with the nearest available driver.</p>
                </div>
            ) : ride.driver ? (
                <div className="premium-glass" style={{ marginBottom: 24, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 30, background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        {ride.driver.name ? ride.driver.name.charAt(0).toUpperCase() : '🚗'}
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>{ride.driver.name || 'Your Driver'}</h3>
                        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                            <span>⭐ {ride.driver.rating || 4.8}</span>
                            <span>{ride.driver.phone}</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Ride Info */}
            <div className="premium-glass" style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Trip Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle</span>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ride.vehicleType}</div>
                    </div>
                    <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fare</span>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{ride.fare} ({ride.paymentMethod})</div>
                    </div>
                    {ride.preferences && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preferences</span>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                {ride.preferences.silentRide && <span style={{ padding: '4px 8px', background: 'var(--card-border)', borderRadius: 12, fontSize: 11, color: 'var(--text-main)' }}>🤫 Silent</span>}
                                {!ride.preferences.musicFriendly && <span style={{ padding: '4px 8px', background: 'var(--card-border)', borderRadius: 12, fontSize: 11, color: 'var(--text-main)' }}>🚫 No Music</span>}
                                {ride.preferences.temperature !== 'No Preference' && <span style={{ padding: '4px 8px', background: 'var(--card-border)', borderRadius: 12, fontSize: 11, color: 'var(--text-main)' }}>🌡️ {ride.preferences.temperature}</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <button onClick={handleCall} style={{ padding: 12, borderRadius: 10, border: 'none', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontWeight: 700, cursor: 'pointer' }}>
                    📞 Masked Call
                </button>
                <button onClick={handleShare} style={{ padding: 12, borderRadius: 10, border: 'none', background: 'var(--primary-accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    🔗 Share Live Tracking
                </button>
            </div>

            {shareUrl && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--badge-bg)', color: 'var(--primary-accent)', fontSize: 12, wordBreak: 'break-all', marginBottom: 24 }}>
                    <strong>Tracking URL:</strong> {shareUrl}
                </div>
            )}

            {/* Cancellation Zone */}
            {ride.status !== 'Completed' && ride.status !== 'Cancelled' && (
                <div style={{ textAlign: 'center' }}>
                    {!cancelMode ? (
                        <button onClick={() => setCancelMode(true)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                            Cancel Ride
                        </button>
                    ) : (
                        <div style={{ padding: 16, border: '1px solid #ef4444', borderRadius: 10 }}>
                            <p style={{ color: '#ef4444', margin: '0 0 12px 0', fontSize: 14 }}>Are you sure? A cancellation fee may apply.</p>
                            <button 
                                disabled={cancelSeconds > 0} 
                                onClick={handleConfirmCancel}
                                style={{ width: '100%', padding: 12, borderRadius: 8, background: cancelSeconds > 0 ? 'var(--card-border)' : '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: cancelSeconds > 0 ? 'not-allowed' : 'pointer' }}
                            >
                                {cancelSeconds > 0 ? `Wait ${cancelSeconds}s...` : 'Confirm Cancellation'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Simulator Controls */}
            {ride.status === 'InProgress' && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <button onClick={handleCompleteRide} style={{ padding: '12px 24px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                        Simulate Ride Completion
                    </button>
                </div>
            )}

            {/* Check My Ride Modal Overlay */}
            {showOtpModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
                }}>
                    <div className="premium-glass" style={{ width: '100%', maxWidth: 400 }}>
                        <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', textAlign: 'center' }}>Check My Ride</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                            Please verify the License Plate matches before entering the vehicle.
                        </p>
                        
                        <div style={{ background: 'var(--card-border)', padding: '16px', borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>License Plate</span>
                            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', letterSpacing: 2 }}>TS 09 EA 1234</div>
                        </div>

                        <div style={{ background: 'var(--primary-accent)', padding: '12px', borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 12, color: '#fff', opacity: 0.8, textTransform: 'uppercase' }}>Your Secure OTP</span>
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 6 }}>{ride.otp || '1234'}</div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textAlign: 'center' }}>Driver Handoff Simulator (Enter OTP to start)</label>
                            <input 
                                type="text" maxLength={4} value={otpInput} onChange={e => setOtpInput(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-main)', textAlign: 'center', fontSize: 20, letterSpacing: 8, boxSizing: 'border-box' }}
                            />
                        </div>

                        {otpError && <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{otpError}</div>}

                        <button onClick={handleStartRide} style={{ width: '100%', padding: 14, borderRadius: 8, background: 'var(--primary-accent)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                            Start Trip
                        </button>
                    </div>
                </div>
            )}

            {/* Masked Call Overlay */}
            {showCallModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
                }}>
                    <div className="premium-glass" style={{ width: '100%', maxWidth: 300, textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--card-border)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                            👤
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Calling Driver...</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                            Connecting via Secure Masked Line. Your real number is hidden.
                        </p>
                        
                        <button onClick={() => setShowCallModal(false)} style={{ width: '100%', padding: 14, borderRadius: 30, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                            End Call
                        </button>
                    </div>
                </div>
            )}

            {/* Ride Started Popup */}
            {showStartedPopup && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
                }}>
                    <div className="premium-glass" style={{ width: '100%', maxWidth: 350, textAlign: 'center', padding: 30 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                            ✅
                        </div>
                        <h2 style={{ margin: '0 0 12px 0', color: 'var(--text-main)' }}>Ride Started!</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24 }}>
                            Your driver has verified the OTP. Have a safe and pleasant trip!
                        </p>
                        <button onClick={() => setShowStartedPopup(false)} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                            Awesome
                        </button>
                    </div>
                </div>
            )}

            {/* Ride Completed Popup */}
            {showCompletedPopup && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
                }}>
                    <div className="premium-glass" style={{ width: '100%', maxWidth: 350, textAlign: 'center', padding: 30 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255, 215, 0, 0.2)', color: '#FFD400', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                            🎉
                        </div>
                        <h2 style={{ margin: '0 0 12px 0', color: 'var(--text-main)' }}>Ride Completed!</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24 }}>
                            You have successfully arrived at your destination. Thank you for riding with UCAB!
                        </p>
                        <button onClick={() => { setShowCompletedPopup(false); navigate('/my-rides'); }} style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary-accent)', color: '#000', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                            View Trip History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
