import React, { useState } from 'react';
import './Emergency.css';
import DriverEmergencyService from '../../../services/driverEmergencyService';
import { useDriver } from '../DriverContext';

const EmergencyDashboard = () => {
    const { emergencyState, setEmergencyState, activeRide } = useDriver();
    const [loading, setLoading] = useState(false);

    const handleTriggerSOS = async () => {
        if (emergencyState) return;
        setLoading(true);
        try {
            const payload = {
                description: 'Driver activated SOS from Portal'
            };
            const res = await DriverEmergencyService.triggerSOS(payload);
            setEmergencyState(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to trigger SOS. Please call emergency services directly.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSOS = async () => {
        if (!window.confirm('Are you sure you want to cancel the active SOS?')) return;
        setLoading(true);
        try {
            await DriverEmergencyService.cancelSOS();
            setEmergencyState(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="emergency-dashboard">
            <div className="emergency-header">
                <h2 className="emergency-title">
                    <i className="fas fa-shield-alt"></i> Safety & Emergency
                </h2>
                <p style={{ color: '#94a3b8', margin: '8px 0 0 0' }}>
                    Quick access to emergency assistance and safety tools.
                </p>
            </div>

            {emergencyState && (
                <div className="emergency-status-banner">
                    <div>
                        <h3><i className="fas fa-exclamation-triangle"></i> SOS Active</h3>
                        <p style={{ margin: 0, color: '#f8fafc' }}>
                            Emergency alert sent. Support team has been notified.
                        </p>
                    </div>
                    <button className="ucab-btn" style={{ background: '#fff', color: '#ef4444' }} onClick={handleCancelSOS} disabled={loading}>
                        Cancel SOS
                    </button>
                </div>
            )}

            <div className="emergency-grid">
                <div className="emergency-panel" style={{ textAlign: 'center', borderColor: emergencyState ? '#ef4444' : 'rgba(239, 68, 68, 0.2)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Emergency Assistance</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
                        Press the button below to immediately alert the UCAB safety team and share your live location.
                    </p>
                    
                    <div className="sos-container">
                        <button 
                            className={`sos-button ${emergencyState ? 'active' : ''}`}
                            onClick={emergencyState ? null : handleTriggerSOS}
                            disabled={loading || emergencyState}
                        >
                            SOS
                        </button>
                    </div>
                </div>

                <div className="emergency-panel">
                    <h3 style={{ margin: '0 0 24px 0', color: '#fff' }}>Quick Contacts</h3>
                    
                    <div className="contact-card">
                        <div>
                            <h4 style={{ margin: '0 0 4px 0' }}>UCAB Safety Line</h4>
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>24/7 dedicated support</span>
                        </div>
                        <a href="tel:112" className="ucab-btn primary" style={{ textDecoration: 'none' }}>
                            <i className="fas fa-phone-alt"></i> Call
                        </a>
                    </div>
                    
                    <div className="contact-card">
                        <div>
                            <h4 style={{ margin: '0 0 4px 0' }}>Local Police</h4>
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Emergency services</span>
                        </div>
                        <a href="tel:112" className="ucab-btn primary" style={{ textDecoration: 'none' }}>
                            <i className="fas fa-phone-alt"></i> 112
                        </a>
                    </div>
                    
                    {activeRide && (
                        <div className="contact-card" style={{ borderColor: 'rgba(255, 215, 0, 0.2)' }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#ffd700' }}>Active Passenger</h4>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Current ride contact</span>
                            </div>
                            <button className="ucab-btn" style={{ background: 'transparent', border: '1px solid #ffd700', color: '#ffd700' }}>
                                <i className="fas fa-comment"></i> Message
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyDashboard;
