import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import supportService from '../../services/supportService';
import SupportSkeleton from './SupportSkeleton';

const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

export default function TicketDetails({ ticketId, onBack }) {
    const { user, authenticated } = useContext(AuthContext);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const repliesEndRef = useRef(null);

    useEffect(() => {
        fetchTicket();

        if (authenticated && user) {
            const socket = io('http://localhost:5000');
            const userId = user.userId || user.id;
            socket.emit('register', userId);
            
            const roomName = `support_${userId}`;
            socket.on(roomName, (payload) => {
                if (payload.event === 'ticketReply' && payload.data.ticketId === ticketId) {
                    setTicket(prev => {
                        if (!prev) return prev;
                        // Avoid duplicate replies if socket is faster than optimistic update
                        const exists = prev.replies.find(r => r._id === payload.data.reply._id || (r.message === payload.data.reply.message && r.createdAt === payload.data.reply.createdAt));
                        if (exists) return { ...prev, status: payload.data.status };
                        return { 
                            ...prev, 
                            status: payload.data.status,
                            replies: [...prev.replies, payload.data.reply] 
                        };
                    });
                }
                if (payload.event === 'ticketUpdated' && payload.data._id === ticketId) {
                    setTicket(payload.data);
                }
            });

            return () => {
                socket.off(roomName);
                socket.disconnect();
            };
        }
    }, [ticketId, authenticated, user]);

    useEffect(() => {
        // Scroll to bottom when replies change
        repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.replies]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const data = await supportService.getTicket(ticketId);
            setTicket(data.data);
        } catch (error) {
            console.error("Failed to fetch ticket:", error);
            alert("Ticket not found or unauthorized");
            onBack();
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setSending(true);
            const data = await supportService.replyTicket(ticketId, replyText);
            setReplyText('');
            // Optimistic update handled by response, but socket might also fire. 
            // the response itself contains the updated ticket
            setTicket(data.data); 
        } catch (error) {
            console.error("Failed to reply:", error);
            alert("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleClose = async () => {
        if (!window.confirm("Are you sure you want to close this ticket?")) return;
        try {
            const data = await supportService.closeTicket(ticketId);
            setTicket(data.data);
        } catch (error) {
            alert("Failed to close ticket");
        }
    };

    if (loading) return <div className="support-container"><SupportSkeleton /></div>;
    if (!ticket) return <div className="support-container">Ticket not found.</div>;

    const isClosed = ticket.status === 'Closed' || ticket.status === 'Resolved';

    return (
        <div className="support-container">
            <div className="support-header">
                <button className="btn-primary" onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                {!isClosed && (
                    <button className="btn-primary" onClick={handleClose} style={{ background: '#ef4444', color: '#fff' }}>
                        Close Ticket
                    </button>
                )}
            </div>

            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ color: '#e5b05c', margin: '0 0 0.5rem 0' }}>{ticket.subject}</h2>
                        <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', gap: '15px' }}>
                            <span><i className="fa-solid fa-tag"></i> {ticket.category}</span>
                            <span><i className="fa-solid fa-flag"></i> Priority: {ticket.priority}</span>
                            <span><i className="fa-regular fa-clock"></i> {formatRelativeTime(ticket.createdAt)}</span>
                        </div>
                    </div>
                    <span className={`ticket-status status-${ticket.status}`} style={{ fontSize: '1rem', padding: '5px 15px' }}>
                        {ticket.status}
                    </span>
                </div>

                <div className="ticket-details-thread">
                    {/* Original Message */}
                    <div className="message-bubble user">
                        <div className="message-header">
                            <span className="message-sender">You</span>
                            <span>{formatRelativeTime(ticket.createdAt)}</span>
                        </div>
                        <div className="message-body">{ticket.description}</div>
                    </div>

                    {/* Replies */}
                    {ticket.replies && ticket.replies.map(reply => {
                        const isUser = reply.senderModel === 'User' || reply.senderModel === 'Passenger';
                        return (
                            <div key={reply._id} className={`message-bubble ${isUser ? 'user' : 'support-agent'}`}>
                                <div className="message-header">
                                    <span className="message-sender">{isUser ? 'You' : 'UCAB Support'}</span>
                                    <span>{formatRelativeTime(reply.createdAt)}</span>
                                </div>
                                <div className="message-body">{reply.message}</div>
                            </div>
                        );
                    })}
                    <div ref={repliesEndRef} />
                </div>

                {!isClosed ? (
                    <div className="reply-box">
                        <form onSubmit={handleReply}>
                            <div className="form-group">
                                <textarea 
                                    className="form-control" 
                                    placeholder="Type your reply here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={sending}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={sending || !replyText.trim()}>
                                {sending ? 'Sending...' : 'Send Reply'} <i className="fa-solid fa-paper-plane" style={{ marginLeft: '5px' }}></i>
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="reply-box" style={{ textAlign: 'center', color: '#888' }}>
                        <i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> This ticket is closed. If you need further assistance, please open a new ticket.
                    </div>
                )}
            </div>
        </div>
    );
}
