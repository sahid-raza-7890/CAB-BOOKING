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
  terminal: {
    background: '#020617',
    color: '#A7F3D0',
    fontFamily: 'monospace',
    padding: '1rem',
    borderRadius: '8px',
    height: '300px',
    overflowY: 'auto',
    fontSize: '0.875rem',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  logLine: {
    marginBottom: '4px',
    wordBreak: 'break-all'
  },
  timestamp: {
    color: '#64748B',
    marginRight: '8px'
  },
  level: (lvl) => ({
    color: lvl === 'ERROR' ? '#EF4444' : lvl === 'WARN' ? '#F59E0B' : '#38BDF8',
    fontWeight: 'bold',
    marginRight: '8px'
  })
};

const LogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    const { data, error } = await adminApiService.getLogs(50);
    if (!error && data) {
      setLogs(data);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div style={styles.card}>
      <div style={styles.title}>
        <span>System Logs (Live)</span>
        <button 
          style={{
            background: 'transparent',
            border: '1px solid #FFD21F',
            color: '#FFD21F',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer'
          }}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? 'Pause Logs' : 'Resume Logs'}
        </button>
      </div>
      
      <div style={styles.terminal}>
        {logs.map((log, idx) => (
          <div key={idx} style={styles.logLine}>
            <span style={styles.timestamp}>[{new Date(log.ts).toLocaleTimeString()}]</span>
            <span style={styles.level(log.level)}>[{log.level}]</span>
            <span>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsViewer;
