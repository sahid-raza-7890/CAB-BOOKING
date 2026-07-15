import React, { useEffect, useState } from 'react';
import adminApiService from '../../../../services/adminApiService';

const styles = {
  card: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
  },
  title: {
    color: '#FFD21F',
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '0.5rem'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  label: {
    color: '#94A3B8',
    fontWeight: '500'
  },
  barContainer: {
    width: '60%',
    height: '10px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  bar: (percent) => ({
    width: `${percent}%`,
    height: '100%',
    background: percent > 85 ? '#EF4444' : percent > 70 ? '#F59E0B' : '#10B981',
    transition: 'width 0.5s ease-in-out'
  }),
  value: {
    color: '#E2E8F0',
    minWidth: '45px',
    textAlign: 'right'
  },
  statusIndicator: (isOk) => ({
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: isOk ? '#10B981' : '#EF4444',
    marginRight: '8px'
  })
};

const ServerMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    mongo: true,
    redis: true
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await adminApiService.getSystemStatus();
      if (!error && data) {
        setMetrics({
          cpu: data.cpu || 0,
          memory: data.memory || 0,
          disk: data.disk || 0,
          mongo: data.mongo !== false,
          redis: data.redis !== false
        });
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Server Metrics</h2>
      
      <div style={styles.metricRow}>
        <span style={styles.label}>CPU Usage</span>
        <div style={styles.barContainer}>
          <div style={styles.bar(metrics.cpu)}></div>
        </div>
        <span style={styles.value}>{metrics.cpu}%</span>
      </div>

      <div style={styles.metricRow}>
        <span style={styles.label}>Memory Usage</span>
        <div style={styles.barContainer}>
          <div style={styles.bar(metrics.memory)}></div>
        </div>
        <span style={styles.value}>{metrics.memory}%</span>
      </div>

      <div style={styles.metricRow}>
        <span style={styles.label}>Disk Space</span>
        <div style={styles.barContainer}>
          <div style={styles.bar(metrics.disk)}></div>
        </div>
        <span style={styles.value}>{metrics.disk}%</span>
      </div>

      <div style={{ ...styles.metricRow, marginTop: '2rem' }}>
        <span style={styles.label}>MongoDB Status</span>
        <span style={styles.value}>
          <span style={styles.statusIndicator(metrics.mongo)}></span>
          {metrics.mongo ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div style={styles.metricRow}>
        <span style={styles.label}>Redis Status</span>
        <span style={styles.value}>
          <span style={styles.statusIndicator(metrics.redis)}></span>
          {metrics.redis ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default ServerMetrics;
