import React, { useState } from 'react';
import { useDriver } from '../DriverContext';
import DriverEmergencyService from '../../../services/driverEmergencyService';
import '../DriverPortal.css'; // ensure dp- styles are loaded

export default function EmergencyDashboard() {
  const { emergencyState, setEmergencyState, activeRide } = useDriver();
  const [loading, setLoading] = useState(false);

  const handleTriggerSOS = async () => {
    if (emergencyState) return;
    setLoading(true);
    try {
      const payload = {
        description: 'Driver activated SOS from Portal',
        location: activeRide?.pickupLocation || { lat: 12.9716, lng: 77.5946 } // Fallback for demo
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
    <div className="dp-content">
      <div style={{ marginBottom: 16 }}>
        <h2 className="dp-section-title">Safety & Emergency</h2>
        <p className="dp-section-sub">Quick access to emergency assistance and safety tools.</p>
      </div>

      {emergencyState && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ color: '#ef4444', margin: '0 0 4px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ animation: 'adPulse 2s infinite', display: 'inline-block', width: 10, height: 10, background: '#ef4444', borderRadius: '50%' }}></span>
              SOS ACTIVE
            </h3>
            <p style={{ margin: 0, color: '#f8fafc', fontSize: 13 }}>
              Emergency alert broadcasted. Support team and nearby responders have been notified.
            </p>
          </div>
          <button 
            onClick={handleCancelSOS} 
            disabled={loading}
            style={{ 
              background: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: 8, 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            {loading ? 'Cancelling...' : 'Cancel SOS'}
          </button>
        </div>
      )}

      <div className="dp-row2">
        <div className="dp-card" style={{ padding: 32, textAlign: 'center', borderColor: emergencyState ? '#ef4444' : 'rgba(255,255,255,0.07)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: 18 }}>Emergency Assistance</h3>
          <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 13, lineHeight: 1.5 }}>
            Press the button below to immediately alert the UCAB safety team and share your live location.
          </p>
          
          <button 
            onClick={emergencyState ? null : handleTriggerSOS}
            disabled={loading || emergencyState}
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: emergencyState ? '#ef4444' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#fff',
              border: emergencyState ? '4px solid #f87171' : 'none',
              fontSize: 32,
              fontWeight: 900,
              cursor: emergencyState ? 'default' : 'pointer',
              boxShadow: emergencyState ? '0 0 40px rgba(239,68,68,0.6)' : '0 10px 25px rgba(239,68,68,0.4)',
              transition: 'all 0.3s',
              animation: emergencyState ? 'adPulse 1.5s infinite' : 'none',
              opacity: loading ? 0.7 : 1
            }}
          >
            SOS
          </button>
        </div>

        <div className="dp-card" style={{ padding: 20 }}>
          <h3 className="dp-card-title" style={{ marginBottom: 20, fontSize: 16 }}>Quick Contacts</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>UCAB Safety Line</h4>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>24/7 dedicated support</span>
              </div>
              <a href="tel:112" style={{ background: '#FFD21F', color: '#000', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                Call Now
              </a>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>Local Police</h4>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>Emergency services</span>
              </div>
              <a href="tel:112" style={{ background: '#FFD21F', color: '#000', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                Dial 112
              </a>
            </div>
            
            {activeRide && (
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#3b82f6', fontSize: 14 }}>Active Passenger</h4>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Current ride contact</span>
                </div>
                <button style={{ background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
