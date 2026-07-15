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
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  label: {
    color: '#94A3B8'
  },
  value: {
    color: '#E2E8F0',
    fontWeight: '500'
  }
};

const DeploymentInfo = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const { data, error } = await adminApiService.getSystemStatus();
      if (!error && data) {
        setInfo({
          version: data.version || 'v1.0.0 (Sprint 40)',
          lastDeployment: data.lastDeployment || new Date().toLocaleString(),
          environment: data.environment || 'Production',
          uptime: data.uptime || 'Unknown',
          nodesActive: data.nodesActive || '0 / 0'
        });
      }
    };
    fetchInfo();
  }, []);

  if (!info) return <div style={styles.card}>Loading deployment info...</div>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Deployment Info</h2>
      <div style={styles.row}>
        <span style={styles.label}>Current Version</span>
        <span style={styles.value}>{info.version}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Last Deployment</span>
        <span style={styles.value}>{info.lastDeployment}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Environment</span>
        <span style={styles.value}>{info.environment}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Uptime</span>
        <span style={styles.value}>{info.uptime}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Nodes Active</span>
        <span style={styles.value}>{info.nodesActive}</span>
      </div>
    </div>
  );
};

export default DeploymentInfo;
