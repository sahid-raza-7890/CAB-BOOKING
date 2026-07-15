import React, { useState } from 'react';
import safetyService from '../../../services/safetyService';
import { passengerApiService } from '../../../services/passengerApiService';
import '../Passenger.css';

const Safety = () => {
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [error, setError] = useState('');
  const [activeRideId, setActiveRideId] = useState('');
  
  const [contacts, setContacts] = useState(['mom@example.com', 'partner@example.com']);
  const [newContact, setNewContact] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  const handleSOS = async () => {
    if (!window.confirm('EMERGENCY SOS: This will alert emergency services and your trusted contacts. Proceed?')) return;
    
    try {
      setLoading(true);
      setError('');
      // Triggering SOS via the existing API
      await passengerApiService.triggerSOS({ rideId: activeRideId || 'current-ride' });
      setTriggered(true);
      alert('SOS Triggered! Help is on the way.');
    } catch (err) {
      setError(err.message || 'Failed to trigger SOS');
      alert('Error triggering SOS: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addContact = (e) => {
    e.preventDefault();
    if (newContact.trim() && !contacts.includes(newContact)) {
      setContacts([...contacts, newContact.trim()]);
      setNewContact('');
    }
  };

  const removeContact = (contactToRemove) => {
    setContacts(contacts.filter(c => c !== contactToRemove));
  };

  const handleShareRide = async () => {
    if (!activeRideId) {
      alert("Please enter an active ride ID to share.");
      return;
    }
    if (contacts.length === 0) {
      alert("Please add at least one trusted contact.");
      return;
    }
    
    try {
      setLoading(true);
      setShareStatus('');
      await safetyService.shareLiveRide(activeRideId, contacts);
      setShareStatus('Live ride link shared with trusted contacts!');
    } catch (err) {
      setError(err.message || 'Failed to share ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-container" style={{ maxWidth: '600px' }}>
      <h2 className="pp-title">Safety & Emergency</h2>
      
      {error && <div className="pp-error">{error}</div>}
      {shareStatus && <div style={{ color: '#10B981', textAlign: 'center', marginBottom: '1rem' }}>{shareStatus}</div>}

      <div style={{ background: 'rgba(15,23,42,0.6)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#EF4444', margin: '0 0 1rem 0' }}>Emergency SOS</h3>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Use this button only in emergencies. It will immediately alert local authorities and your trusted contacts.
        </p>
        
        <button 
          onClick={handleSOS} 
          disabled={loading}
          style={{
            background: '#EF4444',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '1.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: triggered ? 'none' : '0 4px 30px rgba(239, 68, 68, 0.6)',
            animation: triggered ? 'none' : 'pulse 2s infinite',
            opacity: loading ? 0.7 : 1,
            margin: '0 auto'
          }}
        >
          {triggered ? 'SENT' : 'SOS'}
        </button>
        <style>
          {`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
              70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          `}
        </style>
      </div>

      <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#FFD21F', margin: '0 0 1rem 0' }}>Trusted Contacts</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
          {contacts.map((contact, index) => (
            <div key={index} style={{ background: 'rgba(255, 210, 31, 0.1)', border: '1px solid #FFD21F', color: '#FFD21F', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{contact}</span>
              <button 
                onClick={() => removeContact(contact)}
                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
              >
                &times;
              </button>
            </div>
          ))}
          {contacts.length === 0 && <span style={{ color: '#94A3B8' }}>No trusted contacts added.</span>}
        </div>

        <form onSubmit={addContact} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input 
            className="pp-input"
            style={{ flex: 1, margin: 0 }}
            type="email"
            placeholder="Add email or phone..."
            value={newContact}
            onChange={e => setNewContact(e.target.value)}
          />
          <button type="submit" className="pp-btn">Add Contact</button>
        </form>

        <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>Share Live Ride</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            className="pp-input"
            style={{ flex: 1, margin: 0 }}
            placeholder="Active Ride ID (e.g. current)"
            value={activeRideId}
            onChange={e => setActiveRideId(e.target.value)}
          />
          <button onClick={handleShareRide} className="pp-btn" disabled={loading}>
            Share Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default Safety;
