import React, { useState, useEffect } from 'react';
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
    paddingBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#FFD21F',
    color: '#0F172A',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  list: {
    marginTop: '1rem',
    maxHeight: '150px',
    overflowY: 'auto'
  },
  backupItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '4px',
    marginBottom: '0.5rem'
  },
  backupName: {
    color: '#E2E8F0',
    fontSize: '0.875rem'
  },
  backupSize: {
    color: '#94A3B8',
    fontSize: '0.75rem'
  }
};

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    const fetchBackups = async () => {
      const res = await adminApiService.getBackups();
      if (res && res.data) {
        setBackups(res.data);
      }
    };
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await adminApiService.createBackup();
      if (res && !res.error) {
        const fetchRes = await adminApiService.getBackups();
        if (fetchRes && fetchRes.data) setBackups(fetchRes.data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsBackingUp(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>
        <span>System Backups</span>
        <button 
          style={{ ...styles.button, opacity: isBackingUp ? 0.7 : 1 }} 
          onClick={handleCreateBackup}
          disabled={isBackingUp}
        >
          {isBackingUp ? 'Backing Up...' : 'Trigger Backup'}
        </button>
      </div>
      
      <div style={styles.list}>
        {backups.map(b => (
          <div key={b.id} style={styles.backupItem}>
            <div>
              <div style={styles.backupName}>{new Date(b.date).toLocaleString()}</div>
              <div style={styles.backupSize}>{b.status}</div>
            </div>
            <div style={styles.backupName}>{b.size}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupManager;
