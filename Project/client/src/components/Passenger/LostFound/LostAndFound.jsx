import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const LostAndFound = () => {
  const [report, setReport] = useState({ rideId: '', itemName: '', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastItems, setPastItems] = useState([]);

  useEffect(() => {
    fetchLostItems();
  }, []);

  const fetchLostItems = async () => {
    try {
      const data = await passengerApiService.getLostItems();
      setPastItems(data.data || data || []);
    } catch (err) {
      console.error(err);
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
    alignItems: 'flex-start',
    gap: '2rem',
    flexWrap: 'wrap'
  };

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    flex: '1 1 400px',
    maxWidth: '500px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '8px 0 16px 0',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const btnStyle = {
    background: '#FFD21F',
    color: '#0F172A',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    opacity: loading ? 0.7 : 1
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await passengerApiService.reportLostItem(report);
      setSubmitted(true);
      fetchLostItems();
    } catch (err) {
      setError(err.message || 'Failed to report lost item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <h2 style={{ color: '#FFD21F', marginBottom: '1rem', textAlign: 'center' }}>Report Lost Item</h2>
        <p style={{ color: '#94A3B8', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Did you leave something behind in your recent ride? Let us know.
        </p>

        {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#10B981' }}>Report Submitted</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>We will contact the driver and get back to you shortly.</p>
            <button style={{...btnStyle, marginTop: '2rem'}} onClick={() => { setSubmitted(false); setReport({rideId: '', itemName: '', description: ''}); }}>Submit Another Report</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Recent Ride ID</label>
            <input 
              style={inputStyle} 
              type="text" 
              placeholder="e.g. 60d21b4667d0d8992e610c85" 
              value={report.rideId} 
              onChange={e => setReport({...report, rideId: e.target.value})} 
              required 
            />

            <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Lost Item</label>
            <input 
              style={inputStyle} 
              type="text" 
              placeholder="e.g. Wallet, Phone, Keys" 
              value={report.itemName} 
              onChange={e => setReport({...report, itemName: e.target.value})} 
              required 
            />

            <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Description</label>
            <textarea 
              style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} 
              placeholder="Provide details about the item..." 
              value={report.description} 
              onChange={e => setReport({...report, description: e.target.value})} 
              required 
            />

            <button type="submit" style={btnStyle} disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
          </form>
        )}
      </div>

      {pastItems && pastItems.length > 0 && (
        <div style={glassStyle}>
          <h2 style={{ color: '#FFD21F', marginBottom: '1.5rem' }}>Your Reports</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastItems.map(item => (
              <div key={item._id || item.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{item.itemName}</h4>
                <p style={{ margin: '0 0 8px 0', color: '#94A3B8', fontSize: '0.85rem' }}>Ride ID: {item.rideId}</p>
                <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(255, 210, 31, 0.2)', color: '#FFD21F', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {item.status || 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LostAndFound;
