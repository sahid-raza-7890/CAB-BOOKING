import React, { useState, useEffect } from 'react';
import HealthCards from './HealthCards';
import ServerMetrics from './ServerMetrics';
import LogsViewer from './LogsViewer';
import BackupManager from './BackupManager';
import SecurityStatus from './SecurityStatus';
import DeploymentInfo from './DeploymentInfo';
import adminApiService from '../../../../services/adminApiService';

const styles = {
  container: {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '2rem',
    color: '#E2E8F0',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    color: '#FFD21F',
    marginBottom: '2rem',
    fontSize: '2rem',
    textShadow: '0 0 10px rgba(255, 210, 31, 0.3)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  fullWidth: {
    marginBottom: '1.5rem'
  }
};

const SystemDashboard = () => {
  const [loading, setLoading] = useState(true);

  // You can load global data here if you want to pass it down, 
  // but we can also let components fetch their own mapped/simulated data.
  useEffect(() => {
    // Immediate loading finish since child components load their own data
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFD21F'}}>Initializing System Center...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Production Operations Center</h1>
      
      <div style={styles.fullWidth}>
        <HealthCards />
      </div>

      <div style={styles.grid}>
        <ServerMetrics />
        <SecurityStatus />
      </div>

      <div style={styles.grid}>
        <DeploymentInfo />
        <BackupManager />
      </div>

      <div style={styles.fullWidth}>
        <LogsViewer />
      </div>
    </div>
  );
};

export default SystemDashboard;
