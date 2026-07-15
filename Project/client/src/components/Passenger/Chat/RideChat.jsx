import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../../context/SocketContext';

const RideChat = ({ rideId, driverName = 'Driver', driverVehicle = '' }) => {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit('joinRideRoom', rideId);

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('chatMessage', handleNewMessage);

    return () => {
      socket.off('chatMessage', handleNewMessage);
    };
  }, [socket, rideId]);

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'sans-serif'
  };

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '1rem',
    background: 'rgba(15, 23, 42, 0.8)',
    borderBottom: '1px solid rgba(255, 210, 31, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const chatAreaStyle = {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const messageStyle = (isPassenger) => ({
    maxWidth: '75%',
    padding: '10px 15px',
    borderRadius: '16px',
    background: isPassenger ? '#FFD21F' : 'rgba(15, 23, 42, 0.8)',
    color: isPassenger ? '#0F172A' : '#fff',
    alignSelf: isPassenger ? 'flex-end' : 'flex-start',
    borderBottomRightRadius: isPassenger ? '4px' : '16px',
    borderBottomLeftRadius: !isPassenger ? '4px' : '16px',
    fontSize: '0.9rem'
  });

  const inputAreaStyle = {
    padding: '1rem',
    background: 'rgba(15, 23, 42, 0.8)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '10px'
  };

  const handleSend = () => {
    if (!input.trim() || !socket || !rideId) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'passenger',
      text: input,
      rideId
    };
    
    // Optimistic update
    setMessages([...messages, newMsg]);
    
    // Send to socket
    socket.emit('sendChatMessage', newMsg);
    setInput('');
  };

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <div style={headerStyle}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🚕
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#FFD21F' }}>{driverName}</h4>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{driverVehicle || 'Connected via UCAB'}</span>
          </div>
        </div>

        <div style={chatAreaStyle}>
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: 'auto', marginBottom: 'auto' }}>
              No messages yet. Say hi to your driver!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || index} style={messageStyle(msg.sender === 'passenger')}>
                {msg.text}
              </div>
            ))
          )}
        </div>

        <div style={inputAreaStyle}>
          <input 
            type="text" 
            placeholder={rideId ? "Type a message..." : "No active ride to chat"} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!rideId}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(30, 41, 59, 0.5)',
              color: '#fff',
              outline: 'none',
              opacity: !rideId ? 0.5 : 1
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!rideId || !input.trim()}
            style={{
              background: '#FFD21F',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!rideId || !input.trim()) ? 'not-allowed' : 'pointer',
              color: '#0F172A',
              opacity: (!rideId || !input.trim()) ? 0.5 : 1
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideChat;
