import React, { useEffect, useState } from 'react';
import adminApiService from '../../../../services/adminApiService';

const styles = {
  container: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  card: {
    flex: '1 1 200px',
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
  },
  value: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#FFD21F',
    margin: '0.5rem 0'
  },
  label: {
    fontSize: '0.875rem',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};

const HealthCards = () => {
  const [health, setHealth] = useState({
    activeRides: 0,
    apiLatency: 0,
    sockets: 0,
    pendingSos: 0
  });

  useEffect(() => {
    const fetchHealth = async () => {
      const { data, error } = await adminApiService.getSystemHealth();
      if (!error && data) {
        setHealth({
          activeRides: data.activeRides || 0,
          apiLatency: data.apiLatency || 0,
          sockets: data.sockets || 0,
          pendingSos: data.pendingSos || 0
        });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Polling every 15s instead of 5s to avoid spam
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.label}>Active Rides</div>
        <div style={styles.value}>{health.activeRides}</div>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>API Latency</div>
        <div style={styles.value}>{health.apiLatency} ms</div>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Active Sockets</div>
        <div style={styles.value}>{health.sockets}</div>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Pending SOS</div>
        <div style={{ ...styles.value, color: health.pendingSos > 0 ? '#EF4444' : '#10B981' }}>
          {health.pendingSos}
        </div>
      </div>
    </div>
  );
};

export default HealthCards;
