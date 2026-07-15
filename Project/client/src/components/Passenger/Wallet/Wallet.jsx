import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getWallet();
      setBalance(data.balance || data.data?.balance || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    try {
      setAdding(true);
      await passengerApiService.addFunds(Number(amount));
      setAmount('');
      fetchWallet();
    } catch (err) {
      setError(err.message || 'Failed to add funds');
    } finally {
      setAdding(false);
    }
  };

  const containerStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    margin: '0 auto'
  };

  if (loading) return <div style={containerStyle}>Loading Wallet...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#FFD21F', textAlign: 'center', marginBottom: '1rem' }}>My Wallet</h2>
      {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <p style={{ color: '#94A3B8', fontSize: '1rem', margin: '0 0 8px 0' }}>Current Balance</p>
        <h1 style={{ color: '#10B981', fontSize: '3rem', margin: 0 }}>${Number(balance).toFixed(2)}</h1>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Add Funds</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 210, 31, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleAddFunds}
            disabled={adding}
            style={{
              background: '#FFD21F',
              color: '#0F172A',
              padding: '0 20px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: adding ? 'not-allowed' : 'pointer',
              opacity: adding ? 0.7 : 1
            }}
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
