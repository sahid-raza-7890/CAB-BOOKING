import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDriver } from '../DriverContext';
import DriverSupportService from '../../../services/driverSupportService';
import '../DriverPortal.css'; // ensure dp- styles are loaded

export default function SupportDashboard() {
  const { supportTickets, setSupportTickets, activeTicket, setActiveTicket } = useDriver();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DriverSupportService.getTickets();
      const tickets = res.data || [];
      setSupportTickets(tickets);
      if (activeTicket) {
        const updated = tickets.find(t => t._id === activeTicket._id);
        if (updated) setActiveTicket(updated);
      } else if (tickets.length > 0) {
        setActiveTicket(tickets[0]);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets', err);
    } finally {
      setLoading(false);
    }
  }, [activeTicket, setActiveTicket, setSupportTickets]);

  useEffect(() => {
    fetchTickets();
  }, []); // Run once on mount

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    try {
      await DriverSupportService.createTicket({ subject: newTitle, description: newDesc, priority: newPriority });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('Medium');
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText || !activeTicket) return;
    try {
      await DriverSupportService.replyToTicket(activeTicket._id, replyText);
      setReplyText('');
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    try {
      await DriverSupportService.closeTicket(activeTicket._id);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#FF4B4B';
      case 'Medium': return '#FFD21F';
      default: return '#00D26A';
    }
  };

  return (
    <div className="dp-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dp-section-title">Support Center</h2>
          <p className="dp-section-sub">Manage your support tickets and chat with the team.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          style={{ background: '#FFD21F', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          + New Ticket
        </button>
      </div>

      <div className="dp-row-custom" style={{ flex: 1, minHeight: 0 }}>
        {/* Left: Ticket List */}
        <div className="dp-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dp-card-header">
            <span className="dp-card-title">Your Tickets</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16, color: '#aaa', fontSize: 12 }}>Loading tickets...</div>
            ) : supportTickets.length === 0 ? (
              <div style={{ padding: 16, color: '#aaa', fontSize: 12 }}>No tickets found.</div>
            ) : (
              supportTickets.map(ticket => (
                <div 
                  key={ticket._id} 
                  className="dp-ticket-item" 
                  style={{ 
                    cursor: 'pointer', 
                    background: activeTicket?._id === ticket._id ? 'rgba(255, 210, 31, 0.1)' : 'transparent',
                    borderLeft: activeTicket?._id === ticket._id ? '3px solid #FFD21F' : '3px solid transparent'
                  }}
                  onClick={() => setActiveTicket(ticket)}
                >
                  <div className="dp-ticket-id">#{ticket._id.substring(ticket._id.length - 6).toUpperCase()}</div>
                  <div className="dp-ticket-info">
                    <div className="dp-ticket-title">{ticket.subject || ticket.title}</div>
                    <div className="dp-ticket-sub">{new Date(ticket.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="dp-priority-badge" style={{ background: `${getPriorityColor(ticket.priority)}22`, color: getPriorityColor(ticket.priority) }}>
                    {ticket.priority || 'Low'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Chat Interface */}
        {activeTicket ? (
          <div className="dp-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="dp-card-header">
              <div>
                <span className="dp-card-title">{activeTicket.subject || activeTicket.title}</span>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>
                  Status: <strong style={{ color: activeTicket.status === 'Closed' ? '#FF4B4B' : '#00D26A' }}>{activeTicket.status}</strong>
                </div>
              </div>
              {activeTicket.status !== 'Closed' && (
                <button onClick={handleCloseTicket} className="dp-action-btn danger" title="Close Ticket">
                  ✖
                </button>
              )}
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.2)' }}>
              {activeTicket.messages?.map((msg, idx) => {
                const isMine = msg.sender === 'Driver' || msg.senderType === 'Driver' || msg.isDriver;
                return (
                  <div key={idx} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div style={{
                      background: isMine ? '#FFD21F' : 'rgba(255,255,255,0.1)',
                      color: isMine ? '#000' : '#fff',
                      padding: '8px 12px',
                      borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      fontSize: 13
                    }}>
                      {msg.text || msg.message}
                    </div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {activeTicket.status !== 'Closed' && (
              <form onSubmit={handleReply} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Type your message..." 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: 13, outline: 'none' }}
                />
                <button type="submit" style={{ background: '#FFD21F', color: '#000', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Send
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="dp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14 }}>
            Select a ticket to view conversation
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dp-card" style={{ width: 400, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Create New Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Subject" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: 13 }} />
              <textarea required placeholder="Describe your issue..." value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: 13, minHeight: 100, resize: 'vertical' }} />
              <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: 13 }}>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: '#FFD21F', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
