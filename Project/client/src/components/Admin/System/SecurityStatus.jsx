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
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  label: {
    color: '#94A3B8'
  },
  status: (status) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    background: status === 'secure' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
    color: status === 'secure' ? '#10B981' : '#EF4444'
  })
};

const SecurityStatus = () => {
  const [security, setSecurity] = useState(null);

  useEffect(() => {
    const fetchSecurity = async () => {
      const { data, error } = await adminApiService.getSystemSecurity();
      if (!error && data) {
        setSecurity({
          firewall: data.firewall || 'secure',
          ddosProtection: data.ddosProtection || 'secure',
          sslCertificate: data.sslCertificate || 'secure',
          recentIntrusions: data.recentIntrusions || 0,
          vulnerabilities: data.vulnerabilities || 0
        });
      }
    };
    fetchSecurity();
  }, []);

  if (!security) return <div style={styles.card}>Loading security info...</div>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Security Status</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <span style={styles.label}>Firewall</span>
          <span style={styles.status(security.firewall)}>
            {security.firewall}
          </span>
        </li>
        <li style={styles.listItem}>
          <span style={styles.label}>DDoS Protection</span>
          <span style={styles.status(security.ddosProtection)}>
            {security.ddosProtection}
          </span>
        </li>
        <li style={styles.listItem}>
          <span style={styles.label}>SSL Certificate</span>
          <span style={styles.status(security.sslCertificate)}>
            Valid
          </span>
        </li>
        <li style={styles.listItem}>
          <span style={styles.label}>Recent Intrusions</span>
          <span style={{ color: '#E2E8F0', fontWeight: 'bold' }}>
            {security.recentIntrusions}
          </span>
        </li>
        <li style={styles.listItem}>
          <span style={styles.label}>Known Vulnerabilities</span>
          <span style={{ color: security.vulnerabilities === 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
            {security.vulnerabilities}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default SecurityStatus;
