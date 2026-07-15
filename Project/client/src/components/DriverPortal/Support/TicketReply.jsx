import React, { useState } from 'react';
import './Support.css';
import DriverSupportService from '../../../services/driverSupportService';

const TicketReply = ({ ticket, onReply }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            await DriverSupportService.replyToTicket(ticket._id, message);
            setMessage('');
            onReply();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (ticket.status === 'Closed') {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                This ticket is closed. You cannot send new replies.
            </div>
        );
    }

    return (
        <div className="chat-input-area">
            <input 
                type="text" 
                className="chat-input" 
                placeholder="Type your reply..." 
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={loading}
            />
            <button 
                className="ucab-btn primary" 
                style={{ padding: '0 24px', borderRadius: '20px' }}
                onClick={handleSend}
                disabled={loading || !message.trim()}
            >
                <i className="fas fa-paper-plane"></i>
            </button>
        </div>
    );
};

export default TicketReply;
