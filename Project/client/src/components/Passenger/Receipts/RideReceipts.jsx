import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const RideReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getReceipts();
      setReceipts(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    padding: '2rem',
    color: '#fff',
    fontFamily: 'sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  };

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '700px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflowX: 'auto'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    minWidth: '500px'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid rgba(255, 210, 31, 0.5)',
    color: '#FFD21F'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94A3B8'
  };

  if (loading) {
    return <div style={{...containerStyle, alignItems: 'center'}}>Loading receipts...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <h2 style={{ color: '#FFD21F', marginBottom: '1.5rem' }}>Ride Receipts</h2>
        
        {error && <div style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</div>}

        {receipts.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center' }}>No receipts found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Receipt ID</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Driver</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map(receipt => (
                <tr key={receipt._id || receipt.id}>
                  <td style={{...tdStyle, color: '#fff'}}>{receipt.receiptId || receipt._id || receipt.id}</td>
                  <td style={tdStyle}>{receipt.date ? new Date(receipt.date).toLocaleDateString() : 'N/A'}</td>
                  <td style={tdStyle}>{receipt.driverName || 'N/A'}</td>
                  <td style={{...tdStyle, fontWeight: 'bold', color: '#10B981'}}>${receipt.amount || '0.00'}</td>
                  <td style={tdStyle}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {receipt.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RideReceipts;
