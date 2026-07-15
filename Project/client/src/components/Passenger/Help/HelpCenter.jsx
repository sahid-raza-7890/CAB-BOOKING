import React, { useState, useEffect } from 'react';
import supportService from '../../../services/supportService';

const HelpCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await supportService.getTickets();
      setTickets(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    try {
      setLoading(true);
      await supportService.createTicket(newTicket);
      setNewTicket({ subject: '', message: '' });
      setIsCreating(false);
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
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
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const cardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.2rem',
    marginBottom: '1rem'
  };

  const btnStyle = {
    background: '#FFD21F',
    color: '#0F172A',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '1.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '8px 0 16px 0',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 210, 31, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    boxSizing: 'border-box',
    outline: 'none'
  };

  if (loading && tickets.length === 0 && !isCreating) {
    return <div style={{...containerStyle, alignItems: 'center'}}>Loading support center...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <h2 style={{ color: '#FFD21F', textAlign: 'center', marginBottom: '0.5rem' }}>Help Center</h2>
        <p style={{ textAlign: 'center', color: '#94A3B8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Find answers to common questions or reach out to us.
        </p>

        {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {isCreating ? (
          <form onSubmit={handleCreate}>
            <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Subject</label>
            <input 
              style={inputStyle} 
              type="text" 
              value={newTicket.subject} 
              onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
              required 
            />

            <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Message</label>
            <textarea 
              style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} 
              value={newTicket.message} 
              onChange={e => setNewTicket({...newTicket, message: e.target.value})} 
              required 
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={btnStyle}>Submit Ticket</button>
              <button type="button" onClick={() => setIsCreating(false)} style={{...btnStyle, background: 'transparent', color: '#94A3B8', border: '1px solid #94A3B8'}}>Cancel</button>
            </div>
          </form>
        ) : (
          <div>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Your Support Tickets</h3>
            {tickets.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>You have no support tickets.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id || ticket.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#FFD21F', fontSize: '0.95rem' }}>{ticket.subject}</h4>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {ticket.status || 'Open'}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.4' }}>{ticket.message || ticket.description}</p>
                </div>
              ))
            )}
            <button onClick={() => setIsCreating(true)} style={btnStyle}>Create New Ticket</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
