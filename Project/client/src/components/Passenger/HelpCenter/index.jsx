import React, { useState, useEffect, useContext } from 'react';
import supportService from '../../../services/supportService';
import { SocketContext } from '../../../context/SocketContext';
import { Car, CreditCard, User, Smartphone, MessageSquare, ArrowLeft, ChevronRight } from 'lucide-react';
import '../Passenger.css';

const PREDEFINED_CATEGORIES = [
  { id: 'Ride', name: 'Ride Issues', icon: Car, topics: ['Driver was late', 'Wrong route taken', 'Driver behavior', 'Lost an item'] },
  { id: 'Payment', name: 'Payment & Billing', icon: CreditCard, topics: ['Overcharged for ride', 'Promo code did not apply', 'Refund request', 'Payment method failed'] },
  { id: 'Account', name: 'Account Settings', icon: User, topics: ['Cannot update profile', 'Phone number change', 'Account suspended'] },
  { id: 'Technical', name: 'App & Technical', icon: Smartphone, topics: ['App is crashing', 'Location is inaccurate', 'Cannot request ride'] },
  { id: 'Other', name: 'Other Issues', icon: MessageSquare, topics: [] }
];

const HelpCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // New Flow State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: 'Other' });
  
  const [activeTicket, setActiveTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const { socket } = useContext(SocketContext) || {};

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (socket && activeTicket) {
      socket.emit('joinTicket', activeTicket._id || activeTicket.id);
      
      socket.on('ticketMessage', (msg) => {
        setActiveTicket(prev => {
          if (!prev) return prev;
          return { ...prev, messages: [...(prev.messages || []), msg] };
        });
      });

      return () => {
        socket.off('ticketMessage');
        socket.emit('leaveTicket', activeTicket._id || activeTicket.id);
      };
    }
  }, [socket, activeTicket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await supportService.getTickets();
      const fetchedTickets = data?.data || data || [];
      setTickets(Array.isArray(fetchedTickets) ? fetchedTickets : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setNewTicket(prev => ({ ...prev, category: category.id }));
    if (category.id === 'Other') {
      setNewTicket(prev => ({ ...prev, subject: '' }));
    }
  };

  const handleTopicSelect = (topic) => {
    setNewTicket(prev => ({ ...prev, subject: topic }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;
    try {
      setLoading(true);
      // Bugfix: ensure we send description as required by the backend schema, not message
      await supportService.createTicket({
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category
      });
      setNewTicket({ subject: '', description: '', category: 'Other' });
      setSelectedCategory(null);
      setIsCreating(false);
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTicket) return;
    try {
      await supportService.replyTicket(activeTicket._id || activeTicket.id, chatMessage);
      if (socket) {
        socket.emit('sendTicketMessage', { 
          ticketId: activeTicket._id || activeTicket.id, 
          message: chatMessage 
        });
      }
      setChatMessage('');
      // Optimistically update
      const newMsg = { sender: 'passenger', text: chatMessage, timestamp: new Date() };
      setActiveTicket(prev => ({...prev, messages: [...(prev.messages || []), newMsg]}));
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  const renderCreationFlow = () => {
    if (!selectedCategory) {
      return (
        <div className="hc-creation-flow">
          <div className="hc-header">
            <button className="hc-back-btn" onClick={() => setIsCreating(false)}>
              <ArrowLeft size={20} /> Back
            </button>
            <h3 style={{ margin: 0, color: '#fff' }}>What do you need help with?</h3>
          </div>
          
          <div className="hc-category-grid">
            {PREDEFINED_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="hc-category-card" onClick={() => handleCategorySelect(cat)}>
                  <div className="hc-category-icon"><Icon size={24} /></div>
                  <div className="hc-category-content">
                    <h4>{cat.name}</h4>
                    <p>{cat.topics.length > 0 ? `${cat.topics.length} topics` : 'Custom request'}</p>
                  </div>
                  <ChevronRight size={20} className="hc-category-chevron" />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (selectedCategory.topics.length > 0 && !newTicket.subject) {
      return (
        <div className="hc-creation-flow">
          <div className="hc-header">
            <button className="hc-back-btn" onClick={() => setSelectedCategory(null)}>
              <ArrowLeft size={20} /> Back
            </button>
            <h3 style={{ margin: 0, color: '#fff' }}>{selectedCategory.name}</h3>
          </div>
          <div className="hc-topic-list">
            {selectedCategory.topics.map(topic => (
              <button key={topic} className="hc-topic-btn" onClick={() => handleTopicSelect(topic)}>
                {topic}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleCreate} className="hc-creation-form">
        <div className="hc-header">
          <button type="button" className="hc-back-btn" onClick={() => {
            if (selectedCategory.id === 'Other') setSelectedCategory(null);
            else setNewTicket(prev => ({ ...prev, subject: '' }));
          }}>
            <ArrowLeft size={20} /> Back
          </button>
          <h3 style={{ margin: 0, color: '#fff' }}>Provide Details</h3>
        </div>

        <div className="hc-form-group">
          <label>Subject</label>
          <input 
            className="pp-input"
            type="text" 
            value={newTicket.subject} 
            onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
            readOnly={selectedCategory.id !== 'Other'}
            style={selectedCategory.id !== 'Other' ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            required 
          />
        </div>

        <div className="hc-form-group">
          <label>Description</label>
          <textarea 
            className="pp-input"
            style={{ minHeight: '120px', resize: 'vertical' }}
            placeholder="Please describe your issue in detail..."
            value={newTicket.description} 
            onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
            required 
          />
        </div>

        <button type="submit" className="pp-btn hc-submit-btn">Submit Ticket</button>
      </form>
    );
  };

  if (loading && tickets.length === 0 && !isCreating) {
    return <div className="pp-container"><div className="pp-title">Loading support center...</div></div>;
  }

  return (
    <div className="pp-container" style={{ maxWidth: '800px' }}>
      <h2 className="pp-title">Help Center</h2>
      
      {error && <div className="pp-error">{error}</div>}

      {activeTicket ? (
        <div>
          <button className="pp-btn" onClick={() => setActiveTicket(null)} style={{ marginBottom: '1rem', background: 'transparent', color: '#FFD21F', border: '1px solid #FFD21F' }}>
            &larr; Back to Tickets
          </button>
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FFD21F' }}>{activeTicket.subject}</h3>
            
            <div style={{ height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
              {(activeTicket.messages || []).map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'passenger' ? 'flex-end' : 'flex-start', background: msg.sender === 'passenger' ? '#FFD21F' : 'rgba(255,255,255,0.1)', color: msg.sender === 'passenger' ? '#0F172A' : '#fff', padding: '8px 12px', borderRadius: '8px', maxWidth: '70%' }}>
                  {msg.text || msg.message}
                </div>
              ))}
              {(activeTicket.messages?.length || 0) === 0 && (
                <div style={{ color: '#94A3B8', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                  No messages yet. Send a message to start chat.
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
              <input
                className="pp-input"
                style={{ flex: 1, margin: 0 }}
                placeholder="Type your message..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
              />
              <button className="pp-btn" type="submit">Send</button>
            </form>
          </div>
        </div>
      ) : isCreating ? (
        renderCreationFlow()
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', margin: 0 }}>Recent Tickets</h3>
            <button onClick={() => setIsCreating(true)} className="pp-btn">Get Help</button>
          </div>
          
          {tickets.length === 0 ? (
            <div className="hc-empty-state">
              <MessageSquare size={48} color="#475569" />
              <p>You have no active support tickets.</p>
              <button onClick={() => setIsCreating(true)} className="pp-btn hc-empty-btn">Create a Ticket</button>
            </div>
          ) : (
            <div className="hc-ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket._id || ticket.id} className="hc-ticket-card">
                  <div>
                    <h4>{ticket.subject}</h4>
                    <span className={`hc-status hc-status-${(ticket.status || 'open').toLowerCase()}`}>
                      {ticket.status || 'Open'}
                    </span>
                  </div>
                  <button className="pp-btn-outline" onClick={() => setActiveTicket(ticket)}>View Chat</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
