import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import safetyService from '../../services/safetyService';
import { getActiveRide } from '../../services/rideService';
import SafetyAlertList from './SafetyAlertList';
import EmergencyButton from './EmergencyButton';
import EmergencyModal from './EmergencyModal';
import LiveRideShare from './LiveRideShare';
import SafetyTips from './SafetyTips';
import EmergencyContacts from './EmergencyContacts';
import SafetySkeleton from './SafetySkeleton';

export default function SafetyDashboard() {
    const { user, authenticated } = useContext(AuthContext);
    
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRide, setActiveRide] = useState(null);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [alertsRes, rideRes] = await Promise.all([
                safetyService.getAlerts(),
                getActiveRide()
            ]);
            setAlerts(alertsRes.data || []);
            setActiveRide(rideRes.data || null);
        } catch (error) {
            console.error("Failed to load safety data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authenticated || !user) return;
        fetchData();

        const socket = io('http://localhost:5000');
        socket.emit('register', user.userId || user.id);
        
        socket.on('safetyAlertUpdated', () => fetchData());
        socket.on('safetyAlertCreated', () => fetchData());

        return () => {
            socket.off('safetyAlertUpdated');
            socket.off('safetyAlertCreated');
            socket.disconnect();
        };
    }, [authenticated, user]);

    return (
        <div className="safety-container">
            <div className="safety-header">
                <h1><i className="fa-solid fa-shield-halved"></i> Safety Center</h1>
            </div>

            <div className="safety-layout">
                {/* Main Column */}
                <div className="safety-main-col">
                    {loading ? (
                        <SafetySkeleton />
                    ) : (
                        <>
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <h2 style={{ margin: '0 0 1rem 0' }}>Emergency Assistance</h2>
                                <p style={{ color: '#ccc', marginBottom: '2rem' }}>
                                    {activeRide ? 'Trigger an immediate SOS alert for your current ride.' : 'You can only trigger an SOS during an active ride.'}
                                </p>
                                
                                <EmergencyButton 
                                    disabled={!activeRide} 
                                    onClick={() => setShowEmergencyModal(true)} 
                                />
                                
                                {!activeRide && (
                                    <div style={{ marginTop: '2rem', color: '#888', fontSize: '0.9rem' }}>
                                        No active ride found. Call 112 directly if you are in immediate danger outside of a UCAB ride.
                                    </div>
                                )}
                            </div>

                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Active & Past Alerts</h3>
                            <SafetyAlertList alerts={alerts} refresh={fetchData} />
                        </>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="safety-sidebar-col">
                    {activeRide && <LiveRideShare ride={activeRide} />}
                    <EmergencyContacts />
                    <SafetyTips />
                </div>
            </div>

            {showEmergencyModal && activeRide && (
                <EmergencyModal 
                    rideId={activeRide._id} 
                    onClose={() => setShowEmergencyModal(false)}
                    onSuccess={() => {
                        setShowEmergencyModal(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
