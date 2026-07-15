import React, { useState } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const SOSButton = ({ rideId }) => {
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [error, setError] = useState('');

  const handleSOS = async () => {
    if (!window.confirm('EMERGENCY SOS: This will alert emergency services and your emergency contacts. Proceed?')) return;
    
    try {
      setLoading(true);
      setError('');
      await passengerApiService.triggerSOS({ rideId });
      setTriggered(true);
      alert('SOS Triggered! Help is on the way.');
    } catch (err) {
      setError(err.message || 'Failed to trigger SOS');
      alert('Error triggering SOS: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const btnStyle = {
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '1.2rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
    animation: triggered ? 'none' : 'pulse 2s infinite',
    opacity: loading ? 0.7 : 1,
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: 9999
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>
      <button onClick={handleSOS} style={btnStyle} disabled={loading} title="Emergency SOS">
        SOS
      </button>
    </>
  );
};

export default SOSButton;
